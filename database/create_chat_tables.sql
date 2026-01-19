-- ============================================
-- TẠO HỆ THỐNG CHAT GIỮA FARMER VÀ BUYER
-- ============================================

-- Bước 1: Tạo bảng conversations (cuộc trò chuyện)
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Đảm bảo mỗi cặp farmer-buyer chỉ có 1 conversation
  UNIQUE(farmer_id, buyer_id, product_id)
);

-- Bước 2: Tạo bảng messages (tin nhắn)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bước 3: Tạo indexes để tối ưu query
CREATE INDEX IF NOT EXISTS idx_conversations_farmer_id ON public.conversations(farmer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON public.conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_product_id ON public.conversations(product_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_read ON public.messages(receiver_id, read);

-- Bước 4: Tạo function để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Bước 5: Tạo triggers để tự động cập nhật updated_at
DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_messages_updated_at ON public.messages;
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Bước 6: Tạo function để tự động cập nhật last_message_at khi có tin nhắn mới
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_last_message_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Bước 7: Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Bước 8: Tạo RLS Policies cho conversations

-- Policy 1: Users chỉ có thể xem conversations của mình
CREATE POLICY "Users can view own conversations"
ON public.conversations
FOR SELECT
TO authenticated
USING (
  auth.uid() = farmer_id OR 
  auth.uid() = buyer_id
);

-- Policy 2: Users có thể tạo conversations
CREATE POLICY "Users can create conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = farmer_id OR 
  auth.uid() = buyer_id
);

-- Policy 3: Users có thể cập nhật conversations của mình
CREATE POLICY "Users can update own conversations"
ON public.conversations
FOR UPDATE
TO authenticated
USING (
  auth.uid() = farmer_id OR 
  auth.uid() = buyer_id
)
WITH CHECK (
  auth.uid() = farmer_id OR 
  auth.uid() = buyer_id
);

-- Bước 9: Tạo RLS Policies cho messages

-- Policy 1: Users chỉ có thể xem messages trong conversations của mình
CREATE POLICY "Users can view messages in own conversations"
ON public.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.farmer_id = auth.uid() OR conversations.buyer_id = auth.uid())
  )
);

-- Policy 2: Users có thể gửi messages
CREATE POLICY "Users can send messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.farmer_id = auth.uid() OR conversations.buyer_id = auth.uid())
  )
);

-- Policy 3: Users có thể cập nhật messages của mình (đánh dấu đã đọc)
CREATE POLICY "Users can update own received messages"
ON public.messages
FOR UPDATE
TO authenticated
USING (auth.uid() = receiver_id)
WITH CHECK (auth.uid() = receiver_id);

-- Bước 10: Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.messages TO authenticated;

-- Bước 11: Kiểm tra
SELECT 
  'conversations' as table_name,
  COUNT(*) as row_count
FROM public.conversations
UNION ALL
SELECT 
  'messages',
  COUNT(*)
FROM public.messages;
