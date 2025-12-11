import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/roles';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message || "Impossible de récupérer l'événement" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    const { id } = params;
    const data = await request.json();
    const event = await prisma.event.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ success: false, error: (error as Error).message || "Impossible de mettre à jour l'événement" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    const { id } = params;
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ success: false, error: (error as Error).message || "Impossible de supprimer l'événement" }, { status: 500 });
  }
}
