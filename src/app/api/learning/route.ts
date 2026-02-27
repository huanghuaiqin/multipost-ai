import { NextResponse } from 'next/server';
import { readDB, writeDB, LearningItem } from '@/lib/db';

export async function GET() {
  const db = readDB();
  return NextResponse.json(db.learning);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = readDB();
    
    const newItem: LearningItem = {
      id: body.id || `learn-${Date.now()}`,
      title: body.title,
      icon: body.icon || 'BookOpen',
      color: body.color || 'text-purple-500',
      bgColor: body.bgColor || 'bg-purple-50 dark:bg-purple-950/30',
      borderColor: body.borderColor || 'border-purple-100 dark:border-purple-900',
      desc: body.desc,
      content: body.content || { title: body.title, text: '' }
    };

    db.learning.unshift(newItem);
    writeDB(db);

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create learning item' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const db = readDB();
  const initialLength = db.learning.length;
  db.learning = db.learning.filter(item => item.id !== id);

  if (db.learning.length === initialLength) {
     return NextResponse.json({ error: 'Learning item not found' }, { status: 404 });
  }

  writeDB(db);
  return NextResponse.json({ success: true });
}
