const crypto = require('crypto');
const { promisify } = require('util');
const { getUserByUsername, createUser } = require('./authRepository');

const scrypt = promisify(crypto.scrypt);
const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]{3,32}$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const TOKEN_LIFETIME_SECONDS = 8 * 60 * 60;
let generatedTokenSecret;

function createError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function tokenSecret() {
  if (process.env.AUTH_TOKEN_SECRET) return process.env.AUTH_TOKEN_SECRET;
  generatedTokenSecret ||= crypto.randomBytes(32).toString('hex');
  return generatedTokenSecret;
}

function signToken(payload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', tokenSecret()).update(encodedPayload).digest('base64url');
  return `${encodedPayload}.${signature}`;
}

function createAccessToken(user) {
  return signToken({
    sub: user.user_id,
    username: user.username,
    exp: Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS
  });
}

function verifyAccessToken(token) {
  if (typeof token !== 'string') return null;
  const [encodedPayload, signature, extra] = token.split('.');
  if (!encodedPayload || !signature || extra !== undefined) return null;

  const expected = crypto.createHmac('sha256', tokenSecret()).update(encodedPayload).digest();
  let actual;
  try {
    actual = Buffer.from(signature, 'base64url');
  } catch {
    return null;
  }
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (!Number.isInteger(payload.sub)
      || typeof payload.username !== 'string'
      || !Number.isInteger(payload.exp)
      || payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }
    return { userId: payload.sub, username: payload.username };
  } catch {
    return null;
  }
}

async function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derivedKey = await scrypt(password, salt, 64);
  return { passwordHash: derivedKey.toString('hex'), passwordSalt: salt };
}

async function verifyPassword(password, user) {
  const { passwordHash } = await hashPassword(password, user.password_salt);
  const expected = Buffer.from(user.password_hash, 'hex');
  const actual = Buffer.from(passwordHash, 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function validateCredentials(username, password) {
  if (typeof username !== 'string' || !USERNAME_PATTERN.test(username.trim())) {
    throw createError('Tên đăng nhập phải có 3–32 ký tự (chữ, số, dấu chấm, gạch dưới hoặc gạch ngang).', 400, 'INVALID_USERNAME');
  }
  if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
    throw createError('Mật khẩu phải có từ 8 đến 128 ký tự.', 400, 'INVALID_PASSWORD');
  }
  return { username: username.trim().toLowerCase(), password };
}

async function register({ username, password }) {
  const credentials = validateCredentials(username, password);
  const { passwordHash, passwordSalt } = await hashPassword(credentials.password);

  try {
    return await createUser({
      username: credentials.username,
      passwordHash,
      passwordSalt
    });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      throw createError('Tên đăng nhập đã được sử dụng.', 409, 'USERNAME_TAKEN');
    }
    throw error;
  }
}

async function login({ username, password }) {
  if (typeof username !== 'string' || typeof password !== 'string' || password.length > PASSWORD_MAX_LENGTH) {
    throw createError('Vui lòng nhập tên đăng nhập và mật khẩu.', 400, 'INVALID_CREDENTIALS');
  }
  const user = await getUserByUsername(username.trim().toLowerCase());
  if (!user || !(await verifyPassword(password, user))) {
    throw createError('Tên đăng nhập hoặc mật khẩu không đúng.', 401, 'INVALID_CREDENTIALS');
  }
  return user;
}

module.exports = {
  createAccessToken,
  hashPassword,
  login,
  register,
  validateCredentials,
  verifyAccessToken,
  verifyPassword
};
