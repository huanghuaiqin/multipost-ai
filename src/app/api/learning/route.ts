import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const learning = await prisma.learning.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    // Transform content string back to object if needed for frontend compatibility
    const learningWithObjectContent = learning.map(item => ({
      ...item,
      // Frontend expects content object for now, but we are moving to Markdown string.
      // We'll return it as is, and update frontend components to handle it.
    }));
    
    return NextResponse.json(learningWithObjectContent);
  } catch (error) {
    console.error('Error fetching learning:', error);
    return NextResponse.json({ error: 'Failed to fetch learning items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Determine content string
    let contentString = '';
    if (typeof body.content === 'string') {
      contentString = body.content;
    } else if (body.content && typeof body.content === 'object') {
      if (body.content.text) {
        contentString = body.content.text;
      } else {
        contentString = JSON.stringify(body.content);
      }
    }

    const newItem = await prisma.learning.create({
      data: {
        title: body.title,
        desc: body.desc,
        category: body.category || '使用教程',
        content: contentString,
        icon: body.icon || 'BookOpen',
        color: body.color || 'text-purple-500',
        bgColor: body.bgColor || 'bg-purple-50 dark:bg-purple-950/30',
        borderColor: body.borderColor || 'border-purple-100 dark:border-purple-900',
      }
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Error creating learning:', error);
    return NextResponse.json({ error: 'Failed to create learning item' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    await prisma.learning.delete({
      where: { id: String(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting learning:', error);
    return NextResponse.json({ error: 'Learning item not found or failed to delete' }, { status: 404 });
  }
}
