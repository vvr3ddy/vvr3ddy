import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'likes.json');

function getLikesDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, '{}', 'utf8');
  }
  const data = fs.readFileSync(DB_PATH, 'utf8');
  try {
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

function saveLikesDB(data: Record<string, number>) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
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
