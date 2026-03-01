import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const isHot = searchParams.get('isHot') === 'true';

  try {
    const whereClause: any = {};
    if (category) {
      whereClause.category = category;
    }
    if (isHot) {
      whereClause.isHot = true;
    }

    const tools = await prisma.aITool.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(tools);
  } catch (error) {
    console.error('Error fetching tools:', error);
    return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newTool = await prisma.aITool.create({
      data: {
        name: body.name,
        description: body.description,
        icon: body.icon,
        category: body.category,
        url: body.url,
        isHot: body.isHot || false,
      }
    });
    return NextResponse.json(newTool, { status: 201 });
  } catch (error) {
    console.error('Error creating tool:', error);
    return NextResponse.json({ error: 'Failed to create tool' }, { status: 500 });
  }
}
