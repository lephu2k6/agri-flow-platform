-- ============================================
-- ENABLE REALTIME CHO CHAT
-- ============================================

-- Bước 1: Kiểm tra Realtime đã được enable chưa
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public'
      AND tablename IN ('conversations', 'messages')
    )
    THEN '✓ Enabled'
    ELSE '✗ Not enabled'
  END as realtime_status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('conversations', 'messages');

-- Bước 2: Enable Realtime cho conversations
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- Bước 3: Enable Realtime cho messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Bước 4: Kiểm tra lại
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND schemaname = 'public'
AND tablename IN ('conversations', 'messages');

-- Lưu ý: Nếu lỗi "publication does not exist", có thể cần tạo publication:
-- CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
