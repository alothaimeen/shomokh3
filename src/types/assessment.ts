// Assessment Types for Unified Assessment Page

export type TabType = 'daily' | 'weekly' | 'monthly' | 'final' | 'behavior' | 'tasks' | 'points';

export interface Student {
  id: string;
  studentName: string;
  studentNumber: number;
}

export interface DailyGradeEntry {
  studentId: string;
  memorization: number;
  review: number;
  notes?: string;
}

export interface WeeklyGradeEntry {
  studentId: string;
  grade: number;
}

export interface MonthlyGradeEntry {
  studentId: string;
  quranForgetfulness: number;
  quranMajorMistakes: number;
  quranMinorMistakes: number;
  tajweedTheory: number;
}

export interface FinalExamEntry {
  studentId: string;
  quranTest: number;
  tajweedTest: number;
  notes?: string;
}

export interface BehaviorGradeEntry {
  studentId: string;
  dailyScore: number;
  notes?: string;
}

export interface DailyTaskEntry {
  listening5Times: boolean;
  repetition10Times: boolean;
  recitedToPeer: boolean;
  notes?: string;
}

export interface BehaviorPointEntry {
  studentId: string;
  earlyAttendance: boolean;
  perfectMemorization: boolean;
  activeParticipation: boolean;
  timeCommitment: boolean;
  notes?: string;
}

export interface TabConfig {
  id: TabType;
  label: string;
  icon?: string;
  shortcut?: string;
}

export const TAB_CONFIGS: TabConfig[] = [
  { id: 'daily', label: 'التقييم اليومي', shortcut: 'Ctrl+1' },
  { id: 'weekly', label: 'التقييم الأسبوعي', shortcut: 'Ctrl+2' },
  { id: 'monthly', label: 'التقييم الشهري', shortcut: 'Ctrl+3' },
  { id: 'final', label: 'الاختبار النهائي', shortcut: 'Ctrl+4' },
  { id: 'behavior', label: 'السلوك', shortcut: 'Ctrl+5' },
  { id: 'tasks', label: 'المهام اليومية', shortcut: 'Ctrl+6' },
  { id: 'points', label: 'النقاط السلوكية', shortcut: 'Ctrl+7' },
];
