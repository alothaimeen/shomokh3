'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * جلب الإحصائيات الحقيقية من قاعدة البيانات
 * للاستخدام كاقتراحات في صفحة الإعدادات
 */
export async function getRealStats() {
  // 🔒 Security: Admin only
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, error: 'غير مصرح' };
  }

  try {
    const [studentsCount, teachersCount, coursesCount] = await Promise.all([
      db.student.count({ where: { isActive: true } }),
      db.user.count({ where: { userRole: 'TEACHER', isActive: true } }),
      db.course.count({ where: { isActive: true } }),
    ]);

    // حساب الوجوه المنجزة (تقديري بناءً على الدرجات اليومية)
    const dailyGradesCount = await db.dailyGrade.count();
    const facesCompleted = Math.floor(dailyGradesCount * 0.5); // تقدير: نصف وجه لكل درجة

    return {
      success: true,
      data: { studentsCount, teachersCount, coursesCount, facesCompleted }
    };
  } catch (error) {
    console.error('Error fetching real stats:', error);
    return { success: false, error: 'حدث خطأ أثناء جلب الإحصائيات' };
  }
}

/**
 * جلب إعدادات الموقع الحالية
 */
export async function getSiteSettings() {
  try {
    const settings = await db.publicSiteSettings.findFirst({ 
      where: { isActive: true } 
    });
    
    // إذا لم تكن موجودة، إنشاء إعدادات افتراضية
    if (!settings) {
      return await db.publicSiteSettings.create({
        data: {
          studentsCount: 11548,
          teachersCount: 60,
          coursesCount: 59,
          facesCompleted: 2075633,
          aboutVision: 'جمعية رائدة لتعليم مستمر، بأساليب مبتكرة',
          aboutMission: 'تعليم القرآن الكريم وتحفيظه، وترسيخ القيم والأخلاق الإسلامية في نفوس الطالبات، من خلال بيئة تعليمية محفزة، ومعلمات مؤهلات، وبرامج تربوية متميزة',
          aboutGoals: 'تعليم القرآن الكريم وفق المنهج النبوي، غرس محبة القرآن في قلوب الطالبات، إتقان التلاوة والحفظ وفق أحكام التجويد',
          achievementsText: 'أكثر من 11 ألف طالبة و2 مليون وجه منجز',
        }
      });
    }
    
    return settings;
  } catch (error) {
    console.error('Error fetching site settings:', error);
    // إرجاع قيم افتراضية في حالة الخطأ
    return {
      id: 'default',
      studentsCount: 11548,
      teachersCount: 60,
      coursesCount: 59,
      facesCompleted: 2075633,
      aboutTitle: 'عن الجمعية',
      aboutVision: 'جمعية رائدة لتعليم مستمر، بأساليب مبتكرة',
      aboutMission: 'تعليم القرآن الكريم وتحفيظه، وترسيخ القيم والأخلاق الإسلامية',
      aboutGoals: 'تعليم القرآن الكريم وفق المنهج النبوي',
      achievementsTitle: 'إنجازاتنا',
      achievementsText: 'أكثر من 11 ألف طالبة و2 مليون وجه منجز',
      contactTitle: 'تواصل معنا',
      contactEmail: '',
      contactPhone: '',
      contactAddress: '',
      contactWhatsapp: '',
      contactIban: '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastEditedById: null,
    };
  }
}

/**
 * تحديث إعدادات الموقع
 */
export async function updateSiteSettings(formData: FormData) {
  // 🔒 Security: Admin only
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, error: 'غير مصرح' };
  }

  try {
    const settings = await db.publicSiteSettings.findFirst({ where: { isActive: true } });

    const data = {
      studentsCount: parseInt(formData.get('studentsCount') as string) || 0,
      teachersCount: parseInt(formData.get('teachersCount') as string) || 0,
      coursesCount: parseInt(formData.get('coursesCount') as string) || 0,
      facesCompleted: parseInt(formData.get('facesCompleted') as string) || 0,
      aboutTitle: (formData.get('aboutTitle') as string) || 'عن الجمعية',
      aboutVision: (formData.get('aboutVision') as string) || '',
      aboutMission: (formData.get('aboutMission') as string) || '',
      aboutGoals: (formData.get('aboutGoals') as string) || '',
      achievementsTitle: (formData.get('achievementsTitle') as string) || 'إنجازاتنا',
      achievementsText: (formData.get('achievementsText') as string) || '',
      contactTitle: (formData.get('contactTitle') as string) || 'تواصل معنا',
      contactEmail: (formData.get('contactEmail') as string) || '',
      contactPhone: (formData.get('contactPhone') as string) || '',
      contactAddress: (formData.get('contactAddress') as string) || '',
      contactWhatsapp: (formData.get('contactWhatsapp') as string) || '',
      contactIban: (formData.get('contactIban') as string) || '',
      lastEditedById: session.user.id,
      updatedAt: new Date(),
    };

    if (settings) {
      await db.publicSiteSettings.update({
        where: { id: settings.id },
        data
      });
    } else {
      await db.publicSiteSettings.create({ data });
    }

    revalidatePath('/');
    revalidatePath('/about');
    revalidatePath('/about/achievements');
    revalidatePath('/about/contact');
    revalidatePath('/site-settings');

    return { success: true, message: 'تم حفظ الإعدادات بنجاح' };
  } catch (error) {
    console.error('Error updating site settings:', error);
    return { success: false, error: 'حدث خطأ أثناء حفظ الإعدادات' };
  }
}

/**
 * جلب الإحصائيات العامة (للصفحة الرئيسية - Public)
 */
export async function getPublicStats() {
  try {
    const settings = await db.publicSiteSettings.findFirst({ 
      where: { isActive: true },
      select: {
        studentsCount: true,
        teachersCount: true,
        coursesCount: true,
        facesCompleted: true,
      }
    });

    if (!settings) {
      return { studentsCount: 11548, teachersCount: 60, coursesCount: 59, facesCompleted: 2075633 };
    }

    return {
      studentsCount: settings.studentsCount,
      teachersCount: settings.teachersCount,
      coursesCount: settings.coursesCount,
      facesCompleted: settings.facesCompleted,
    };
  } catch (error) {
    console.error('Error fetching public stats:', error);
    return { studentsCount: 11548, teachersCount: 60, coursesCount: 59, facesCompleted: 2075633 };
  }
}

/**
 * جلب محتوى صفحة "عن الجمعية"
 */
export async function getAboutContent() {
  try {
    const settings = await db.publicSiteSettings.findFirst({ 
      where: { isActive: true },
      select: {
        aboutTitle: true,
        aboutVision: true,
        aboutMission: true,
        aboutGoals: true,
      }
    });

    if (!settings) {
      return {
        aboutTitle: 'عن الجمعية',
        aboutVision: 'جمعية رائدة لتعليم مستمر، بأساليب مبتكرة',
        aboutMission: 'تعليم القرآن الكريم وتحفيظه، وترسيخ القيم والأخلاق الإسلامية',
        aboutGoals: 'تعليم القرآن الكريم وفق المنهج النبوي',
      };
    }

    return settings;
  } catch (error) {
    console.error('Error fetching about content:', error);
    return {
      aboutTitle: 'عن الجمعية',
      aboutVision: 'جمعية رائدة لتعليم مستمر، بأساليب مبتكرة',
      aboutMission: 'تعليم القرآن الكريم وتحفيظه، وترسيخ القيم والأخلاق الإسلامية',
      aboutGoals: 'تعليم القرآن الكريم وفق المنهج النبوي',
    };
  }
}

/**
 * جلب محتوى صفحة "إنجازاتنا"
 */
export async function getAchievementsContent() {
  try {
    const settings = await db.publicSiteSettings.findFirst({ 
      where: { isActive: true },
      select: {
        achievementsTitle: true,
        achievementsText: true,
        studentsCount: true,
        facesCompleted: true,
      }
    });

    if (!settings) {
      return {
        achievementsTitle: 'إنجازاتنا',
        achievementsText: 'أكثر من 11 ألف طالبة و2 مليون وجه منجز',
        studentsCount: 11548,
        facesCompleted: 2075633,
      };
    }

    return settings;
  } catch (error) {
    console.error('Error fetching achievements content:', error);
    return {
      achievementsTitle: 'إنجازاتنا',
      achievementsText: 'أكثر من 11 ألف طالبة و2 مليون وجه منجز',
      studentsCount: 11548,
      facesCompleted: 2075633,
    };
  }
}

/**
 * جلب محتوى صفحة "تواصل معنا"
 */
export async function getContactContent() {
  try {
    const settings = await db.publicSiteSettings.findFirst({ 
      where: { isActive: true },
      select: {
        contactTitle: true,
        contactEmail: true,
        contactPhone: true,
        contactAddress: true,
        contactWhatsapp: true,
      }
    });

    if (!settings) {
      return {
        contactTitle: 'تواصل معنا',
        contactEmail: '',
        contactPhone: '',
        contactAddress: '',
        contactWhatsapp: '',
      };
    }

    return settings;
  } catch (error) {
    console.error('Error fetching contact content:', error);
    return {
      contactTitle: 'تواصل معنا',
      contactEmail: '',
      contactPhone: '',
      contactAddress: '',
      contactWhatsapp: '',
    };
  }
}
