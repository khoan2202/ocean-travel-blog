# Wanderwave

Blog du lịch cá nhân, làm theo kiểu full-stack nhưng không dùng framework: frontend HTML/CSS/JS thuần, API chạy serverless trên Vercel, dữ liệu nằm trong một Postgres nhúng nên không cần cài hay cấu hình database.

**Demo:** https://ocean-travel-blog.vercel.app

## Có gì trong đó

- Trang chủ với ~20 hiệu ứng viết tay (con trỏ tuỳ chỉnh, spotlight theo chuột, bong bóng canvas, gõ chữ, scroll reveal, bộ đếm số, parallax, thẻ nghiêng 3D, ripple...). Không dùng thư viện animation nào.
- Danh sách bài viết có lọc theo danh mục, tìm kiếm (debounce), modal chi tiết, thả tim, bình luận.
- Trang quản trị `/admin`: đăng nhập bằng `ADMIN_KEY`, thống kê, thêm/sửa/xoá bài, xem tin nhắn liên hệ và người đăng ký.
- Form liên hệ và đăng ký nhận tin, kiểm tra cả ở trình duyệt lẫn server.
- Responsive, hỗ trợ `prefers-reduced-motion`, escape HTML ở mọi chỗ hiển thị dữ liệu người dùng.

## Công nghệ

| | |
|---|---|
| Frontend | HTML5, CSS3 (biến CSS, Grid/Flex, keyframes), JavaScript ES Modules |
| Backend | Vercel Serverless Functions (Node.js) trong `api/` |
| Database | [PGlite](https://pglite.dev) (Postgres chạy trong tiến trình Node), schema và dữ liệu mẫu trong `sql/` |
| Test | Script `scripts/test-api.js` (17 case), chạy tự động bằng GitHub Actions |

## Chạy trên máy

Cần Node.js 24 trở lên.

```bash
npm install
cp .env.example .env     # đặt ADMIN_KEY nếu muốn vào /admin
npm run dev              # http://localhost:3000
npm run test:api         # chạy khi server đang bật
```

## Lưu ý về dữ liệu

Dữ liệu nằm trong RAM. Mỗi lần server khởi động, `sql/schema.sql` và `sql/seed.sql` được nạp lại. Vì vậy bình luận, lượt tim, đăng ký và bài thêm từ trang admin sẽ mất khi server tắt (hoặc khi Vercel cho instance nghỉ). Bài viết mẫu trong `sql/seed.sql` thì luôn còn.

Đây là lựa chọn có chủ đích để dự án chạy được mà không cần database ngoài. Nếu cần lưu lâu dài, chỉ phải thay `lib/db.js` bằng một driver Postgres thật (ví dụ `pg` với Neon hoặc Supabase), các file trong `api/` vẫn dùng nguyên SQL như hiện tại.

## Deploy lên Vercel

1. Đẩy code lên GitHub, import repo vào Vercel với preset **Other**.
2. Thêm biến môi trường `ADMIN_KEY`.
3. Deploy. Cấu hình nằm trong `vercel.json` (thư mục `public/`, đóng gói kèm file của PGlite cho hàm API).

Runtime Node 24.x được khai báo trong `package.json`.

## Cấu trúc

```
api/          mỗi file là một endpoint (posts, comments, likes, subscribe, contact, stats)
lib/          db.js (PGlite), http.js (helper dùng chung), env.js (đọc .env)
sql/          schema.sql, seed.sql
public/       frontend tĩnh: index.html, admin.html, css/, js/, assets/img/
scripts/      test-api.js
dev-server.js server local bắt chước Vercel
CREDITS.md    nguồn ảnh
```

## Cách mình làm dự án này

Mình làm dự án này cùng Claude Code (trợ lý lập trình AI).

- **Mình:** đặt yêu cầu, chọn hướng đi và đánh đổi (ví dụ dùng PGlite thay database ngoài), deploy lên Vercel, chạy thử và báo lỗi, chọn ảnh, duyệt kết quả.
- **Claude:** đóng vai trò trợ lý lập trình, hỗ trợ viết code, tìm ảnh Creative Commons và rà lỗi.

## Nguồn ảnh

Ảnh lấy từ Wikimedia Commons theo giấy phép Creative Commons, xem [CREDITS.md](CREDITS.md) hoặc trang `/credits` trên website.

## Giấy phép

MIT, xem [LICENSE](LICENSE).
