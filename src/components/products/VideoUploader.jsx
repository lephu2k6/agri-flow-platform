import React, { useState, useRef } from 'react'
import { Video, Upload, X, Play, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { videoService } from '../../services/video.service'
import toast from 'react-hot-toast'

const VideoUploader = ({ productId, existingVideoUrl, onVideoUploaded, onVideoDeleted }) => {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState(existingVideoUrl || null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)

  const handleFileSelect = async (file) => {
    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
    if (!validTypes.includes(file.type)) {
      toast.error('Định dạng video không hợp lệ. Chỉ chấp nhận: MP4, WebM, OGG, MOV')
      return
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      toast.error('Video quá lớn. Kích thước tối đa: 100MB')
      return
    }

    // Create preview
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    // Upload video
    if (productId) {
      await uploadVideo(file)
    } else {
      // If no productId yet, just store the file for later upload
      toast.success('Video đã được chọn. Sẽ được upload sau khi tạo sản phẩm.')
      if (onVideoUploaded) {
        onVideoUploaded(file)
      }
    }
  }

  const uploadVideo = async (file) => {
    if (!productId) {
      toast.error('Cần tạo sản phẩm trước khi upload video')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Simulate progress (Supabase doesn't provide progress events)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const result = await videoService.uploadProductVideo(productId, file)

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (result.success) {
        setPreviewUrl(result.videoUrl)
        toast.success('Upload video thành công!')
        if (onVideoUploaded) {
          onVideoUploaded(result.videoUrl)
        }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Không thể upload video')
      setPreviewUrl(null)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDelete = async () => {
    if (!productId || !previewUrl) return

    try {
      const result = await videoService.deleteProductVideo(productId, previewUrl)
      
      if (result.success) {
        setPreviewUrl(null)
        toast.success('Đã xóa video')
        if (onVideoDeleted) {
          onVideoDeleted()
        }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Không thể xóa video')
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        <span className="flex items-center gap-2">
          <Video size={16} className="text-emerald-600" />
          Video sản phẩm (Tùy chọn)
        </span>
        <span className="text-xs text-gray-500 font-normal block mt-1">
          Định dạng: MP4, WebM, OGG, MOV | Tối đa: 100MB
        </span>
      </label>

      {previewUrl ? (
        <div className="relative group">
          <div className="relative bg-black rounded-xl overflow-hidden">
            <video
              ref={videoRef}
              src={previewUrl}
              controls
              className="w-full h-auto max-h-96"
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  const duration = videoRef.current.duration
                  console.log('Video duration:', duration, 'seconds')
                }
              }}
            />
            
            {/* Delete Button */}
            <button
              onClick={handleDelete}
              className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
              disabled={uploading}
            >
              <X size={18} />
            </button>

            {/* Upload Progress */}
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="animate-spin text-white mx-auto mb-2" size={32} />
                  <div className="w-64 bg-gray-700 rounded-full h-2 mb-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-white text-sm">{uploadProgress}%</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            dragActive
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50/50'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/quicktime"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0])
              }
            }}
            className="hidden"
            disabled={uploading}
          />

          {uploading ? (
            <div className="space-y-4">
              <Loader2 className="animate-spin text-emerald-500 mx-auto" size={48} />
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">Đang upload... {uploadProgress}%</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <Video className="text-emerald-600" size={32} />
              </div>
              <div>
                <p className="text-gray-700 font-semibold mb-1">
                  Kéo thả video vào đây hoặc click để chọn
                </p>
                <p className="text-sm text-gray-500">
                  MP4, WebM, OGG, MOV • Tối đa 100MB
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
              >
                <Upload size={18} />
                Chọn video
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">Mẹo upload video:</p>
            <ul className="space-y-1 text-xs">
              <li>• Video nên có độ phân giải tối thiểu 720p</li>
              <li>• Thời lượng khuyến nghị: 30 giây - 2 phút</li>
              <li>• Quay video sản phẩm thực tế để tăng độ tin cậy</li>
              <li>• Đảm bảo ánh sáng đủ để video rõ nét</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoUploader
