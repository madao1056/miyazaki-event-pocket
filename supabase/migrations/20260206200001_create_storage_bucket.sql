-- event-media バケット作成
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-media', 'event-media', true)
ON CONFLICT (id) DO NOTHING;

-- 全員がアップロード可能
CREATE POLICY "Anyone can upload media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'event-media');

-- 全員が読み取り可能
CREATE POLICY "Anyone can view media"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-media');
