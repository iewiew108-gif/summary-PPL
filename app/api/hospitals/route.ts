import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { generateId } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') ?? '';
  const province_id = searchParams.get('province_id');

  const conditions = ['h.is_active = 1'];
  const params: unknown[] = [];

  if (search) { conditions.push('h.name LIKE ?'); params.push(`%${search}%`); }
  if (province_id) { conditions.push('h.province_id = ?'); params.push(province_id); }

  const hospitals = await query(
    `SELECT h.*, p.name_th AS province_name, p.region
     FROM hospitals h JOIN provinces p ON p.id = h.province_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY p.name_th, h.name LIMIT 200`,
    params
  );
  return NextResponse.json({ hospitals });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const id = generateId('h');

  await query(
    `INSERT INTO hospitals (id, name, province_id, district, address, phone, contact_name, contact_phone, note, created_by)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [id, body.name, body.province_id, body.district ?? null, body.address ?? null,
     body.phone ?? null, body.contact_name ?? null, body.contact_phone ?? null,
     body.note ?? null, user.id]
  );
  return NextResponse.json({ id }, { status: 201 });
}
