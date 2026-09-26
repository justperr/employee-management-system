const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT, 10),
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

let poolPromise = null;

async function initializePool() {
  try {
    poolPromise = await new sql.ConnectionPool(config).connect();
    console.log('✅ Connected to MSSQL Server successfully');
    return poolPromise;
  } catch (err) {
    console.error('❌ Database Connection Failed!', err.message);
    process.exit(1);
  }
}

function getPool() {
  if (!poolPromise) {
    throw new Error('Database pool not initialized');
  }
  return poolPromise;
}

module.exports = { initializePool, getPool };