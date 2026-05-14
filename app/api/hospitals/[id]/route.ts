import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  await query(
    `UPDATE hospitals SET
      name = ?, province_id = ?, district = ?, address = ?,
      phone = ?, contact_name = ?, contact_phone = ?, note = ?
     WHERE id = ?`,
    [
      body.name, body.province_id,
      body.district ?? null, body.address ?? null,
      body.phone ?? null, body.contact_name ?? null,
      body.contact_phone ?? null, body.note ?? null,
      id,
    ]
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  await query('UPDATE hospitals SET is_active = 0 WHERE id = ?', [id]);
  return NextResponse.json({ ok: true });
}
