import mysql from 'mysql2/promise';

const databaseName =
  process.env.DB_NAME ??
  process.env.DB_DATABASE ??
  process.env.DATABASE_NAME ??
  'support_system';

export const db = mysql.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: databaseName,
});
