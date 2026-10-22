const express = require('express');
const { getAllTechnicians, getTechnicianById, getTechniciansByCenter } = require('./technicianService');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const centerId = req.query.centerId ? Number(req.query.centerId) : null;
    const technicians = centerId ? await getTechniciansByCenter(centerId) : await getAllTechnicians();
    res.json(technicians);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Internal server error' });
  }
});

router.get('/:technicianId', async (req, res) => {
  try {
    const technician = await getTechnicianById(Number(req.params.technicianId));
    res.json(technician);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message || 'Internal server error' });
  }
});

module.exports = { technicianRoutes: router };
