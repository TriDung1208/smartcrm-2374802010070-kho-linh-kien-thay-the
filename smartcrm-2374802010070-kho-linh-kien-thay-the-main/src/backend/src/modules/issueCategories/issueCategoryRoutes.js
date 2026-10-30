const express = require('express');
const {
  getAllIssueCategories,
  getIssueCategoryById,
  createIssueCategory,
  updateIssueCategory,
  deleteIssueCategory
} = require('./issueCategoryService');
const router = express.Router();

function sendError(res, error) {
  return res.status(error.statusCode || 500).json({
    code: error.code || 'INTERNAL_ERROR',
    message: error.statusCode ? error.message : 'Đã xảy ra lỗi máy chủ.'
  });
}

router.get('/', async (req, res) => {
  try {
    const categories = await getAllIssueCategories();
    return res.json(categories);
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/:categoryId', async (req, res) => {
  try {
    const category = await getIssueCategoryById(req.params.categoryId);
    return res.json(category);
  } catch (error) {
    return sendError(res, error);
  }
});

router.post('/', async (req, res) => {
  try {
    const category = await createIssueCategory(req.body);
    return res.status(201).json(category);
  } catch (error) {
    return sendError(res, error);
  }
});

router.put('/:categoryId', async (req, res) => {
  try {
    const category = await updateIssueCategory(req.params.categoryId, req.body);
    return res.json(category);
  } catch (error) {
    return sendError(res, error);
  }
});

router.delete('/:categoryId', async (req, res) => {
  try {
    await deleteIssueCategory(req.params.categoryId);
    return res.status(204).end();
  } catch (error) {
    return sendError(res, error);
  }
});

module.exports = { issueCategoryRoutes: router };
