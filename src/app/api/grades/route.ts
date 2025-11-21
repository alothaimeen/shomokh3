/**
 * API: جلب بيانات الدرجات
 * يدعم SWR hook
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'غير مصادق عليه' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const studentId = searchParams.get('studentId');
    const date = searchParams.get('date');

    // بناء الفلتر
    const where: any = {};
    if (courseId) where.courseId = courseId;
    if (studentId) where.studentId = studentId;
    if (date) where.date = new Date(date);

    const grades = await db.dailyGrade.findMany({
      where,
      select: {
        id: true,
        studentId: true,
        courseId: true,
        date: true,
        memorization: true,
        review: true,
        notes: true,
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: grades,
    });
  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب البيانات' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'غير مصادق عليه' },
        { status: 401 }
      );
    }

    const grade = await request.json();

    const savedGrade = await db.dailyGrade.upsert({
      where: {
        studentId_courseId_date: {
          studentId: grade.studentId,
          courseId: grade.courseId,
          date: new Date(grade.date),
        },
      },
      update: {
        memorization: grade.memorization,
        review: grade.review,
        notes: grade.notes,
      },
      create: {
        studentId: grade.studentId,
        courseId: grade.courseId,
        date: new Date(grade.date),
        memorization: grade.memorization,
        review: grade.review,
        notes: grade.notes,
      },
    });

    return NextResponse.json({
      success: true,
      data: savedGrade,
    });
  } catch (error) {
    console.error('Error saving grade:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حفظ الدرجة' },
      { status: 500 }
    );
  }
}
