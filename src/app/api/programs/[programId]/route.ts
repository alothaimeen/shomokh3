import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ programId: string }> }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'غير مصادق عليه' }, { status: 401 });
  }

  const { programId } = await params;

  try {
    const program = await db.program.findUnique({
      where: { id: programId },
      include: {
        courses: {
          include: {
            teacher: {
              select: {
                id: true,
                userName: true
              }
            },
            _count: {
              select: {
                enrollments: true
              }
            }
          }
        }
      }
    });

    if (!program) {
      return NextResponse.json({ error: 'البرنامج غير موجود' }, { status: 404 });
    }

    // تنسيق البيانات للواجهة الأمامية
    const formattedProgram = {
      id: program.id,
      programName: program.programName,
      programDescription: program.programDescription,
      courses: program.courses.map(course => ({
        id: course.id,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        syllabus: course.syllabus,
        level: course.level,
        maxStudents: course.maxStudents,
        teacherId: course.teacherId,
        teacherName: course.teacher?.userName,
        isActive: course.isActive,
        createdAt: course.createdAt.toISOString(),
        studentsCount: course._count.enrollments
      }))
    };

    return NextResponse.json(formattedProgram);
  } catch (error) {
    console.error('Error fetching program:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب البيانات' }, { status: 500 });
  }
}
