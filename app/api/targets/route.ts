import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await query<{ year: number; target_amount: number; note: string | null }>(
    'SELECT year, target_amount, note FROM yearly_targets ORDER BY year DESC'
  );
  return NextResponse.json({ targets: rows });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { year, target_amount, note } = await req.json();
  if (!year || target_amount == null) return NextResponse.json({ error: 'year and target_amount required' }, { status: 400 });

  await query(
    'INSERT INTO yearly_targets (year, target_amount, note, updated_by) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE target_amount = VALUES(target_amount), note = VALUES(note), updated_by = VALUES(updated_by)',
    [year, target_amount, note ?? null, user.id]
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { year } = await req.json();
  await query('DELETE FROM yearly_targets WHERE year = ?', [year]);
  return NextResponse.json({ ok: true });
}
