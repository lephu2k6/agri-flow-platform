-- ============================================
-- SỬA NHANH LỖI CONSTRAINT ORDERS STATUS
-- Chạy script này trong Supabase SQL Editor
-- ============================================

-- Bước 1: Xóa constraint cũ (nếu có)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Bước 2: Tạo lại constraint với TẤT CẢ các giá trị status được sử dụng trong code
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

-- Bước 3: Kiểm tra lại constraint đã tạo
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'orders'::regclass
AND contype = 'c'
AND conname LIKE '%status%';

-- Bước 4: Kiểm tra các giá trị status hiện có trong database
SELECT DISTINCT status, COUNT(*) as count
FROM orders 
GROUP BY status
ORDER BY status;
