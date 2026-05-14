import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const site = await queryOne('SELECT * FROM v_sites_full WHERE id = ?', [id]);
  if (!site) return NextResponse.json({ error: 'ไม่พบข้อมูล' }, { status: 404 });

  const members = await query('SELECT * FROM site_team_members WHERE site_id = ? ORDER BY joined_at', [id]);
  return NextResponse.json({ site, members });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await queryOne<{ owner_id: string }>('SELECT owner_id FROM sites WHERE id = ?', [id]);
  if (!existing) return NextResponse.json({ error: 'ไม่พบข้อมูล' }, { status: 404 });
  if (user.role !== 'admin' && existing.owner_id !== user.id) {
    return NextResponse.json({ error: 'ไม่มีสิทธิ์แก้ไข' }, { status: 403 });
  }

  const body = await req.json();
  const allowed = ['hospital_id','month','year','install_type','wards','unit_price','amount','team_id',
    'responsible_user_id','responsible_name','status','date_start','date_end','note'];

  const sets: string[] = [];
  const vals: unknown[] = [];
  for (const key of allowed) {
    if (key in body) { sets.push(`${key} = ?`); vals.push(body[key] ?? null); }
  }
  sets.push('updated_by = ?');
  vals.push(user.id);
  vals.push(id);

  await query(`UPDATE sites SET ${sets.join(', ')} WHERE id = ?`, vals);
  const site = await queryOne('SELECT * FROM v_sites_full WHERE id = ?', [id]);
  return NextResponse.json({ site });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const existing = await queryOne<{ owner_id: string }>('SELECT owner_id FROM sites WHERE id = ?', [id]);
  if (!existing) return NextResponse.json({ error: 'ไม่พบข้อมูล' }, { status: 404 });
  if (user.role !== 'admin' && existing.owner_id !== user.id) {
    return NextResponse.json({ error: 'ไม่มีสิทธิ์ลบ' }, { status: 403 });
  }

  await query('DELETE FROM sites WHERE id = ?', [id]);
  return NextResponse.json({ ok: true });
}
