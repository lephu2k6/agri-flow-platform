# Database Setup và Migration

## Lỗi thường gặp

### Lỗi: `orders_status_check` constraint violation

**Nguyên nhân**: Giá trị `status` không khớp với check constraint trong database.

**Giải pháp**:

1. Chạy script `check_and_fix_constraints.sql` để:
   - Kiểm tra constraint hiện tại
   - Xem các giá trị status đang được sử dụng
   - Xóa và tạo lại constraint với các giá trị đúng

2. Hoặc chạy trực tiếp trong Supabase SQL Editor:

```sql
-- Xóa constraint cũ
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Tạo lại với các giá trị hợp lệ
ALTER TABLE orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'confirmed', 'shipped', 'completed', 'cancelled'));
```

## Các giá trị status hợp lệ

Dựa trên code hiện tại, các status hợp lệ là:
- `pending` - Chờ xác nhận
- `confirmed` - Đã xác nhận  
- `shipped` - Đang giao hàng
- `completed` - Hoàn thành
- `cancelled` - Đã hủy

## Các bảng cần tạo thêm

Để các tính năng mới hoạt động, cần tạo các bảng sau:

### 1. Bảng `notifications` ⚠️ QUAN TRỌNG

**Lỗi thường gặp**: `PGRST205: Could not find the table 'public.notifications'`

**Giải pháp**: Chạy script `create_notifications_table.sql`

```sql
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
```

Xem chi tiết: `FIX_NOTIFICATIONS_TABLE.md`

### 2. Bảng `reviews`
```sql
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, buyer_id, order_id)
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_buyer_id ON reviews(buyer_id);
```

### 2. Bảng `wishlists`
```sql
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX idx_wishlists_product_id ON wishlists(product_id);
```

### 3. Bảng `notifications`
```sql
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('order', 'product', 'message', 'system')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(500),
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

### 4. Cập nhật bảng `products`
```sql
-- Thêm cột rating nếu chưa có
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
```

## Hướng dẫn chạy migration

1. Mở Supabase Dashboard
2. Vào SQL Editor
3. Copy và chạy từng script theo thứ tự:
   - `check_and_fix_constraints.sql` (nếu gặp lỗi constraint)
   - Tạo các bảng mới (reviews, wishlists, notifications)
   - Cập nhật bảng products

## Kiểm tra sau khi migration

```sql
-- Kiểm tra constraint orders
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'orders'::regclass 
AND contype = 'c';

-- Kiểm tra các bảng đã tạo
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('reviews', 'wishlists', 'notifications');

-- Kiểm tra cột mới trong products
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('average_rating', 'total_reviews');
```
