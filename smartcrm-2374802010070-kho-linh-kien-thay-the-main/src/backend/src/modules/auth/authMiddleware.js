const { verifyAccessToken } = require('./authService');

function authenticate(req, res, next) {
  const authorization = req.get('authorization') || '';
  const match = /^Bearer (.+)$/i.exec(authorization);
  const user = match ? verifyAccessToken(match[1]) : null;

  if (!user) {
    return res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Vui lòng đăng nhập để tiếp tục.'
    });
  }

  req.user = user;
  return next();
}

module.exports = { authenticate };
