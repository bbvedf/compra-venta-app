// tests/unit/constants/eventTypes.test.js
const eventTypes = require('../../../constants/eventTypes');

describe('eventTypes constants', () => {
  it('debería estar definido y no vacío', () => {
    expect(eventTypes).toBeDefined();
    expect(Object.keys(eventTypes).length).toBeGreaterThan(0);
  });
});
