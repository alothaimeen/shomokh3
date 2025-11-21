/**
 * Fetcher المركزي لـ SWR
 * يتعامل مع الأخطاء ويرجع JSON
 */

export async function fetcher<T = any>(url: string): Promise<T> {
  const res = await fetch(url);
  
  if (!res.ok) {
    const error = new Error('حدث خطأ أثناء جلب البيانات');
    // إرفاق معلومات إضافية للخطأ
    (error as any).info = await res.json().catch(() => ({}));
    (error as any).status = res.status;
    throw error;
  }
  
  return res.json();
}
