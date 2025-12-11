import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret'; // Fallback for dev, but warn
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Helper to create a JWT token
export function createToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Token valid for 1 hour
}

// Middleware to verify JWT token
export async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;

  if (!token) {
    return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // You can attach decoded user info to the request here if needed
    // request.user = decoded;
    return null; // No error, continue
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  // Basic password check (will be augmented with TOTP later)
  if (password === ADMIN_PASSWORD) {
    const token = createToken({ isAdmin: true });

    // Set token in an HTTP-only cookie
    const serialized = serialize('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    return NextResponse.json({ success: true, message: 'Logged in' }, { status: 200, headers: { 'Set-Cookie': serialized } });
  } else {
    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
  }
}
