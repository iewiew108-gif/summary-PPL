import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { hashPassword, createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'กรุณากรอก username และ password' }, { status: 400 });
    }

    const user = await queryOne<{
      id: string; username: string; password_hash: string; password_salt: string;
      display_name: string; role: string; is_active: number;
    }>(
      'SELECT id, username, password_hash, password_salt, display_name, role, is_active FROM users WHERE username = ?',
      [username]
    );

    if (!user || !user.is_active) {
      return NextResponse.json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    const hash = hashPassword(password, user.password_salt);
    if (hash !== user.password_hash) {
      return NextResponse.json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? undefined;
    const ua = req.headers.get('user-agent') ?? undefined;
    const token = await createSession(user.id, ip, ua);

    const response = NextResponse.json({
      user: { id: user.id, username: user.username, display_name: user.display_name, role: user.role }
    });

    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด กรุณาลองใหม่' }, { status: 500 });
  }
}
