import { request } from './client.js';

const mapStock = (stock) => ({
  ...stock,
  centerId: stock.center_id ?? stock.centerId,
  partId: stock.part_id ?? stock.partId,
  partCode: stock.part_code ?? stock.partCode,
  partName: stock.part_name ?? stock.partName,
  unitPrice: stock.unit_price ?? stock.unitPrice,
  currentStock: stock.current_stock ?? stock.currentStock,
  minThreshold: stock.min_threshold ?? stock.minThreshold,
  lowStock: Boolean(
    stock.low_stock
      ?? stock.lowStock
      ?? Number(stock.current_stock ?? stock.currentStock) < Number(stock.min_threshold ?? stock.minThreshold)
  )
});

export async function listCenters() {
  return request('/service-centers');
}

export async function listStocks(centerId) {
  const query = centerId ? `?centerId=${encodeURIComponent(centerId)}` : '';
  const data = await request(`/stocks${query}`);
  return data.map(mapStock);
}

export async function getStock(centerId, partId) {
  const stock = await request(`/stocks?centerId=${encodeURIComponent(centerId)}&partId=${encodeURIComponent(partId)}`);
  return mapStock(stock);
}

export function listAlerts(centerId) {
  const query = centerId ? `?centerId=${encodeURIComponent(centerId)}` : '';
  return request(`/stock-alerts${query}`);
}

export function listTransactions(centerId, type) {
  const params = new URLSearchParams();
  if (centerId) params.set('centerId', centerId);
  if (type) params.set('type', type);
  const queryString = params.toString();
  const query = queryString ? `?${queryString}` : '';
  return request(`/stock-transactions${query}`);
}

export function receiveStock(data) {
  return request('/stock-receipts', { method: 'POST', body: data });
}

export function issueStock(data) {
  return request('/stock-issues', { method: 'POST', body: data });
}
