import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'support_system',

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
