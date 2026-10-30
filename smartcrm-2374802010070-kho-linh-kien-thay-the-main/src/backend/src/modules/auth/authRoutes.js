const express = require('express');
const { createAccessToken, login, register } = require('./authService');

const router = express.Router();

function sendError(res, error) {
  if (!error.statusCode) console.error('Authentication request failed:', error);
  return res.status(error.statusCode || 500).json({
    code: error.code || 'INTERNAL_ERROR',
    message: error.statusCode ? error.message : 'Đã xảy ra lỗi máy chủ.'
  });
}

router.post('/register', async (req, res) => {
  try {
    const user = await register(req.body || {});
    return res.status(201).json({
      token: createAccessToken({ user_id: user.userId, username: user.username }),
      user: { id: user.userId, username: user.username }
    });
  } catch (error) {
    return sendError(res, error);
  }
});

router.post('/login', async (req, res) => {
  try {
    const user = await login(req.body || {});
    return res.json({
      token: createAccessToken(user),
      user: { id: user.user_id, username: user.username }
    });
  } catch (error) {
    return sendError(res, error);
  }
});

module.exports = { authRoutes: router };
