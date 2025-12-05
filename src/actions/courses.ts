'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

/**
 * جلب المعلمات النشطين
 */
export async function getTeachers() {
  const session = await auth();
  
  if (!session?.user) {
    return { error: 'غير مصادق عليه', teachers: [] };
  }

  // فقط ADMIN يمكنه رؤية قائمة المعلمات
  if (session.user.role !== 'ADMIN') {
    return { error: 'غير مصرح', teachers: [] };
  }

  try {
    const teachers = await db.user.findMany({
      where: {
        userRole: 'TEACHER',
        isActive: true
      },
      select: {
        id: true,
        userName: true,
        userEmail: true
      },
      orderBy: { userName: 'asc' }
    });

    return { teachers };
  } catch (error) {
    console.error('خطأ في جلب المعلمات:', error);
    return { error: 'فشل في جلب المعلمات', teachers: [] };
  }
}

/**
 * جلب بيانات البرنامج مع الحلقات
 */
export async function getProgramWithCourses(programId: string) {
  const session = await auth();
  
  if (!session?.user) {
    return { error: 'غير مصادق عليه' };
  }

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
          },
          orderBy: { courseName: 'asc' }
        }
      }
    });

    if (!program) {
      return { error: 'البرنامج غير موجود' };
    }

    // تنسيق البيانات
    const formattedCourses = program.courses.map(course => ({
      id: course.id,
      courseName: course.courseName,
      courseDescription: course.courseDescription || '',
      syllabus: course.syllabus || '',
      level: course.level,
      maxStudents: course.maxStudents,
      teacherId: course.teacherId || undefined,
      teacherName: course.teacher?.userName,
      isActive: course.isActive,
      createdAt: course.createdAt.toISOString().split('T')[0],
      studentsCount: course._count.enrollments
    }));

    return {
      program: {
        id: program.id,
        programName: program.programName,
        programDescription: program.programDescription
      },
      courses: formattedCourses
    };
  } catch (error) {
    console.error('خطأ في جلب البرنامج:', error);
    return { error: 'حدث خطأ أثناء جلب البيانات' };
  }
}

/**
 * إضافة حلقة جديدة
 */
export async function createCourse(formData: FormData) {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return { error: 'غير مصرح' };
  }

  const programId = formData.get('programId') as string;
  const courseName = formData.get('courseName') as string;
  const courseDescription = formData.get('courseDescription') as string;
  const syllabus = formData.get('syllabus') as string;
  const level = parseInt(formData.get('level') as string) || 1;
  const maxStudents = parseInt(formData.get('maxStudents') as string) || 20;
  const teacherId = formData.get('teacherId') as string;

  if (!programId || !courseName) {
    return { error: 'اسم الحلقة والبرنامج مطلوبان' };
  }

  try {
    const course = await db.course.create({
      data: {
        courseName,
        courseDescription: courseDescription || '',
        syllabus: syllabus || '',
        level,
        maxStudents,
        teacherId: teacherId || null,
        programId,
        isActive: true
      },
      include: {
        teacher: { select: { id: true, userName: true } }
      }
    });

    revalidatePath(`/programs/${programId}/courses`);
    return { success: true, course };
  } catch (error) {
    console.error('خطأ في إنشاء الحلقة:', error);
    return { error: 'فشل في إنشاء الحلقة' };
  }
}

/**
 * تحديث معلمة الحلقة
 */
export async function assignTeacherToCourse(courseId: string, teacherId: string | null) {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return { error: 'غير مصرح' };
  }

  try {
    const course = await db.course.update({
      where: { id: courseId },
      data: { teacherId: teacherId || null },
      include: {
        teacher: { select: { id: true, userName: true } },
        program: { select: { id: true } }
      }
    });

    revalidatePath(`/programs/${course.program.id}/courses`);
    return { success: true, teacherName: course.teacher?.userName };
  } catch (error) {
    console.error('خطأ في تعيين المعلمة:', error);
    return { error: 'فشل في تعيين المعلمة' };
  }
}

/**
 * تفعيل/إيقاف الحلقة
 */
export async function toggleCourseStatus(courseId: string) {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return { error: 'غير مصرح' };
  }

  try {
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { isActive: true, program: { select: { id: true } } }
    });

    if (!course) {
      return { error: 'الحلقة غير موجودة' };
    }

    const updated = await db.course.update({
      where: { id: courseId },
      data: { isActive: !course.isActive }
    });

    revalidatePath(`/programs/${course.program.id}/courses`);
    return { success: true, isActive: updated.isActive };
  } catch (error) {
    console.error('خطأ في تغيير حالة الحلقة:', error);
    return { error: 'فشل في تغيير حالة الحلقة' };
  }
}
