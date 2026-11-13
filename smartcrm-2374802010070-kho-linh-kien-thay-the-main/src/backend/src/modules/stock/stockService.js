const { getStockByCenterAndPart, getAllStock, getLowStock, applyStockTransaction, getTransactions } = require('./stockRepository');
const {
  validateStockMutation,
  validateOptionalStockId,
  validateTransactionType
} = require('./stockRules');

async function getStock(centerId, partId) {
  const validCenterId = validateOptionalStockId(centerId, 'centerId');
  const validPartId = validateOptionalStockId(partId, 'partId');
  if (validCenterId === null || validPartId === null) {
    const error = new Error('centerId and partId are required');
    error.statusCode = 400;
    throw error;
  }

  const stock = await getStockByCenterAndPart(validCenterId, validPartId);
  if (!stock) {
    const error = new Error('Stock record not found');
    error.statusCode = 404;
    throw error;
  }
  return stock;
}

async function getOverviewStocks(centerId = null) {
  return getAllStock(validateOptionalStockId(centerId, 'centerId'));
}

async function getAlerts(centerId = null) {
  const rows = await getLowStock(validateOptionalStockId(centerId, 'centerId'));
  return rows.map((row) => ({
    centerId: row.center_id,
    partId: row.part_id,
    partCode: row.part_code,
    partName: row.part_name,
    currentStock: row.current_stock,
    minThreshold: row.min_threshold,
    status: 'LOW_STOCK'
  }));
}

async function receiveStock({ centerId, partId, quantity, note = '' }) {
  const values = validateStockMutation({ centerId, partId, quantity, type: 'IN' });
  const result = await applyStockTransaction({
    ...values,
    transactionType: 'IN',
    ticketCode: note
  });

  return {
    transactionId: result.transactionId,
    type: 'IN',
    centerId: values.centerId,
    partId: values.partId,
    quantity: values.quantity,
    currentStock: result.currentStock
  };
}

async function issueStock({ centerId, partId, ticketId, quantity, note = '' }) {
  const values = validateStockMutation({ centerId, partId, ticketId, quantity, type: 'OUT' });
  const result = await applyStockTransaction({
    centerId: values.centerId,
    partId: values.partId,
    quantity: values.quantity,
    transactionType: 'OUT',
    ticketCode: `TICKET-${values.ticketId}${note ? `: ${note}` : ''}`
  });

  return {
    transactionId: result.transactionId,
    type: 'OUT',
    centerId: values.centerId,
    partId: values.partId,
    ticketId: values.ticketId,
    quantity: values.quantity,
    currentStock: result.currentStock
  };
}

async function getTransactionsList(centerId = null, type = null) {
  const validCenterId = validateOptionalStockId(centerId, 'centerId');
  const validType = validateTransactionType(type);
  const rows = await getTransactions(validCenterId, validType);
  return {
    items: rows,
    total: rows.length
  };
}

module.exports = {
  getStock,
  getOverviewStocks,
  getAlerts,
  receiveStock,
  issueStock,
  getTransactionsList
};
