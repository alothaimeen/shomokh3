import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET: جلب درجات الاختبار النهائي
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

    if (!courseId) {
      return NextResponse.json({ error: 'معرف الحلقة مطلوب' }, { status: 400 });
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

    // جلب درجات الاختبار النهائي
    const finalExams = await db.$queryRaw<any[]>`
      SELECT * FROM final_exams WHERE "courseId" = ${courseId}
    `;

    // دمج البيانات
    const studentsWithGrades = students.map(student => ({
      id: student.id,
      studentName: student.studentName,
      studentNumber: student.studentNumber,
      finalExam: finalExams.find((e: any) => e.studentId === student.id) || null
    }));

    return NextResponse.json({ students: studentsWithGrades });
  } catch (error) {
    console.error('خطأ في جلب درجات الاختبار النهائي:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الدرجات' },
      { status: 500 }
    );
  }
}

// POST: حفظ درجات الاختبار النهائي
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
    const { courseId, grades } = body;

    if (!courseId || !grades || !Array.isArray(grades)) {
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
        INSERT INTO final_exams (id, "studentId", "courseId", "quranTest", "tajweedTest", notes, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        ON CONFLICT ("studentId", "courseId")
        DO UPDATE SET
          "quranTest" = $4,
          "tajweedTest" = $5,
          notes = $6,
          "updatedAt" = NOW()
      `,
        `fe_${Date.now()}_${Math.random()}`,
        grade.studentId,
        courseId,
        grade.quranTest,
        grade.tajweedTest,
        grade.notes || null
      );
    }

    return NextResponse.json({ 
      message: 'تم حفظ درجات الاختبار النهائي بنجاح',
      count: grades.length
    });
  } catch (error) {
    console.error('خطأ في حفظ درجات الاختبار النهائي:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في حفظ الدرجات' },
      { status: 500 }
    );
  }
}
