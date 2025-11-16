import { useEffect, useCallback } from 'react';

/**
 * Custom hook للتحذير عند مغادرة الصفحة بدون حفظ التعديلات
 * @param hasUnsavedChanges - حالة وجود تعديلات غير محفوظة
 * @param message - رسالة التحذير (اختياري)
 */
export function useUnsavedChanges(
  hasUnsavedChanges: boolean,
  message: string = 'لديك تعديلات غير محفوظة. هل تريد المغادرة؟'
) {
  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    },
    [hasUnsavedChanges, message]
  );

  useEffect(() => {
    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [hasUnsavedChanges, handleBeforeUnload]);

  return null;
}
