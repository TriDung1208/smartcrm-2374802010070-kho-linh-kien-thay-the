const { findAll, findById, create, update, deleteById } = require('./serviceCenterRepository');

function createError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function validateId(centerId) {
  const id = Number(centerId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw createError('centerId must be a positive integer.', 400, 'INVALID_CENTER_ID');
  }
  return id;
}

function validateCenter(input) {
  const fields = {
    centerCode: input?.centerCode,
    centerName: input?.centerName,
    city: input?.city
  };
  for (const [field, value] of Object.entries(fields)) {
    if (typeof value !== 'string' || !value.trim() || value.trim().length > 100) {
      throw createError(`${field} must be a non-empty string of at most 100 characters.`, 400, 'INVALID_SERVICE_CENTER');
    }
    fields[field] = value.trim();
  }
  return fields;
}

async function getAllServiceCenters() {
  return findAll();
}

async function getServiceCenterById(centerId) {
  const rows = await findById(validateId(centerId));
  if (!rows.length) {
    throw createError('Service center not found.', 404, 'SERVICE_CENTER_NOT_FOUND');
  }
  return rows[0];
}

async function createServiceCenter(input) {
  try {
    return await create(validateCenter(input));
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      throw createError('Mã trung tâm đã được sử dụng.', 409, 'SERVICE_CENTER_CODE_TAKEN');
    }
    throw error;
  }
}

async function updateServiceCenter(centerId, input) {
  const id = validateId(centerId);
  try {
    const center = await update(id, validateCenter(input));
    if (!center) throw createError('Service center not found.', 404, 'SERVICE_CENTER_NOT_FOUND');
    return center;
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      throw createError('Mã trung tâm đã được sử dụng.', 409, 'SERVICE_CENTER_CODE_TAKEN');
    }
    throw error;
  }
}

async function deleteServiceCenter(centerId) {
  const deleted = await deleteById(validateId(centerId));
  if (!deleted) throw createError('Service center not found.', 404, 'SERVICE_CENTER_NOT_FOUND');
}

module.exports = {
  getAllServiceCenters,
  getServiceCenterById,
  createServiceCenter,
  updateServiceCenter,
  deleteServiceCenter
};
