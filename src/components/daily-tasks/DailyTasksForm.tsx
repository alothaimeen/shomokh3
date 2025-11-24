'use client';

import { useState } from 'react';
import { updateDailyTask } from '@/actions/points';

interface DailyTask {
  date: string;
  listening5Times: boolean;
  repetition10Times: boolean;
  recitedToPeer: boolean;
  notes?: string;
}

interface DailyTasksFormProps {
  courseId: string;
  initialTask: DailyTask | null;
  initialDate: string;
}

export default function DailyTasksForm({ courseId, initialTask, initialDate }: DailyTasksFormProps) {
  const [taskData, setTaskData] = useState<DailyTask>(initialTask || {
    date: initialDate,
    listening5Times: false,
    repetition10Times: false,
    recitedToPeer: false,
    notes: ''
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('courseId', courseId);
      formData.append('date', taskData.date);
      formData.append('listening5Times', String(taskData.listening5Times));
      formData.append('repetition10Times', String(taskData.repetition10Times));
      formData.append('recitedToPeer', String(taskData.recitedToPeer));
      if (taskData.notes) formData.append('notes', taskData.notes);

      const result = await updateDailyTask(formData);

      if (result.success) {
        setMessage('✅ تم حفظ المهام بنجاح!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ ' + (result.error || 'حدث خطأ أثناء الحفظ'));
      }
    } catch (error) {
      setMessage('❌ حدث خطأ أثناء الحفظ');
      console.error('Error saving task:', error);
    } finally {
      setSaving(false);
    }
  };

  const calculatePoints = () => {
    return (taskData.listening5Times ? 5 : 0) + 
           (taskData.repetition10Times ? 5 : 0) + 
           (taskData.recitedToPeer ? 5 : 0);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex items-center">
        <input
          type="checkbox"
          id="listening5Times"
          checked={taskData.listening5Times}
          onChange={(e) => setTaskData({...taskData, listening5Times: e.target.checked})}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="listening5Times" className="mr-2 text-sm font-medium text-gray-700">
          🎧 السماع 5 مرات (5 نقاط)
        </label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="repetition10Times"
          checked={taskData.repetition10Times}
          onChange={(e) => setTaskData({...taskData, repetition10Times: e.target.checked})}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="repetition10Times" className="mr-2 text-sm font-medium text-gray-700">
          🔄 التكرار 10 مرات (5 نقاط)
        </label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="recitedToPeer"
          checked={taskData.recitedToPeer}
          onChange={(e) => setTaskData({...taskData, recitedToPeer: e.target.checked})}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="recitedToPeer" className="mr-2 text-sm font-medium text-gray-700">
          👭 السرد على الرفيقة (5 نقاط)
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📝 ملاحظات (اختياري)
        </label>
        <textarea
          value={taskData.notes || ''}
          onChange={(e) => setTaskData({...taskData, notes: e.target.value})}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          placeholder="أي ملاحظات إضافية..."
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-lg font-semibold text-blue-900">
          🏆 مجموع النقاط اليوم: {calculatePoints()} نقطة
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition-colors disabled:bg-gray-400"
      >
        {saving ? 'جاري الحفظ...' : '💾 حفظ المهام'}
      </button>
    </form>
  );
}
