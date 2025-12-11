import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuthToken, setAuthCookie, verifyPassword } from '@/lib/auth';
import { resolveRoleForEmail } from '@/lib/roles';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Identifiants manquants' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return NextResponse.json({ error: 'Mot de passe invalide' }, { status: 401 });

    // assure admin role for configured emails
    if (user.role !== 'ADMIN' && resolveRoleForEmail(email) === 'ADMIN') {
      await prisma.user.update({ where: { id: user.id }, data: { role: 'ADMIN' } });
    }

    const token = createAuthToken({ id: user.id, email: user.email, role: user.role });
    setAuthCookie(token);
    return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } catch (error) {
    return NextResponse.json({ error: 'Impossible de valider la connexion' }, { status: 500 });
  }
}
