import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/roles';

export async function GET() {
  const events = await prisma.event.findMany({ orderBy: { eventDate: 'asc' } });
  return NextResponse.json(events);
}

export async function POST(request: NextRequest) {
  await requireAdmin(request);
  const data = await request.json();
  const event = await prisma.event.create({ data });
  return NextResponse.json(event, { status: 201 });
}
