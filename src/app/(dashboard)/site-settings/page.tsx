'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { Settings, BarChart3, Info, Trophy, Phone, Save, Sparkles } from 'lucide-react';
import AppHeader from '@/components/shared/AppHeader';
import { getSiteSettings, updateSiteSettings, getRealStats } from '@/actions/public-settings';

type TabId = 'stats' | 'about' | 'achievements' | 'contact';

interface SiteSettings {
  id: string;
  studentsCount: number;
  teachersCount: number;
  coursesCount: number;
  facesCompleted: number;
  aboutTitle: string;
  aboutVision: string;
  aboutMission: string;
  aboutGoals: string;
  achievementsTitle: string;
  achievementsText: string;
  contactTitle: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  contactWhatsapp: string;
  contactIban: string;
}

interface RealStats {
  studentsCount: number;
  teachersCount: number;
  coursesCount: number;
  facesCompleted: number;
}

export default function SiteSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('stats');
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [realStats, setRealStats] = useState<RealStats | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [settingsData, statsResult] = await Promise.all([
        getSiteSettings(),
        getRealStats()
      ]);
      
      setSettings(settingsData as SiteSettings);
      if (statsResult.success && statsResult.data) {
        setRealStats(statsResult.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await updateSiteSettings(formData);
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'تم الحفظ بنجاح' });
        loadData();
      } else {
        setMessage({ type: 'error', text: result.error || 'حدث خطأ' });
      }
      
      setTimeout(() => setMessage(null), 3000);
    });
  };

  const tabs = [
    { id: 'stats' as TabId, label: 'الإحصائيات', icon: <BarChart3 size={18} /> },
    { id: 'about' as TabId, label: 'عن الجمعية', icon: <Info size={18} /> },
    { id: 'achievements' as TabId, label: 'إنجازاتنا', icon: <Trophy size={18} /> },
    { id: 'contact' as TabId, label: 'تواصل معنا', icon: <Phone size={18} /> },
  ];

  const applyRealValue = (field: keyof RealStats) => {
    if (realStats && settings) {
      setSettings({ ...settings, [field]: realStats[field] });
    }
  };

  if (isLoading) {
    return (
      <>
        <AppHeader title="إعدادات الموقع" />
        <main className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded-lg w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader title="إعدادات الموقع" />
      
      <main className="p-6 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-purple to-primary-blue rounded-lg flex items-center justify-center">
                <Settings className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">بيانات الجمعية</h1>
                <p className="text-gray-600">إدارة محتوى الصفحة الرئيسية والصفحات العامة</p>
              </div>
            </div>
          </div>

          {/* Toast Message */}
          {message && (
            <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.text}
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex border-b">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-primary-purple border-b-2 border-primary-purple bg-primary-purple/5'
                      : 'text-gray-600 hover:text-primary-purple hover:bg-gray-50'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Hidden inputs to ensure all data is submitted regardless of active tab */}
              {settings && (
                <>
                  <input type="hidden" name="studentsCount" value={settings.studentsCount} />
                  <input type="hidden" name="teachersCount" value={settings.teachersCount} />
                  <input type="hidden" name="coursesCount" value={settings.coursesCount} />
                  <input type="hidden" name="facesCompleted" value={settings.facesCompleted} />
                  <input type="hidden" name="aboutTitle" value={settings.aboutTitle} />
                  <input type="hidden" name="aboutVision" value={settings.aboutVision} />
                  <input type="hidden" name="aboutMission" value={settings.aboutMission} />
                  <input type="hidden" name="aboutGoals" value={settings.aboutGoals} />
                  <input type="hidden" name="achievementsTitle" value={settings.achievementsTitle} />
                  <input type="hidden" name="achievementsText" value={settings.achievementsText} />
                  <input type="hidden" name="contactTitle" value={settings.contactTitle} />
                  <input type="hidden" name="contactEmail" value={settings.contactEmail} />
                  <input type="hidden" name="contactPhone" value={settings.contactPhone} />
                  <input type="hidden" name="contactAddress" value={settings.contactAddress} />
                  <input type="hidden" name="contactWhatsapp" value={settings.contactWhatsapp} />
                  <input type="hidden" name="contactIban" value={settings.contactIban} />
                </>
              )}

              {/* Stats Tab */}
              {activeTab === 'stats' && settings && (
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">الإحصائيات المعروضة في الصفحة الرئيسية</h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* عدد الطالبات */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">عدد الطالبات</label>
                      <input
                        type="number"
                        name="studentsCount"
                        value={settings.studentsCount}
                        onChange={(e) => setSettings({ ...settings, studentsCount: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                      />
                      {realStats && (
                        <SmartSuggestion
                          label="القيمة الفعلية"
                          value={realStats.studentsCount}
                          unit="طالبة"
                          onUse={() => applyRealValue('studentsCount')}
                        />
                      )}
                    </div>

                    {/* عدد المعلمات */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">عدد المعلمات</label>
                      <input
                        type="number"
                        name="teachersCount"
                        value={settings.teachersCount}
                        onChange={(e) => setSettings({ ...settings, teachersCount: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                      />
                      {realStats && (
                        <SmartSuggestion
                          label="القيمة الفعلية"
                          value={realStats.teachersCount}
                          unit="معلمة"
                          onUse={() => applyRealValue('teachersCount')}
                        />
                      )}
                    </div>

                    {/* عدد الحلقات */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">عدد الحلقات القرآنية</label>
                      <input
                        type="number"
                        name="coursesCount"
                        value={settings.coursesCount}
                        onChange={(e) => setSettings({ ...settings, coursesCount: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                      />
                      {realStats && (
                        <SmartSuggestion
                          label="القيمة الفعلية"
                          value={realStats.coursesCount}
                          unit="حلقة"
                          onUse={() => applyRealValue('coursesCount')}
                        />
                      )}
                    </div>

                    {/* عدد الوجوه المنجزة */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">عدد الوجوه المنجزة</label>
                      <input
                        type="number"
                        name="facesCompleted"
                        value={settings.facesCompleted}
                        onChange={(e) => setSettings({ ...settings, facesCompleted: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                      />
                      {realStats && (
                        <SmartSuggestion
                          label="القيمة التقديرية"
                          value={realStats.facesCompleted}
                          unit="وجه"
                          onUse={() => applyRealValue('facesCompleted')}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* About Tab */}
              {activeTab === 'about' && settings && (
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">محتوى صفحة &quot;عن الجمعية&quot;</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">عنوان القسم</label>
                    <input
                      type="text"
                      name="aboutTitle"
                      value={settings.aboutTitle}
                      onChange={(e) => setSettings({ ...settings, aboutTitle: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">رؤيتنا</label>
                    <textarea
                      name="aboutVision"
                      value={settings.aboutVision}
                      onChange={(e) => setSettings({ ...settings, aboutVision: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">رسالتنا</label>
                    <textarea
                      name="aboutMission"
                      value={settings.aboutMission}
                      onChange={(e) => setSettings({ ...settings, aboutMission: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">أهدافنا التعليمية</label>
                    <textarea
                      name="aboutGoals"
                      value={settings.aboutGoals}
                      onChange={(e) => setSettings({ ...settings, aboutGoals: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                      dir="rtl"
                      placeholder="أدخل كل هدف في سطر جديد"
                    />
                  </div>
                </div>
              )}

              {/* Achievements Tab */}
              {activeTab === 'achievements' && settings && (
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">محتوى صفحة &quot;إنجازاتنا&quot;</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">عنوان القسم</label>
                    <input
                      type="text"
                      name="achievementsTitle"
                      value={settings.achievementsTitle}
                      onChange={(e) => setSettings({ ...settings, achievementsTitle: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">نص الإنجازات</label>
                    <textarea
                      name="achievementsText"
                      value={settings.achievementsText}
                      onChange={(e) => setSettings({ ...settings, achievementsText: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                      dir="rtl"
                      placeholder="أدخل وصفاً لإنجازات الجمعية..."
                    />
                  </div>
                </div>
              )}

              {/* Contact Tab */}
              {activeTab === 'contact' && settings && (
                <div className="space-y-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">معلومات التواصل</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">عنوان القسم</label>
                    <input
                      type="text"
                      name="contactTitle"
                      value={settings.contactTitle}
                      onChange={(e) => setSettings({ ...settings, contactTitle: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                      dir="rtl"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                      <input
                        type="email"
                        name="contactEmail"
                        value={settings.contactEmail}
                        onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                        dir="ltr"
                        placeholder="email@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                      <input
                        type="tel"
                        name="contactPhone"
                        value={settings.contactPhone}
                        onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                        dir="ltr"
                        placeholder="+966 XX XXX XXXX"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">رقم الواتساب</label>
                      <input
                        type="tel"
                        name="contactWhatsapp"
                        value={settings.contactWhatsapp}
                        onChange={(e) => setSettings({ ...settings, contactWhatsapp: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                        dir="ltr"
                        placeholder="+966 XX XXX XXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
                    <textarea
                      name="contactAddress"
                      value={settings.contactAddress}
                      onChange={(e) => setSettings({ ...settings, contactAddress: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                      dir="rtl"
                      placeholder="عنوان الجمعية..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">رقم الآيبان (IBAN)</label>
                    <input
                      type="text"
                      name="contactIban"
                      value={settings.contactIban}
                      onChange={(e) => setSettings({ ...settings, contactIban: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent font-mono"
                      dir="ltr"
                      placeholder="SA00 0000 0000 0000 0000 0000"
                    />
                    <p className="mt-1 text-xs text-gray-500">رقم الحساب البنكي الدولي لاستقبال التبرعات</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-purple to-primary-blue text-white font-medium rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50"
                >
                  <Save size={18} />
                  {isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </>
    );
}

// مكون الاقتراح الذكي
function SmartSuggestion({ 
  label, 
  value, 
  unit, 
  onUse 
}: { 
  label: string; 
  value: number; 
  unit: string; 
  onUse: () => void 
}) {
  return (
    <div className="mt-2 flex items-center gap-2 text-sm">
      <Sparkles size={14} className="text-amber-500" />
      <span className="text-gray-600">
        {label}: {value.toLocaleString('ar-SA')} {unit}
      </span>
      <button
        type="button"
        onClick={onUse}
        className="text-primary-purple hover:underline font-medium"
      >
        استخدام
      </button>
    </div>
  );
}
