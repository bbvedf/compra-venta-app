const request = require('supertest');
const express = require('express');
const adminRouter = require('../../routes/admin');
const pool = require('../../db');

// Mock middleware
jest.mock('../../middleware/authMiddleware', () => ({
  verifyToken: (req, res, next) => {
    req.user = { email: 'mockuser@test.com' }; // simulamos req.user
    next();
  },
  isAdmin: (req, res, next) => next(),
}));

// Mock logger y emailSender
jest.mock('../../utils/logger');
jest.mock('../../utils/emailSender');
const emailSender = require('../../utils/emailSender');

const testApp = express();
testApp.use(express.json());
testApp.use('/api/admin', adminRouter);

describe('Admin Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ------------------------
  // GET /users
  // ------------------------
  describe('GET /api/admin/users', () => {
    test('devuelve lista de usuarios', async () => {
      pool.query = jest.fn().mockResolvedValueOnce({ rows: [{ id: 1, email: 'test@test.com' }] });

      const res = await request(testApp).get('/api/admin/users');

      expect(res.statusCode).toBe(200);
      expect(res.body.users).toHaveLength(1);
      expect(res.body.users[0].email).toBe('test@test.com');
    });

    test('maneja error de la base de datos', async () => {
      pool.query = jest.fn().mockRejectedValueOnce(new Error('DB error'));

      const res = await request(testApp).get('/api/admin/users');

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Error al obtener usuarios');
    });
  });

  // ------------------------
  // PATCH /users/:id
  // ------------------------
  describe('PATCH /api/admin/users/:id', () => {
    test('actualiza usuario y envía email de aprobación', async () => {
      pool.query = jest
        .fn()
        .mockResolvedValueOnce({ rows: [{ email: 'a@b.com', is_approved: false }] })
        .mockResolvedValueOnce({ rows: [{}] });

      const res = await request(testApp)
        .patch('/api/admin/users/1')
        .send({ isApproved: true, role: 'admin' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(emailSender.sendUserApprovedEmail).toHaveBeenCalledWith('a@b.com');
    });

    test('actualiza usuario y envía email de rechazo', async () => {
      pool.query = jest
        .fn()
        .mockResolvedValueOnce({ rows: [{ email: 'a@b.com', is_approved: true }] })
        .mockResolvedValueOnce({ rows: [{}] });

      const res = await request(testApp)
        .patch('/api/admin/users/1')
        .send({ isApproved: false, role: 'user' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(emailSender.sendUserRejectedEmail).toHaveBeenCalledWith('a@b.com');
    });

    test('usuario sin cambios de aprobación', async () => {
      pool.query = jest
        .fn()
        .mockResolvedValueOnce({ rows: [{ email: 'a@b.com', is_approved: true }] })
        .mockResolvedValueOnce({ rows: [{}] });

      const res = await request(testApp).patch('/api/admin/users/1').send({ role: 'admin' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(emailSender.sendUserApprovedEmail).not.toHaveBeenCalled();
      expect(emailSender.sendUserRejectedEmail).not.toHaveBeenCalled();
    });

    test('usuario no encontrado', async () => {
      pool.query = jest.fn().mockResolvedValueOnce({ rows: [] });

      const res = await request(testApp).patch('/api/admin/users/999').send({ role: 'admin' });

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Usuario no encontrado');
    });
  });

  // ------------------------
  // DELETE /users/:id
  // ------------------------
  describe('DELETE /api/admin/users/:id', () => {
    test('elimina usuario existente', async () => {
      pool.query = jest
        .fn()
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({});

      const res = await request(testApp).delete('/api/admin/users/1');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('usuario no encontrado', async () => {
      pool.query = jest.fn().mockResolvedValueOnce({ rows: [] });

      const res = await request(testApp).delete('/api/admin/users/999');

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe('Usuario no encontrado');
    });
  });

  // ------------------------
  // POST /send-calculation
  // ------------------------
  describe('POST /api/admin/send-calculation', () => {
    test('envía correo correctamente', async () => {
      emailSender.sendCalculationEmail.mockResolvedValueOnce();

      const calculationData = { someData: 123, chartDataUrl: 'fakeUrl' };

      const res = await request(testApp).post('/api/admin/send-calculation').send(calculationData);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Correo enviado correctamente');
      expect(emailSender.sendCalculationEmail).toHaveBeenCalledWith(
        'mockuser@test.com',
        calculationData,
        calculationData.chartDataUrl,
      );
    });
  });

  // ------------------------
  // POST /send-mortgage
  // ------------------------
  describe('POST /api/admin/send-mortgage', () => {
    test('envía correo correctamente', async () => {
      emailSender.sendMortgageEmail.mockResolvedValueOnce();

      const mortgageData = {
        principal: 1000,
        rate: 5,
        years: 10,
        paymentsPerYear: 12,
        tableData: [{ month: 1, payment: 100 }],
        chartDataUrl: 'fakeUrl',
      };

      const res = await request(testApp).post('/api/admin/send-mortgage').send(mortgageData);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Correo de hipoteca enviado correctamente');
      expect(emailSender.sendMortgageEmail).toHaveBeenCalledWith('mockuser@test.com', mortgageData);
    });
  });
});
