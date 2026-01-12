import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        {
          error: 'Not authenticated',
          authenticated: false,
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: session.user?.name,
      hasAccessToken: !!session.accessToken,
      tokenExpiry: session.accessTokenExpires,
      currentTime: Date.now(),
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      {
        error: 'Failed to check session',
        authenticated: false,
      },
      { status: 500 }
    );
  }
}
