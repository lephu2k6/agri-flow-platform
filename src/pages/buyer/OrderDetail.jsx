import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { reviewService } from '../../services/review.service'
import { useAuth } from '../../hooks/useAuth'
import { ArrowLeft, MapPin, Package, Calendar, Star, MessageSquare, Send, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const OrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)

  // Review state
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products (
            *,
            product_images (*)
          ),
          profiles!farmer_id (
            full_name,
            phone
          )
        `)
        .eq('id', id).single()

      if (error) throw error
      setOrder(data)

      // Kiểm tra xem đã đánh giá chưa
      if (data && user) {
        const reviewCheck = await reviewService.hasUserReviewed(data.product_id, user.id)
        setHasReviewed(reviewCheck.hasReviewed)
      }
    } catch (error) {
      console.error("Lỗi khi tải đơn hàng:", error)
      toast.error('Không thể tải chi tiết đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      return toast.error('Vui lòng để lại lời nhắn chia sẻ trải nghiệm của bạn!')
    }

    setSubmittingReview(true)
    try {
      const result = await reviewService.createReview({
        product_id: order.product_id,
        buyer_id: user.id,
        order_id: order.id,
        rating,
        comment: comment.trim()
      })

      if (result.success) {
        toast.success('Cảm ơn bạn đã gửi đánh giá! ❤️')
        setHasReviewed(true)
        setShowReviewModal(false)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Đã có lỗi xảy ra. Vui lòng thử lại sau.')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-neutral-500 font-medium italic">Đang tải thông tin đơn hàng...</p>
      </div>
    </div>
  )

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Package size={64} className="mx-auto text-gray-200 mb-4" />
        <h2 className="text-2xl font-black text-gray-400">Không tìm thấy đơn hàng</h2>
        <button onClick={() => navigate('/buyer/orders')} className="mt-4 text-emerald-600 font-bold hover:underline">Quay lại danh sách</button>
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 mb-8 hover:text-emerald-600 group transition-all font-bold uppercase tracking-tighter text-sm">
        <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Quay lại
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-emerald-50 relative">
        {/* Status Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-10 text-white text-center relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <p className="uppercase text-[10px] font-black tracking-[0.3em] opacity-80 mb-3">Hành trình nông sản</p>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter">{order.status}</h2>

          {order.status === 'completed' && !hasReviewed && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="mt-6 bg-white text-emerald-700 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl active:scale-95 transition-all flex items-center gap-2 mx-auto"
            >
              <Star size={16} fill="currentColor" /> Đánh giá ngay
            </button>
          )}

          {hasReviewed && (
            <div className="mt-6 flex items-center justify-center gap-2 text-emerald-100 font-bold text-sm">
              <Check size={16} /> Bạn đã gửi đánh giá cho đơn hàng này
            </div>
          )}
        </div>

        <div className="p-8 sm:p-12">
          {/* Product Info */}
          <div className="flex flex-col sm:flex-row gap-8 mb-10 pb-10 border-b border-emerald-50">
            <img
              src={order.products?.product_images?.[0]?.image_url || order.products?.image_url}
              className="w-32 h-32 rounded-3xl object-cover shadow-lg border-4 border-white ring-1 ring-emerald-50"
            />
            <div className="flex-1">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Chi tiết sản phẩm</p>
              <h3 className="font-black text-2xl text-gray-800 tracking-tight">{order.products?.title}</h3>
              <p className="text-gray-500 font-medium mt-1 uppercase text-xs tracking-wider">
                Số lượng: <span className="text-gray-900 font-black">{order.quantity} {order.products?.unit}</span>
              </p>
              <div className="flex items-center justify-between mt-4">
                <p className="text-3xl font-black text-emerald-600 tracking-tighter italic">
                  {order.total_amount?.toLocaleString()}đ
                </p>
                <p className="text-[10px] font-bold text-gray-300 uppercase italic">COD Payment</p>
              </div>
            </div>
          </div>

          {/* Delivery Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                  <MapPin className="text-emerald-600" size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Địa chỉ nhận hàng</p>
                  <p className="text-gray-700 font-bold leading-relaxed">
                    {order.delivery_address}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {order.delivery_district}, {order.delivery_province}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                  <Calendar className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Thời gian đặt</p>
                  <p className="text-gray-700 font-bold">
                    {new Date(order.created_at).toLocaleString('vi-VN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 rounded-3xl p-6 border border-neutral-100 divide-y divide-neutral-200/50">
              <div className="pb-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Thông tin Nông dân</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black">
                    {order.profiles?.full_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{order.profiles?.full_name || 'Agri-Flow Farmer'}</p>
                    <p className="text-xs text-gray-500 italic">{order.profiles?.phone || 'SĐT ẩn'}</p>
                  </div>
                </div>
              </div>
              <div className="pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tiền hàng</span>
                  <span className="font-bold text-gray-800">{order.total_amount?.toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phí vận chuyển</span>
                  <span className="text-emerald-600 font-bold">Miễn phí</span>
                </div>
                <div className="flex justify-between text-lg pt-2">
                  <span className="font-black text-gray-900 italic uppercase italic">Tổng cộng</span>
                  <span className="font-black text-emerald-600 italic underline decoration-wavy decoration-emerald-200">{order.total_amount?.toLocaleString()}đ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom-10 duration-500">
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-100 transition-colors text-neutral-400"
            >
              <X size={24} />
            </button>

            <div className="p-10">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-emerald-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-emerald-50">
                  <MessageSquare className="text-emerald-600" size={32} />
                </div>
                <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Đánh giá sản phẩm</h3>
                <p className="text-gray-500 italic mt-1">Cảm nhận của bạn là động lực cho nông dân!</p>
              </div>

              <div className="space-y-8">
                {/* Rating Stars */}
                <div className="text-center">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Bạn thấy nông sản này thế nào?</p>
                  <div className="flex justify-center gap-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => setRating(s)}
                        className={`p-1 transition-all transform hover:scale-125 ${s <= rating ? 'text-amber-400' : 'text-neutral-200'}`}
                      >
                        <Star size={36} fill={s <= rating ? 'currentColor' : 'none'} strokeWidth={1.5} />
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-sm font-black text-amber-500 uppercase italic tracking-widest">
                    {rating === 5 ? 'Tuyệt vời!' : rating === 4 ? 'Hài lòng!' : rating === 3 ? 'Bình thường' : rating === 2 ? 'Tạm được' : 'Kém'}
                  </p>
                </div>

                {/* Comment area */}
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">Chia sẻ trải nghiệm</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Sản phẩm tươi ngon, giao hàng đúng hẹn..."
                    className="w-full h-32 bg-neutral-50 rounded-3xl p-6 border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all resize-none text-gray-700 font-medium"
                  />
                </div>

                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="w-full py-5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:translate-y-0"
                >
                  {submittingReview ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <> GỬI ĐÁNH GIÁ <Send size={18} /> </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderDetail
