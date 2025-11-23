'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Program {
  id: string;
  programName: string;
  programDescription: string | null;
  isActive: boolean;
  createdAt: Date;
  _count: { courses: number };
}

export function ProgramsList({ 
  initialPrograms,
  canManagePrograms 
}: { 
  initialPrograms: Program[];
  canManagePrograms: boolean;
}) {
  const [programs, setPrograms] = useState(initialPrograms);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProgram, setNewProgram] = useState({ programName: '', programDescription: '' });

  const handleAddProgram = async () => {
    if (!newProgram.programName.trim()) return;

    try {
      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          programName: newProgram.programName,
          programDescription: newProgram.programDescription
        })
      });

      if (response.ok) {
        const newProgramData = await response.json();
        setPrograms([newProgramData, ...programs]);
        setNewProgram({ programName: '', programDescription: '' });
        setShowAddForm(false);
      } else {
        console.error('فشل في إضافة البرنامج');
        alert('فشل في إضافة البرنامج');
      }
    } catch (error) {
      console.error('خطأ في إضافة البرنامج:', error);
      alert('خطأ في الاتصال');
    }
  };

  const toggleProgramStatus = async (programId: string) => {
    const program = programs.find(p => p.id === programId);
    if (!program) return;

    try {
      const response = await fetch('/api/programs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          programId,
          isActive: !program.isActive
        })
      });

      if (response.ok) {
        setPrograms(programs.map(p =>
          p.id === programId
            ? { ...p, isActive: !p.isActive }
            : p
        ));
      } else {
        console.error('فشل في تحديث البرنامج');
        alert('فشل في تحديث البرنامج');
      }
    } catch (error) {
      console.error('خطأ في تحديث البرنامج:', error);
      alert('خطأ في الاتصال');
    }
  };

  return (
    <>
      {/* Add Program Button */}
      {canManagePrograms && (
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            إضافة برنامج جديد
          </button>
        </div>
      )}

      {/* Add Program Form */}
      {showAddForm && canManagePrograms && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-medium mb-4">إضافة برنامج جديد</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم البرنامج
              </label>
              <input
                type="text"
                value={newProgram.programName}
                onChange={(e) => setNewProgram({...newProgram, programName: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="أدخل اسم البرنامج"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وصف البرنامج
              </label>
              <textarea
                value={newProgram.programDescription}
                onChange={(e) => setNewProgram({...newProgram, programDescription: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="أدخل وصف البرنامج"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddProgram}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                إضافة
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Programs List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            قائمة البرامج ({programs.length})
          </h3>

          {programs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">لا توجد برامج مضافة حتى الآن</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {programs.map((program) => (
                <div key={program.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {program.programName}
                      </h4>
                      <p className="text-gray-600 mb-2">{program.programDescription}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>📚 {program._count.courses} حلقة</span>
                        <span>📅 {new Date(program.createdAt).toLocaleDateString('ar-SA')}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          program.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {program.isActive ? 'نشط' : 'غير نشط'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-col sm:flex-row">
                      <Link
                        href={`/programs/${program.id}/courses`}
                        className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-center"
                      >
                        📚 عرض الحلقات ({program._count.courses})
                      </Link>
                      {canManagePrograms && (
                        <button
                          onClick={() => toggleProgramStatus(program.id)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium ${
                            program.isActive
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          } transition-colors`}
                        >
                          {program.isActive ? 'إيقاف' : 'تفعيل'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
