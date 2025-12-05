/**
 * مكتبة تحويل التاريخ الهجري (أم القرى)
 * خوارزمية حسابية موثوقة
 */

/**
 * أسماء الأشهر الهجرية
 */
export const HIJRI_MONTHS = [
  'محرم',
  'صفر',
  'ربيع الأول',
  'ربيع الآخر',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة'
];

/**
 * أسماء الأيام بالعربية
 */
export const WEEKDAYS = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت'
];

/**
 * أسماء الأشهر الميلادية بالعربية
 */
export const GREGORIAN_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر'
];

/**
 * جدول بدايات الأشهر الهجرية بتقويم أم القرى
 * المصدر: تقويم أم القرى الرسمي (https://www.ummulqura.org.sa)
 * الفورمات: [سنة, شهر, يوم] = التاريخ الميلادي لأول يوم في الشهر الهجري
 */
const UMM_AL_QURA_MONTHS: { [key: string]: [number, number, number] } = {
  // 1445
  '1445-1': [2023, 7, 19], '1445-2': [2023, 8, 18], '1445-3': [2023, 9, 16],
  '1445-4': [2023, 10, 16], '1445-5': [2023, 11, 14], '1445-6': [2023, 12, 14],
  '1445-7': [2024, 1, 12], '1445-8': [2024, 2, 11], '1445-9': [2024, 3, 11],
  '1445-10': [2024, 4, 10], '1445-11': [2024, 5, 9], '1445-12': [2024, 6, 7],
  // 1446
  '1446-1': [2024, 7, 7], '1446-2': [2024, 8, 5], '1446-3': [2024, 9, 4],
  '1446-4': [2024, 10, 3], '1446-5': [2024, 11, 2], '1446-6': [2024, 12, 1],
  '1446-7': [2024, 12, 31], '1446-8': [2025, 1, 30], '1446-9': [2025, 2, 28],
  '1446-10': [2025, 3, 30], '1446-11': [2025, 4, 28], '1446-12': [2025, 5, 27],
  // 1447 - تصحيح بحسب تقويم أم القرى الرسمي
  '1447-1': [2025, 6, 26], '1447-2': [2025, 7, 25], '1447-3': [2025, 8, 24],
  '1447-4': [2025, 9, 22], '1447-5': [2025, 10, 22], '1447-6': [2025, 11, 20],
  '1447-7': [2025, 12, 20], '1447-8': [2026, 1, 18], '1447-9': [2026, 2, 17],
  '1447-10': [2026, 3, 18], '1447-11': [2026, 4, 17], '1447-12': [2026, 5, 16],
  // 1448
  '1448-1': [2026, 6, 15], '1448-2': [2026, 7, 14], '1448-3': [2026, 8, 13],
  '1448-4': [2026, 9, 11], '1448-5': [2026, 10, 11], '1448-6': [2026, 11, 9],
  '1448-7': [2026, 12, 9], '1448-8': [2027, 1, 7], '1448-9': [2027, 2, 6],
  '1448-10': [2027, 3, 7], '1448-11': [2027, 4, 6], '1448-12': [2027, 5, 5],
  // 1449
  '1449-1': [2027, 6, 4], '1449-2': [2027, 7, 3], '1449-3': [2027, 8, 2],
  '1449-4': [2027, 8, 31], '1449-5': [2027, 9, 30], '1449-6': [2027, 10, 29],
  '1449-7': [2027, 11, 28], '1449-8': [2027, 12, 27], '1449-9': [2028, 1, 26],
  '1449-10': [2028, 2, 24], '1449-11': [2028, 3, 25], '1449-12': [2028, 4, 23],
  // 1450
  '1450-1': [2028, 5, 23], '1450-2': [2028, 6, 21], '1450-3': [2028, 7, 21],
  '1450-4': [2028, 8, 19], '1450-5': [2028, 9, 18], '1450-6': [2028, 10, 17],
  '1450-7': [2028, 11, 16], '1450-8': [2028, 12, 15], '1450-9': [2029, 1, 14],
  '1450-10': [2029, 2, 12], '1450-11': [2029, 3, 14], '1450-12': [2029, 4, 12],
};

/**
 * تحويل تاريخ ميلادي إلى هجري (تقويم أم القرى الرسمي)
 * @param date التاريخ الميلادي
 * @returns كائن التاريخ الهجري {year, month, day}
 */
export function convertToHijri(date: Date): { year: number; month: number; day: number } {
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  // البحث في جدول أم القرى
  for (let year = 1450; year >= 1445; year--) {
    for (let month = 12; month >= 1; month--) {
      const key = `${year}-${month}`;
      const monthStart = UMM_AL_QURA_MONTHS[key];
      if (!monthStart) continue;
      
      const startDate = new Date(monthStart[0], monthStart[1] - 1, monthStart[2]);
      if (targetDate >= startDate) {
        const diffDays = Math.floor((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const day = diffDays + 1;
        
        // إذا اليوم أكبر من 30، ننتقل للشهر التالي
        if (day > 30) {
          const nextMonth = month === 12 ? 1 : month + 1;
          const nextYear = month === 12 ? year + 1 : year;
          return { year: nextYear, month: nextMonth, day: day - 30 };
        }
        
        return { year, month, day };
      }
    }
  }
  
  // Fallback للتواريخ خارج النطاق (استخدام خوارزمية حسابية)
  const jd = gregorianToJulian(date.getFullYear(), date.getMonth() + 1, date.getDate());
  return julianToHijriFallback(jd);
}

/**
 * تحويل من ميلادي إلى يوليان (للـ Fallback)
 */
function gregorianToJulian(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

/**
 * تحويل من يوليان إلى هجري (Fallback)
 */
function julianToHijriFallback(jd: number): { year: number; month: number; day: number } {
  const L = Math.floor(jd - 1948439.5) + 10632;
  const N = Math.floor((L - 1) / 10631);
  const L2 = L - 10631 * N + 354;
  const J = Math.floor((10985 - L2) / 5316) * Math.floor(50 * L2 / 17719) + Math.floor(L2 / 5670) * Math.floor(43 * L2 / 15238);
  const L3 = L2 - Math.floor((30 - J) / 15) * Math.floor(17719 * J / 50) - Math.floor(J / 16) * Math.floor(15238 * J / 43) + 29;
  const month = Math.floor(24 * L3 / 709);
  const day = L3 - Math.floor(709 * month / 24);
  const year = 30 * N + J - 30;
  
  return { year, month, day };
}

/**
 * تنسيق التاريخ الهجري
 * @param date التاريخ الميلادي
 * @returns نص التاريخ الهجري مثل: "15 جمادى الأولى 1447هـ"
 */
export function formatHijriDate(date: Date): string {
  const hijri = convertToHijri(date);
  const monthName = HIJRI_MONTHS[hijri.month - 1];
  
  return `${hijri.day} ${monthName} ${hijri.year}هـ`;
}

/**
 * تنسيق التاريخ مع اسم اليوم
 * @param date التاريخ الميلادي
 * @returns نص مثل: "الأحد 15 جمادى الأولى 1447هـ"
 */
export function formatHijriDateWithDay(date: Date): string {
  const dayName = WEEKDAYS[date.getDay()];
  const hijriDate = formatHijriDate(date);
  
  return `${dayName} ${hijriDate}`;
}

/**
 * تنسيق التاريخ الهجري والميلادي معاً
 * @param date التاريخ
 * @returns نص مثل: "الأحد 15 جمادى الأولى 1447هـ الموافق 17 نوفمبر 2025م"
 */
export function formatFullDate(date: Date): string {
  const hijriWithDay = formatHijriDateWithDay(date);
  const gregorianDay = date.getDate();
  const gregorianMonth = GREGORIAN_MONTHS[date.getMonth()];
  const gregorianYear = date.getFullYear();
  
  return `${hijriWithDay} الموافق ${gregorianDay} ${gregorianMonth} ${gregorianYear}م`;
}

/**
 * تنسيق مختصر للتاريخ الهجري فقط
 * @param date التاريخ
 * @returns نص مثل: "15/5/1447هـ"
 */
export function formatHijriDateShort(date: Date): string {
  const hijri = convertToHijri(date);
  return `${hijri.day}/${hijri.month}/${hijri.year}هـ`;
}

/**
 * الحصول على التاريخ الهجري الحالي
 * @returns نص التاريخ الهجري الحالي
 */
export function getCurrentHijriDate(): string {
  return formatHijriDate(new Date());
}

/**
 * الحصول على التاريخ الكامل الحالي (هجري وميلادي)
 * @returns نص التاريخ الكامل
 */
export function getCurrentFullDate(): string {
  return formatFullDate(new Date());
}

/**
 * تحويل تاريخ هجري إلى ميلادي (تقويم أم القرى الرسمي)
 * @param year السنة الهجرية
 * @param month الشهر الهجري (1-12)
 * @param day اليوم الهجري
 * @returns كائن Date ميلادي
 */
export function convertHijriToGregorian(year: number, month: number, day: number): Date {
  const key = `${year}-${month}`;
  const monthStart = UMM_AL_QURA_MONTHS[key];
  
  if (monthStart) {
    // استخدام جدول أم القرى
    const startDate = new Date(monthStart[0], monthStart[1] - 1, monthStart[2]);
    startDate.setDate(startDate.getDate() + day - 1);
    return startDate;
  }
  
  // Fallback للتواريخ خارج النطاق
  const jd = hijriToJulianFallback(year, month, day);
  return julianToGregorianFallback(jd);
}

/**
 * تحويل من هجري إلى يوليان (Fallback)
 */
function hijriToJulianFallback(year: number, month: number, day: number): number {
  return Math.floor((11 * year + 3) / 30) + 354 * year + 30 * month - Math.floor((month - 1) / 2) + day + 1948440 - 385;
}

/**
 * تحويل من يوليان إلى ميلادي (Fallback)
 */
function julianToGregorianFallback(jd: number): Date {
  const Z = Math.floor(jd + 0.5);
  const A = Math.floor((Z - 1867216.25) / 36524.25);
  const A2 = Z + 1 + A - Math.floor(A / 4);
  const B = A2 + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);
  
  const day = B - D - Math.floor(30.6001 * E);
  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;
  
  return new Date(year, month - 1, day);
}

/**
 * الحصول على عدد أيام الشهر الهجري (من جدول أم القرى)
 * @param year السنة الهجرية
 * @param month الشهر الهجري (1-12)
 * @returns عدد الأيام
 */
export function getHijriMonthDays(year: number, month: number): number {
  const currentKey = `${year}-${month}`;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const nextKey = `${nextYear}-${nextMonth}`;
  
  const currentStart = UMM_AL_QURA_MONTHS[currentKey];
  const nextStart = UMM_AL_QURA_MONTHS[nextKey];
  
  if (currentStart && nextStart) {
    const start = new Date(currentStart[0], currentStart[1] - 1, currentStart[2]);
    const end = new Date(nextStart[0], nextStart[1] - 1, nextStart[2]);
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  // Fallback
  const oddMonths = [1, 3, 5, 7, 9, 11];
  return oddMonths.includes(month) ? 30 : 29;
}

/**
 * الحصول على عدد أيام الشهر الميلادي
 * @param year السنة الميلادية
 * @param month الشهر الميلادي (1-12)
 * @returns عدد الأيام
 */
export function getGregorianMonthDays(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}
