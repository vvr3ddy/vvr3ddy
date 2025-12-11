import { NextRequest, NextResponse } from 'next/server';
import { createToken, verifyAuth } from '@/lib/auth'; // Re-using verifyAuth for POST protection
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import otpGenerator from 'otp-generator';
// For TOTP, we need a library like 'speakeasy' or implement manually.
// For now, let's assume a simplified TOTP check with the secret from .env

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const TOTP_SECRET = process.env.TOTP_SECRET; // This should be base32 encoded

// Helper function to check TOTP code (simplified, in a real app use speakeasy.totp.verify)
function verifyTotpCode(code: string, secret: string): boolean {
  if (!secret) return false; // TOTP not configured
  // Dummy check: In real app, generate a valid token and compare
  // For now, just a placeholder. User would use a TOTP app with this secret.
  return code === '123456'; // Replace with real TOTP verification
}

export async function POST(request: NextRequest) {
  const { password, otpCode } = await request.json();

  // 1. Verify Password
  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
  }

  // 2. Verify TOTP (if configured)
  if (TOTP_SECRET && !verifyTotpCode(otpCode, TOTP_SECRET)) {
    return NextResponse.json({ success: false, message: 'Invalid OTP code' }, { status: 401 });
  }

  // 3. Create and Set Token
  const token = jwt.sign({ isAdmin: true }, JWT_SECRET, { expiresIn: '1h' }); // Token valid for 1 hour

  const serialized = serialize('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60, // 1 hour
    path: '/',
  });

  return NextResponse.json({ success: true, message: 'Logged in' }, { status: 200, headers: { 'Set-Cookie': serialized } });
}
