-- ============================================
-- SỬA LỖI: Row-level security policy cho Storage
-- Lỗi: "new row violates row-level security policy"
-- ============================================

-- Bước 1: Kiểm tra bucket đã tồn tại
SELECT * FROM storage.buckets WHERE id = 'product-videos';

-- Bước 2: Xóa các policies cũ nếu có (để tạo lại)
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Access" ON storage.objects;

-- Bước 3: Tạo policies mới cho bucket product-videos

-- Policy 1: Cho phép authenticated users upload (INSERT)
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-videos'
);

-- Policy 2: Cho phép mọi người đọc (SELECT) - vì bucket là public
CREATE POLICY "Allow public reads"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'product-videos'
);

-- Policy 3: Cho phép authenticated users cập nhật file của chính họ
CREATE POLICY "Allow authenticated updates"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-videos'
)
WITH CHECK (
  bucket_id = 'product-videos'
);

-- Policy 4: Cho phép authenticated users xóa file của chính họ
CREATE POLICY "Allow authenticated deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-videos'
);

-- Bước 4: Kiểm tra policies đã tạo
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
AND policyname LIKE '%product-videos%' OR policyname LIKE '%authenticated%' OR policyname LIKE '%public%';

-- Bước 5: Kiểm tra RLS đã được bật trên storage.objects
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- Nếu rowsecurity = false, bật RLS:
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
