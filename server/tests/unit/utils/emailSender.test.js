// server/tests/unit/utils/emailSender.test.js
const emailSender = require('../../../utils/emailSender');

// Mock del logger
jest.mock('../../../utils/logger', () => ({
  info: jest.fn(),
}));

// Mock de nodemailer
jest.mock('nodemailer', () => {
  const sendMailMock = jest.fn().mockResolvedValue({ messageId: 'test-id' });
  return {
    createTransport: () => ({ sendMail: sendMailMock }),
    __sendMailMock: sendMailMock, // para poder accederlo en los tests
  };
});

const nodemailer = require('nodemailer');
const sendMailMock = nodemailer.__sendMailMock;

beforeEach(() => {
  jest.clearAllMocks();
  process.env.EMAIL_USER = 'test@example.com';
  process.env.EMAIL_BCC = 'bcc@example.com';
});

describe('emailSender utils', () => {
  test('sendPasswordResetEmail llama a sendMail correctamente', async () => {
    const to = 'user@example.com';
    const resetLink = 'https://reset-link.com';

    await emailSender.sendPasswordResetEmail(to, resetLink);

    expect(sendMailMock).toHaveBeenCalledTimes(1);
    const mailOptions = sendMailMock.mock.calls[0][0];
    expect(mailOptions.to).toBe(to);
    expect(mailOptions.subject).toBe('Restablece tu contraseña');
    expect(mailOptions.html).toContain(resetLink);
  });

  test('sendNewUserNotificationEmail llama a sendMail correctamente', async () => {
    const newUser = { username: 'newuser', email: 'newuser@example.com' };

    await emailSender.sendNewUserNotificationEmail(newUser);

    expect(sendMailMock).toHaveBeenCalledTimes(1);
    const mailOptions = sendMailMock.mock.calls[0][0];
    expect(mailOptions.to).toBe(process.env.EMAIL_BCC);
    expect(mailOptions.subject).toBe('Nuevo usuario registrado');
    expect(mailOptions.html).toContain(newUser.username);
  });

  test('sendUserApprovedEmail y sendUserRejectedEmail llaman a sendMail', async () => {
    const to = 'user@example.com';

    await emailSender.sendUserApprovedEmail(to);
    await emailSender.sendUserRejectedEmail(to);

    expect(sendMailMock).toHaveBeenCalledTimes(2);
    const subjects = sendMailMock.mock.calls.map((call) => call[0].subject);
    expect(subjects).toContain('Cuenta aprobada');
    expect(subjects).toContain('Cuenta CANCELADA');
  });

  test('sendCalculationEmail envía correo con adjunto si chartDataUrl existe', async () => {
    const to = 'user@example.com';
    const calculationData = {
      capital: 1000,
      rate: 5,
      years: 2,
      tableData: [{ year: 1, balance: 1050, interest: 50, periodic: 0, realBalance: 1025 }],
    };
    const chartDataUrl = 'data:image/png;base64,AAAA';

    await emailSender.sendCalculationEmail(to, calculationData, chartDataUrl);

    expect(sendMailMock).toHaveBeenCalledTimes(1);
    const mailOptions = sendMailMock.mock.calls[0][0];
    expect(mailOptions.attachments.length).toBe(1);
    expect(mailOptions.html).toContain('Datos de entrada');
  });

  test('sendMortgageEmail envía correo con tabla y gráfico', async () => {
    const to = 'user@example.com';
    const mortgageData = {
      principal: 100000,
      interestRate: 3,
      years: 30,
      paymentsPerYear: 12,
      monthlyPayment: 500,
      table: [
        { period: 1, payment: 500, principalPayment: 300, interestPayment: 200, balance: 99700 },
      ],
      chartDataUrl: 'data:image/png;base64,BBBB',
    };

    await emailSender.sendMortgageEmail(to, mortgageData);

    expect(sendMailMock).toHaveBeenCalledTimes(1);
    const mailOptions = sendMailMock.mock.calls[0][0];
    expect(mailOptions.attachments.length).toBe(1);
    expect(mailOptions.html).toContain('Amortización');
  });
});
