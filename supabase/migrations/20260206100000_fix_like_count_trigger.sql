-- いいねカウント更新トリガーのRLS対応修正
-- SECURITY DEFINERを追加してRLSをバイパス可能にする

-- 既存の関数を削除して再作成
DROP FUNCTION IF EXISTS increment_like_count() CASCADE;
DROP FUNCTION IF EXISTS decrement_like_count() CASCADE;

-- いいね追加時にlike_countを増加（SECURITY DEFINER追加）
CREATE OR REPLACE FUNCTION increment_like_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE comments
  SET like_count = like_count + 1
  WHERE id = NEW.comment_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- いいね削除時にlike_countを減少（SECURITY DEFINER追加）
CREATE OR REPLACE FUNCTION decrement_like_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE comments
  SET like_count = like_count - 1
  WHERE id = OLD.comment_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- トリガー再作成
CREATE TRIGGER trigger_increment_like_count
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION increment_like_count();

CREATE TRIGGER trigger_decrement_like_count
  AFTER DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_like_count();
