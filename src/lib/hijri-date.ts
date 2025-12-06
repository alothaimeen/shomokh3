/**
 * مكتبة تحويل التاريخ الهجري (أم القرى)
 * تستخدم moment-hijri للتحويل الدقيق
 */

// @ts-ignore
import moment from 'moment-hijri';

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
 * تحويل تاريخ ميلادي إلى هجري
 * @param date التاريخ الميلادي
 * @returns كائن التاريخ الهجري {year, month, day}
 */
export function convertToHijri(date: Date): { year: number; month: number; day: number } {
  const m = moment(date);
  return {
    year: m.iYear(),
    month: m.iMonth() + 1, // moment-hijri uses 0-indexed months
    day: m.iDate()
  };
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
 * تحويل تاريخ هجري إلى ميلادي
 * @param year السنة الهجرية
 * @param month الشهر الهجري (1-12)
 * @param day اليوم الهجري
 * @returns كائن Date ميلادي
 */
export function convertHijriToGregorian(year: number, month: number, day: number): Date {
  // moment-hijri uses 0-indexed months
  const m = moment(`${year}/${month}/${day}`, 'iYYYY/iM/iD');
  return m.toDate();
}

/**
 * الحصول على عدد أيام الشهر الهجري
 * @param year السنة الهجرية
 * @param month الشهر الهجري (1-12)
 * @returns عدد الأيام
 */
export function getHijriMonthDays(year: number, month: number): number {
  // استخدام moment-hijri للحصول على عدد أيام الشهر الهجري
  const m = moment(`${year}/${month}/1`, 'iYYYY/iM/iD');
  return m.iDaysInMonth();
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
