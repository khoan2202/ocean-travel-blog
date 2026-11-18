-- Schema của Wanderwave. Dùng IF NOT EXISTS nên chạy lại không lỗi.

-- bài viết
CREATE TABLE IF NOT EXISTS posts (
  id            SERIAL PRIMARY KEY,
  slug          VARCHAR(120) NOT NULL UNIQUE,
  title         VARCHAR(200) NOT NULL,
  excerpt       TEXT         NOT NULL,
  content       TEXT         NOT NULL,   -- các đoạn cách nhau bằng dòng trống
  category      VARCHAR(20)  NOT NULL
                CHECK (category IN ('beach', 'mountain', 'city', 'food')),
  location      VARCHAR(120) NOT NULL,
  country       VARCHAR(80)  NOT NULL,
  cover_image   VARCHAR(255) NOT NULL,
  read_minutes  INT          NOT NULL DEFAULT 5  CHECK (read_minutes > 0),
  distance_km   INT          NOT NULL DEFAULT 0  CHECK (distance_km >= 0),
  likes         INT          NOT NULL DEFAULT 0  CHECK (likes >= 0),
  views         INT          NOT NULL DEFAULT 0  CHECK (views >= 0),
  travel_date   DATE,
  is_featured   BOOLEAN      NOT NULL DEFAULT FALSE,   -- hiện ở mục Hành trình
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- bình luận (1 bài - nhiều bình luận)
CREATE TABLE IF NOT EXISTS comments (
  id           SERIAL PRIMARY KEY,
  post_id      INT          NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_name  VARCHAR(60)  NOT NULL,
  content      VARCHAR(1000) NOT NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- người đăng ký nhận tin
CREATE TABLE IF NOT EXISTS subscribers (
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(160) NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- tin nhắn từ form liên hệ
CREATE TABLE IF NOT EXISTS contacts (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(80)   NOT NULL,
  email       VARCHAR(160)  NOT NULL,
  message     VARCHAR(2000) NOT NULL,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- index cho các truy vấn lọc và sắp xếp
CREATE INDEX IF NOT EXISTS idx_posts_category   ON posts (category);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments (post_id);
