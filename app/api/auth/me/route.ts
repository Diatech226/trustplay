import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ success: false, data: null }, { status: 401 });
    return NextResponse.json({ success: true, data: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message || 'Impossible de récupérer le profil' }, { status: 500 });
  }
}
