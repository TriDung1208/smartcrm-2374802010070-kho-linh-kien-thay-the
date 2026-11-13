const test = require('node:test');
const assert = require('node:assert/strict');
const { requireRole } = require('./authorization');

test('allows an authenticated user with an explicitly permitted role', () => {
  let continued = false;
  const middleware = requireRole('ADMIN', 'WAREHOUSE');

  middleware({ user: { role: 'WAREHOUSE' } }, {}, () => {
    continued = true;
  });

  assert.equal(continued, true);
});

test('denies a role not allowed to manage protected resources', () => {
  let continued = false;
  let responseStatus;
  let responseBody;
  const response = {
    status(status) {
      responseStatus = status;
      return this;
    },
    json(body) {
      responseBody = body;
      return this;
    }
  };

  requireRole('ADMIN')({ user: { role: 'WAREHOUSE' } }, response, () => {
    continued = true;
  });

  assert.equal(continued, false);
  assert.equal(responseStatus, 403);
  assert.equal(responseBody.code, 'FORBIDDEN');
});

test('denies requests without an authenticated user', () => {
  let responseStatus;
  const response = {
    status(status) {
      responseStatus = status;
      return this;
    },
    json() {
      return this;
    }
  };

  requireRole('ADMIN')({}, response, () => {});

  assert.equal(responseStatus, 403);
});
