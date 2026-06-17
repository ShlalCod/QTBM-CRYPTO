import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    levels: [
      {
        id: 'basic',
        label: 'Basic',
        description: 'Email & phone verification',
        withdrawalLimit: '2 BTC/day',
        features: ['Spot trading', 'P2P trading', 'Basic deposits'],
        required: ['Email verification', 'Phone number'],
      },
      {
        id: 'intermediate',
        label: 'Intermediate',
        description: 'Identity document verification',
        withdrawalLimit: '100 BTC/day',
        features: ['All Basic features', 'Futures trading', 'Earn products', 'Higher limits'],
        required: ['Government ID', 'Selfie verification', 'Address proof'],
      },
      {
        id: 'advanced',
        label: 'Advanced',
        description: 'Enhanced due diligence',
        withdrawalLimit: 'Unlimited',
        features: ['All Intermediate features', 'Institutional features', 'API access', 'Unlimited withdrawals'],
        required: ['Proof of income', 'Source of funds', 'Additional documentation'],
      },
    ],
    currentStatus: 'not_started',
    verificationSteps: [
      { id: 1, label: 'Personal Information', status: 'completed' },
      { id: 2, label: 'Document Upload', status: 'current' },
      { id: 3, label: 'Selfie Verification', status: 'pending' },
      { id: 4, label: 'Review & Submit', status: 'pending' },
    ],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { documents } = body;

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json(
        { error: 'At least one document is required' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'KYC documents submitted for review',
      submissionId: String(Date.now()),
      estimatedReviewTime: '1-3 business days',
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
