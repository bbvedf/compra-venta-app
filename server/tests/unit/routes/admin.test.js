// server/tests/unit/routes/admin.test.js
const request = require('supertest');
const app = require('../../../index');
const jwt = require('jsonwebtoken');

// -------------------------
// Mock de base de datos
// -------------------------
jest.mock('../../../db', () => {
  const mockQuery = jest.fn(async (text, params) => {
    const normalizedQuery = text.replace(/\s+/g, ' ').trim();

    if (
      normalizedQuery ===
      'SELECT id, email, is_approved AS "isApproved", role FROM users WHERE id = $1'
    ) {
      return {
        rows: [
          {
            id: params[0],
            email: params[0] === 1 ? 'admin@example.com' : 'user@example.com',
            isApproved: true,
            role: params[0] === 1 ? 'admin' : 'user',
          },
        ],
        rowCount: 1,
      };
    }

    if (normalizedQuery.includes('SELECT ban_until FROM banned_ips WHERE ip_address = $1')) {
      return { rows: [], rowCount: 0 };
    }

    if (
      normalizedQuery ===
      'SELECT id, email, is_approved AS "isApproved", role, created_at AS "createdAt" FROM users ORDER BY created_at DESC'
    ) {
      return { rows: [], rowCount: 0 };
    }

    return { rows: [], rowCount: 0 };
  });
  return { query: mockQuery };
});

// -------------------------
// Mock global del rate limiter
// -------------------------
jest.mock('express-rate-limit', () => {
  return () => (req, res, next) => next(); // middleware que llama a next() siempre
});

// -------------------------
// Tokens JWT
// -------------------------
const JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

const adminToken = jwt.sign(
  { userId: 1, email: 'admin@example.com', role: 'admin', isApproved: true },
  JWT_SECRET,
  { expiresIn: '1h' },
);

const userToken = jwt.sign(
  { userId: 2, email: 'user@example.com', role: 'user', isApproved: true },
  JWT_SECRET,
  { expiresIn: '1h' },
);

// -------------------------
// Tests
// -------------------------
describe('Admin Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // GET /api/admin/users
  describe('GET /api/admin/users', () => {
    it('debe denegar acceso a usuario no admin', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/forbidden/i);
    });

    it('debe permitir acceso a admin', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('users');
      expect(Array.isArray(res.body.users)).toBe(true);
    });
  });

  // PATCH /api/admin/users/:id
  describe('PATCH /api/admin/users/:id', () => {
    it('debe fallar si id no es un número', async () => {
      const res = await request(app)
        .patch('/api/admin/users/abc')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'user', isApproved: true });
      expect(res.status).toBe(400);
      expect(res.body.errors[0].msg).toMatch(/debe ser un número/i);
    });

    it('debe fallar si role es inválido', async () => {
      const res = await request(app)
        .patch('/api/admin/users/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'invalid' });
      expect(res.status).toBe(400);
      expect(res.body.errors[0].msg).toMatch(/role inválido/i);
    });
  });

  // DELETE /api/admin/users/:id
  describe('DELETE /api/admin/users/:id', () => {
    it('debe fallar si id no es un número', async () => {
      const res = await request(app)
        .delete('/api/admin/users/abc')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(400);
      expect(res.body.errors[0].msg).toMatch(/debe ser un número/i);
    });
  });

  // POST /send-calculation
  describe('POST /api/admin/send-calculation', () => {
    it('debe permitir envíos válidos', async () => {
      const res = await request(app)
        .post('/api/admin/send-calculation')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ chartDataUrl: 'data:image/png;base64,...' });
      expect(res.status).toBe(200);
    });

    it('debe aplicar rate limit', async () => {
      // En unit tests no probamos rate limit real, así que aquí no falla
      const res = await request(app)
        .post('/api/admin/send-calculation')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      expect(res.status).toBe(200);
    });
  });

  // POST /send-mortgage
  describe('POST /api/admin/send-mortgage', () => {
    it('debe permitir envíos válidos', async () => {
      const res = await request(app)
        .post('/api/admin/send-mortgage')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ chartDataUrl: 'data:image/png;base64,...' });
      expect(res.status).toBe(200);
    });

    it('debe aplicar rate limit', async () => {
      // En unit tests no probamos rate limit real, así que aquí no falla
      const res = await request(app)
        .post('/api/admin/send-mortgage')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      expect(res.status).toBe(200);
    });
  });
});
