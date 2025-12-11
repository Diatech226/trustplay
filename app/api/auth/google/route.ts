import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({ error: 'Google auth non configurée dans ce squelette.' }, { status: 501 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
