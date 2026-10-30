const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createAccessToken,
  hashPassword,
  validateCredentials,
  verifyAccessToken,
  verifyPassword
} = require('./authService');

test('validates and normalizes registration usernames', () => {
  assert.deepEqual(
    validateCredentials('  Tech.User  ', 'strong-pass-1'),
    { username: 'tech.user', password: 'strong-pass-1' }
  );
});

test('rejects weak passwords and malformed usernames', () => {
  assert.throws(() => validateCredentials('ab', 'strong-pass-1'), { code: 'INVALID_USERNAME' });
  assert.throws(() => validateCredentials('valid_name', 'short'), { code: 'INVALID_PASSWORD' });
});

test('hashes passwords and verifies only the matching password', async () => {
  const { passwordHash, passwordSalt } = await hashPassword('strong-pass-1');
  const user = { password_hash: passwordHash, password_salt: passwordSalt };

  assert.equal(await verifyPassword('strong-pass-1', user), true);
  assert.equal(await verifyPassword('different-pass', user), false);
});

test('creates signed access tokens and rejects tampered tokens', () => {
  const token = createAccessToken({ user_id: 7, username: 'tech.user' });

  assert.deepEqual(verifyAccessToken(token), { userId: 7, username: 'tech.user' });
  assert.equal(verifyAccessToken(`${token}tampered`), null);
  assert.equal(verifyAccessToken('not-a-token'), null);
});
