const express = require('express');
const { getAllServiceCenters, getServiceCenterById } = require('./serviceCenterService');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const centers = await getAllServiceCenters();
    res.json(centers);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Internal server error' });
  }
});

router.get('/:centerId', async (req, res) => {
  try {
    const center = await getServiceCenterById(Number(req.params.centerId));
    res.json(center);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Internal server error' });
  }
});

module.exports = { serviceCenterRoutes: router };
