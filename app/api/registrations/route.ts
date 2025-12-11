import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET() {
  const registrations = await prisma.eventRegistration.findMany({ include: { event: true, user: true }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(registrations);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await getUserFromRequest(request);
  const payload = {
    eventId: body.eventId,
    email: body.email ?? user?.email,
    name: body.name ?? user?.name,
    userId: user?.id,
  };
  const registration = await prisma.eventRegistration.create({ data: payload });
  return NextResponse.json(registration, { status: 201 });
}
