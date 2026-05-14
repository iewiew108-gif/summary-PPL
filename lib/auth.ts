import crypto from 'crypto';
import { cookies } from 'next/headers';
import { query, queryOne } from './db';

export function hashPassword(password: string, salt: string): string {
  return crypto.createHash('sha256').update(`${password}:${salt}`).digest('hex');
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export interface User {
  id: string;
  username: string;
  display_name: string;
  role: 'admin' | 'user';
  email: string | null;
  is_active: number;
}

export interface Session {
  id: string;
  user_id: string;
  expires_at: Date;
}

export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;

  const session = await queryOne<{ user_id: string; expires_at: Date }>(
    'SELECT user_id, expires_at FROM user_sessions WHERE id = ? AND expires_at > NOW()',
    [token]
  );
  if (!session) return null;

  const user = await queryOne<User>(
    'SELECT id, username, display_name, role, email, is_active FROM users WHERE id = ? AND is_active = 1',
    [session.user_id]
  );

  if (user) {
    await query('UPDATE user_sessions SET last_activity = NOW() WHERE id = ?', [token]);
  }

  return user;
}

export async function createSession(userId: string, ipAddress?: string, userAgent?: string): Promise<string> {
  const token = generateToken();
  const sessionDays = 30;
  await query(
    `INSERT INTO user_sessions (id, user_id, ip_address, user_agent, expires_at)
     VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))`,
    [token, userId, ipAddress ?? null, userAgent ?? null, sessionDays]
  );
  await query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [userId]);
  return token;
}

export async function deleteSession(token: string): Promise<void> {
  await query('DELETE FROM user_sessions WHERE id = ?', [token]);
}
