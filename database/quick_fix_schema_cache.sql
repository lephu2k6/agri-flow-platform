-- ============================================
-- SỬA NHANH: Schema Cache Issue
-- Bảng đã tồn tại nhưng PostgREST chưa nhận ra
-- ============================================

-- Bước 1: Kiểm tra bảng có tồn tại không
SELECT 
  'Bảng notifications' as item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'notifications'
    )
    THEN '✓ TỒN TẠI'
    ELSE '✗ KHÔNG TỒN TẠI'
  END as status;

-- Bước 2: Grant permissions (quan trọng!)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.notifications TO anon;

-- Bước 3: Đảm bảo RLS đã bật
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Bước 4: Kiểm tra và tạo policies nếu thiếu
DO $$
BEGIN
  -- Policy cho SELECT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'notifications'
    AND policyname = 'Users can view own notifications'
  ) THEN
    CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT TO authenticated
    USING (auth.uid() = user_id);
  END IF;

  -- Policy cho INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'notifications'
    AND policyname = 'System can create notifications'
  ) THEN
    CREATE POLICY "System can create notifications"
    ON public.notifications FOR INSERT TO authenticated
    WITH CHECK (true);
  END IF;

  -- Policy cho UPDATE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'notifications'
    AND policyname = 'Users can update own notifications'
  ) THEN
    CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Policy cho DELETE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'notifications'
    AND policyname = 'Users can delete own notifications'
  ) THEN
    CREATE POLICY "Users can delete own notifications"
    ON public.notifications FOR DELETE TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Bước 5: Kiểm tra kết quả
SELECT 
  'Permissions' as check_item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_privileges 
      WHERE table_schema = 'public' 
      AND table_name = 'notifications'
      AND grantee = 'authenticated'
    )
    THEN '✓ ĐÃ GRANT'
    ELSE '✗ CHƯA GRANT'
  END as status

UNION ALL

SELECT 
  'RLS Policies',
  COUNT(*)::text || ' policies'
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'notifications';

-- Bước 6: Test query (để trigger cache refresh)
SELECT COUNT(*) as notification_count FROM public.notifications;
