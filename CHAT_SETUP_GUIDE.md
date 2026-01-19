# Hướng dẫn Setup Hệ thống Chat

## ✅ Tính năng đã xây dựng

### 1. Database Schema
- **Bảng `conversations`**: Lưu thông tin cuộc trò chuyện
- **Bảng `messages`**: Lưu tin nhắn
- **RLS Policies**: Bảo mật dữ liệu
- **Realtime Subscriptions**: Chat real-time

### 2. Services & Context
- **`chat.service.js`**: Service xử lý chat logic
- **`ChatContext.jsx`**: Context quản lý state chat
- **Supabase Realtime**: Real-time messaging

### 3. UI Components
- **`ChatWindow.jsx`**: Cửa sổ chat
- **`ChatList.jsx`**: Danh sách conversations
- **`ChatButton.jsx`**: Nút mở chat từ trang sản phẩm
- **`Chat.jsx`**: Trang quản lý chat

### 4. Tích hợp
- Đã tích hợp vào Header (icon tin nhắn với badge unread)
- Đã tích hợp vào ProductDetail (nút chat)
- Route `/chat` để quản lý conversations

## 🚀 Cài đặt Database

### Bước 1: Chạy SQL Script

Mở Supabase Dashboard → SQL Editor và chạy:

**File**: `database/create_chat_tables.sql`

Hoặc copy và chạy trực tiếp:

```sql
-- Tạo bảng conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(farmer_id, buyer_id, product_id)
);

-- Tạo bảng messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tạo indexes
CREATE INDEX IF NOT EXISTS idx_conversations_farmer_id ON public.conversations(farmer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON public.conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Tạo RLS Policies (xem file SQL đầy đủ)
```

### Bước 2: Enable Realtime

1. Vào Supabase Dashboard → **Database** → **Replication**
2. Bật Replication cho:
   - `public.conversations`
   - `public.messages`

Hoặc chạy SQL:

```sql
-- Enable Realtime cho conversations
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- Enable Realtime cho messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
```

### Bước 3: Grant Permissions

```sql
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.messages TO authenticated;
```

## 📋 Cách sử dụng

### 1. Chat từ trang sản phẩm
- Vào trang chi tiết sản phẩm
- Click nút **"Chat với nông dân"**
- Cửa sổ chat sẽ mở ra (popup)

### 2. Quản lý conversations
- Click icon **Tin nhắn** trên Header
- Xem danh sách tất cả conversations
- Click vào conversation để mở chat

### 3. Gửi tin nhắn
- Nhập tin nhắn vào ô input
- Nhấn Enter hoặc click nút Send
- Tin nhắn hiển thị real-time

## 🔧 Tính năng

### Real-time
- ✅ Tin nhắn mới hiển thị ngay lập tức
- ✅ Cập nhật unread count tự động
- ✅ Cập nhật last_message_at tự động

### Bảo mật
- ✅ RLS policies đảm bảo user chỉ thấy conversations của mình
- ✅ User chỉ có thể gửi tin nhắn trong conversations của mình
- ✅ User chỉ có thể đánh dấu đã đọc tin nhắn của mình

### UI/UX
- ✅ Chat window với scroll tự động
- ✅ Hiển thị thời gian tương đối
- ✅ Badge unread count
- ✅ Responsive design

## 📁 Files đã tạo

```
src/
├── services/
│   └── chat.service.js          ✅
├── contexts/
│   └── ChatContext.jsx          ✅
├── components/
│   └── chat/
│       ├── ChatWindow.jsx       ✅
│       ├── ChatList.jsx         ✅
│       └── ChatButton.jsx       ✅
└── pages/
    └── Chat.jsx                 ✅

database/
└── create_chat_tables.sql       ✅
```

## ⚠️ Lưu ý

1. **Realtime phải được enable** trong Supabase Dashboard
2. **RLS Policies phải được tạo** để bảo mật
3. **Permissions phải được grant** cho authenticated users
4. **User phải đăng nhập** để sử dụng chat

## 🚀 Sau khi setup

1. Chạy SQL script để tạo bảng
2. Enable Realtime cho 2 bảng
3. Grant permissions
4. Refresh trang web
5. Thử chat!
