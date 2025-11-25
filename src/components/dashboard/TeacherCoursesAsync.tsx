import { db } from '@/lib/db';
import TeacherDashboard from './TeacherDashboard';

async function getTeacherData(teacherId: string) {
    const courses = await db.course.findMany({
        where: { teacherId },
        select: {
            id: true,
            courseName: true,
            program: { select: { programName: true } },
            _count: { select: { enrollments: true } }
        }
    });

    return courses.map(c => ({
        id: c.id,
        courseName: c.courseName,
        programName: c.program.programName,
        level: 1,
        studentsCount: c._count.enrollments
    }));
}

interface Props {
    teacherId: string;
}

export default async function TeacherCoursesAsync({ teacherId }: Props) {
    const courses = await getTeacherData(teacherId);
    return <TeacherDashboard courses={courses} />;
}
