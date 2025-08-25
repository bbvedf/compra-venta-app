// tests/integration/healthz.test.js
const request = require('supertest');
const app = require('../../index'); // tu Express app
const pool = require('../../db'); // DB real de test

describe('Endpoint /healthz', () => {
  test('debe devolver 200 si DB está viva', async () => {
    const res = await request(app).get('/healthz');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('db', 'up');
  });

  test('debe devolver 503 si DB falla', async () => {
    const originalQuery = pool.query;
    pool.query = jest.fn(() => Promise.reject(new Error('DB down')));

    const res = await request(app).get('/healthz');

    expect(res.status).toBe(503);
    expect(res.body).toHaveProperty('status', 'error');
    expect(res.body).toHaveProperty('db', 'down');

    pool.query = originalQuery; // restaurar query original
  });
});
