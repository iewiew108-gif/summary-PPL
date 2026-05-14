import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rows = await query<{ config_key: string; config_value: string; data_type: string }>(
    'SELECT config_key, config_value, data_type FROM system_config'
  );

  const config: Record<string, string | number | boolean> = {};
  for (const row of rows) {
    if (row.data_type === 'number') config[row.config_key] = Number(row.config_value);
    else if (row.data_type === 'boolean') config[row.config_key] = row.config_value === 'true';
    else config[row.config_key] = row.config_value;
  }

  return NextResponse.json({ config });
}

export async function PUT(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  for (const [key, value] of Object.entries(body)) {
    await query(
      'UPDATE system_config SET config_value = ?, updated_by = ? WHERE config_key = ?',
      [String(value), user.id, key]
    );
  }
  return NextResponse.json({ ok: true });
}
