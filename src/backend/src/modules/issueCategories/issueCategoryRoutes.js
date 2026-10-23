const express = require('express');
const { getAllIssueCategories, getIssueCategoryById } = require('./issueCategoryService');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const categories = await getAllIssueCategories();
    res.json(categories);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Internal server error' });
  }
});

router.get('/:categoryId', async (req, res) => {
  try {
    const category = await getIssueCategoryById(Number(req.params.categoryId));
    res.json(category);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Internal server error' });
  }
});

module.exports = { issueCategoryRoutes: router };
