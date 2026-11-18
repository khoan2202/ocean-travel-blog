// GET /api/stats - số liệu cho bộ đếm ở hero và trang admin
const { query } = require('../lib/db');
const { sendJson, createHandler } = require('../lib/http');

async function getStats(req, res) {
  const [totals] = await query(`
    SELECT
      COUNT(*)::int                         AS posts,
      COUNT(DISTINCT country)::int          AS countries,
      COALESCE(SUM(distance_km), 0)::int    AS kilometers,
      COALESCE(SUM(likes), 0)::int          AS likes,
      COALESCE(SUM(views), 0)::int          AS views,
      (SELECT COUNT(*)::int FROM comments)    AS comments,
      (SELECT COUNT(*)::int FROM subscribers) AS subscribers
    FROM posts
  `);

  const byCategory = await query(`
    SELECT category, COUNT(*)::int AS total
      FROM posts GROUP BY category ORDER BY total DESC
  `);

  return sendJson(res, 200, { ...totals, byCategory });
}

module.exports = createHandler({ GET: getStats });
