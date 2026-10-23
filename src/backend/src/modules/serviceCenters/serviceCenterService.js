const { findAll, findById } = require('./serviceCenterRepository');

async function getAllServiceCenters() {
  return findAll();
}

async function getServiceCenterById(centerId) {
  const rows = await findById(centerId);
  if (!rows.length) {
    const err = new Error('Service center not found');
    err.statusCode = 404;
    throw err;
  }
  return rows[0];
}

module.exports = { getAllServiceCenters, getServiceCenterById };
