import { supabase } from '../lib/supabase'
import { ensureBucketExists } from '../utils/storageHelper'

const BUCKET_NAME = 'product-videos'

export const videoService = {
  // Upload video cho sản phẩm
  async uploadProductVideo(productId, videoFile) {
    try {
      // Validate file type
      const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
      if (!validTypes.includes(videoFile.type)) {
        throw new Error('Định dạng video không hợp lệ. Chỉ chấp nhận: MP4, WebM, OGG, MOV')
      }

      // Validate file size (max 100MB)
      const maxSize = 100 * 1024 * 1024 // 100MB
      if (videoFile.size > maxSize) {
        throw new Error('Video quá lớn. Kích thước tối đa: 100MB')
      }

      // Kiểm tra bucket tồn tại
      const bucketCheck = await ensureBucketExists(BUCKET_NAME)
      if (!bucketCheck.success) {
        throw new Error(
          bucketCheck.instructions || 
          'Bucket chưa được tạo. Vui lòng tạo bucket "product-videos" trong Supabase Dashboard.'
        )
      }

      const fileExt = videoFile.name.split('.').pop()
      const fileName = `${productId}/video-${Date.now()}.${fileExt}`
      
      // Upload video to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, videoFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        // Nếu lỗi là bucket not found
        if (uploadError.message?.includes('not found') || uploadError.message?.includes('Bucket')) {
          throw new Error(
            'Bucket "product-videos" chưa được tạo.\n\n' +
            'Vui lòng tạo bucket trong Supabase Dashboard:\n' +
            '1. Vào Storage → New bucket\n' +
            '2. Tên: product-videos\n' +
            '3. Public: ON\n' +
            '4. File size limit: 100MB\n' +
            '5. Allowed MIME types: video/mp4, video/webm, video/ogg, video/quicktime'
          )
        }
        
        // Nếu lỗi là RLS policy
        if (uploadError.message?.includes('row-level security') || 
            uploadError.message?.includes('policy') ||
            uploadError.message?.includes('violates')) {
          throw new Error(
            'Lỗi quyền truy cập: Chưa có policy cho phép upload.\n\n' +
            'Vui lòng tạo policies trong Supabase:\n' +
            '1. Vào SQL Editor\n' +
            '2. Chạy script: database/fix_storage_policies.sql\n' +
            'Hoặc xem hướng dẫn: FIX_STORAGE_POLICY.md'
          )
        }
        
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(fileName)

      // Save video URL to database
      const { data, error: dbError } = await supabase
        .from('products')
        .update({ video_url: publicUrl })
        .eq('id', productId)
        .select()
        .single()

      if (dbError) throw dbError

      return { success: true, videoUrl: publicUrl, data }
    } catch (error) {
      console.error('Upload video error:', error)
      return { success: false, error: error.message }
    }
  },

  // Xóa video của sản phẩm
  async deleteProductVideo(productId, videoUrl) {
    try {
      // Extract file path from URL
      const urlParts = videoUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]
      const folderPath = urlParts[urlParts.length - 2]
      const filePath = `${folderPath}/${fileName}`

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath])

      if (storageError) throw storageError

      // Remove video URL from database
      const { error: dbError } = await supabase
        .from('products')
        .update({ video_url: null })
        .eq('id', productId)

      if (dbError) throw dbError

      return { success: true }
    } catch (error) {
      console.error('Delete video error:', error)
      return { success: false, error: error.message }
    }
  },

  // Lấy video của sản phẩm
  async getProductVideo(productId) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('video_url')
        .eq('id', productId)
        .single()

      if (error) throw error

      return { success: true, videoUrl: data?.video_url }
    } catch (error) {
      console.error('Get video error:', error)
      return { success: false, error: error.message }
    }
  }
}
