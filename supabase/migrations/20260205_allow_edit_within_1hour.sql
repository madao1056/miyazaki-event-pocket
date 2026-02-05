-- コメントの編集ポリシーを追加（1時間以内かつ同一client_hash）
CREATE POLICY "comments_update_own_within_1hour" ON comments
  FOR UPDATE USING (
    created_at > NOW() - INTERVAL '1 hour'
  )
  WITH CHECK (
    created_at > NOW() - INTERVAL '1 hour'
  );
