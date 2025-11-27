'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * Server Action لجلب تقرير الحضور الشامل
 */
export async function getAttendanceReport(courseId?: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: 'غير مصرح' };
  }

  try {
    const whereClause: any = {};
    
    // ADMIN يرى كل شيء، TEACHER يرى حلقاته فقط
    if (session.user.role === 'TEACHER') {
      const teacherCourses = await db.course.findMany({
        where: { teacherId: session.user.id },
        select: { id: true }
      });
      whereClause.courseId = { in: teacherCourses.map(c => c.id) };
    }
    
    if (courseId) {
      whereClause.courseId = courseId;
    }

    const attendanceRecords = await db.attendance.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            studentNumber: true,
            studentName: true
          }
        },
        course: {
          select: {
            courseName: true,
            program: {
              select: { programName: true }
            }
          }
        }
      },
      orderBy: [
        { date: 'desc' },
        { student: { studentNumber: 'asc' } }
      ]
    });

    const report = attendanceRecords.map(record => ({
      date: record.date.toISOString().split('T')[0],
      studentNumber: record.student.studentNumber.toString(),
      studentName: record.student.studentName,
      courseName: record.course.courseName,
      programName: record.course.program.programName,
      status: record.status,
      statusLabel: getAttendanceStatusLabel(record.status)
    }));

    return { success: true, data: report };
  } catch (error) {
    console.error('Error fetching attendance report:', error);
    return { error: 'حدث خطأ أثناء جلب التقرير' };
  }
}

/**
 * Server Action لجلب تقرير النقاط التحفيزية
 */
export async function getBehaviorPointsReport(courseId?: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: 'غير مصرح' };
  }

  try {
    const whereClause: any = {};
    
    if (session.user.role === 'TEACHER') {
      const teacherCourses = await db.course.findMany({
        where: { teacherId: session.user.id },
        select: { id: true }
      });
      whereClause.courseId = { in: teacherCourses.map(c => c.id) };
    }
    
    if (courseId) {
      whereClause.courseId = courseId;
    }

    const behaviorRecords = await db.behaviorPoint.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            studentNumber: true,
            studentName: true
          }
        },
        course: {
          select: {
            courseName: true
          }
        }
      },
      orderBy: [
        { date: 'desc' },
        { student: { studentNumber: 'asc' } }
      ]
    });

    // تجميع النقاط لكل طالبة
    const studentsMap = new Map<string, {
      studentId: string;
      studentNumber: number;
      studentName: string;
      courseName: string;
      totalPoints: number;
      positivePoints: number;
      negativePoints: number;
      recordsCount: number;
    }>();

    behaviorRecords.forEach(record => {
      const key = `${record.studentId}-${record.courseId}`;
      
      // حساب النقاط من الحقول Boolean (كل حقل = 5 نقاط)
      const points = 
        (record.earlyAttendance ? 5 : 0) +
        (record.perfectMemorization ? 5 : 0) +
        (record.activeParticipation ? 5 : 0) +
        (record.timeCommitment ? 5 : 0);
      
      const existing = studentsMap.get(key);
      
      if (existing) {
        existing.totalPoints += points;
        existing.positivePoints += points;
        existing.recordsCount++;
      } else {
        studentsMap.set(key, {
          studentId: record.studentId,
          studentNumber: record.student.studentNumber,
          studentName: record.student.studentName,
          courseName: record.course.courseName,
          totalPoints: points,
          positivePoints: points,
          negativePoints: 0,
          recordsCount: 1
        });
      }
    });

    const report = Array.from(studentsMap.values()).sort((a, b) => 
      b.totalPoints - a.totalPoints
    );

    return { success: true, data: report };
  } catch (error) {
    console.error('Error fetching behavior points report:', error);
    return { error: 'حدث خطأ أثناء جلب التقرير' };
  }
}

/**
 * Server Action لجلب إحصائيات Dashboard المتقدمة
 */
export async function getDashboardStats() {
  const session = await auth();
  if (!session?.user) {
    return { error: 'غير مصرح' };
  }

  try {
    const role = session.user.role;

    if (role === 'ADMIN') {
      // إحصائيات المديرة
      const [
        totalStudents,
        totalTeachers,
        totalCourses,
        activeEnrollments,
        recentAttendance
      ] = await Promise.all([
        db.student.count(),
        db.user.count({ where: { userRole: 'TEACHER' } }),
        db.course.count(),
        db.enrollment.count({ where: { isActive: true } }),
        db.attendance.count({
          where: {
            date: {
              gte: new Date(new Date().setDate(new Date().getDate() - 7))
            }
          }
        })
      ]);

      // حساب أفضل 5 طالبات بناءً على النقاط التحفيزية
      const allBehaviorPoints = await db.behaviorPoint.findMany({
        include: {
          student: {
            select: {
              studentName: true,
              studentNumber: true
            }
          }
        }
      });

      // حساب النقاط لكل طالبة
      const studentPointsMap = new Map<string, {
        studentName: string;
        studentNumber: number;
        points: number;
      }>();

      allBehaviorPoints.forEach(record => {
        const points = 
          (record.earlyAttendance ? 5 : 0) +
          (record.perfectMemorization ? 5 : 0) +
          (record.activeParticipation ? 5 : 0) +
          (record.timeCommitment ? 5 : 0);
        
        const existing = studentPointsMap.get(record.studentId);
        if (existing) {
          existing.points += points;
        } else {
          studentPointsMap.set(record.studentId, {
            studentName: record.student.studentName,
            studentNumber: record.student.studentNumber,
            points
          });
        }
      });

      const topStudentsData = Array.from(studentPointsMap.values())
        .sort((a, b) => b.points - a.points)
        .slice(0, 5);

      return {
        success: true,
        data: {
          totalStudents,
          totalTeachers,
          totalCourses,
          activeEnrollments,
          recentAttendance,
          topStudents: topStudentsData
        }
      };
    }

    if (role === 'TEACHER') {
      // إحصائيات المعلمة
      const courses = await db.course.findMany({
        where: { teacherId: session.user.id },
        include: {
          _count: {
            select: {
              enrollments: true,
              attendances: true
            }
          }
        }
      });

      const totalStudents = courses.reduce((sum, c) => sum + c._count.enrollments, 0);
      const totalAttendance = courses.reduce((sum, c) => sum + c._count.attendances, 0);

      return {
        success: true,
        data: {
          totalCourses: courses.length,
          totalStudents,
          totalAttendance,
          courses: courses.map(c => ({
            id: c.id,
            courseName: c.courseName,
            studentsCount: c._count.enrollments,
            attendanceCount: c._count.attendances
          }))
        }
      };
    }

    if (role === 'STUDENT') {
      // إحصائيات الطالبة
      const student = await db.student.findUnique({
        where: { userId: session.user.id },
        include: {
          enrollments: {
            include: {
              course: { select: { courseName: true } }
            }
          },
          attendances: { where: { status: 'PRESENT' } },
          behaviorPoints: true
        }
      });

      if (!student) {
        return { error: 'لم يتم العثور على بيانات الطالبة' };
      }

      // حساب النقاط من الحقول Boolean
      const totalPoints = student.behaviorPoints.reduce((sum, p) => {
        const points = 
          (p.earlyAttendance ? 5 : 0) +
          (p.perfectMemorization ? 5 : 0) +
          (p.activeParticipation ? 5 : 0) +
          (p.timeCommitment ? 5 : 0);
        return sum + points;
      }, 0);
      
      // حساب نسبة الحضور: جلب جميع سجلات الحضور (بدون فلتر)
      const totalAttendanceRecords = await db.attendance.count({
        where: {
          studentId: student.id
        }
      });
      
      const attendanceRate = totalAttendanceRecords > 0 
        ? Math.round((student.attendances.length / totalAttendanceRecords) * 100)
        : 0;

      return {
        success: true,
        data: {
          totalCourses: student.enrollments.length,
          totalAttendance: student.attendances.length,
          totalPoints,
          attendanceRate,
          courses: student.enrollments.map(e => e.course.courseName)
        }
      };
    }

    return { error: 'دور غير معروف' };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { error: 'حدث خطأ أثناء جلب الإحصائيات' };
  }
}

// Helper function
function getAttendanceStatusLabel(status: string): string {
  const labels: { [key: string]: string } = {
    'PRESENT': 'حاضرة',
    'EXCUSED': 'غائبة بعذر',
    'ABSENT': 'غائبة بدون عذر',
    'REVIEWED': 'راجعت بدون حضور',
    'LEFT_EARLY': 'خروج مبكر'
  };
  return labels[status] || status;
}
