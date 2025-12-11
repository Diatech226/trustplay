import { NextRequest, NextResponse } from 'next/server';
import { getUserFromCookies, getUserFromRequest } from './auth';

export function resolveRoleForEmail(email: string) {
  const admins = (process.env.ADMIN_EMAILS || '').split(',').map((value) => value.trim().toLowerCase()).filter(Boolean);
  return admins.includes(email.toLowerCase()) ? 'ADMIN' : 'USER';
}

export async function requireAuth(request?: Request | NextRequest) {
  const user = request
    ? await getUserFromRequest(request as NextRequest)
    : await getUserFromCookies();
  if (!user) {
    throw NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return user;
}

export async function requireAdmin(request?: Request | NextRequest) {
  const user = await requireAuth(request);
  if (user.role !== 'ADMIN') {
    throw NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return user;
}
