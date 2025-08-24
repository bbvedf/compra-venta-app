const request = require('supertest');
const express = require('express');
const bannedIP = require('../../utils/bannedIP');
const pool = require('../../db');

let app;

beforeAll(() => {
  app = express();

  // Middleware bajo prueba
  app.use(bannedIP);

  // Endpoint simulado
  app.get('/test', (req, res) => {
    // Para simular fallo 401 o éxito
    if (req.query.fail) {
      return res.status(401).send('Unauthorized');
    }
    res.send('OK');
  });
});

describe('Middleware bannedIP', () => {
  const testIP = '123.45.67.89';

  it('permite a una IP limpia acceder', async () => {
    const res = await request(app).get('/test').set('x-forwarded-for', testIP);

    expect(res.status).toBe(200);
    expect(res.text).toBe('OK');
  });

  it('banea tras 5 fallos seguidos y devuelve 403', async () => {
    // Simular 5 fallos
    for (let i = 0; i < 5; i++) {
      await request(app).get('/test?fail=1').set('x-forwarded-for', testIP);
    }

    // Sexto intento → baneado
    const res = await request(app).get('/test').set('x-forwarded-for', testIP);

    expect(res.status).toBe(403);

    // Confirmar en DB
    const { rows } = await pool.query('SELECT * FROM banned_ips WHERE ip_address = $1', [testIP]);
    expect(rows.length).toBeGreaterThan(0);
  });

  it('levanta ban si ban_until expiró', async () => {
    const banUntilPast = new Date(Date.now() - 60 * 1000);
    await pool.query(`INSERT INTO banned_ips (ip_address, ban_until) VALUES ($1, $2)`, [
      testIP,
      banUntilPast,
    ]);

    const res = await request(app).get('/test').set('x-forwarded-for', testIP);

    expect(res.status).toBe(200);
  });
});
