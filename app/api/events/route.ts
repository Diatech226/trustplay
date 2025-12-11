import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/roles';

export async function GET() {
  try {
    const events = await prisma.event.findMany({ orderBy: { eventDate: 'asc' } });
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: 'Impossible de charger les événements' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const data = await request.json();
    const event = await prisma.event.create({ data });
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Impossible de créer l\'événement' }, { status: 500 });
  }
}
