import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const provinces = await query(
    'SELECT id, name_th, region FROM provinces WHERE is_active = 1 ORDER BY name_th'
  );
  return NextResponse.json({ provinces });
}
