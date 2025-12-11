import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const authResponse = await verifyAuth(request);
  
  if (authResponse) {
    // If verifyAuth returns a response, it means authentication failed
    return NextResponse.json({ isAuthenticated: false }, { status: 401 });
  }

  // If verifyAuth returns null, it means authentication succeeded
  return NextResponse.json({ isAuthenticated: true }, { status: 200 });
}
