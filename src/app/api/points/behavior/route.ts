import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'غير مصادق عليه' }, { status: 401 });
    }

    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const date = searchParams.get('date');

    if (!courseId || !date) {
      return NextResponse.json({ error: 'courseId و date مطلوبان' }, { status: 400 });
    }

    // جلب الطالبات المسجلات في الحلقة
    const enrollments = await db.enrollment.findMany({
      where: {
        courseId: courseId,
        isActive: true
      },
      include: {
        student: true
      }
    });

    // جلب النقاط المحفوظة للتاريخ المحدد
    const existingPoints = await db.behaviorPoint.findMany({
      where: {
        courseId: courseId,
        date: new Date(date)
      }
    });

    // إنشاء map للنقاط الموجودة
    const pointsMap = new Map(
      existingPoints.map(p => [p.studentId, p])
    );

    // دمج البيانات
    const students = enrollments.map(enrollment => ({
      studentId: enrollment.student.id,
      studentName: enrollment.student.studentName,
      date: date,
      earlyAttendance: pointsMap.get(enrollment.student.id)?.earlyAttendance || false,
      perfectMemorization: pointsMap.get(enrollment.student.id)?.perfectMemorization || false,
      activeParticipation: pointsMap.get(enrollment.student.id)?.activeParticipation || false,
      timeCommitment: pointsMap.get(enrollment.student.id)?.timeCommitment || false,
      notes: pointsMap.get(enrollment.student.id)?.notes || ''
    }));

    return NextResponse.json({ students });
  } catch (error) {
    console.error('خطأ في جلب النقاط:', error);
    return NextResponse.json({ error: 'خطأ في جلب النقاط' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'غير مصادق عليه' }, { status: 401 });
    }

    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await request.json();
    const { courseId, date, points } = body;

    if (!courseId || !date || !points || !Array.isArray(points)) {
      return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 400 });
    }

    // التحقق من ملكية الحلقة (للمعلمة)
    if (session.user.role === 'TEACHER') {
      const course = await db.course.findUnique({
        where: { id: courseId },
        include: { teacher: true }
      });

      if (!course || course.teacher?.userEmail !== session.user.email) {
        return NextResponse.json({ error: 'غير مصرح بالوصول لهذه الحلقة' }, { status: 403 });
      }
    }

    // حفظ النقاط لكل طالبة
    const results = [];
    for (const point of points) {
      const result = await db.behaviorPoint.upsert({
        where: {
          studentId_courseId_date: {
            studentId: point.studentId,
            courseId: courseId,
            date: new Date(date)
          }
        },
        update: {
          earlyAttendance: point.earlyAttendance,
          perfectMemorization: point.perfectMemorization,
          activeParticipation: point.activeParticipation,
          timeCommitment: point.timeCommitment,
          notes: point.notes,
          updatedAt: new Date()
        },
        create: {
          studentId: point.studentId,
          courseId: courseId,
          date: new Date(date),
          earlyAttendance: point.earlyAttendance,
          perfectMemorization: point.perfectMemorization,
          activeParticipation: point.activeParticipation,
          timeCommitment: point.timeCommitment,
          notes: point.notes
        }
      });
      results.push(result);
    }

    return NextResponse.json({ 
      message: `تم حفظ النقاط لـ ${results.length} طالبة`,
      saved: results.length 
    });
  } catch (error) {
    console.error('خطأ في حفظ النقاط:', error);
    return NextResponse.json({ error: 'خطأ في حفظ النقاط' }, { status: 500 });
  }
}
