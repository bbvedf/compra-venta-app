// tests/unit/models/ApprovedEmail.test.js
const ApprovedEmail = require('../../../models/ApprovedEmail');
const pool = require('../../../db');

jest.mock('../../../db', () => ({
  query: jest.fn(),
}));

describe('ApprovedEmail model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('isApproved devuelve true si el email está aprobado', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ email: 'test@example.com' }] });

    const result = await ApprovedEmail.isApproved('test@example.com');
    expect(result).toBe(true);
    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM approved_emails WHERE email = $1', [
      'test@example.com',
    ]);
  });

  test('isApproved devuelve false si el email no está aprobado', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const result = await ApprovedEmail.isApproved('nope@example.com');
    expect(result).toBe(false);
  });

  test('create inserta un email y devuelve el objeto creado', async () => {
    const fakeRow = { email: 'new@example.com', role: 'user' };
    pool.query.mockResolvedValueOnce({ rows: [fakeRow] });

    const result = await ApprovedEmail.create('new@example.com', 'user');
    expect(result).toEqual(fakeRow);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO approved_emails'),
      ['new@example.com', 'user'],
    );
  });

  test('findByEmail devuelve la fila correspondiente', async () => {
    const fakeRow = { email: 'found@example.com', role: 'admin' };
    pool.query.mockResolvedValueOnce({ rows: [fakeRow] });

    const result = await ApprovedEmail.findByEmail('found@example.com');
    expect(result).toEqual(fakeRow);
  });

  test('getAll devuelve todas las filas', async () => {
    const fakeRows = [
      { email: 'a@example.com', role: 'user' },
      { email: 'b@example.com', role: 'admin' },
    ];
    pool.query.mockResolvedValueOnce({ rows: fakeRows });

    const result = await ApprovedEmail.getAll();
    expect(result).toEqual(fakeRows);
  });
});
