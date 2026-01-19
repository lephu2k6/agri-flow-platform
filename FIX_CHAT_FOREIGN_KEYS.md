# 🔧 Sửa lỗi Foreign Key cho Chat System

## ❌ Lỗi
```
PGRST200: Could not find a relationship between 'conversations' and 'farmer_id' in the schema cache
```

## 🔍 Nguyên nhân
PostgREST không thể tự động join với `auth.users` vì đó là schema khác. Cần sử dụng `public.profiles` thay vì `auth.users` cho foreign keys.

## ✅ Giải pháp

### Cách 1: Sửa Foreign Keys (Khuyến nghị)

Chạy script SQL trong Supabase SQL Editor:

```sql
-- File: database/fix_chat_foreign_keys.sql
```

Script này sẽ:
1. Xóa foreign keys cũ (nếu có)
2. Tạo foreign keys mới trỏ đến `public.profiles`
3. Grant permissions
4. Refresh schema cache

### Cách 2: Sử dụng Alternative Query (Đã tự động)

Code đã được cập nhật để tự động fallback sang alternative query nếu foreign key relationship không tồn tại. Alternative query sẽ:
- Query conversations/messages riêng
- Query profiles riêng
- Merge data trong JavaScript

## 📝 Các bước thực hiện

### Bước 1: Chạy SQL Script
1. Mở Supabase Dashboard
2. Vào **SQL Editor**
3. Copy nội dung file `database/fix_chat_foreign_keys.sql`
4. Chạy script

### Bước 2: Kiểm tra Foreign Keys
Chạy query này để kiểm tra:

```sql
SELECT
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name IN ('conversations', 'messages')
  AND tc.constraint_type = 'FOREIGN KEY';
```

Kết quả mong đợi:
- `conversations.farmer_id` → `profiles.id`
- `conversations.buyer_id` → `profiles.id`
- `messages.sender_id` → `profiles.id`
- `messages.receiver_id` → `profiles.id`

### Bước 3: Refresh Schema Cache
Nếu vẫn lỗi, refresh schema cache:

```sql
NOTIFY pgrst, 'reload schema';
```

Hoặc restart Supabase project.

## 🎯 Kết quả
Sau khi sửa, PostgREST sẽ có thể tự động join với `profiles` table và query sẽ hoạt động bình thường.

## 📌 Lưu ý
- Nếu bảng `conversations` hoặc `messages` đã có dữ liệu, đảm bảo tất cả `farmer_id`, `buyer_id`, `sender_id`, `receiver_id` đều tồn tại trong bảng `profiles`
- Nếu không, cần migrate dữ liệu trước khi sửa foreign keys
