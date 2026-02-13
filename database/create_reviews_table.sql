-- ============================================
-- CREATE REVIEWS TABLE & PRODUCT STATS COLUMNS
-- Chạy script này trong Supabase SQL Editor
-- ============================================

-- 1. Thêm cột thống kê vào bảng products nếu chưa có
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- 2. Tạo bảng reviews
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    images TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(buyer_id, order_id, product_id) -- Mỗi khách hàng chỉ đánh giá 1 lần cho 1 sản phẩm trong 1 đơn hàng
);

-- 3. Bật RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 4. Tạo Policies
-- Ai cũng có thể xem đánh giá
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
CREATE POLICY "Anyone can view reviews" 
ON public.reviews FOR SELECT 
USING (true);

-- Chỉ người mua đơn hàng mới có thể tạo đánh giá
DROP POLICY IF EXISTS "Buyers can create reviews for their orders" ON public.reviews;
CREATE POLICY "Buyers can create reviews for their orders" 
ON public.reviews FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = buyer_id);

-- Người dùng có thể cập nhật đánh giá của chính mình
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
CREATE POLICY "Users can update their own reviews" 
ON public.reviews FOR UPDATE 
TO authenticated 
USING (auth.uid() = buyer_id);

-- 5. Cấp quyền
GRANT ALL ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
GRANT SELECT ON public.reviews TO anon;

-- 6. Refresh schema cache
NOTIFY pgrst, 'reload schema';
