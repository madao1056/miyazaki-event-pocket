-- =============================================================================
-- Supabase Schema for EventPocket
-- =============================================================================

-- -----------------------------------------------------------------------------
-- テーブル作成
-- -----------------------------------------------------------------------------

-- 市町村マスタ
CREATE TABLE municipalities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- コメント
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipality_id INTEGER NOT NULL REFERENCES municipalities(id),
  content TEXT NOT NULL CHECK (char_length(content) <= 500),
  like_count INTEGER DEFAULT 0,
  client_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- いいね
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  client_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, client_hash)
);

-- -----------------------------------------------------------------------------
-- インデックス作成
-- -----------------------------------------------------------------------------

-- municipalities
CREATE INDEX idx_municipalities_name ON municipalities(name);

-- comments
CREATE INDEX idx_comments_municipality_id ON comments(municipality_id);
CREATE INDEX idx_comments_client_hash ON comments(client_hash);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- likes
CREATE INDEX idx_likes_comment_id ON likes(comment_id);
CREATE INDEX idx_likes_client_hash ON likes(client_hash);

-- -----------------------------------------------------------------------------
-- 初期データ投入
-- -----------------------------------------------------------------------------

INSERT INTO municipalities (name) VALUES
  ('東京都渋谷区'),
  ('東京都新宿区'),
  ('東京都港区'),
  ('神奈川県横浜市'),
  ('神奈川県川崎市'),
  ('大阪府大阪市'),
  ('愛知県名古屋市'),
  ('福岡県福岡市');

-- -----------------------------------------------------------------------------
-- Row Level Security (RLS) 設定
-- -----------------------------------------------------------------------------

-- RLS有効化
ALTER TABLE municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- municipalities: 全員読み取り可能
CREATE POLICY "municipalities_select_all" ON municipalities
  FOR SELECT USING (true);

-- comments: 全員読み取り可能、挿入は誰でも可能
CREATE POLICY "comments_select_all" ON comments
  FOR SELECT USING (true);

CREATE POLICY "comments_insert_all" ON comments
  FOR INSERT WITH CHECK (true);

-- likes: 全員読み取り可能、挿入・削除は誰でも可能
CREATE POLICY "likes_select_all" ON likes
  FOR SELECT USING (true);

CREATE POLICY "likes_insert_all" ON likes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "likes_delete_all" ON likes
  FOR DELETE USING (true);

-- -----------------------------------------------------------------------------
-- いいねカウント更新用トリガー関数
-- -----------------------------------------------------------------------------

-- いいね追加時にlike_countを増加
CREATE OR REPLACE FUNCTION increment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE comments
  SET like_count = like_count + 1
  WHERE id = NEW.comment_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- いいね削除時にlike_countを減少
CREATE OR REPLACE FUNCTION decrement_like_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE comments
  SET like_count = like_count - 1
  WHERE id = OLD.comment_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- トリガー作成
CREATE TRIGGER trigger_increment_like_count
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION increment_like_count();

CREATE TRIGGER trigger_decrement_like_count
  AFTER DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_like_count();
