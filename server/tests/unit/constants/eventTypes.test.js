// tests/unit/constants/eventTypes.test.js
const eventTypes = require('../../../server/constants/eventTypes');

describe('eventTypes constants', () => {
  it('debería estar definido y no vacío', () => {
    expect(eventTypes).toBeDefined();
    expect(Object.keys(eventTypes).length).toBeGreaterThan(0);
  });
});
