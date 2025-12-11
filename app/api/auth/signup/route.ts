import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuthToken, hashPassword, setAuthCookie } from '@/lib/auth';
import { resolveRoleForEmail } from '@/lib/roles';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Utilisateur déjà existant' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const role = resolveRoleForEmail(email);
    const user = await prisma.user.create({ data: { email, passwordHash, name, role } });

    const token = createAuthToken({ id: user.id, email: user.email, role: user.role });
    setAuthCookie(token);

    return NextResponse.json(
      { success: true, data: { id: user.id, email: user.email, role: user.role, name: user.name } },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message || "Impossible de créer l'utilisateur" }, { status: 500 });
  }
}
