import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';


export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.email || session.user.userRole !== 'STUDENT') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // جلب البيانات من قاعدة البيانات (محدث - الجلسة 10.6)
    // إزالة قيد المستوى الأول - الطالبات يمكنهن الانضمام لأي مستوى
    const availableCourses = await db.course.findMany({
      where: {
        isActive: true,
        // تم إزالة: level: 1 - الطالبات تختار أي مستوى حسب حفظها
      },
      include: {
        program: {
          select: {
            id: true,
            programName: true,
            programDescription: true,
          }
        },
        teacher: {
          select: {
            id: true,
            userName: true,
          }
        },
        _count: {
          select: {
            enrollments: true, // عد الطالبات المسجلات
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedCourses = availableCourses.map(course => ({
      id: course.id,
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      syllabus: course.syllabus,
      level: course.level,
      maxStudents: course.maxStudents,
      currentStudents: course._count.enrollments,
      isAvailable: course._count.enrollments < course.maxStudents,
      program: {
        id: course.program.id,
        programName: course.program.programName,
        programDescription: course.program.programDescription,
      },
      teacher: course.teacher ? {
        id: course.teacher.id,
        userName: course.teacher.userName,
      } : null,
    }));

    return NextResponse.json({ courses: formattedCourses });

  } catch (error) {
    console.error('خطأ في جلب الحلقات المتاحة:', error);
    return NextResponse.json({ error: 'خطأ في جلب الحلقات المتاحة' }, { status: 500 });
  }
}
