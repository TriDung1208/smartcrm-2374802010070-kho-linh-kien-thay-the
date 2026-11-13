const { verifyAccessToken } = require('./authService');
const { getUserById } = require('./authRepository');

async function authenticate(req, res, next) {
  const authorization = req.get('authorization') || '';
  const match = /^Bearer\s+(.+)$/i.exec(authorization);
  const tokenUser = match ? verifyAccessToken(match[1]) : null;

  if (!tokenUser) {
    return res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Vui lòng đăng nhập để tiếp tục.'
    });
  }

  try {
    const user = await getUserById(tokenUser.userId);
    if (!user) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Tài khoản không còn tồn tại.'
      });
    }

    req.user = { userId: user.user_id, username: user.username, role: user.role };
    return next();
  } catch (error) {
    console.error('Authentication lookup failed:', error);
    return res.status(500).json({
      code: 'AUTHENTICATION_ERROR',
      message: 'Không thể xác thực tài khoản lúc này.'
    });
  }
}

module.exports = { authenticate };
