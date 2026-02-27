import { NextResponse } from 'next/server';
import { readDB, writeDB, NewsItem } from '@/lib/db';

export async function GET() {
  const db = await readDB();
  return NextResponse.json(db.news);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await readDB();
    
    const newItem: NewsItem = {
      id: Date.now(), // 简单生成 ID
      title: body.title,
      summary: body.summary,
      date: body.date || '刚刚',
      category: body.category || '默认',
      categoryColor: body.categoryColor || 'text-gray-600 bg-gray-50 border-gray-100',
      icon: body.icon || 'FileText',
      iconColor: body.iconColor || 'text-gray-500',
      imageColor: body.imageColor || 'bg-gradient-to-br from-gray-100 to-gray-50'
    };

    db.news.unshift(newItem); // 添加到开头
    await writeDB(db);

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create news item' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const db = await readDB();
  const initialLength = db.news.length;
  // 转换 id 为数字进行比较，或者字符串比较，视 id 类型而定。这里 db.json 中有数字也有字符串，但在 News 中主要是数字。
  // 不过为了兼容，转成字符串比较比较稳妥。
  db.news = db.news.filter(item => String(item.id) !== id);

  if (db.news.length === initialLength) {
     return NextResponse.json({ error: 'News item not found' }, { status: 404 });
  }

  await writeDB(db);
  return NextResponse.json({ success: true });
}
