import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'paperless_db',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'UTF8MB4_UNICODE_CI',
});

// Force correct charset on every new connection (fixes Thai character garbling on MariaDB 10.0)
pool.on('connection', (conn) => {
  conn.query("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'");
});

export default pool;

type DbParam = string | number | boolean | null;

export async function query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
  const [rows] = await pool.query(sql, params as DbParam[]);
  return rows as T[];
}

export async function queryOne<T = unknown>(sql: string, params?: unknown[]): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}
