const { findAll, findById, findByCenter } = require('./technicianRepository');

async function getAllTechnicians() {
  return findAll();
}

async function getTechnicianById(technicianId) {
  const rows = await findById(technicianId);
  if (!rows.length) {
    const err = new Error('Technician not found');
    err.statusCode = 404;
    throw err;
  }
  return rows[0];
}

async function getTechniciansByCenter(centerId) {
  return findByCenter(centerId);
}

module.exports = { getAllTechnicians, getTechnicianById, getTechniciansByCenter };
