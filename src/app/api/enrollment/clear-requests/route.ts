import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.email) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // إذا كان المستخدم طالبة، احذف طلباتها فقط
    if (session.user.userRole === 'STUDENT') {
      // البحث عن الطالبة باستخدام userId
      const student = await db.student.findUnique({
        where: {
          userId: session.user.id
        }
      });

      if (student) {
        await db.enrollmentRequest.deleteMany({
          where: {
            studentId: student.id
          }
        });

        return NextResponse.json({
          message: 'تم حذف طلبات الانضمام الخاصة بك',
          deletedCount: 'جميع الطلبات'
        });
      }
    }

    // إذا كان المستخدم مدير، احذف جميع الطلبات
    if (session.user.userRole === 'ADMIN') {
      const result = await db.enrollmentRequest.deleteMany({});

      return NextResponse.json({
        message: 'تم حذف جميع طلبات الانضمام',
        deletedCount: result.count
      });
    }

    return NextResponse.json({ error: 'غير مصرح لك بهذا الإجراء' }, { status: 403 });

  } catch (error) {
    console.error('خطأ في حذف طلبات الانضمام:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
