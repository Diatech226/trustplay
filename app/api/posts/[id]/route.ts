import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/roles';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  await requireAdmin(request);
  const data = await request.json();
  const post = await prisma.post.update({ where: { id: params.id }, data });
  return NextResponse.json(post);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  await requireAdmin(request);
  await prisma.post.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
