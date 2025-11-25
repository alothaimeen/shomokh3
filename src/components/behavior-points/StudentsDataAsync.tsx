import { getBehaviorPoints } from '@/lib/data/queries';
import BehaviorPointsForm from '@/components/grades/BehaviorPointsForm';

interface StudentsDataAsyncProps {
  courseId: string;
  selectedDate: string;
}

export default async function StudentsDataAsync({ 
  courseId, 
  selectedDate 
}: StudentsDataAsyncProps) {
  if (!courseId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800">الرجاء اختيار حلقة</p>
      </div>
    );
  }

  const students = await getBehaviorPoints(courseId, selectedDate);

  if (students.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800">لا توجد طالبات مسجلات</p>
      </div>
    );
  }

  return <BehaviorPointsForm students={students} courseId={courseId} selectedDate={selectedDate} />;
}
