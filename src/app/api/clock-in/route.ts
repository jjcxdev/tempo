import { NextRequest, NextResponse } from 'next/server';
import { clockIn, Location } from '@/lib/turso';
import { getToken } from 'next-auth/jwt';

export async function POST(req: NextRequest) {
  console.log('Turso Database URL:', process.env.TURSO_DATABASE_URL);
  console.log('Turso Auth Token:', process.env.TURSO_AUTH_TOKEN);

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || !token.sub) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = token.sub;

  try {
    const { location } = await req.json() as { location: Location };
    console.log('Received clock-in request:', { userId, location });

    await clockIn(userId, location);
    return NextResponse.json({ message: 'Clock-in successful' });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error in /api/clock-in:', error.message);
      return NextResponse.json({ message: 'Error clocking in', error: error.message }, { status: 500 });
    } else {
      console.error('Unknown error in /api/clock-in:', error);
      return NextResponse.json({ message: 'Unknown error clocking in' }, { status: 500 });
    }
  }
}
