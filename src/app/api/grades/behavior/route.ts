import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET: جلب درجات السلوك ليوم محدد
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'غير مصادق عليه' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const date = searchParams.get('date');

    if (!courseId || !date) {
      return NextResponse.json({ error: 'معرف الحلقة والتاريخ مطلوبان' }, { status: 400 });
    }

    // جلب الطالبات المسجلات
    const students = await db.student.findMany({
      where: {
        enrollments: {
          some: {
            courseId: courseId
          }
        },
        isActive: true
      },
      orderBy: {
        studentName: 'asc'
      }
    });

    // جلب درجات السلوك لهذا اليوم
    const behaviorGrades = await db.$queryRaw<any[]>`
      SELECT * FROM behavior_grades 
      WHERE "courseId" = ${courseId} 
      AND DATE(date) = DATE(${date})
    `;

    // دمج البيانات
    const studentsWithGrades = students.map(student => ({
      id: student.id,
      studentName: student.studentName,
      studentNumber: student.studentNumber,
      behaviorGrade: behaviorGrades.find((g: any) => g.studentId === student.id) || null
    }));

    return NextResponse.json({ students: studentsWithGrades });
  } catch (error) {
    console.error('خطأ في جلب درجات السلوك:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الدرجات' },
      { status: 500 }
    );
  }
}

// POST: حفظ درجات السلوك
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'غير مصادق عليه' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await request.json();
    const { courseId, date, grades } = body;

    if (!courseId || !date || !grades || !Array.isArray(grades)) {
      return NextResponse.json(
        { error: 'البيانات المرسلة غير صحيحة' },
        { status: 400 }
      );
    }

    // التحقق من أن المعلمة تدير هذه الحلقة (إذا كانت معلمة)
    if (session.user.role === 'TEACHER') {
      const course = await db.course.findUnique({
        where: { id: courseId },
        select: { teacherId: true }
      });

      if (course?.teacherId !== session.user.id) {
        return NextResponse.json(
          { error: 'غير مصرح - هذه الحلقة لا تخصك' },
          { status: 403 }
        );
      }
    }

    // حفظ الدرجات (upsert لكل طالبة)
    for (const grade of grades) {
      await db.$executeRawUnsafe(`
        INSERT INTO behavior_grades (id, "studentId", "courseId", date, "dailyScore", notes, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        ON CONFLICT ("studentId", "courseId", date)
        DO UPDATE SET
          "dailyScore" = $5,
          notes = $6,
          "updatedAt" = NOW()
      `,
        `bg_${Date.now()}_${Math.random()}`,
        grade.studentId,
        courseId,
        new Date(date),
        grade.dailyScore,
        grade.notes || null
      );
    }

    return NextResponse.json({ 
      message: 'تم حفظ درجات السلوك بنجاح',
      count: grades.length
    });
  } catch (error) {
    console.error('خطأ في حفظ درجات السلوك:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حفظ الدرجات' },
      { status: 500 }
    );
  }
}
