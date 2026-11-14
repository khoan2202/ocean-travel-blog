# 🌊 Wanderwave — Personal Travel Blog (Full-stack)

Blog du lịch cá nhân với **rất nhiều hiệu ứng động**, tông **xanh dương biển + mint**, lấy cảm hứng bố cục từ template *Luminary* (TemplateMo 621).

| Tầng | Công nghệ |
|------|-----------|
| Frontend | HTML5, CSS3 (biến CSS, keyframes, Grid/Flex), JavaScript thuần (ES Modules) |
| Backend | Vercel Serverless Functions (Node.js) trong thư mục `api/` |
| Database | PGlite (PostgreSQL nhúng, dữ liệu mẫu trong `sql/seed.sql`) |
| Deploy | Vercel |

## Chạy nhanh trên máy

```bash
npm install
npm run dev               # mở http://localhost:3000
```
Không cần cài PostgreSQL hay tạo database: dữ liệu mẫu (`sql/seed.sql`) được nạp vào
một Postgres nhúng (PGlite) mỗi lần server khởi động. Tạo file `.env` với `ADMIN_KEY=...`
để vào trang `/admin` (xem `.env.example`).

> Lưu ý: bình luận, tim, đăng ký, bài viết thêm từ admin chỉ nằm trong RAM – tắt server
> (hoặc instance Vercel nghỉ) là mất, quay về dữ liệu mẫu.

## Deploy lên Vercel

1. Đẩy code lên GitHub.
2. Vercel → **Add New → Project** → chọn repo → Framework Preset: **Other** → Deploy.
3. **Settings → Environment Variables** → thêm `ADMIN_KEY` → **Redeploy**.

## Cấu trúc thư mục

```
ocean-travel-blog/
├── api/                # Backend: mỗi file = 1 endpoint serverless
│   ├── posts.js        # GET/POST/PUT/DELETE bài viết
│   ├── comments.js     # GET/POST bình luận
│   ├── likes.js        # POST thả tim
│   ├── subscribe.js    # POST đăng ký nhận tin, GET (admin)
│   ├── contact.js      # POST liên hệ, GET (admin)
│   └── stats.js        # GET số liệu thống kê
├── lib/
│   ├── db.js           # Database nhúng PGlite (nạp schema + seed khi khởi động)
│   └── http.js         # Hàm tiện ích: trả JSON, kiểm tra admin, validate
├── sql/
│   ├── schema.sql      # Tạo bảng
│   └── seed.sql        # Dữ liệu mẫu
├── scripts/
│   └── test-api.js     # Test nhanh các API
├── public/             # Frontend tĩnh (Vercel phục vụ thư mục này)
│   ├── index.html
│   ├── admin.html
│   ├── css/ (style.css, animations.css, admin.css)
│   ├── js/  (main.js, effects.js, blog.js, forms.js, api.js, admin.js)
│   └── assets/img/
├── docs/               # Hướng dẫn code, báo cáo, slide
├── dev-server.js       # Server chạy local giả lập Vercel
└── vercel.json         # Cấu hình Vercel
```

Xem giải thích chi tiết từng dòng code trong **`docs/HUONG_DAN_CODE.md`**.
