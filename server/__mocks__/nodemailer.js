// server/__mocks__/nodemailer.js
module.exports = {
  createTransport: () => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' })
  })
};