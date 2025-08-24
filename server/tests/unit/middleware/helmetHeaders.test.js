// tests/unit/middleware/helmetHeaders.test.js
const request = require('supertest');
const app = require('../../../index'); // tu app

describe('Helmet headers', () => {
  test('debería incluir los headers de seguridad', async () => {
    const res = await request(app).get('/api/auth/some-endpoint'); // endpoint cualquiera
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['strict-transport-security']).toMatch(/max-age=\d+/);
    expect(res.headers['x-dns-prefetch-control']).toBe('off');
  });
});
