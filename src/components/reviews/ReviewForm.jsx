import React, { useState } from 'react'
import { X, Star, Image as ImageIcon, Send } from 'lucide-react'
import { reviewService } from '../../services/review.service'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

const ReviewForm = ({ productId, orderId, onClose, onSuccess }) => {
  const { user } = useAuth()
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!comment.trim()) {
      toast.error('Vui lòng nhập đánh giá')
      return
    }

    try {
      setLoading(true)
      const result = await reviewService.createReview({
        product_id: productId,
        buyer_id: user.id,
        order_id: orderId,
        rating,
        comment: comment.trim(),
        images
      })

      if (result.success) {
        toast.success('Cảm ơn bạn đã đánh giá!')
        onSuccess()
        onClose()
      } else {
        toast.error(result.error || 'Không thể gửi đánh giá')
      }
    } catch (error) {
      console.error('Review submit error:', error)
      toast.error('Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + images.length > 5) {
      toast.error('Tối đa 5 ảnh')
      return
    }
    setImages([...images, ...files])
  }

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index))
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-50 to-white px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-900">Đánh giá sản phẩm</h2>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-white rounded-xl transition-colors text-gray-400 hover:text-red-500"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Rating Stars */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Đánh giá của bạn
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={40}
                      className={`${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300'
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {rating === 5 ? 'Tuyệt vời!' :
                 rating === 4 ? 'Rất tốt' :
                 rating === 3 ? 'Tốt' :
                 rating === 2 ? 'Tạm được' : 'Không hài lòng'}
              </p>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nhận xét chi tiết
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all min-h-[120px] resize-none"
                rows="5"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Thêm ảnh (tối đa 5)
              </label>
              <div className="flex gap-3 flex-wrap">
                {images.map((img, index) => (
                  <div key={index} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-emerald-200">
                    <img 
                      src={URL.createObjectURL(img)} 
                      alt={`Review ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <label className="w-24 h-24 border-2 border-dashed border-emerald-300 rounded-xl flex items-center justify-center cursor-pointer hover:bg-emerald-50 transition-colors">
                    <ImageIcon size={24} className="text-emerald-500" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading || !comment.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={18} />
                    Gửi đánh giá
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ReviewForm
