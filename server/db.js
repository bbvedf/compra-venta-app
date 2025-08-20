// server/db.js
const logger = require('./utils/logger');
const { Pool } = require('pg');
require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
});

logger.info('POSTGRES_HOST', process.env.POSTGRES_HOST);
logger.info('POSTGRES_PORT', process.env.POSTGRES_PORT);

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT || 5432,
  database:
    process.env.NODE_ENV === 'test' ? process.env.POSTGRES_DB_TEST : process.env.POSTGRES_DATABASE,
});

module.exports = pool;
