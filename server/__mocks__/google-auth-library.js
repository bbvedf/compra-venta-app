// server/__mocks__/google-auth-library.js
const mClient = { verifyIdToken: jest.fn() };
module.exports = {
  OAuth2Client: jest.fn(() => mClient),
};
