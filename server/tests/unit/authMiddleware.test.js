// server/tests/unit/authMiddleware.test.js
const { verifyToken } = require('../../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

jest.mock('../../utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
}));


describe('authMiddleware', () => {
    it('pasa si token válido', async () => {
        const req = { headers: { authorization: 'Bearer validtoken' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

        jwt.verify = jest.fn().mockReturnValue({ userId: 1 });

        await expect(verifyToken(req, res, next)).resolves.not.toThrow();
    });

    it('lanza error si token inválido', async () => {
        const req = { headers: { authorization: 'Bearer invalid' } };
        const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        const next = jest.fn();

        jwt.verify = jest.fn(() => { throw new Error('fail'); });

        await verifyToken(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
    });
});
