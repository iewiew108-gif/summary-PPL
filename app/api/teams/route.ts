import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const year = searchParams.get('year');

  const teams = await query(
    `SELECT t.id, t.name, t.capacity, t.display_order,
            u.display_name AS leader_name
     FROM teams t LEFT JOIN users u ON u.id = t.leader_id
     WHERE t.is_active = 1 ORDER BY t.display_order`
  );

  let workload = null;
  if (year) {
    workload = await query(
      `SELECT * FROM v_team_workload WHERE year = ? ORDER BY team_id, FIELD(month,'ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.')`,
      [year]
    );
  }

  return NextResponse.json({ teams, workload });
}
