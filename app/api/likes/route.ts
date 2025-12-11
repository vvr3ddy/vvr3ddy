import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DB_PATH = path.join(process.cwd(), 'data', 'likes.json');

// Encryption configuration
const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.LIKES_ENCRYPTION_KEY; // Must be a 256-bit (32-byte) key
const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error('LIKES_ENCRYPTION_KEY is not set in environment variables.');
  }
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error('LIKES_ENCRYPTION_KEY is not set in environment variables.');
  }
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift() as string, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

function getLikesDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, encrypt('{}'), 'utf8'); // Encrypt empty object on first write
  }
  const encryptedData = fs.readFileSync(DB_PATH, 'utf8');
  try {
    const decryptedData = decrypt(encryptedData);
    return JSON.parse(decryptedData);
  } catch (e) {
    console.error('Error decrypting or parsing likes DB:', e);
    // If decryption fails, return empty object to prevent app crash
    return {};
  }
}

function saveLikesDB(data: Record<string, number>) {
  const encryptedData = encrypt(JSON.stringify(data, null, 2));
  fs.writeFileSync(DB_PATH, encryptedData, 'utf8');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ success: false, message: 'Slug required' }, { status: 400 });
  }

  const db = getLikesDB();
  const likes = db[slug] || 0;

  return NextResponse.json({ likes });
}

export async function POST(request: Request) {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json({ success: false, message: 'Slug required' }, { status: 400 });
    }

    const db = getLikesDB();
    const currentLikes = db[slug] || 0;
    const newLikes = currentLikes + 1;
    
    db[slug] = newLikes;
    saveLikesDB(db);

    return NextResponse.json({ success: true, likes: newLikes });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error updating likes' }, { status: 500 });
  }
}
