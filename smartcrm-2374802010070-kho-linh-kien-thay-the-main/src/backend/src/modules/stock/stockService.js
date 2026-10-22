const { getStockByCenterAndPart, getAllStock, getLowStock, upsertStock, createTransaction, getTransactions } = require('./stockRepository');

async function getStock(centerId, partId) {
  if (!centerId || !partId) {
    const error = new Error('centerId and partId are required');
    error.statusCode = 400;
    throw error;
  }

  const stock = await getStockByCenterAndPart(Number(centerId), Number(partId));
  if (!stock) {
    const error = new Error('Stock record not found');
    error.statusCode = 404;
    throw error;
  }
  return stock;
}

async function getOverviewStocks(centerId = null) {
  return getAllStock(centerId);
}

async function getAlerts(centerId = null) {
  const rows = await getLowStock(centerId);
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
  if (!centerId || !partId || !quantity || Number(quantity) <= 0) {
    const error = new Error('Invalid quantity or centerId/partId');
    error.statusCode = 400;
    throw error;
  }

  const existing = await getStockByCenterAndPart(Number(centerId), Number(partId));
  if (!existing) {
    const error = new Error('Stock item not found for center');
    error.statusCode = 404;
    throw error;
  }

  const newQuantity = existing.current_stock + Number(quantity);
  await upsertStock(Number(centerId), Number(partId), newQuantity, existing.min_threshold);
  const transactionId = await createTransaction({
    centerId: Number(centerId),
    partId: Number(partId),
    transactionType: 'IN',
    quantity: Number(quantity),
    ticketCode: note || null
  });

  return {
    transactionId,
    type: 'IN',
    centerId: Number(centerId),
    partId: Number(partId),
    quantity: Number(quantity),
    currentStock: newQuantity
  };
}

async function issueStock({ centerId, partId, ticketId, quantity, note = '' }) {
  if (!centerId || !partId || !quantity || Number(quantity) <= 0) {
    const error = new Error('Invalid quantity or centerId/partId');
    error.statusCode = 400;
    throw error;
  }

  const existing = await getStockByCenterAndPart(Number(centerId), Number(partId));
  if (!existing) {
    const error = new Error('Stock item not found for center');
    error.statusCode = 404;
    throw error;
  }

  if (Number(quantity) > existing.current_stock) {
    const error = new Error(`Available stock is ${existing.current_stock} but requested quantity is ${quantity}`);
    error.statusCode = 409;
    error.code = 'INSUFFICIENT_STOCK';
    throw error;
  }

  const newQuantity = existing.current_stock - Number(quantity);
  await upsertStock(Number(centerId), Number(partId), newQuantity, existing.min_threshold);
  const transactionId = await createTransaction({
    centerId: Number(centerId),
    partId: Number(partId),
    transactionType: 'OUT',
    quantity: Number(quantity),
    ticketCode: ticketId ? `TICKET-${ticketId}` : null
  });

  return {
    transactionId,
    type: 'OUT',
    centerId: Number(centerId),
    partId: Number(partId),
    ticketId: Number(ticketId),
    quantity: Number(quantity),
    currentStock: newQuantity
  };
}

async function getTransactionsList(centerId = null, type = null) {
  const rows = await getTransactions(centerId, type);
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
