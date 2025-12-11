import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET() {
  try {
    const registrations = await prisma.eventRegistration.findMany({
      include: { event: true, user: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: registrations });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message || 'Impossible de récupérer les inscriptions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body?.eventId) {
      return NextResponse.json({ success: false, error: 'eventId requis' }, { status: 400 });
    }

    const eventId = String(body.eventId);

    const user = await getUserFromRequest(request);
    const payload = {
      eventId,
      email: body.email ?? user?.email,
      name: body.name ?? user?.name,
      userId: user?.id,
    };

    const registration = await prisma.eventRegistration.create({ data: payload });
    return NextResponse.json({ success: true, data: registration }, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ success: false, error: (error as Error).message || "Impossible d'enregistrer l'inscription" }, { status: 500 });
  }
}
