const { findAll, findById, create, update, deleteById } = require('./issueCategoryRepository');

const priorities = new Set(['THAP', 'TRUNG_BINH', 'CAO']);

function createError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function validateId(categoryId) {
  const id = Number(categoryId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw createError('categoryId must be a positive integer.', 400, 'INVALID_CATEGORY_ID');
  }
  return id;
}

function validateCategory(input) {
  if (typeof input?.categoryName !== 'string'
    || !input.categoryName.trim()
    || input.categoryName.trim().length > 80) {
    throw createError('categoryName must be a non-empty string of at most 80 characters.', 400, 'INVALID_CATEGORY');
  }
  if (!priorities.has(input.defaultPriority)) {
    throw createError('defaultPriority must be THAP, TRUNG_BINH, or CAO.', 400, 'INVALID_CATEGORY');
  }
  if (typeof input.isActive !== 'boolean') {
    throw createError('isActive must be a boolean.', 400, 'INVALID_CATEGORY');
  }
  return {
    categoryName: input.categoryName.trim(),
    defaultPriority: input.defaultPriority,
    isActive: input.isActive ? 1 : 0
  };
}

async function getAllIssueCategories() {
  return findAll();
}

async function getIssueCategoryById(categoryId) {
  const rows = await findById(validateId(categoryId));
  if (!rows.length) {
    throw createError('Issue category not found.', 404, 'ISSUE_CATEGORY_NOT_FOUND');
  }
  return rows[0];
}

async function createIssueCategory(input) {
  return create(validateCategory(input));
}

async function updateIssueCategory(categoryId, input) {
  const id = validateId(categoryId);
  const category = await update(id, validateCategory(input));
  if (!category) throw createError('Issue category not found.', 404, 'ISSUE_CATEGORY_NOT_FOUND');
  return category;
}

async function deleteIssueCategory(categoryId) {
  const deleted = await deleteById(validateId(categoryId));
  if (!deleted) throw createError('Issue category not found.', 404, 'ISSUE_CATEGORY_NOT_FOUND');
}

module.exports = {
  getAllIssueCategories,
  getIssueCategoryById,
  createIssueCategory,
  updateIssueCategory,
  deleteIssueCategory
};
