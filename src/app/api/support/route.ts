import { NextResponse } from 'next/server';
import { mockFAQs, mockSupportTickets } from '@/lib/mock-data';

export async function GET() {
  const categories = [...new Set(mockFAQs.map((f) => f.category))];

  return NextResponse.json({
    faqs: mockFAQs,
    faqCategories: categories,
    tickets: mockSupportTickets,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subject, category, message } = body;

    if (!subject || !category || !message) {
      return NextResponse.json(
        { error: 'Subject, category, and message are required' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      ticket: {
        id: String(Date.now()),
        subject,
        category,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastMessage: message,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
