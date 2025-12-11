import { NextRequest, NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST() {
  const serialized = serialize('admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: -1, // Expire the cookie immediately
    path: '/',
  });

  return NextResponse.json({ success: true, message: 'Logged out' }, { status: 200, headers: { 'Set-Cookie': serialized } });
}
