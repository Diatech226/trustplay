import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/roles';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) return NextResponse.json({ success: false, error: 'Identifiant invalide' }, { status: 400 });
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message || 'Impossible de récupérer le post' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    const id = Number(params.id);
    if (Number.isNaN(id)) return NextResponse.json({ success: false, error: 'Identifiant invalide' }, { status: 400 });
    const data = await request.json();
    const post = await prisma.post.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ success: false, error: (error as Error).message || 'Impossible de mettre à jour le post' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    const id = Number(params.id);
    if (Number.isNaN(id)) return NextResponse.json({ success: false, error: 'Identifiant invalide' }, { status: 400 });
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ success: true, data: { id } });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ success: false, error: (error as Error).message || 'Impossible de supprimer le post' }, { status: 500 });
  }
}
