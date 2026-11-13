const { setUserRole } = require('../src/modules/auth/authRepository');

const VALID_ROLES = new Set(['ADMIN', 'WAREHOUSE']);

async function updateUserRole(username, role) {
  const normalizedUsername = typeof username === 'string' ? username.trim().toLowerCase() : '';
  if (!normalizedUsername || !VALID_ROLES.has(role)) {
    throw new Error('Usage: npm run set-role -- <username> <ADMIN|WAREHOUSE>');
  }

  const updated = await setUserRole(normalizedUsername, role);
  if (!updated) {
    throw new Error(`Không tìm thấy tài khoản "${normalizedUsername}".`);
  }
  console.log(`Đã cập nhật vai trò ${role} cho tài khoản ${normalizedUsername}.`);
}

if (require.main === module) {
  updateUserRole(process.argv[2], process.argv[3]).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { updateUserRole };
