import { db } from '@/lib/db';
import StudentDashboard from './StudentDashboard';

async function getStudentData(userId: string) {
    const student = await db.student.findUnique({
        where: { userId },
        include: {
            enrollments: {
                include: {
                    course: {
                        include: {
                            program: { select: { programName: true } },
                            teacher: { select: { userName: true } }
                        }
                    }
                }
            }
        }
    });

    if (!student) return [];

    return student.enrollments.map(e => ({
        id: e.id,
        courseName: e.course.courseName,
        programName: e.course.program.programName,
        level: 1,
        teacherName: e.course.teacher?.userName || 'غير محدد'
    }));
}

interface Props {
    userId: string;
}

export default async function StudentEnrollmentsAsync({ userId }: Props) {
    const enrollments = await getStudentData(userId);
    return <StudentDashboard enrollments={enrollments} />;
}
