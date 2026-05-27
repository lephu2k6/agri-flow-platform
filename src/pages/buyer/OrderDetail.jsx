import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { reviewService } from '../../services/review.service'
import { useAuth } from '../../hooks/useAuth'
import {
  ArrowLeft, MapPin, Package, Calendar, Star, MessageSquare,
  Send, X, Check, Clock, Truck, CheckCircle2, XCircle,
  ClipboardCheck, User, Phone, CreditCard
} from 'lucide-react'
import toast from 'react-hot-toast'

const statusConfig = {
  pending: { label: 'Chờ xác nhận', tone: 'amber', icon: Clock },
  confirmed: { label: 'Đã xác nhận', tone: 'blue', icon: ClipboardCheck },
  shipped: { label: 'Đang giao', tone: 'indigo', icon: Truck },
  completed: { label: 'Hoàn thành', tone: 'emerald', icon: CheckCircle2 },
  cancelled: { label: 'Đã hủy', tone: 'rose', icon: XCircle }
}

const statusOrder = ['pending', 'confirmed', 'shipped', 'completed']

const OrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)
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
      return toast.error('Vui lòng để lại lời nhắn chia sẻ trải nghiệm của bạn')
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
        toast.success('Cảm ơn bạn đã gửi đánh giá')
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
    <div className="market-surface flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-11 w-11 animate-spin rounded-full border-2 border-emerald-100 border-t-emerald-600"></div>
        <p className="mt-4 font-semibold text-gray-500">Đang tải thông tin đơn hàng...</p>
      </div>
    </div>
  )

  if (!order) return (
    <div className="market-surface flex min-h-screen items-center justify-center">
      <div className="text-center">
        <Package size={48} className="mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-black text-gray-500">Không tìm thấy đơn hàng</h2>
        <button onClick={() => navigate('/buyer/orders')} className="mt-4 font-bold text-emerald-600 hover:underline">Quay lại danh sách</button>
      </div>
    </div>
  )

  const currentStatus = statusConfig[order.status] || statusConfig.pending
  const CurrentIcon = currentStatus.icon
  const productImage = order.products?.product_images?.[0]?.image_url || order.products?.image_url || 'https://via.placeholder.com/300'
  const timeline = buildTimeline(order)

  return (
    <div className="market-surface min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <button onClick={() => navigate(-1)} className="mb-5 inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-gray-500 hover:text-emerald-600">
          <ArrowLeft size={17} /> Quay lại
        </button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="market-panel overflow-hidden">
              <div className="bg-emerald-700 px-6 py-7 text-white">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-100">Chi tiết đơn hàng</p>
                    <h1 className="mt-2 flex items-center gap-3 text-3xl font-black">
                      <CurrentIcon size={30} />
                      {currentStatus.label}
                    </h1>
                    <p className="mt-2 text-sm font-semibold text-emerald-50">Mã đơn #{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  {order.status === 'completed' && !hasReviewed && (
                    <button onClick={() => setShowReviewModal(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-black text-emerald-700 hover:bg-emerald-50">
                      <Star size={16} fill="currentColor" /> Đánh giá ngay
                    </button>
                  )}
                  {hasReviewed && (
                    <div className="inline-flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm font-bold text-emerald-50">
                      <Check size={16} /> Bạn đã gửi đánh giá
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 md:p-6">
                <div className="flex flex-col gap-5 border-b border-gray-100 pb-6 md:flex-row">
                  <img src={productImage} alt={order.products?.title} className="h-32 w-32 rounded-md border border-gray-100 object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black uppercase tracking-wide text-emerald-600">Chi tiết sản phẩm</p>
                    <h2 className="mt-2 text-2xl font-black text-gray-900">{order.products?.title}</h2>
                    <p className="mt-2 text-sm font-bold uppercase text-gray-500">
                      Số lượng: <span className="text-gray-900">{order.quantity} {order.products?.unit}</span>
                    </p>
                    <div className="mt-5 flex flex-wrap items-center gap-4">
                      <p className="text-3xl font-black text-emerald-600">{formatMoney(order.total_amount)}</p>
                      <span className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1 text-xs font-black uppercase text-gray-400">
                        <CreditCard size={13} /> COD khi nhận hàng
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <InfoItem icon={MapPin} title="Địa chỉ nhận hàng">
                    <p className="font-bold text-gray-900">{order.delivery_address}</p>
                    <p className="mt-1 text-sm text-gray-500">{order.delivery_district}, {order.delivery_province}</p>
                  </InfoItem>
                  <InfoItem icon={Calendar} title="Thời gian đặt">
                    <p className="font-bold text-gray-900">{formatDateTime(order.created_at)}</p>
                  </InfoItem>
                </div>
              </div>
            </section>

            <section className="market-panel overflow-hidden">
              <div className="border-b border-gray-100 px-5 py-4">
                <h2 className="font-black text-gray-900">Theo dõi trạng thái</h2>
                <p className="mt-1 text-sm text-gray-500">Các mốc xử lý được hiển thị theo thời gian cập nhật đơn hàng.</p>
              </div>
              <div className="p-5">
                <div className="space-y-0">
                  {timeline.map((item, index) => (
                    <TimelineItem
                      key={item.key}
                      item={item}
                      isLast={index === timeline.length - 1}
                    />
                  ))}
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="market-panel p-5">
              <p className="text-xs font-black uppercase tracking-wide text-gray-400">Thông tin nông dân</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-600 font-black text-white">
                  {order.profiles?.full_name?.charAt(0) || 'N'}
                </div>
                <div>
                  <p className="font-black text-gray-900">{order.profiles?.full_name || 'Agri-Flow Farmer'}</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                    <Phone size={13} /> {order.profiles?.phone || 'SĐT ẩn'}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 border-t border-gray-100 pt-5">
                <PriceRow label="Tiền hàng" value={formatMoney(order.total_amount)} />
                <PriceRow label="Phí vận chuyển" value="Miễn phí" valueClass="text-emerald-600" />
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-base font-black uppercase text-gray-900">Tổng cộng</span>
                  <span className="text-xl font-black text-emerald-600">{formatMoney(order.total_amount)}</span>
                </div>
              </div>
            </section>

            <section className="market-panel p-5">
              <p className="text-xs font-black uppercase tracking-wide text-gray-400">Tóm tắt trạng thái</p>
              <div className={`mt-4 rounded-md border p-4 ${getStatusTone(order.status)}`}>
                <div className="flex items-center gap-2 font-black">
                  <CurrentIcon size={18} /> {currentStatus.label}
                </div>
                <p className="mt-2 text-sm font-semibold opacity-80">
                  Cập nhật lần cuối: {formatDateTime(order.updated_at || order.created_at)}
                </p>
              </div>
            </section>
          </aside>
        </div>
      </div>

      {showReviewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="market-panel relative w-full max-w-md overflow-hidden shadow-2xl">
            <button onClick={() => setShowReviewModal(false)} className="absolute right-4 top-4 rounded-md p-2 text-gray-400 hover:bg-gray-100">
              <X size={22} />
            </button>

            <div className="p-6">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                  <MessageSquare size={28} />
                </div>
                <h3 className="text-xl font-black text-gray-900">Đánh giá sản phẩm</h3>
                <p className="mt-1 text-sm text-gray-500">Chia sẻ trải nghiệm của bạn với nông dân.</p>
              </div>

              <div className="space-y-5">
                <div className="text-center">
                  <p className="mb-3 text-xs font-black uppercase tracking-wide text-gray-400">Mức độ hài lòng</p>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} onClick={() => setRating(s)} className={s <= rating ? 'text-amber-400' : 'text-gray-200'}>
                        <Star size={32} fill={s <= rating ? 'currentColor' : 'none'} strokeWidth={1.5} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-black uppercase tracking-wide text-gray-400">Nội dung đánh giá</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Sản phẩm tươi ngon, giao hàng đúng hẹn..."
                    className="market-input h-28 w-full resize-none p-3 text-sm"
                  />
                </div>

                <button onClick={handleSubmitReview} disabled={submittingReview} className="market-button h-11 w-full text-sm disabled:opacity-60">
                  {submittingReview ? 'Đang gửi...' : <>Gửi đánh giá <Send size={16} /></>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const buildTimeline = (order) => {
  if (order.status === 'cancelled') {
    return [
      makeTimelineItem('pending', order, true),
      {
        key: 'cancelled',
        label: 'Đơn hàng đã hủy',
        description: 'Đơn hàng không tiếp tục được xử lý.',
        time: order.cancelled_at || order.updated_at || order.created_at,
        active: true,
        current: true,
        icon: XCircle
      }
    ]
  }

  const currentIndex = Math.max(statusOrder.indexOf(order.status), 0)
  return statusOrder.map((status, index) => makeTimelineItem(status, order, index <= currentIndex, index === currentIndex))
}

const makeTimelineItem = (status, order, active, current = false) => {
  const config = statusConfig[status]
  const timestampMap = {
    pending: order.created_at,
    confirmed: order.confirmed_at,
    shipped: order.shipped_at,
    completed: order.completed_at
  }

  const fallbackTime = current && status !== 'pending' ? order.updated_at : null
  const time = timestampMap[status] || fallbackTime

  const descriptions = {
    pending: 'Đơn hàng đã được tạo và gửi đến nông dân.',
    confirmed: 'Nông dân xác nhận đơn hàng và chuẩn bị sản phẩm.',
    shipped: 'Đơn hàng đang trên đường giao đến bạn.',
    completed: 'Đơn hàng đã hoàn tất.'
  }

  return {
    key: status,
    label: config.label,
    description: descriptions[status],
    time,
    active,
    current,
    icon: config.icon
  }
}

const TimelineItem = ({ item, isLast }) => {
  const Icon = item.icon
  return (
    <div className="relative flex gap-4 pb-7 last:pb-0">
      {!isLast && (
        <div className={`absolute left-[17px] top-9 h-full w-0.5 ${item.active ? 'bg-emerald-200' : 'bg-gray-200'}`} />
      )}
      <div className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${
        item.active ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-200 bg-white text-gray-300'
      }`}>
        <Icon size={17} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h3 className={`font-black ${item.active ? 'text-gray-900' : 'text-gray-400'}`}>{item.label}</h3>
          {item.current && <span className="w-fit rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-black uppercase text-emerald-700">Hiện tại</span>}
        </div>
        <p className={`mt-1 text-sm ${item.active ? 'text-gray-600' : 'text-gray-400'}`}>{item.description}</p>
        <p className="mt-2 text-xs font-bold text-gray-400">
          {item.time ? formatDateTime(item.time) : 'Đang chờ cập nhật'}
        </p>
      </div>
    </div>
  )
}

const InfoItem = ({ icon: Icon, title, children }) => (
  <div className="flex gap-3 rounded-md border border-gray-100 bg-gray-50 p-4">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white text-emerald-600">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-gray-400">{title}</p>
      <div className="mt-2">{children}</div>
    </div>
  </div>
)

const PriceRow = ({ label, value, valueClass = 'text-gray-900' }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-gray-500">{label}</span>
    <span className={`font-black ${valueClass}`}>{value}</span>
  </div>
)

const getStatusTone = (status) => {
  const tones = {
    pending: 'border-amber-100 bg-amber-50 text-amber-700',
    confirmed: 'border-blue-100 bg-blue-50 text-blue-700',
    shipped: 'border-indigo-100 bg-indigo-50 text-indigo-700',
    completed: 'border-emerald-100 bg-emerald-50 text-emerald-700',
    cancelled: 'border-rose-100 bg-rose-50 text-rose-700'
  }
  return tones[status] || tones.pending
}

const formatMoney = (value) => `${(value || 0).toLocaleString('vi-VN')}đ`

const formatDateTime = (value) => {
  if (!value) return 'Đang chờ cập nhật'
  return new Date(value).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export default OrderDetail
