import React, { useState, useEffect, memo } from 'react';
import { DailyTaskEntry } from '@/types/assessment';

interface DailyTasksTabProps {
  courseId: string;
  date: string;
  onUnsavedChanges: (hasChanges: boolean) => void;
}

export const DailyTasksTab = memo(({ courseId, date, onUnsavedChanges }: DailyTasksTabProps) => {
  const [taskData, setTaskData] = useState<DailyTaskEntry>({
    listening5Times: false,
    repetition10Times: false,
    recitedToPeer: false,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (courseId && date) {
      fetchTask();
    }
  }, [courseId, date]);

  const fetchTask = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/points/daily-tasks?courseId=${courseId}&date=${date}`);
      const data = await response.json();
      
      if (data.task) {
        setTaskData({
          listening5Times: data.task.listening5Times || false,
          repetition10Times: data.task.repetition10Times || false,
          recitedToPeer: data.task.recitedToPeer || false,
          notes: data.task.notes || ''
        });
      } else {
        setTaskData({
          listening5Times: false,
          repetition10Times: false,
          recitedToPeer: false,
          notes: ''
        });
      }
    } catch (error) {
      console.error('خطأ في جلب المهام:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (field: keyof DailyTaskEntry) => {
    if (field === 'notes') return;
    
    setTaskData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
    onUnsavedChanges(true);
    setMessage('');
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/points/daily-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          date,
          ...taskData
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ تم حفظ المهام بنجاح');
        onUnsavedChanges(false);
        
        const totalPoints = 
          (taskData.listening5Times ? 5 : 0) +
          (taskData.repetition10Times ? 5 : 0) +
          (taskData.recitedToPeer ? 5 : 0);
        
        setMessage(`✅ تم حفظ المهام بنجاح. النقاط المحصلة: ${totalPoints}/15`);
      } else {
        setMessage(`❌ ${data.error || 'فشل في حفظ المهام'}`);
      }
    } catch (error) {
      console.error('خطأ في حفظ المهام:', error);
      setMessage('❌ حدث خطأ في حفظ المهام');
    } finally {
      setSaving(false);
    }
  };

  const totalPoints = 
    (taskData.listening5Times ? 5 : 0) +
    (taskData.repetition10Times ? 5 : 0) +
    (taskData.recitedToPeer ? 5 : 0);

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        المهام اليومية - {new Date(date).toLocaleDateString('ar-EG')}
      </h3>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-700">
          <strong>ملاحظة:</strong> المهام اليومية تعتمد على أمانة الطالبة في تسجيل إنجازاتها.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="flex items-center space-x-3 space-x-reverse">
          <input
            type="checkbox"
            id="listening"
            checked={taskData.listening5Times}
            onChange={() => handleCheckboxChange('listening5Times')}
            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="listening" className="text-gray-700 font-medium">
            السماع 5 مرات (5 نقاط)
          </label>
        </div>

        <div className="flex items-center space-x-3 space-x-reverse">
          <input
            type="checkbox"
            id="repetition"
            checked={taskData.repetition10Times}
            onChange={() => handleCheckboxChange('repetition10Times')}
            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="repetition" className="text-gray-700 font-medium">
            التكرار 10 مرات (5 نقاط)
          </label>
        </div>

        <div className="flex items-center space-x-3 space-x-reverse">
          <input
            type="checkbox"
            id="recited"
            checked={taskData.recitedToPeer}
            onChange={() => handleCheckboxChange('recitedToPeer')}
            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="recited" className="text-gray-700 font-medium">
            السرد على الرفيقة (5 نقاط)
          </label>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">
              مجموع النقاط:
            </span>
            <span className="text-2xl font-bold text-indigo-600">
              {totalPoints} / 15
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {saving ? 'جاري الحفظ...' : 'حفظ المهام'}
        </button>
      </div>
    </div>
  );
});

DailyTasksTab.displayName = 'DailyTasksTab';
