-- ============================================
-- THÊM HỖ TRỢ VIDEO CHO SẢN PHẨM
-- ============================================

-- Bước 1: Thêm cột video_url vào bảng products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Bước 2: Tạo storage bucket cho video (chạy trong Supabase Dashboard > Storage)
-- Tên bucket: product-videos
-- Public: true
-- File size limit: 100MB
-- Allowed MIME types: video/mp4, video/webm, video/ogg, video/quicktime

-- Bước 3: Tạo policy cho storage bucket (chạy trong Supabase Dashboard > Storage > Policies)
-- Policy name: Allow authenticated users to upload videos
-- Policy definition:
--   INSERT: authenticated users can insert
--   SELECT: public can select
--   UPDATE: authenticated users can update their own videos
--   DELETE: authenticated users can delete their own videos

-- Hoặc dùng SQL:
-- CREATE POLICY "Allow authenticated uploads" ON storage.objects
-- FOR INSERT TO authenticated
-- WITH CHECK (bucket_id = 'product-videos');

-- CREATE POLICY "Allow public reads" ON storage.objects
-- FOR SELECT TO public
-- USING (bucket_id = 'product-videos');

-- CREATE POLICY "Allow authenticated updates" ON storage.objects
-- FOR UPDATE TO authenticated
-- USING (bucket_id = 'product-videos');

-- CREATE POLICY "Allow authenticated deletes" ON storage.objects
-- FOR DELETE TO authenticated
-- USING (bucket_id = 'product-videos');

-- Bước 4: Kiểm tra cột đã được thêm
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'video_url';
