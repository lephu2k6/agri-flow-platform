-- ============================================
-- TẠO BẢNG NOTIFICATIONS
-- ============================================

-- Bước 1: Tạo bảng notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('order', 'product', 'message', 'system')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(500),
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bước 2: Tạo indexes để tối ưu query
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Bước 3: Tạo function để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Bước 4: Tạo trigger để tự động cập nhật updated_at
DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Bước 5: Enable Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Bước 6: Tạo RLS Policies

-- Policy 1: Users chỉ có thể xem notifications của chính mình
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: System có thể tạo notifications cho bất kỳ user nào
-- (Cần service role key để tạo notifications từ server)
CREATE POLICY "System can create notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy 3: Users chỉ có thể cập nhật notifications của chính mình
CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users chỉ có thể xóa notifications của chính mình
CREATE POLICY "Users can delete own notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Bước 7: Kiểm tra bảng đã được tạo
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'notifications'
ORDER BY ordinal_position;

-- Bước 8: Kiểm tra policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'notifications';
