function invalidField(field) {
  const error = new Error(`${field} must be a positive integer`);
  error.statusCode = 400;
  const errorCodes = {
    centerId: 'INVALID_CENTER_ID',
    partId: 'INVALID_PART_ID',
    quantity: 'INVALID_QUANTITY',
    ticketId: 'INVALID_TICKET_ID'
  };
  error.code = errorCodes[field];
  return error;
}

function positiveInteger(value, field) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number <= 0) {
    throw invalidField(field);
  }
  return number;
}

function validateOptionalStockId(value, field) {
  if (value === null || value === undefined || value === '') return null;
  return positiveInteger(value, field);
}

function validateTransactionType(type) {
  if (type === null || type === undefined || type === '') return null;
  if (type !== 'IN' && type !== 'OUT') {
    const error = new Error('type must be IN or OUT');
    error.statusCode = 400;
    error.code = 'INVALID_TRANSACTION_TYPE';
    throw error;
  }
  return type;
}

function validateStockMutation({ centerId, partId, quantity, ticketId, type }) {
  const values = {
    centerId: positiveInteger(centerId, 'centerId'),
    partId: positiveInteger(partId, 'partId'),
    quantity: positiveInteger(quantity, 'quantity')
  };

  if (type === 'OUT') {
    values.ticketId = positiveInteger(ticketId, 'ticketId');
  }

  return values;
}

function calculateStockChange(currentStock, quantity, type) {
  if (!Number.isSafeInteger(currentStock) || currentStock < 0) {
    throw new Error('Current stock must be a non-negative integer');
  }

  if (type === 'OUT' && quantity > currentStock) {
    const error = new Error(`Available stock is ${currentStock} but requested quantity is ${quantity}`);
    error.statusCode = 409;
    error.code = 'INSUFFICIENT_STOCK';
    error.details = { available: currentStock, requested: quantity };
    throw error;
  }

  return type === 'IN' ? currentStock + quantity : currentStock - quantity;
}

module.exports = {
  validateStockMutation,
  validateOptionalStockId,
  validateTransactionType,
  calculateStockChange
};
