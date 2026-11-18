// Mấy hàm dùng chung cho các endpoint trong api/
const crypto = require('crypto');

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

// Vercel đã parse sẵn JSON vào req.body, nhưng có lúc nó vẫn là chuỗi
function getBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body;
}

// admin = gửi đúng ADMIN_KEY trong header x-admin-key
function isAdmin(req) {
  const expected = process.env.ADMIN_KEY || '';
  const given = String(req.headers['x-admin-key'] || '');
  if (!expected || given.length !== expected.length) return false;
  // timingSafeEqual để không lộ key qua thời gian phản hồi
  return crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

function cleanText(value, maxLength = 255) {
  return String(value ?? '').trim().slice(0, maxLength);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

// "Hạ Long Bay!" -> "ha-long-bay"
function slugify(text) {
  return String(text)
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // bỏ dấu
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

// Bọc handler: chặn method không khai báo, và đổi lỗi Postgres thành mã HTTP hợp lý
function createHandler(methods) {
  return async function handler(req, res) {
    const fn = methods[req.method];
    if (!fn) {
      res.setHeader('Allow', Object.keys(methods).join(', '));
      return sendJson(res, 405, { error: `Phương thức ${req.method} không được hỗ trợ` });
    }
    try {
      await fn(req, res);
    } catch (err) {
      console.error('[API ERROR]', err);
      if (err.code === '23505') return sendJson(res, 409, { error: 'Dữ liệu đã tồn tại (trùng lặp)' });
      if (err.code === '23503') return sendJson(res, 404, { error: 'Không tìm thấy dữ liệu liên quan' });
      if (['23514', '22P02', '22007', '22008'].includes(err.code)) {
        return sendJson(res, 400, { error: 'Dữ liệu không hợp lệ' });
      }
      return sendJson(res, 500, { error: 'Lỗi máy chủ, vui lòng thử lại sau' });
    }
  };
}

module.exports = { sendJson, getBody, isAdmin, cleanText, isEmail, slugify, createHandler };
