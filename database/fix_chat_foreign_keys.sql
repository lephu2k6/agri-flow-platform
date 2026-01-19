-- ============================================
-- SỬA FOREIGN KEYS CHO CHAT TABLES
-- ============================================

-- Bước 1: Xóa foreign keys cũ (nếu có)
ALTER TABLE IF EXISTS public.conversations 
  DROP CONSTRAINT IF EXISTS conversations_farmer_id_fkey;

ALTER TABLE IF EXISTS public.conversations 
  DROP CONSTRAINT IF EXISTS conversations_buyer_id_fkey;

ALTER TABLE IF EXISTS public.messages 
  DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

ALTER TABLE IF EXISTS public.messages 
  DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;

-- Bước 2: Tạo foreign keys mới trỏ đến profiles
ALTER TABLE public.conversations
  ADD CONSTRAINT conversations_farmer_id_fkey 
  FOREIGN KEY (farmer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.conversations
  ADD CONSTRAINT conversations_buyer_id_fkey 
  FOREIGN KEY (buyer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.messages
  ADD CONSTRAINT messages_sender_id_fkey 
  FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.messages
  ADD CONSTRAINT messages_receiver_id_fkey 
  FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Bước 3: Kiểm tra foreign keys
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name IN ('conversations', 'messages')
  AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, tc.constraint_name;

-- Bước 4: Grant permissions (nếu chưa có)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.messages TO authenticated;

-- Bước 5: Refresh schema cache (PostgREST)
NOTIFY pgrst, 'reload schema';
