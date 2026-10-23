const express = require('express');
const { getStock, getOverviewStocks, getAlerts, receiveStock, issueStock, getTransactionsList } = require('./stockService');
const router = express.Router();

router.get('/stocks', async (req, res) => {
  try {
    const { centerId, partId } = req.query;
    if (centerId && partId) {
      const stock = await getStock(centerId, partId);
      return res.json(stock);
    }
    const items = await getOverviewStocks(centerId || null);
    return res.json(items);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      code: error.code || 'INTERNAL_ERROR',
      message: error.message || 'Internal server error',
      details: error.details || {}
    });
  }
});

router.post('/stock-receipts', async (req, res) => {
  try {
    const result = await receiveStock(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      code: error.code || 'INTERNAL_ERROR',
      message: error.message || 'Internal server error',
      details: error.details || {}
    });
  }
});

router.post('/stock-issues', async (req, res) => {
  try {
    const result = await issueStock(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      code: error.code || 'INTERNAL_ERROR',
      message: error.message || 'Internal server error',
      details: error.details || {}
    });
  }
});

router.get('/stock-alerts', async (req, res) => {
  try {
    const alerts = await getAlerts(req.query.centerId || null);
    res.json({ items: alerts });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      code: error.code || 'INTERNAL_ERROR',
      message: error.message || 'Internal server error',
      details: error.details || {}
    });
  }
});

router.get('/stock-transactions', async (req, res) => {
  try {
    const transactions = await getTransactionsList(req.query.centerId || null, req.query.type || null);
    res.json(transactions);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      code: error.code || 'INTERNAL_ERROR',
      message: error.message || 'Internal server error',
      details: error.details || {}
    });
  }
});

module.exports = { stockRoutes: router };
