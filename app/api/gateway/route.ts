import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { generateId } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') ?? '';
  const gateway_type = searchParams.get('type') ?? '';
  const status = searchParams.get('status') ?? '';

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (search) {
    conditions.push('(h.name LIKE ? OR g.installer_name LIKE ? OR g.contact_name LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (gateway_type) { conditions.push('g.gateway_type = ?'); params.push(gateway_type); }
  if (status) { conditions.push('g.status = ?'); params.push(status); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const rows = await query(
    `SELECT g.*, h.name AS hospital_name, p.name_th AS province_name
     FROM gateway_installations g
     JOIN hospitals h ON h.id = g.hospital_id
     JOIN provinces p ON p.id = h.province_id
     ${where}
     ORDER BY g.created_at DESC
     LIMIT 200`,
    params
  );

  return NextResponse.json({ gateways: rows });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const id = generateId('gw');

  await query(
    `INSERT INTO gateway_installations
      (id, gateway_type, hospital_id, hamin, installer_name,
       contact_name, contact_position, contact_phone, contact_email,
       db_ip, db_name, db_user, db_pass,
       remote_ip, remote_computer_name, anydesk_user, anydesk_pass,
       telegram_token, date_contact, date_completed, status, note, created_by)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      id, body.gateway_type ?? 'HOSxPLineOfficialGateway',
      body.hospital_id, body.hamin ?? null, body.installer_name,
      body.contact_name, body.contact_position ?? null, body.contact_phone, body.contact_email ?? null,
      body.db_ip, body.db_name, body.db_user, body.db_pass,
      body.remote_ip, body.remote_computer_name ?? null, body.anydesk_user ?? null, body.anydesk_pass ?? null,
      body.telegram_token ?? null,
      body.date_contact ?? null, body.date_completed ?? null,
      body.status ?? 'รอดำเนินการ', body.note ?? null, user.id,
    ]
  );

  return NextResponse.json({ id }, { status: 201 });
}
