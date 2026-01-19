# Giải pháp cho lỗi: `orders_status_check` constraint violation

## 🔴 Lỗi
```
{
    "code": "23514",
    "details": null,
    "hint": null,
    "message": "new row for relation \"orders\" violates check constraint \"orders_status_check\""
}
```

## 🔍 Nguyên nhân
Giá trị `status` khi insert vào bảng `orders` không khớp với check constraint trong database.

## ✅ Giải pháp

### Cách 1: Sửa trực tiếp trong Supabase SQL Editor (KHUYẾN NGHỊ)

1. Mở Supabase Dashboard → SQL Editor
2. Chạy script `quick_fix_status.sql`:

```sql
-- Xóa constraint cũ
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Tạo lại với tất cả các giá trị hợp lệ
ALTER TABLE orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN (
  'pending',      -- Chờ xác nhận
  'confirmed',    -- Đã xác nhận
  'shipped',      -- Đang giao hàng
  'shipping',     -- Đang giao (dùng trong Dashboard)
  'completed',    -- Hoàn thành
  'cancelled',    -- Đã hủy
  'processing'    -- Đang xử lý (dùng trong Dashboard)
));
```

3. Kiểm tra lại:
```sql
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'orders'::regclass
AND contype = 'c'
AND conname LIKE '%status%';
```

### Cách 2: Kiểm tra giá trị status hiện tại

Chạy query này để xem các giá trị status đang được sử dụng:

```sql
SELECT DISTINCT status, COUNT(*) as count
FROM orders 
GROUP BY status
ORDER BY status;
```

Nếu có giá trị nào không nằm trong danh sách trên, bạn cần:
- Cập nhật dữ liệu cũ, HOẶC
- Thêm giá trị đó vào constraint

### Cách 3: Kiểm tra constraint hiện tại

```sql
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'orders'::regclass
AND contype = 'c';
```

## 📋 Các giá trị status hợp lệ trong code

Dựa trên code đã viết, các status được sử dụng:

| Status | Mô tả | Nơi sử dụng |
|--------|-------|-------------|
| `pending` | Chờ xác nhận | buyer.service.js, Orders.jsx |
| `confirmed` | Đã xác nhận | Orders.jsx |
| `shipped` | Đang giao hàng | Orders.jsx |
| `shipping` | Đang giao | Dashboard.jsx |
| `completed` | Hoàn thành | Orders.jsx, Dashboard.jsx |
| `cancelled` | Đã hủy | Orders.jsx |
| `processing` | Đang xử lý | Dashboard.jsx |

## 🚀 Sau khi sửa

1. Thử tạo đơn hàng mới
2. Nếu vẫn lỗi, kiểm tra lại:
   - Giá trị status trong code có đúng không
   - Constraint đã được cập nhật chưa
   - Có giá trị status nào khác đang được sử dụng không

## 💡 Lưu ý

- Script `quick_fix_status.sql` đã bao gồm TẤT CẢ các giá trị status được sử dụng trong code
- Nếu bạn muốn thêm status mới, cần:
  1. Thêm vào constraint
  2. Cập nhật code để xử lý status mới
  3. Cập nhật UI để hiển thị status mới

## 🔧 Debug

Nếu vẫn gặp lỗi sau khi sửa:

1. Kiểm tra log trong browser console
2. Kiểm tra giá trị status đang được gửi:
   ```javascript
   console.log('Status being sent:', orderData.status || 'pending')
   ```
3. Kiểm tra constraint trong database:
   ```sql
   SELECT pg_get_constraintdef(oid) 
   FROM pg_constraint 
   WHERE conrelid = 'orders'::regclass 
   AND conname = 'orders_status_check';
   ```
