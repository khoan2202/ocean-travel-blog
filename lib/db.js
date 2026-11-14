// =====================================================================
//  lib/db.js – DATABASE NHÚNG (PGlite = PostgreSQL chạy trong Node, không cần cài gì)
//  • Mỗi lần khởi động: tạo bảng (sql/schema.sql) + nạp dữ liệu mẫu (sql/seed.sql).
//  • Dữ liệu nằm trong RAM của tiến trình:
//      - Chạy local: mất khi tắt server (nạp lại từ seed khi bật lại).
//      - Trên Vercel: bình luận/like/đăng ký... chỉ tồn tại tạm trong 1 instance,
//        có thể mất khi instance nghỉ. Bài viết gốc (seed) thì luôn còn.
//  Các file api/*.js vẫn viết SQL như cũ, không phải sửa.
// =====================================================================
const fs = require('fs');
const path = require('path');

const SQL_DIR = path.join(__dirname, '..', 'sql');

// Khởi tạo đúng 1 lần cho mỗi instance (lưu Promise vào globalThis để dùng lại)
function getDb() {
  if (!globalThis._wanderwaveDb) {
    globalThis._wanderwaveDb = (async () => {
      const { PGlite } = await import('@electric-sql/pglite');
      const db = new PGlite({
        // DATE (1082) trả về chuỗi 'YYYY-MM-DD' -> tránh lệch múi giờ
        parsers: { 1082: (v) => v },
      });
      await db.exec(fs.readFileSync(path.join(SQL_DIR, 'schema.sql'), 'utf8'));
      await db.exec(fs.readFileSync(path.join(SQL_DIR, 'seed.sql'), 'utf8'));
      return db;
    })();
  }
  return globalThis._wanderwaveDb;
}

/**
 * Chạy 1 câu SQL có tham số ($1, $2...).
 * @returns {Promise<Array>} Mảng các dòng kết quả
 */
async function query(text, params = []) {
  const db = await getDb();
  const result = await db.query(text, params);
  return result.rows;
}

module.exports = { query, getDb };
