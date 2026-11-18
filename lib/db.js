// Database: PGlite, tức Postgres chạy ngay trong Node nên không cần cài hay cấu hình gì.
// Mỗi lần khởi động sẽ tạo bảng từ sql/schema.sql rồi nạp sql/seed.sql.
//
// Lưu ý: dữ liệu nằm trong RAM. Chạy local thì mất khi tắt server; trên Vercel thì
// bình luận/like/bài mới chỉ sống đến khi instance nghỉ. Bài viết trong seed thì luôn còn.
const fs = require('fs');
const path = require('path');

const SQL_DIR = path.join(__dirname, '..', 'sql');

// chỉ khởi tạo một lần mỗi instance, lưu promise vào globalThis để các lần gọi sau dùng lại
function getDb() {
  if (!globalThis._wanderwaveDb) {
    globalThis._wanderwaveDb = (async () => {
      const { PGlite } = await import('@electric-sql/pglite');
      const db = new PGlite({
        // trả DATE về chuỗi 'YYYY-MM-DD', tránh bị lệch một ngày do múi giờ
        parsers: { 1082: (v) => v },
      });
      await db.exec(fs.readFileSync(path.join(SQL_DIR, 'schema.sql'), 'utf8'));
      await db.exec(fs.readFileSync(path.join(SQL_DIR, 'seed.sql'), 'utf8'));
      return db;
    })();
  }
  return globalThis._wanderwaveDb;
}

async function query(text, params = []) {
  const db = await getDb();
  const result = await db.query(text, params);
  return result.rows;
}

module.exports = { query, getDb };
