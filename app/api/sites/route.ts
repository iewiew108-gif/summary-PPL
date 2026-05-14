import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { generateId } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const year = searchParams.get('year');
  const month = searchParams.get('month');
  const status = searchParams.get('status');
  const team_id = searchParams.get('team_id');
  const page = Number(searchParams.get('page') || 1);
  const limit = Number(searchParams.get('limit') || 20);
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (user.role !== 'admin') {
    conditions.push('owner_id = ?');
    params.push(user.id);
  }
  if (year) { conditions.push('year = ?'); params.push(year); }
  if (month) { conditions.push('month = ?'); params.push(month); }
  if (status) { conditions.push('status = ?'); params.push(status); }
  if (team_id) { conditions.push('team_id = ?'); params.push(team_id); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [sites, countRow] = await Promise.all([
    query(`SELECT * FROM v_sites_full ${where} ORDER BY year DESC, FIELD(month,'ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.') DESC LIMIT ? OFFSET ?`, [...params, limit, offset]),
    queryOne<{ total: number }>(`SELECT COUNT(*) AS total FROM v_sites_full ${where}`, params),
  ]);

  return NextResponse.json({ sites, total: countRow?.total ?? 0, page, limit });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const id = generateId('s');

  const config = await queryOne<{ onsite_price: string; online_price: string; current_year: string }>(
    `SELECT
      (SELECT config_value FROM system_config WHERE config_key = 'onsite_price') AS onsite_price,
      (SELECT config_value FROM system_config WHERE config_key = 'online_price') AS online_price,
      (SELECT config_value FROM system_config WHERE config_key = 'current_year') AS current_year`
  );

  const unitPrice = body.unit_price ?? (body.install_type === 'onsite'
    ? Number(config?.onsite_price ?? 590000)
    : Number(config?.online_price ?? 490000));
  const wards = Number(body.wards ?? 1);
  const amount = body.amount ?? unitPrice * wards;
  const year = body.year ?? Number(config?.current_year ?? 2569);

  await query(
    `INSERT INTO sites (id, hospital_id, month, year, install_type, wards, unit_price, amount, team_id,
      responsible_user_id, responsible_name, status, date_start, date_end, note, owner_id, created_by)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id, body.hospital_id, body.month, year, body.install_type, wards, unitPrice, amount,
     body.team_id, body.responsible_user_id ?? null, body.responsible_name ?? null,
     body.status ?? 'อยู่ในแผน', body.date_start ?? null, body.date_end ?? null,
     body.note ?? null, user.id, user.id]
  );

  const site = await queryOne('SELECT * FROM v_sites_full WHERE id = ?', [id]);
  return NextResponse.json({ site }, { status: 201 });
}
