import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, category, url, icon, isHot = false } = body;

    if (!name || !url || !category) {
      return NextResponse.json(
        { error: 'Missing required fields (name, url, category)' },
        { status: 400 }
      );
    }

    const newTool = await prisma.aITool.create({
      data: {
        name,
        description,
        category,
        url,
        icon,
        isHot
      }
    });

    return NextResponse.json(newTool);
  } catch (error: any) {
    console.error('Create Tool Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create tool' },
      { status: 500 }
    );
  }
}
