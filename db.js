const mysql = require('mysql2/promise');

// Log available MySQL env vars for debugging
console.log('DB ENV CHECK:', {
  MYSQL_URL: process.env.MYSQL_URL ? 'SET' : 'NOT SET',
  MYSQL_PUBLIC_URL: process.env.MYSQL_PUBLIC_URL ? 'SET' : 'NOT SET',
  MYSQLDATABASE: process.env.MYSQLDATABASE || 'NOT SET',
  MYSQL_DATABASE: process.env.MYSQL_DATABASE || 'NOT SET',
  MYSQLHOST: process.env.MYSQLHOST || 'NOT SET',
  MYSQL_HOST: process.env.MYSQL_HOST || 'NOT SET',
  MYSQLPORT: process.env.MYSQLPORT || 'NOT SET',
  MYSQL_PORT: process.env.MYSQL_PORT || 'NOT SET',
  MYSQLUSER: process.env.MYSQLUSER || 'NOT SET',
  MYSQL_USER: process.env.MYSQL_USER || 'NOT SET',
  DB_HOST: process.env.DB_HOST || 'NOT SET',
  DB_NAME: process.env.DB_NAME || 'NOT SET',
});

const dbUrl = process.env.MYSQL_URL || process.env.MYSQL_PUBLIC_URL;

let pool;

if (dbUrl) {
  pool = mysql.createPool(dbUrl);
} else {
  const config = {
    host: process.env.MYSQLHOST || process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.MYSQLPORT || process.env.MYSQL_PORT || process.env.DB_PORT || '3306'),
    user: process.env.MYSQLUSER || process.env.MYSQL_USER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || process.env.DB_NAME || 'school_management',
    waitForConnections: true,
    connectionLimit: 10,
  };
  console.log('Using DB config:', { ...config, password: '***' });
  pool = mysql.createPool(config);
}

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schools (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address VARCHAR(255) NOT NULL,
      latitude FLOAT NOT NULL,
      longitude FLOAT NOT NULL
    )
  `);

  console.log('Database and schools table initialized.');
}

module.exports = { pool, initializeDatabase };
