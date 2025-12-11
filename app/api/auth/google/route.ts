import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ error: 'Google auth non configurée dans ce squelette.' }, { status: 501 });
}
