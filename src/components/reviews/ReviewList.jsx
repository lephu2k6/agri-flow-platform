import React, { useState, useEffect } from 'react'
import { Star, User, Calendar, Image as ImageIcon } from 'lucide-react'
import { reviewService } from '../../services/review.service'
import toast from 'react-hot-toast'

const ReviewList = ({ productId }) => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [productId])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const result = await reviewService.getProductReviews(productId, 10, page * 10)
      
      if (result.success) {
        if (page === 0) {
          setReviews(result.data)
        } else {
          setReviews([...reviews, ...result.data])
        }
        setHasMore(result.data.length === 10)
      }
    } catch (error) {
      console.error('Fetch reviews error:', error)
      toast.error('Không thể tải đánh giá')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-emerald-100 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 border border-emerald-100 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <Star size={32} className="text-emerald-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Chưa có đánh giá nào</h3>
        <p className="text-gray-600">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white rounded-xl p-6 border border-emerald-100 hover:shadow-lg transition-shadow">
          {/* User Info */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center text-emerald-600 font-bold text-lg flex-shrink-0">
              {review.profiles?.full_name?.charAt(0).toUpperCase() || <User size={24} />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-bold text-gray-900">
                  {review.profiles?.full_name || 'Người dùng'}
                </h4>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar size={14} />
                {formatDate(review.created_at)}
              </div>
            </div>
          </div>

          {/* Comment */}
          {review.comment && (
            <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-line">
              {review.comment}
            </p>
          )}

          {/* Images */}
          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {review.images.map((img, index) => (
                <div key={index} className="w-20 h-20 rounded-lg overflow-hidden border border-emerald-100">
                  <img 
                    src={typeof img === 'string' ? img : URL.createObjectURL(img)} 
                    alt={`Review ${index + 1}`}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => window.open(typeof img === 'string' ? img : URL.createObjectURL(img), '_blank')}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Load More */}
      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={() => {
              setPage(page + 1)
              fetchReviews()
            }}
            disabled={loading}
            className="px-6 py-3 border-2 border-emerald-500 text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang tải...' : 'Xem thêm đánh giá'}
          </button>
        </div>
      )}
    </div>
  )
}

export default ReviewList
