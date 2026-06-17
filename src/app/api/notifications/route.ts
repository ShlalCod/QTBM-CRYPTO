import { NextResponse } from 'next/server';
import { mockNotifications } from '@/lib/mock-data';

export async function GET() {
  const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

  return NextResponse.json({
    notifications: mockNotifications,
    unreadCount,
    totalCount: mockNotifications.length,
  });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { notificationId, markAllRead } = body;

    if (markAllRead) {
      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read',
      });
    }

    if (notificationId) {
      return NextResponse.json({
        success: true,
        message: `Notification ${notificationId} marked as read`,
      });
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
