// server/tests/integration/metrics.test.js
const request = require('supertest');
const app = require('../../index');

describe('GET /metrics', () => {
  it('debe responder 200 y contener métricas básicas', async () => {
    const res = await request(app).get('/metrics');

    // Código de estado
    expect(res.statusCode).toBe(200);

    // Métricas esperadas
    expect(res.text).toMatch(/http_requests_total/);
    expect(res.text).toMatch(/http_request_duration_ms/);
    expect(res.text).toMatch(/http_errors_total/);
  });
});
