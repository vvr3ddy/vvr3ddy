import { NextRequest, NextResponse } from 'next/server';
import { createToken, verifyAuth } from '@/lib/auth';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode'; // For generating QR code

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
let TOTP_SECRET_GENERATED = process.env.TOTP_SECRET;

export async function GET(request: NextRequest) {
    // Only allow setup if not already configured and in dev mode
    if (TOTP_SECRET_GENERATED && process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ success: false, message: 'TOTP already configured' }, { status: 403 });
    }

    try {
        const secret = speakeasy.generateSecret({
            length: 20,
            name: 'Gemini Blog Admin', // Your app name
        });
        TOTP_SECRET_GENERATED = secret.base32; // Store in memory for immediate use or persistent storage

        const otpauthUrl = secret.otpauth_url;
        const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl as string);

        // In a real app, you'd save secret.base32 to your .env.local or secure store
        // For now, we're just displaying it.
        return NextResponse.json({ 
            success: true, 
            message: 'Scan QR code with your authenticator app.',
            secret: secret.base32,
            otpauthUrl,
            qrCodeDataUrl,
        });
    } catch (error) {
        console.error('Error generating TOTP secret:', error);
        return NextResponse.json({ success: false, message: 'Failed to generate TOTP secret.' }, { status: 500 });
    }
}