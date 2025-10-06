// src/lib/course-ownership.ts
// دالة فحص ملكية الحلقة - حماية أساسية ضد الوصول غير المصرح به

import { prisma } from '@/lib/db';

/**
 * التحقق من أن المستخدم يملك حق الوصول للحلقة المحددة
 *
 * @param userId - معرف المستخدم
 * @param courseId - معرف الحلقة
 * @param userRole - دور المستخدم (ADMIN, TEACHER, STUDENT)
 * @returns Promise<boolean> - true إذا كان مصرح، false إذا لم يكن مصرح
 */
export async function checkCourseOwnership(
  userId: string,
  courseId: string,
  userRole: string
): Promise<boolean> {
  try {
    // ADMIN يمكنه الوصول لكل شيء
    if (userRole === 'ADMIN') {
      return true;
    }

    // TEACHER يجب أن يملك الحلقة
    if (userRole === 'TEACHER') {
      // التحقق من أن المعلمة تملك هذه الحلقة
      const course = await prisma.course.findFirst({
        where: {
          id: courseId,
          teacherId: userId
        }
      });

      // إذا وُجدت الحلقة، المعلمة تملكها
      return !!course;
    }

    // STUDENT - سيتم فحص enrollment في APIs منفصلة
    // هنا نرجع false لأن الطالبة لا تملك الحلقة
    return false;

  } catch (error) {
    console.error('❌ Error in checkCourseOwnership:', error);
    // في حالة الخطأ، نرفض الوصول للأمان
    return false;
  }
}

/**
 * التحقق من أن الطالبة مسجلة في الحلقة المحددة
 *
 * @param studentId - معرف الطالبة
 * @param courseId - معرف الحلقة
 * @returns Promise<boolean> - true إذا كانت مسجلة، false إذا لم تكن مسجلة
 */
export async function checkStudentEnrollment(
  studentId: string,
  courseId: string
): Promise<boolean> {
  try {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: studentId,
        courseId: courseId,
        isActive: true
      }
    });

    return !!enrollment;

  } catch (error) {
    console.error('❌ Error in checkStudentEnrollment:', error);
    return false;
  }
}

/**
 * جلب جميع الحلقات التي يملكها المستخدم
 *
 * @param userId - معرف المستخدم
 * @param userRole - دور المستخدم
 * @returns Promise<string[]> - مصفوفة معرفات الحلقات
 */
export async function getUserCourses(
  userId: string,
  userRole: string
): Promise<string[]> {
  try {
    // ADMIN يملك كل الحلقات
    if (userRole === 'ADMIN') {
      const courses = await prisma.course.findMany({
        select: { id: true }
      });
      return courses.map(c => c.id);
    }

    // TEACHER - حلقاتها فقط
    if (userRole === 'TEACHER') {
      const courses = await prisma.course.findMany({
        where: { teacherId: userId },
        select: { id: true }
      });
      return courses.map(c => c.id);
    }

    // STUDENT - الحلقات المسجلة فيها
    if (userRole === 'STUDENT') {
      const enrollments = await prisma.enrollment.findMany({
        where: {
          studentId: userId,
          isActive: true
        },
        select: { courseId: true }
      });
      return enrollments.map(e => e.courseId);
    }

    return [];

  } catch (error) {
    console.error('❌ Error in getUserCourses:', error);
    return [];
  }
}
