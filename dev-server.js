// Server chạy local, bắt chước cách Vercel làm việc:
//   /api/xxx -> api/xxx.js
//   còn lại  -> file tĩnh trong public/ (cleanUrls: /admin -> admin.html)
// Chạy: npm run dev rồi mở http://localhost:3000
require('./lib/env').loadEnv();
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon',
};

// Vercel tự parse body, ở đây phải tự làm
function readJsonBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch { resolve({}); }
    });
  });
}

async function handleApi(req, res, url) {
  const name = url.pathname.replace(/^\/api\//, '').replace(/[^a-z-]/g, '');
  const file = path.join(__dirname, 'api', `${name}.js`);
  if (!fs.existsSync(file)) {
    res.statusCode = 404;
    return res.end(JSON.stringify({ error: 'API không tồn tại' }));
  }
  req.query = Object.fromEntries(url.searchParams);
  req.body = await readJsonBody(req);
  const handler = require(file);
  return handler(req, res);
}

function serveStatic(res, url) {
  let filePath = path.normalize(path.join(PUBLIC_DIR, decodeURIComponent(url.pathname)));
  if (!filePath.startsWith(PUBLIC_DIR)) { res.statusCode = 403; return res.end(); } // chặn ../

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) filePath = path.join(filePath, 'index.html');
  if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) filePath += '.html';

  if (!fs.existsSync(filePath)) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end('<h1>404 – Không tìm thấy trang</h1>');
  }
  res.setHeader('Content-Type', MIME[path.extname(filePath)] || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  console.log(`${req.method} ${url.pathname}${url.search}`);
  if (url.pathname.startsWith('/api/')) return handleApi(req, res, url);
  return serveStatic(res, url);
}).listen(PORT, () => {
  console.log(`Wanderwave chạy tại http://localhost:${PORT}`);
});
