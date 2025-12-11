import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false, message: 'Dev only' }, { status: 403 });
  }

  const password = request.headers.get('x-admin-password');
  
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
