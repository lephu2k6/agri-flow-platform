import { supabase } from '../lib/supabase'

/**
 * Helper functions để làm việc với Supabase Storage
 */

// Kiểm tra bucket có tồn tại không
export const checkBucketExists = async (bucketName) => {
  try {
    const { data, error } = await supabase.storage.from(bucketName).list('', {
      limit: 1
    })
    
    // Nếu không lỗi hoặc lỗi không phải "not found", bucket tồn tại
    if (!error || error.message?.includes('not found') === false) {
      return { exists: true }
    }
    
    return { exists: false, error: error?.message }
  } catch (error) {
    // Nếu lỗi là "not found", bucket không tồn tại
    if (error.message?.includes('not found') || error.message?.includes('Bucket')) {
      return { exists: false, error: error.message }
    }
    return { exists: false, error: error.message }
  }
}

// Tạo bucket (chỉ admin mới có thể)
export const createBucket = async (bucketName, isPublic = true) => {
  try {
    // Note: Tạo bucket thường cần quyền admin
    // Cách tốt nhất là tạo qua Supabase Dashboard
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: isPublic,
      fileSizeLimit: 100 * 1024 * 1024, // 100MB
      allowedMimeTypes: [
        'video/mp4',
        'video/webm',
        'video/ogg',
        'video/quicktime'
      ]
    })

    if (error) {
      // Nếu lỗi là bucket đã tồn tại, coi như thành công
      if (error.message?.includes('already exists')) {
        return { success: true, message: 'Bucket đã tồn tại' }
      }
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error('Create bucket error:', error)
    return { 
      success: false, 
      error: error.message,
      needsManualSetup: true 
    }
  }
}

// Kiểm tra và tạo bucket nếu cần
export const ensureBucketExists = async (bucketName) => {
  const checkResult = await checkBucketExists(bucketName)
  
  if (checkResult.exists) {
    return { success: true, message: 'Bucket đã tồn tại' }
  }

  // Thử tạo bucket
  const createResult = await createBucket(bucketName)
  
  if (!createResult.success && createResult.needsManualSetup) {
    return {
      success: false,
      error: 'Bucket chưa được tạo. Vui lòng tạo bucket thủ công trong Supabase Dashboard.',
      instructions: `
1. Mở Supabase Dashboard
2. Vào Storage → New bucket
3. Tên bucket: ${bucketName}
4. Public bucket: Bật (ON)
5. File size limit: 100MB
6. Allowed MIME types: video/mp4, video/webm, video/ogg, video/quicktime
      `
    }
  }

  return createResult
}
