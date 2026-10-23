const { findAll, findById } = require('./issueCategoryRepository');

async function getAllIssueCategories() {
  return findAll();
}

async function getIssueCategoryById(categoryId) {
  const rows = await findById(categoryId);
  if (!rows.length) {
    const err = new Error('Issue category not found');
    err.statusCode = 404;
    throw err;
  }
  return rows[0];
}

module.exports = { getAllIssueCategories, getIssueCategoryById };
