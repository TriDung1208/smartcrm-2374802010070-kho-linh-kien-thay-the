const express = require('express');
const {
  getAllServiceCenters,
  getServiceCenterById,
  createServiceCenter,
  updateServiceCenter,
  deleteServiceCenter
} = require('./serviceCenterService');
const router = express.Router();

function sendError(res, error) {
  return res.status(error.statusCode || 500).json({
    code: error.code || 'INTERNAL_ERROR',
    message: error.statusCode ? error.message : 'Đã xảy ra lỗi máy chủ.'
  });
}

router.get('/', async (req, res) => {
  try {
    const centers = await getAllServiceCenters();
    return res.json(centers);
  } catch (error) {
    return sendError(res, error);
  }
});

router.get('/:centerId', async (req, res) => {
  try {
    const center = await getServiceCenterById(req.params.centerId);
    return res.json(center);
  } catch (error) {
    return sendError(res, error);
  }
});

router.post('/', async (req, res) => {
  try {
    const center = await createServiceCenter(req.body);
    return res.status(201).json(center);
  } catch (error) {
    return sendError(res, error);
  }
});

router.put('/:centerId', async (req, res) => {
  try {
    const center = await updateServiceCenter(req.params.centerId, req.body);
    return res.json(center);
  } catch (error) {
    return sendError(res, error);
  }
});

router.delete('/:centerId', async (req, res) => {
  try {
    await deleteServiceCenter(req.params.centerId);
    return res.status(204).end();
  } catch (error) {
    return sendError(res, error);
  }
});

module.exports = { serviceCenterRoutes: router };
