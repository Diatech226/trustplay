import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/roles';

export async function GET() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  await requireAdmin(request);
  const data = await request.json();
  const post = await prisma.post.create({ data });
  return NextResponse.json(post, { status: 201 });
}
