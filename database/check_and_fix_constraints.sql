-- ============================================
-- SCRIPT KIỂM TRA VÀ SỬA CONSTRAINT CHO ORDERS
-- ============================================

-- Bước 1: Kiểm tra constraint hiện tại
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'orders'::regclass
AND contype = 'c'
AND conname LIKE '%status%';

-- Bước 2: Xem các giá trị status hiện có trong database
SELECT DISTINCT status, COUNT(*) 
FROM orders 
GROUP BY status
ORDER BY status;

-- Bước 3: Xóa constraint cũ (nếu có)
-- Thay 'orders_status_check' bằng tên constraint thực tế từ bước 1
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Bước 4: Tạo lại constraint với các giá trị hợp lệ
-- Dựa trên code, các status hợp lệ là:
-- 'pending', 'confirmed', 'shipped', 'shipping', 'completed', 'cancelled', 'processing'
-- (Bao gồm tất cả các giá trị được sử dụng trong code)
ALTER TABLE orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'confirmed', 'shipped', 'shipping', 'completed', 'cancelled', 'processing'));

-- Bước 5: Kiểm tra lại constraint đã tạo
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'orders'::regclass
AND contype = 'c'
AND conname LIKE '%status%';
