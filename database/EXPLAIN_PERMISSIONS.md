# Giải thích SQL Permissions cho Notifications

## 📝 Đoạn code SQL

```sql
-- Grant permissions (quan trọng!)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.notifications TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.notifications TO anon;

-- Đảm bảo RLS đã bật
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Test query để trigger cache refresh
SELECT COUNT(*) FROM public.notifications;
```

## 🔍 Giải thích từng dòng

### 1. `GRANT USAGE ON SCHEMA public TO authenticated;`
- **Mục đích**: Cho phép role `authenticated` sử dụng schema `public`
- **Cần thiết**: User đã đăng nhập cần quyền này để truy cập các bảng trong schema `public`
- **Kết quả**: User authenticated có thể thấy và truy cập schema `public`

### 2. `GRANT ALL ON public.notifications TO authenticated;`
- **Mục đích**: Cấp tất cả quyền (SELECT, INSERT, UPDATE, DELETE) cho `authenticated` trên bảng `notifications`
- **Cần thiết**: Để user đã đăng nhập có thể:
  - Xem notifications của mình (SELECT)
  - Tạo notifications mới (INSERT) - thường từ server
  - Cập nhật notifications (UPDATE) - đánh dấu đã đọc
  - Xóa notifications (DELETE)
- **Lưu ý**: RLS policies sẽ kiểm soát chi tiết hơn (user chỉ thấy notifications của mình)

### 3. `GRANT USAGE ON SCHEMA public TO anon;`
- **Mục đích**: Cho phép role `anon` (anonymous/user chưa đăng nhập) sử dụng schema `public`
- **Cần thiết**: Để anonymous users có thể thấy schema (nhưng không thể truy cập data nếu không có quyền)

### 4. `GRANT SELECT ON public.notifications TO anon;`
- **Mục đích**: Cho phép anonymous users đọc bảng `notifications`
- **Lưu ý**: Với RLS enabled, anonymous users vẫn không thể xem data vì policies yêu cầu `auth.uid() = user_id`
- **Có thể bỏ**: Nếu bạn không muốn anonymous users có quyền SELECT, có thể bỏ dòng này

### 5. `ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;`
- **Mục đích**: Bật Row Level Security (RLS) cho bảng `notifications`
- **Cần thiết**: RLS đảm bảo user chỉ có thể:
  - Xem notifications của chính mình
  - Cập nhật/xóa notifications của chính mình
- **Bảo mật**: Ngăn user xem notifications của user khác

### 6. `SELECT COUNT(*) FROM public.notifications;`
- **Mục đích**: Test query để trigger PostgREST schema cache refresh
- **Cần thiết**: Sau khi tạo bảng hoặc thay đổi permissions, PostgREST cần refresh cache
- **Kết quả**: Chạy query này giúp PostgREST nhận ra bảng mới

## ⚠️ Lưu ý quan trọng

### Thứ tự thực hiện
1. **Tạo bảng** trước (nếu chưa có)
2. **Grant permissions** sau
3. **Enable RLS** và tạo **policies** cuối cùng

### RLS vs Permissions
- **Permissions (GRANT)**: Quyết định user có thể làm gì (SELECT, INSERT, etc.)
- **RLS Policies**: Quyết định user có thể thấy/sửa data nào (chỉ data của mình)

### Security Best Practices
```sql
-- Nên có cả 2 lớp bảo vệ:
-- 1. Permissions (GRANT) - lớp ngoài
-- 2. RLS Policies - lớp trong (chi tiết hơn)
```

## 🚀 Cách sử dụng

### Bước 1: Chạy trong Supabase SQL Editor
1. Mở Supabase Dashboard
2. Vào **SQL Editor**
3. Paste đoạn code
4. Click **Run**

### Bước 2: Kiểm tra kết quả
```sql
-- Kiểm tra permissions
SELECT 
  grantee,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
AND table_name = 'notifications'
AND grantee IN ('authenticated', 'anon');
```

### Bước 3: Test
- Refresh trang web
- Thử fetch notifications
- Lỗi sẽ biến mất

## 🔧 Troubleshooting

### Nếu vẫn lỗi sau khi chạy:

1. **Kiểm tra bảng có tồn tại**:
```sql
SELECT * FROM information_schema.tables 
WHERE table_name = 'notifications';
```

2. **Kiểm tra permissions**:
```sql
SELECT * FROM information_schema.table_privileges 
WHERE table_name = 'notifications';
```

3. **Kiểm tra RLS**:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'notifications';
```

4. **Đợi cache refresh** (1-2 phút) hoặc restart project
