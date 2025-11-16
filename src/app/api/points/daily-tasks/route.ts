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

    if (session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const date = searchParams.get('date');

    if (!courseId || !date) {
      return NextResponse.json({ error: 'courseId و date مطلوبان' }, { status: 400 });
    }

    // البحث عن الطالبة
    const student = await db.student.findFirst({
      where: { studentName: session.user.name || '' }
    });

    if (!student) {
      return NextResponse.json({ error: 'الطالبة غير موجودة' }, { status: 404 });
    }

    // جلب المهام اليومية
    const tasks: any = await db.$queryRawUnsafe(`
      SELECT * FROM daily_tasks
      WHERE "studentId" = $1 AND "courseId" = $2 AND date = $3
      LIMIT 1
    `, student.id, courseId, new Date(date));

    const task = tasks && tasks.length > 0 ? tasks[0] : null;

    return NextResponse.json({ task });
  } catch (error) {
    console.error('خطأ في جلب المهام:', error);
    return NextResponse.json({ error: 'خطأ في جلب المهام' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'غير مصادق عليه' }, { status: 401 });
    }

    if (session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await request.json();
    const { courseId, date, listening5Times, repetition10Times, recitedToPeer, notes } = body;

    if (!courseId || !date) {
      return NextResponse.json({ error: 'courseId و date مطلوبان' }, { status: 400 });
    }

    // البحث عن الطالبة
    const student = await db.student.findFirst({
      where: { studentName: session.user.name || '' }
    });

    if (!student) {
      return NextResponse.json({ error: 'الطالبة غير موجودة' }, { status: 404 });
    }

    // التحقق من التسجيل في الحلقة
    const enrollment = await db.enrollment.findFirst({
      where: {
        studentId: student.id,
        courseId: courseId,
        isActive: true
      }
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'غير مسجلة في هذه الحلقة' }, { status: 403 });
    }

    // حفظ أو تحديث المهام
    const task = await db.$executeRawUnsafe(`
      INSERT INTO daily_tasks (id, date, "listening5Times", "repetition10Times", "recitedToPeer", notes, "createdAt", "updatedAt", "studentId", "courseId")
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), $7, $8)
      ON CONFLICT ("studentId", "courseId", date)
      DO UPDATE SET
        "listening5Times" = $3,
        "repetition10Times" = $4,
        "recitedToPeer" = $5,
        notes = $6,
        "updatedAt" = NOW()
      RETURNING *
    `, 
      `task-${Date.now()}`,
      new Date(date),
      listening5Times,
      repetition10Times,
      recitedToPeer,
      notes || null,
      student.id,
      courseId
    );

    return NextResponse.json({ message: 'تم حفظ المهام بنجاح', task });
  } catch (error) {
    console.error('خطأ في حفظ المهام:', error);
    return NextResponse.json({ error: 'خطأ في حفظ المهام' }, { status: 500 });
  }
}
