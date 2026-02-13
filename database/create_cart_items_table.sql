-- ============================================
-- CREATE CART_ITEMS TABLE
-- Chạy script này trong Supabase SQL Editor để kích hoạt tính năng lưu giỏ hàng vào DB
-- ============================================

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Bật RLS
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Tạo Policies
DROP POLICY IF EXISTS "Users can view their own cart items" ON public.cart_items;
CREATE POLICY "Users can view their own cart items" 
ON public.cart_items FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own cart items" ON public.cart_items;
CREATE POLICY "Users can insert their own cart items" 
ON public.cart_items FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own cart items" ON public.cart_items;
CREATE POLICY "Users can update their own cart items" 
ON public.cart_items FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own cart items" ON public.cart_items;
CREATE POLICY "Users can delete their own cart items" 
ON public.cart_items FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Cấp quyền
GRANT ALL ON public.cart_items TO authenticated;
GRANT ALL ON public.cart_items TO service_role;
