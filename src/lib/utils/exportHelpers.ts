import type {
  AttendanceReportItem,
  BehaviorPointsReportItem,
  AcademicReportItem,
  ReportFilters,
  SortOptions,
  ExportFormat
} from '@/actions/reports';

// ==================== CSV GENERATION ====================

export function generateCSV(headers: string[], rows: string[][]): string {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => escapeCsvCell(cell)).join(','))
  ].join('\n');
  return '\uFEFF' + csvContent;
}

function escapeCsvCell(cell: string | number | null | undefined): string {
  if (cell === null || cell === undefined) return '';
  const str = String(cell);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ==================== FILE NAMING ====================

export function generateFileName(
  reportType: 'attendance' | 'behavior' | 'academic',
  filters?: ReportFilters,
  format?: ExportFormat
): string {
  const timestamp = new Date().toISOString().split('T')[0];
  let parts: string[] = [reportType];
  if (filters?.courseId) parts.push('course');
  if (filters?.studentId) parts.push('student');
  if (filters?.dateFrom && filters?.dateTo) {
    parts.push(`${filters.dateFrom}_to_${filters.dateTo}`);
  } else if (filters?.dateFrom) {
    parts.push(`from_${filters.dateFrom}`);
  } else if (filters?.dateTo) {
    parts.push(`until_${filters.dateTo}`);
  }
  if (format) parts.push(format);
  parts.push(timestamp);
  return `report_${parts.join('_')}.csv`;
}
// ==================== ATTENDANCE REPORT EXPORT ====================

export function exportAttendanceReport(
  data: AttendanceReportItem[],
  format: ExportFormat,
  filters?: ReportFilters
): void {
  const headers = format === 'detailed'
    ? ['التاريخ', 'رقم الطالبة', 'اسم الطالبة', 'الحلقة', 'البرنامج', 'الحالة']
    : ['التاريخ', 'رقم الطالبة', 'اسم الطالبة', 'الحالة'];

  const rows = data.map(item =>
    format === 'detailed'
      ? [item.date, String(item.studentNumber), item.studentName, item.courseName, item.programName, item.statusLabel]
      : [item.date, String(item.studentNumber), item.studentName, item.statusLabel]
  );

  const csv = generateCSV(headers, rows);
  const fileName = generateFileName('attendance', filters, format);
  downloadCSV(csv, fileName);
}

// ==================== BEHAVIOR POINTS REPORT EXPORT ====================

export function exportBehaviorPointsReport(
  data: BehaviorPointsReportItem[],
  format: ExportFormat,
  filters?: ReportFilters
): void {
  const headers = format === 'detailed'
    ? ['رقم الطالبة', 'اسم الطالبة', 'الحلقة', 'إجمالي النقاط', 'نقاط الحضور المبكر', 'نقاط الحفظ المتقن', 'نقاط المشاركة النشطة', 'نقاط الالتزام بالوقت', 'عدد الجلسات', 'المعدل لكل جلسة']
    : ['رقم الطالبة', 'اسم الطالبة', 'الحلقة', 'إجمالي النقاط', 'المعدل لكل جلسة'];

  const rows = data.map(item =>
    format === 'detailed'
      ? [String(item.studentNumber), item.studentName, item.courseName, String(item.totalPoints), String(item.earlyAttendancePoints), String(item.perfectMemorizationPoints), String(item.activeParticipationPoints), String(item.timeCommitmentPoints), String(item.recordsCount), String(item.averagePerSession)]
      : [String(item.studentNumber), item.studentName, item.courseName, String(item.totalPoints), String(item.averagePerSession)]
  );

  const csv = generateCSV(headers, rows);
  const fileName = generateFileName('behavior', filters, format);
  downloadCSV(csv, fileName);
}

// ==================== ACADEMIC REPORT EXPORT ====================

export function exportAcademicReport(
  data: AcademicReportItem[],
  format: ExportFormat,
  filters?: ReportFilters
): void {
  const headers = format === 'detailed'
    ? ['رقم الطالبة', 'اسم الطالبة', 'الحلقة', 'الدرجات اليومية', 'الدرجات الأسبوعية', 'الدرجات الشهرية', 'الدرجات السلوكية', 'الإجمالي', 'المعدل', 'النسبة المئوية', 'الحالة']
    : ['رقم الطالبة', 'اسم الطالبة', 'الحلقة', 'الإجمالي', 'النسبة المئوية', 'الحالة'];

  const rows = data.map(item =>
    format === 'detailed'
      ? [String(item.studentNumber), item.studentName, item.courseName, String(item.dailyGrades.total), String(item.weeklyGrades.total), String(item.monthlyGrades.total), String(item.behaviorGrades.total), String(item.overallTotal), String(item.overallAverage), `${item.percentage}%`, item.status]
      : [String(item.studentNumber), item.studentName, item.courseName, String(item.overallTotal), `${item.percentage}%`, item.status]
  );

  const csv = generateCSV(headers, rows);
  const fileName = generateFileName('academic', filters, format);
  downloadCSV(csv, fileName);
}

// ==================== DOWNLOAD HELPER ====================

function downloadCSV(csv: string, fileName: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// ==================== FILTER & SORT DESCRIPTIONS ====================

export function getFilterDescription(filters?: ReportFilters): string {
  if (!filters) return 'جميع البيانات';
  const parts: string[] = [];
  if (filters.courseId) parts.push('حلقة محددة');
  if (filters.studentId) parts.push('طالبة محددة');
  if (filters.status) parts.push(`الحالة: ${filters.status}`);
  if (filters.dateFrom) parts.push(`من ${filters.dateFrom}`);
  if (filters.dateTo) parts.push(`إلى ${filters.dateTo}`);
  return parts.length > 0 ? parts.join(' - ') : 'جميع البيانات';
}

export function getSortDescription(sortBy?: SortOptions): string {
  if (!sortBy) return 'الترتيب الافتراضي';
  const fieldNames: Record<string, string> = {
    date: 'التاريخ',
    studentName: 'اسم الطالبة',
    studentNumber: 'رقم الطالبة',
    courseName: 'الحلقة',
    status: 'الحالة',
    points: 'النقاط',
    total: 'الإجمالي'
  };
  const orderNames = { asc: 'تصاعدي', desc: 'تنازلي' };
  const fieldName = fieldNames[sortBy.field] || sortBy.field;
  const orderName = orderNames[sortBy.order];
  return `${fieldName} (${orderName})`;
}

