// server/tests/unit/authMiddleware.test.js
const { verifyToken, checkApproved, isAdmin } = require('../../../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const pool = require('../../../db');

jest.mock('../../../utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}));

jest.mock('../../../db', () => ({
  query: jest.fn(),
}));

describe('authMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  // ------------------------
  // verifyToken
  // ------------------------
  it('pasa si token válido y usuario aprobado existe', async () => {
    req.headers.authorization = 'Bearer validtoken';
    jwt.verify = jest.fn().mockReturnValue({ userId: 1 });
    pool.query.mockResolvedValue({
      rows: [{ id: 1, email: 'a@b.com', isApproved: true, role: 'user' }],
    });

    await verifyToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ id: 1, email: 'a@b.com', isApproved: true, role: 'user' });
  });

  it('lanza 401 si no hay header', async () => {
    await verifyToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token requerido' });
  });

  it('lanza 401 si header es Bearer pero sin token', async () => {
    req.headers.authorization = 'Bearer ';
    await verifyToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('lanza 403 si token inválido', async () => {
    req.headers.authorization = 'Bearer invalid';
    jwt.verify = jest.fn(() => {
      throw new Error('fail');
    });

    await verifyToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('lanza 401 si usuario no existe', async () => {
    req.headers.authorization = 'Bearer validtoken';
    jwt.verify = jest.fn().mockReturnValue({ userId: 99 });
    pool.query.mockResolvedValue({ rows: [] });

    await verifyToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('lanza 401 si usuario no aprobado', async () => {
    req.headers.authorization = 'Bearer validtoken';
    jwt.verify = jest.fn().mockReturnValue({ userId: 1 });
    pool.query.mockResolvedValue({
      rows: [{ id: 1, email: 'a@b.com', isApproved: false, role: 'user' }],
    });

    await verifyToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  // ------------------------
  // checkApproved
  // ------------------------
  it('pasa si usuario aprobado', async () => {
    req.user = { email: 'a@b.com' };
    pool.query.mockResolvedValue({ rows: [{ is_approved: true }] });

    await checkApproved(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('lanza 403 si usuario no aprobado', async () => {
    req.user = { email: 'a@b.com' };
    pool.query.mockResolvedValue({ rows: [{ is_approved: false }] });

    await checkApproved(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('lanza 500 si hay error en DB', async () => {
    req.user = { email: 'a@b.com' };
    pool.query.mockRejectedValue(new Error('DB fail'));

    await checkApproved(req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  // ------------------------
  // isAdmin
  // ------------------------
  it('pasa si user es admin', async () => {
    req.user = { role: 'admin' };
    await isAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('lanza 403 si user no es admin', async () => {
    req.user = { role: 'user' };
    await isAdmin(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});
