'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Program {
  id: string;
  programName: string;
  programDescription: string;
  isActive: boolean;
  createdAt: string;
  coursesCount: number;
}

export default function ProgramsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProgram, setNewProgram] = useState({ programName: '', programDescription: '' });

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

  // بيانات تجريبية للبرامج
  useEffect(() => {
    const mockPrograms: Program[] = [
      {
        id: '1',
        programName: 'برنامج حفظ القرآن الكريم',
        programDescription: 'برنامج متكامل لحفظ القرآن الكريم مع التجويد',
        isActive: true,
        createdAt: '2025-01-01',
        coursesCount: 3
      },
      {
        id: '2',
        programName: 'برنامج التجويد المتقدم',
        programDescription: 'برنامج تخصصي في علم التجويد وأحكام التلاوة',
        isActive: true,
        createdAt: '2025-01-15',
        coursesCount: 2
      },
      {
        id: '3',
        programName: 'برنامج الدراسات القرآنية',
        programDescription: 'برنامج شامل للدراسات القرآنية والتفسير',
        isActive: false,
        createdAt: '2025-02-01',
        coursesCount: 1
      }
    ];
    setPrograms(mockPrograms);
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحقق من الجلسة...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const userRole = session.user?.role;
  const canManagePrograms = userRole === 'ADMIN' || userRole === 'MANAGER';

  const handleAddProgram = () => {
    if (newProgram.programName.trim()) {
      const program: Program = {
        id: Date.now().toString(),
        programName: newProgram.programName,
        programDescription: newProgram.programDescription,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
        coursesCount: 0
      };
      setPrograms([...programs, program]);
      setNewProgram({ programName: '', programDescription: '' });
      setShowAddForm(false);
    }
  };

  const toggleProgramStatus = (programId: string) => {
    setPrograms(programs.map(program =>
      program.id === programId
        ? { ...program, isActive: !program.isActive }
        : program
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              إدارة البرامج التعليمية
            </h1>
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
                لوحة التحكم
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">

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
                            <span>📚 {program.coursesCount} حلقة</span>
                            <span>📅 {program.createdAt}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              program.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {program.isActive ? 'نشط' : 'غير نشط'}
                            </span>
                          </div>
                        </div>

                        {canManagePrograms && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleProgramStatus(program.id)}
                              className={`px-3 py-1 rounded text-sm ${
                                program.isActive
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              } transition-colors`}
                            >
                              {program.isActive ? 'إيقاف' : 'تفعيل'}
                            </button>
                            <Link
                              href={`/programs/${program.id}/courses`}
                              className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded text-sm transition-colors"
                            >
                              الحلقات
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}