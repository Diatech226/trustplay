import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/roles';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({ where: { id: params.id } });
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(event);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  await requireAdmin(request);
  const data = await request.json();
  const event = await prisma.event.update({ where: { id: params.id }, data });
  return NextResponse.json(event);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  await requireAdmin(request);
  await prisma.event.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
