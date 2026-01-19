-- ============================================
-- REFRESH SCHEMA CACHE - Sửa lỗi PGRST205
-- Lỗi: "Could not find the table in the schema cache"
-- ============================================

-- Bước 1: Kiểm tra bảng có tồn tại không
SELECT 
  table_schema,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'notifications';

-- Bước 2: Kiểm tra cấu trúc bảng
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'notifications'
ORDER BY ordinal_position;

-- Bước 3: Refresh schema cache trong PostgREST
-- Note: PostgREST tự động refresh cache, nhưng có thể force refresh bằng cách:
-- 1. Restart PostgREST service (trong Supabase Dashboard)
-- 2. Hoặc chạy query này để trigger refresh

-- Kiểm tra xem có cần thêm cột nào không (so sánh với code)
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'id') 
    THEN '✓ id exists'
    ELSE '✗ id missing'
  END as id_check,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'user_id') 
    THEN '✓ user_id exists'
    ELSE '✗ user_id missing'
  END as user_id_check,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'type') 
    THEN '✓ type exists'
    ELSE '✗ type missing'
  END as type_check,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'title') 
    THEN '✓ title exists'
    ELSE '✗ title missing'
  END as title_check,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'message') 
    THEN '✓ message exists'
    ELSE '✗ message missing'
  END as message_check,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'read') 
    THEN '✓ read exists'
    ELSE '✗ read missing'
  END as read_check;

-- Bước 4: Nếu bảng ở schema khác, kiểm tra
SELECT 
  table_schema,
  table_name
FROM information_schema.tables
WHERE table_name = 'notifications';

-- Bước 5: Grant permissions nếu cần
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.notifications TO anon;

-- Bước 6: Kiểm tra RLS
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'notifications';

-- Nếu RLS chưa bật, bật nó:
-- ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
