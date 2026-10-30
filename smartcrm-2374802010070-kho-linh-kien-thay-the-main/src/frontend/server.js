const fs = require('fs');
const http = require('http');
const path = require('path');

const frontendPath = __dirname;
const port = Number(process.env.FRONTEND_PORT || 5173);
const apiPort = Number(process.env.API_PORT || 3000);
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png'
};

function sendJson(res, statusCode, body) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function proxyApi(req, res) {
  const headers = { ...req.headers };
  delete headers.host;
  delete headers.connection;

  const upstream = http.request({
    hostname: '127.0.0.1',
    port: apiPort,
    path: req.url,
    method: req.method,
    headers
  }, (upstreamResponse) => {
    res.writeHead(upstreamResponse.statusCode || 502, upstreamResponse.headers);
    upstreamResponse.pipe(res);
  });

  upstream.on('error', (error) => {
    console.error(`Backend proxy failed: ${error.message}`);
    if (!res.headersSent) {
      sendJson(res, 502, {
        code: 'BACKEND_UNAVAILABLE',
        message: 'Backend không khả dụng. Hãy khởi động backend rồi thử lại.'
      });
    } else {
      res.destroy(error);
    }
  });
  req.pipe(upstream);
}

const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (requestUrl.pathname === '/api/v1' || requestUrl.pathname.startsWith('/api/v1/')) {
    proxyApi(req, res);
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    res.end();
    return;
  }

  if (requestUrl.pathname === '/config.js') {
    res.writeHead(200, {
      'Content-Type': 'text/javascript; charset=utf-8',
      'Cache-Control': 'no-store'
    });
    res.end('window.SMARTCRM_API_BASE = "/api/v1";');
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(requestUrl.pathname);
  } catch {
    sendJson(res, 400, { code: 'INVALID_PATH', message: 'Đường dẫn không hợp lệ.' });
    return;
  }

  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.resolve(frontendPath, `.${requestedPath}`);
  if (filePath !== frontendPath && !filePath.startsWith(`${frontendPath}${path.sep}`)) {
    sendJson(res, 403, { code: 'FORBIDDEN_PATH', message: 'Không thể truy cập đường dẫn này.' });
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      sendJson(res, 404, { code: 'NOT_FOUND', message: 'Không tìm thấy tài nguyên.' });
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache'
    });
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Frontend running at http://localhost:${port}`);
});
