import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/roles';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const event = await prisma.event.findUnique({ where: { id: params.id } });
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ error: 'Impossible de récupérer l\'événement' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    const data = await request.json();
    const event = await prisma.event.update({ where: { id: params.id }, data });
    return NextResponse.json(event);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Impossible de mettre à jour l\'événement' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    await prisma.event.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Impossible de supprimer l\'événement' }, { status: 500 });
  }
}
