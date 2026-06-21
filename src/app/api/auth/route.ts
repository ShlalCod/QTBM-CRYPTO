import { NextRequest, NextResponse } from 'next/server';

// Mock user database
const mockUsers = [
  {
    id: 'user-1',
    email: 'demo@qtbm.bank',
    name: 'Demo User',
    role: 'user',
    status: 'registered',
    twoFactorEnabled: false,
    kycStatus: 'verified',
  },
  {
    id: 'user-2',
    email: 'admin@qtbm.bank',
    name: 'Admin User',
    role: 'admin',
    status: 'registered',
    twoFactorEnabled: true,
    kycStatus: 'verified',
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'login': {
        const { email, password } = body;

        // Simulate validation
        if (!email || !password) {
          return NextResponse.json(
            { error: 'Email and password are required' },
            { status: 400 }
          );
        }

        // Simulate password check (any password >= 6 chars works)
        if (password.length < 6) {
          return NextResponse.json(
            { error: 'Invalid email or password' },
            { status: 401 }
          );
        }

        // Find or create user
        const user = mockUsers.find(u => u.email === email) || {
          id: `user-${Date.now()}`,
          email,
          name: email.split('@')[0],
          role: 'user',
          status: 'registered',
          twoFactorEnabled: false,
          kycStatus: 'not_started',
        };

        return NextResponse.json({
          success: true,
          twoFactorEnabled: user.twoFactorEnabled,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            twoFactorEnabled: user.twoFactorEnabled,
            kycStatus: user.kycStatus,
          },
        });
      }

      case 'register': {
        const { email, password } = body;

        if (!email || !password) {
          return NextResponse.json(
            { error: 'Email and password are required' },
            { status: 400 }
          );
        }

        // Check if email already exists
        if (mockUsers.find(u => u.email === email)) {
          return NextResponse.json(
            { error: 'An account with this email already exists' },
            { status: 409 }
          );
        }

        const newUser = {
          id: `user-${Date.now()}`,
          email,
          name: email.split('@')[0],
          role: 'user',
          status: 'registered',
          twoFactorEnabled: false,
          kycStatus: 'not_started',
        };

        return NextResponse.json({
          success: true,
          user: newUser,
        });
      }

      case 'verify2fa': {
        const { code } = body;

        // Any 6-digit code works for demo
        if (!code || code.length !== 6) {
          return NextResponse.json(
            { error: 'Invalid verification code' },
            { status: 400 }
          );
        }

        // Simulate verification
        return NextResponse.json({
          success: true,
          user: {
            id: 'user-2',
            email: 'admin@qtbm.bank',
            name: 'Admin User',
            role: 'admin',
            status: 'registered',
            twoFactorEnabled: true,
            kycStatus: 'verified',
          },
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
