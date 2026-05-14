import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const row = await queryOne(
    `SELECT g.*, h.name AS hospital_name, p.name_th AS province_name
     FROM gateway_installations g
     JOIN hospitals h ON h.id = g.hospital_id
     JOIN provinces p ON p.id = h.province_id
     WHERE g.id = ?`,
    [id]
  );
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ gateway: row });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  await query(
    `UPDATE gateway_installations SET
      gateway_type = ?, hospital_id = ?, hamin = ?, installer_name = ?,
      contact_name = ?, contact_position = ?, contact_phone = ?, contact_email = ?,
      db_ip = ?, db_name = ?, db_user = ?, db_pass = ?,
      remote_ip = ?, remote_computer_name = ?, anydesk_user = ?, anydesk_pass = ?,
      telegram_token = ?, date_contact = ?, date_completed = ?, status = ?, note = ?
     WHERE id = ?`,
    [
      body.gateway_type, body.hospital_id, body.hamin ?? null, body.installer_name,
      body.contact_name, body.contact_position ?? null, body.contact_phone, body.contact_email ?? null,
      body.db_ip, body.db_name, body.db_user, body.db_pass,
      body.remote_ip, body.remote_computer_name ?? null, body.anydesk_user ?? null, body.anydesk_pass ?? null,
      body.telegram_token ?? null,
      body.date_contact ?? null, body.date_completed ?? null,
      body.status, body.note ?? null,
      id,
    ]
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  await query('DELETE FROM gateway_installations WHERE id = ?', [id]);
  return NextResponse.json({ ok: true });
}
