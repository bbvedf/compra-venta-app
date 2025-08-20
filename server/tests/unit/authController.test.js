// server/tests/unit/authController.test.js
const { __testHelpers } = require('../../controllers/auth');
const jwt = require('jsonwebtoken');

describe('authController helpers', () => {
  it('genera un token correctamente', () => {
    const payload = { id: 123, email: 'test@test.com', role: 'basic', isApproved: true };
    const token = __testHelpers.generateToken(payload);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mi_secreto');
    expect(decoded.userId).toBe(123);
    expect(decoded.email).toBe('test@test.com');
  });

  it('hashea password y valida correctamente', async () => {
    const password = 'Test123!';
    const hash = await __testHelpers.hashPassword(password);
    const valid = await __testHelpers.comparePassword(password, hash);
    expect(valid).toBe(true);
  });
});
