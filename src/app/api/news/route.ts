import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const news = await prisma.news.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newItem = await prisma.news.create({
      data: {
        title: body.title,
        summary: body.summary,
        date: body.date || '刚刚',
        category: body.category || '默认',
        categoryColor: body.categoryColor || 'text-gray-600 bg-gray-50 border-gray-100',
        icon: body.icon || 'FileText',
        iconColor: body.iconColor || 'text-gray-500',
        imageColor: body.imageColor || 'bg-gradient-to-br from-gray-100 to-gray-50'
      }
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json({ error: 'Failed to create news item' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    await prisma.news.delete({
      where: { id: String(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting news:', error);
    return NextResponse.json({ error: 'News item not found or failed to delete' }, { status: 404 });
  }
}
