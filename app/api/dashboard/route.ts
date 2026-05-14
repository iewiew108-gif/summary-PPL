import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const yearParam = new URL(req.url).searchParams.get('year');
  const yearSql = yearParam
    ? String(Number(yearParam))
    : `(SELECT config_value FROM system_config WHERE config_key = 'current_year')`;

  const [targetRow, summary, monthly, teamWorkload] = await Promise.all([
    queryOne<{ target: string; plan_total: string; installed_total: string }>(
      `SELECT
        COALESCE(
          (SELECT target_amount FROM yearly_targets WHERE year = ${yearSql}),
          (SELECT config_value FROM system_config WHERE config_key = 'yearly_target')
        ) AS target,
        COALESCE(SUM(amount),0) AS plan_total,
        COALESCE(SUM(CASE WHEN status IN ('ติดตั้งแล้ว','กำลังปฏิบัติงาน') THEN amount ELSE 0 END),0) AS installed_total
       FROM sites
       WHERE year = ${yearSql} AND status != 'ยกเลิก'`
    ),
    query<{ status: string; count: number; total_wards: number; total_amount: string }>(
      `SELECT status, COUNT(*) AS count, COALESCE(SUM(wards),0) AS total_wards, COALESCE(SUM(amount),0) AS total_amount
       FROM sites
       WHERE year = ${yearSql}
       GROUP BY status`
    ),
    query<{ month: string; site_count: number; total_wards: number; total_amount: string; installed_amount: string }>(
      `SELECT * FROM v_monthly_summary WHERE year = ${yearSql}`
    ),
    query<{ team_name: string; month: string; total_wards: number; capacity: number }>(
      `SELECT team_name, month, total_wards, capacity
       FROM v_team_workload
       WHERE year = ${yearSql}`
    ),
  ]);

  return NextResponse.json({ summary: targetRow, statusSummary: summary, monthly, teamWorkload });
}
