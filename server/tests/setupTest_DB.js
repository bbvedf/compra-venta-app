// server/tests/setupTest_DB.js
const pool = require('../db');

beforeAll(async () => {
  // Esperar que la DB esté lista
  let retries = 5;
  while (retries) {
    try {
      await pool.query('SELECT 1');
      break;
    } catch (err) {
      retries -= 1;
      console.log('Waiting for DB... retrying', err.message); // Añadir mensaje de error
      if (retries === 0) {
        throw new Error('Failed to connect to database after retries');
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // Crear tablas
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_approved BOOLEAN DEFAULT false NOT NULL,
      role VARCHAR(20) DEFAULT 'basic' NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      event_type VARCHAR(50) NOT NULL,
      ip_address VARCHAR(45),
      user_agent TEXT,
      details JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Usuario dummy
  await pool.query(`
    INSERT INTO users (username, email, password, is_approved, role)
    VALUES ('tester', 'test@example.com', 'hashedpass', true, 'basic')
    ON CONFLICT (email) DO NOTHING;
  `);
}, 30000);

beforeEach(async () => {
  // Truncar antes de cada test
  await pool.query('TRUNCATE users_logs RESTART IDENTITY CASCADE;');
  await pool.query('TRUNCATE users RESTART IDENTITY CASCADE;');
});

afterAll(async () => {
  // Cerrar al final de toda la suite
  await pool.end();
});
