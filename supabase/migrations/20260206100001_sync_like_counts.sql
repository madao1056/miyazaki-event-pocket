-- 既存のlike_countを実際のlikesテーブルの件数と同期
UPDATE comments
SET like_count = (
  SELECT COUNT(*)
  FROM likes
  WHERE likes.comment_id = comments.id
);
