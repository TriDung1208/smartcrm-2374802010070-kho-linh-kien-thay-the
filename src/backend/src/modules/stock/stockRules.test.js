const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateStockChange, validateStockMutation } = require('./stockRules');

test('accepts an inbound stock mutation with positive integer values', () => {
  assert.deepEqual(
    validateStockMutation({ centerId: '1', partId: '2', quantity: '5', type: 'IN' }),
    { centerId: 1, partId: 2, quantity: 5 }
  );
});

test('rejects a zero quantity at the lower boundary', () => {
  assert.throws(
    () => validateStockMutation({ centerId: 1, partId: 2, quantity: 0, type: 'IN' }),
    { code: 'INVALID_QUANTITY', statusCode: 400 }
  );
});

test('rejects negative stock quantities', () => {
  assert.throws(
    () => validateStockMutation({ centerId: 1, partId: 2, quantity: -1, type: 'IN' }),
    { code: 'INVALID_QUANTITY', statusCode: 400 }
  );
});

test('rejects fractional stock quantities', () => {
  assert.throws(
    () => validateStockMutation({ centerId: 1, partId: 2, quantity: 1.5, type: 'IN' }),
    { code: 'INVALID_QUANTITY', statusCode: 400 }
  );
});

test('requires a positive warranty ticket ID for an outbound mutation', () => {
  assert.throws(
    () => validateStockMutation({ centerId: 1, partId: 2, quantity: 1, type: 'OUT' }),
    { code: 'INVALID_TICKET_ID', statusCode: 400 }
  );
});

test('allows issuing the exact available stock and leaves zero', () => {
  assert.equal(calculateStockChange(4, 4, 'OUT'), 0);
});

test('rejects an issue exceeding stock with available and requested details', () => {
  assert.throws(
    () => calculateStockChange(2, 3, 'OUT'),
    { code: 'INSUFFICIENT_STOCK', statusCode: 409, details: { available: 2, requested: 3 } }
  );
});
