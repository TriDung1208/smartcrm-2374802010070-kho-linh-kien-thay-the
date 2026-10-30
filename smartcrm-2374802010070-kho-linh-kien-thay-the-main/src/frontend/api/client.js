const baseUrl = (window.SMARTCRM_API_BASE || '/api/v1').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export async function request(path, { method = 'GET', body, authenticated = true } = {}) {
  const token = authenticated ? window.localStorage.getItem('token') : null;
  const headers = {};

  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch {
    throw new ApiError('Không kết nối được máy chủ. Hãy kiểm tra backend và thử lại.', 0);
  }

  const contentType = response.headers.get('content-type') || '';
  const data = response.status === 204
    ? null
    : contentType.includes('application/json')
      ? await response.json()
      : null;

  if (response.status === 401 && token) {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('username');
    window.dispatchEvent(new Event('smartcrm:unauthorized'));
  }

  if (!response.ok) {
    throw new ApiError(data?.message || `Yêu cầu thất bại (${response.status}).`, response.status, data?.code);
  }

  return data;
}
