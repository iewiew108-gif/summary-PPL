import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUser, hashPassword, generateSalt } from '@/lib/auth';
import { generateId } from '@/lib/utils';

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const users = await query(
    `SELECT id, username, display_name, role, email, phone, is_active, last_login_at, created_at
     FROM users ORDER BY role, display_name`
  );
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const id = generateId('u');
  const salt = generateSalt();
  const hash = hashPassword(body.password, salt);

  await query(
    `INSERT INTO users (id, username, password_hash, password_salt, display_name, role, email, phone, created_by)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [id, body.username, hash, salt, body.display_name, body.role ?? 'user',
     body.email ?? null, body.phone ?? null, user.id]
  );
  return NextResponse.json({ id }, { status: 201 });
}
