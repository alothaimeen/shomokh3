/**
 * 🧠 Performance Configuration - Adaptive Strategy
 * 
 * يحدد استراتيجية الأداء بناءً على حجم البيانات
 * - الأحجام الصغيرة (< 30): بساطة وسرعة
 * - الأحجام المتوسطة (30-100): pagination تلقائية
 * - الأحجام الكبيرة (> 100): virtual scroll + تحسينات متقدمة
 */

export interface PerformanceConfig {
  // تحسينات أساسية (للجميع)
  useParallelFetching: boolean;
  useSuspense: boolean;
  useNextFont: boolean;
  useBulkAPIs: boolean;
  
  // تحسينات متوسطة (> 30 عنصر)
  usePagination: boolean;
  useDebounce: boolean;
  debounceDelay: number;
  pageSize: number;
  
  // تحسينات متقدمة (> 100 عنصر)
  useVirtualScroll: boolean;
  useOptimisticUI: boolean;
  enableIndexes: boolean;
  
  // استراتيجية العرض
  renderStrategy: 'simple' | 'paginated' | 'virtualized';
}

/**
 * يحدد إعدادات الأداء بناءً على حجم البيانات
 */
export function getPerformanceConfig(dataSize: number): PerformanceConfig {
  return {
    // تحسينات أساسية - دائماً مفعّلة
    useParallelFetching: true,
    useSuspense: true,
    useNextFont: true,
    useBulkAPIs: true,
    
    // تحسينات متوسطة - تُفعّل عند > 30
    usePagination: dataSize > 30,
    useDebounce: dataSize > 30,
    debounceDelay: dataSize > 30 ? (dataSize > 100 ? 300 : 150) : 0,
    pageSize: dataSize > 100 ? 20 : dataSize > 30 ? 50 : dataSize,
    
    // تحسينات متقدمة - تُفعّل عند > 100
    useVirtualScroll: dataSize > 100,
    useOptimisticUI: dataSize > 100,
    enableIndexes: dataSize > 500,
    
    // استراتيجية العرض
    renderStrategy: 
      dataSize <= 30 ? 'simple' :
      dataSize <= 100 ? 'paginated' :
      'virtualized'
  };
}

/**
 * يُستخدم للبحث - debounce delay حسب حجم البيانات
 */
export function getSearchDelay(dataSize: number): number {
  if (dataSize <= 30) return 0;       // بحث فوري
  if (dataSize <= 100) return 150;    // debounce خفيف
  return 300;                          // debounce قوي
}

/**
 * يُستخدم للـ pagination - حجم الصفحة حسب البيانات
 */
export function getPageSize(dataSize: number): number {
  if (dataSize <= 30) return dataSize;  // عرض الكل
  if (dataSize <= 100) return 50;       // صفحات كبيرة
  return 20;                             // صفحات صغيرة
}

/**
 * يحدد إذا كانت الـ indexes ضرورية
 */
export function shouldUseIndexes(dataSize: number): boolean {
  return dataSize > 500;
}

/**
 * رسالة للمطورين - توضح الاستراتيجية المختارة
 */
export function getPerformanceMessage(dataSize: number): string {
  const config = getPerformanceConfig(dataSize);
  
  if (config.renderStrategy === 'simple') {
    return `📊 ${dataSize} عناصر - استراتيجية بسيطة (عرض الكل)`;
  }
  
  if (config.renderStrategy === 'paginated') {
    return `📊 ${dataSize} عناصر - pagination (${config.pageSize}/صفحة)`;
  }
  
  return `📊 ${dataSize} عناصر - virtual scroll (تحسينات متقدمة)`;
}
