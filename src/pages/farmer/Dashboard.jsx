import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Package, ShoppingBag, DollarSign, Clock, ChevronRight,
  Plus, RefreshCw, BarChart3, LayoutDashboard, Star,
  AlertCircle, Calendar, CheckCircle, MessageSquare
} from 'lucide-react'
import { farmerService } from '../../services/farmer.service'
import { reviewService } from '../../services/review.service'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

const FarmerDashboard = () => {
  const { profile } = useAuth()
  const [stats, setStats] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')

  useEffect(() => {
    if (profile?.id) fetchDashboardData()
  }, [profile?.id, period])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const result = await farmerService.getFarmerStats(profile.id, period)
      if (result.success) setStats(result.stats)
      else toast.error(result.error)

      const reviewResult = await reviewService.getFarmerReviews(profile.id)
      if (reviewResult.success) setReviews(reviewResult.data.slice(0, 4))
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(val || 0)

  const formatNumber = (val) => new Intl.NumberFormat('vi-VN').format(val || 0)

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Chờ xác nhận' },
      confirmed: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Đã xác nhận' },
      shipped: { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'Đang giao' },
      completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Hoàn thành' },
      cancelled: { bg: 'bg-rose-50', text: 'text-rose-700', label: 'Đã hủy' }
    }
    return badges[status] || badges.pending
  }

  if (loading) {
    return (
      <div className="market-surface flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 animate-spin rounded-full border-2 border-emerald-100 border-t-emerald-600"></div>
          <p className="mt-4 font-semibold text-gray-500">Đang tải dữ liệu trang trại...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="market-surface min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
              <LayoutDashboard size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                <Calendar size={14} />
                {new Date().toLocaleDateString('vi-VN')}
              </div>
              <h1 className="market-heading mt-1 text-2xl">Xin chào, {profile?.full_name?.split(' ').pop() || 'Nông dân'}</h1>
              <p className="text-sm text-gray-500">Theo dõi doanh thu, đơn hàng và phản hồi khách mua.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-md border border-gray-200 bg-white p-1">
              {['week', 'month', 'quarter', 'year'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`rounded px-3 py-2 text-xs font-bold ${period === p ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  {p === 'week' ? 'Tuần' : p === 'month' ? 'Tháng' : p === 'quarter' ? 'Quý' : 'Năm'}
                </button>
              ))}
            </div>
            <button onClick={fetchDashboardData} className="inline-flex h-10 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-sm font-bold text-gray-600 hover:bg-gray-50">
              <RefreshCw size={16} /> Làm mới
            </button>
            <Link to="/farmer/products/create" className="market-button h-10 px-4 text-sm">
              <Plus size={18} /> Đăng bán mới
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Doanh thu" value={formatCurrency(stats?.totalRevenue)} icon={DollarSign} subtext="Theo kỳ đã chọn" />
          <StatCard title="Đơn hàng" value={formatNumber(stats?.totalOrders)} icon={ShoppingBag} subtext="Tổng số đơn" />
          <StatCard title="Sản phẩm" value={formatNumber(stats?.totalProducts)} icon={Package} subtext="Đang bán" />
          <StatCard title="Đánh giá" value={stats?.rating ? `${stats.rating}/5` : 'Chưa có'} icon={Star} subtext={`${stats?.totalReviews || 0} đánh giá`} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Panel title="Đơn hàng gần đây" icon={Clock} action={<Link to="/farmer/orders" className="text-emerald-600">Xem tất cả</Link>}>
              <div className="divide-y divide-gray-100">
                {stats?.recentOrders?.length > 0 ? (
                  stats.recentOrders.slice(0, 5).map((order) => {
                    const badge = getStatusBadge(order.status)
                    return (
                      <div key={order.id} className="flex flex-col gap-3 px-5 py-4 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                            <ShoppingBag size={20} />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-black text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</span>
                              <span className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase ${badge.bg} ${badge.text}`}>{badge.label}</span>
                            </div>
                            <p className="mt-1 text-xs font-semibold text-gray-500">{new Date(order.created_at).toLocaleDateString('vi-VN')} • {order.quantity} sản phẩm</p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="font-black text-emerald-600">{formatCurrency(order.total_amount)}</p>
                          <p className="text-xs text-gray-400">Khách: {order.profiles?.full_name || 'Đang cập nhật'}</p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <EmptyState icon={ShoppingBag} text="Chưa có đơn hàng nào" />
                )}
              </div>
            </Panel>

            <Panel title="Phản hồi từ khách hàng" icon={Star} action={<span>{reviews.length} phản hồi</span>}>
              <div className="divide-y divide-gray-100">
                {reviews.length > 0 ? reviews.map((review) => (
                  <div key={review.id} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 font-black text-emerald-700">
                        {review.profiles?.full_name?.charAt(0) || 'B'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <h4 className="font-bold text-gray-900">{review.profiles?.full_name}</h4>
                          <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={12} className={s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                          ))}
                        </div>
                        <p className="mt-2 rounded-md bg-gray-50 p-3 text-sm text-gray-600">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <EmptyState icon={MessageSquare} text="Chưa có phản hồi nào" />
                )}
              </div>
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel title="Công cụ nhanh" icon={BarChart3}>
              <div className="space-y-2 p-4">
                <QuickLink to="/farmer/products" icon={Package} label="Quản lý sản phẩm" count={stats?.totalProducts} />
                <QuickLink to="/farmer/orders" icon={ShoppingBag} label="Đơn hàng" count={stats?.totalOrders} badge={stats?.statusDistribution?.pending} />
                <QuickLink to="/chat" icon={MessageSquare} label="Tin nhắn" />
                <QuickLink to="/farmer/products/create" icon={Plus} label="Đăng sản phẩm mới" />
              </div>
            </Panel>

            <Panel title="Tình trạng đơn" icon={CheckCircle}>
              <div className="grid grid-cols-2 gap-3 p-4">
                {Object.entries(stats?.statusDistribution || {}).map(([status, count]) => {
                  const badge = getStatusBadge(status)
                  return (
                    <div key={status} className="rounded-md bg-gray-50 p-3 text-center">
                      <div className={`text-xl font-black ${badge.text}`}>{count}</div>
                      <div className={`mt-1 rounded-full px-2 py-1 text-[11px] font-bold ${badge.bg} ${badge.text}`}>{badge.label}</div>
                    </div>
                  )
                })}
              </div>
            </Panel>

            <Panel title="Gợi ý vận hành" icon={AlertCircle}>
              <div className="space-y-3 p-4 text-sm text-gray-600">
                <Tip title="Cập nhật tồn kho" description="Giữ số lượng sản phẩm chính xác để tránh hủy đơn." />
                <Tip title="Phản hồi nhanh" description="Trả lời tin nhắn sớm giúp tăng tỷ lệ chốt đơn." />
                <Tip title="Ảnh sản phẩm rõ" description="Ảnh thật từ trang trại giúp tăng độ tin cậy." />
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ title, value, icon: Icon, subtext }) => (
  <div className="market-panel p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{title}</p>
        <p className="mt-2 text-2xl font-black text-gray-900">{value}</p>
        <p className="mt-1 text-xs font-semibold text-gray-400">{subtext}</p>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
        <Icon size={22} />
      </div>
    </div>
  </div>
)

const Panel = ({ title, icon: Icon, action, children }) => (
  <div className="market-panel overflow-hidden">
    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
          <Icon size={18} />
        </div>
        <h2 className="font-black text-gray-900">{title}</h2>
      </div>
      <div className="text-xs font-bold text-gray-400">{action}</div>
    </div>
    {children}
  </div>
)

const QuickLink = ({ to, icon: Icon, label, count, badge }) => (
  <Link to={to} className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 p-3 hover:border-emerald-200 hover:bg-white">
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-emerald-600">
        <Icon size={17} />
      </div>
      <span className="font-bold text-gray-700">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {count !== undefined && <span className="text-sm font-bold text-gray-400">{count}</span>}
      {badge > 0 && <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-black text-white">{badge}</span>}
      <ChevronRight size={16} className="text-gray-400" />
    </div>
  </Link>
)

const Tip = ({ title, description }) => (
  <div className="rounded-md bg-gray-50 p-3">
    <h4 className="font-bold text-gray-900">{title}</h4>
    <p className="mt-1 text-xs leading-relaxed text-gray-500">{description}</p>
  </div>
)

const EmptyState = ({ icon: Icon, text }) => (
  <div className="px-5 py-12 text-center">
    <Icon size={34} className="mx-auto mb-3 text-gray-300" />
    <p className="font-semibold text-gray-400">{text}</p>
  </div>
)

export default FarmerDashboard
