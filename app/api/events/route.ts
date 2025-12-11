import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/roles';

export async function GET() {
  try {
    const events = await prisma.event.findMany({ orderBy: { eventDate: 'asc' } });
    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message || 'Impossible de charger les événements' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const data = await request.json();
    const event = await prisma.event.create({ data });
    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ success: false, error: (error as Error).message || "Impossible de créer l'événement" }, { status: 500 });
  }
}
