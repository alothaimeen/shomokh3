'use client';

import { useState, useRef, useCallback } from 'react';
import { getPerformanceConfig } from '@/lib/performance-config';

/**
 * 🎯 Adaptive List Component
 * 
 * مكون ذكي يختار استراتيجية العرض بناءً على حجم البيانات:
 * - < 30: عرض بسيط (simple render)
 * - 30-100: pagination تلقائية
 * - > 100: virtual scrolling (يُحمل ديناميكياً)
 */

interface AdaptiveListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  emptyMessage?: string;
  className?: string;
}

export function AdaptiveList<T>({
  items,
  renderItem,
  keyExtractor,
  emptyMessage = 'لا توجد بيانات',
  className = 'space-y-2'
}: AdaptiveListProps<T>) {
  const config = getPerformanceConfig(items.length);
  
  // عرض رسالة فارغة
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    );
  }
  
  // استراتيجية 1: قائمة صغيرة (< 30) - عرض بسيط
  if (config.renderStrategy === 'simple') {
    return (
      <div className={className}>
        {items.map((item, index) => (
          <div key={keyExtractor(item, index)}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    );
  }
  
  // استراتيجية 2: قائمة متوسطة (30-100) - pagination
  if (config.renderStrategy === 'paginated') {
    return (
      <PaginatedList
        items={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        pageSize={config.pageSize}
        className={className}
      />
    );
  }
  
  // استراتيجية 3: قائمة كبيرة (> 100) - virtual scrolling
  // ملاحظة: يمكن تطبيق VirtualizedList لاحقاً إذا احتجت
  return (
    <PaginatedList
      items={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      pageSize={20}
      className={className}
    />
  );
}

/**
 * مكون Pagination بسيط - "عرض المزيد"
 */
interface PaginatedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  pageSize: number;
  className?: string;
}

function PaginatedList<T>({
  items,
  renderItem,
  keyExtractor,
  pageSize,
  className = 'space-y-2'
}: PaginatedListProps<T>) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  
  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;
  const remaining = items.length - visibleCount;
  
  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + pageSize, items.length));
  }, [pageSize, items.length]);
  
  return (
    <>
      <div className={className}>
        {visibleItems.map((item, index) => (
          <div key={keyExtractor(item, index)}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
      
      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={loadMore}
            className="bg-gradient-to-r from-primary-purple to-primary-blue text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            عرض المزيد ({Math.min(pageSize, remaining)} من {remaining})
          </button>
        </div>
      )}
    </>
  );
}

/**
 * Hook لـ Adaptive Search - debounce ذكي
 */
export function useAdaptiveSearch(
  onSearch: (query: string) => void,
  dataSize: number
) {
  const [query, setQuery] = useState('');
  const config = getPerformanceConfig(dataSize);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    
    // بحث فوري للأحجام الصغيرة
    if (config.debounceDelay === 0) {
      onSearch(value);
      return;
    }
    
    // Debounced search للأحجام الكبيرة
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      onSearch(value);
    }, config.debounceDelay);
  }, [config.debounceDelay, onSearch]);
  
  return { query, setQuery: handleSearch };
}
