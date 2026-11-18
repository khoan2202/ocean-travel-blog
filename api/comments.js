// /api/comments
//   GET ?post_id=   danh sách bình luận của một bài
//   POST            thêm bình luận
//   DELETE ?id=     xoá (admin)
const { query } = require('../lib/db');
const { sendJson, getBody, isAdmin, cleanText, createHandler } = require('../lib/http');

async function listComments(req, res) {
  const postId = parseInt(req.query.post_id, 10);
  if (!postId) return sendJson(res, 400, { error: 'Thiếu post_id' });
  const comments = await query(
    `SELECT id, author_name, content, created_at
       FROM comments WHERE post_id = $1 ORDER BY created_at DESC`,
    [postId]
  );
  return sendJson(res, 200, { comments });
}

async function addComment(req, res) {
  const body = getBody(req);
  const postId = parseInt(body.post_id, 10);
  const author = cleanText(body.author_name, 60);
  const content = cleanText(body.content, 1000);

  if (!postId || !author || content.length < 2) {
    return sendJson(res, 400, { error: 'Vui lòng nhập tên và nội dung bình luận' });
  }
  // post_id không tồn tại thì khoá ngoại ném 23503, createHandler đổi thành 404
  const rows = await query(
    `INSERT INTO comments (post_id, author_name, content)
     VALUES ($1, $2, $3)
     RETURNING id, author_name, content, created_at`,
    [postId, author, content]
  );
  return sendJson(res, 201, { comment: rows[0] });
}

async function deleteComment(req, res) {
  if (!isAdmin(req)) return sendJson(res, 401, { error: 'Bạn cần quyền quản trị' });
  const rows = await query('DELETE FROM comments WHERE id = $1 RETURNING id', [parseInt(req.query.id, 10)]);
  if (!rows.length) return sendJson(res, 404, { error: 'Không tìm thấy bình luận' });
  return sendJson(res, 200, { deleted: rows[0].id });
}

module.exports = createHandler({ GET: listComments, POST: addComment, DELETE: deleteComment });
