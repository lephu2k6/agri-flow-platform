import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Package, ShoppingBag, DollarSign, TrendingUp, Clock,
  ChevronRight, Plus, RefreshCw, BarChart3,
  LayoutDashboard, Settings, MoreHorizontal, ArrowUpRight,
  Users, Star, AlertCircle, Calendar, Truck, CheckCircle,
  MessageSquare
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
      // Tải thống kê
      const result = await farmerService.getFarmerStats(profile.id, period)
      if (result.success) setStats(result.stats)
      else toast.error(result.error)

      // Tải đánh giá gần đây
      const reviewResult = await reviewService.getFarmerReviews(profile.id)
      if (reviewResult.success) {
        setReviews(reviewResult.data.slice(0, 4)) // Lấy 4 đánh giá mới nhất
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(val || 0)
  }

  const formatNumber = (val) => {
    return new Intl.NumberFormat('vi-VN').format(val || 0)
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Chờ xác nhận' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Đã xác nhận' },
      shipped: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Đang giao' },
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Hoàn thành' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Đã hủy' }
    }
    return badges[status] || badges.pending
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-emerald-100 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-6 text-emerald-800 font-medium">Đang tải dữ liệu trang trại...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30">
      {/* Header - Premium Gradient */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.1] bg-[length:32px_32px]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl -ml-32 -mb-32"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            {/* Welcome Section */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 flex items-center justify-center shadow-2xl">
                  <LayoutDashboard size={40} className="text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full border-4 border-emerald-800 shadow-lg animate-pulse"></div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-emerald-100 text-sm font-semibold mb-2">
                  <Calendar size={16} />
                  <span>{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  Xin chào, <span className="text-emerald-300">{profile?.full_name?.split(' ').pop() || 'Nông dân'}</span>
                </h1>
                <p className="text-emerald-100/80 mt-2 max-w-xl">
                  Trang trại của bạn đang hoạt động tốt. Cùng xem xét các chỉ số kinh doanh hôm nay!
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-4">
              {/* Period Selector */}
              <div className="flex bg-white/10 backdrop-blur-md rounded-xl p-1 border border-white/20">
                {['week', 'month', 'quarter', 'year'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === p
                      ? 'bg-white text-emerald-800 shadow-lg'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    {p === 'week' ? 'Tuần' : p === 'month' ? 'Tháng' : p === 'quarter' ? 'Quý' : 'Năm'}
                  </button>
                ))}
              </div>

              <button
                onClick={fetchDashboardData}
                className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all group"
                title="Làm mới dữ liệu"
              >
                <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
              </button>

              <Link
                to="/farmer/products/create"
                className="flex items-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Đăng bán mới</span>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <StatCard
              title="Doanh thu"
              value={formatCurrency(stats?.totalRevenue)}
              icon={<DollarSign size={24} />}
              trend="+12.5%"
              color="emerald"
              subtext="So với kỳ trước"
            />
            <StatCard
              title="Đơn hàng"
              value={formatNumber(stats?.totalOrders)}
              icon={<ShoppingBag size={24} />}
              trend="+8.2%"
              color="blue"
              subtext="Tổng số đơn"
            />
            <StatCard
              title="Sản phẩm"
              value={formatNumber(stats?.totalProducts)}
              icon={<Package size={24} />}
              trend="+3"
              color="purple"
              subtext="Đang bán"
            />
            <StatCard
              title="Đánh giá"
              value={stats?.rating ? `${stats.rating}/5` : 'Chưa có'}
              icon={<Star size={24} />}
              trend={stats?.rating > 4.5 ? "+0.3" : null}
              color="amber"
              subtext={`Từ ${stats?.totalReviews || 0} đánh giá`}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Recent Orders */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Orders Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100/50 overflow-hidden">
              <div className="px-6 py-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50/50 to-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md">
                    <Clock size={20} className="text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Đơn hàng gần đây</h2>
                </div>
                <Link
                  to="/farmer/orders"
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  Xem tất cả <ChevronRight size={16} />
                </Link>
              </div>

              <div className="divide-y divide-emerald-50">
                {stats?.recentOrders?.length > 0 ? (
                  stats.recentOrders.slice(0, 5).map((order) => {
                    const badge = getStatusBadge(order.status)
                    return (
                      <div key={order.id} className="p-6 hover:bg-emerald-50/30 transition-colors group">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all">
                              <ShoppingBag size={24} className="text-emerald-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="font-semibold text-gray-800">
                                  #{order.id.slice(0, 8).toUpperCase()}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                                  {badge.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                <span>{new Date(order.created_at).toLocaleDateString('vi-VN')}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span>{order.quantity} sản phẩm</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="text-lg font-bold text-emerald-600">
                              {formatCurrency(order.total_amount)}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              Khách: {order.profiles?.full_name || 'Đang cập nhật'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag size={32} className="text-emerald-300" />
                    </div>
                    <p className="text-gray-500 font-medium">Chưa có đơn hàng nào</p>
                    <p className="text-sm text-gray-400 mt-1">Các đơn hàng mới sẽ xuất hiện tại đây</p>
                  </div>
                )}
              </div>
            </div>

            {/* Buyer Reviews Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100/50 overflow-hidden">
              <div className="px-6 py-5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50/50 to-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-md">
                    <Star size={20} className="text-white fill-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Phản hồi từ khách hàng</h2>
                </div>
                <Link
                  to="/farmer/reviews"
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  Xem tất cả <ChevronRight size={16} />
                </Link>
              </div>

              <div className="divide-y divide-emerald-50/50 grayscale hover:grayscale-0 transition-all duration-700">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 uppercase">
                          {review.profiles?.full_name?.charAt(0) || 'B'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-gray-800">{review.profiles?.full_name}</h4>
                            <span className="text-xs text-gray-400">
                              {new Date(review.created_at).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1 mb-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={12}
                                className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
                              />
                            ))}
                            <span className="text-[10px] text-gray-400 ml-2 italic">đã mua: {review.products?.title}</span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed bg-emerald-50/30 p-3 rounded-xl border border-emerald-50/50 italic">
                            "{review.comment}"
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
                      <MessageSquare size={24} className="text-gray-300" />
                    </div>
                    <p className="text-gray-400 text-sm font-medium">Chưa có phản hồi nào</p>
                  </div>
                )}
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
                  <BarChart3 size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Phân bố trạng thái đơn hàng</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(stats?.statusDistribution || {}).map(([status, count]) => {
                  const badge = getStatusBadge(status)
                  return (
                    <div key={status} className="text-center p-4 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md transition-all">
                      <div className={`text-2xl font-bold ${badge.text}`}>{count}</div>
                      <div className={`text-xs font-medium mt-1 px-2 py-1 rounded-full ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Progress Bar */}
              <div className="mt-6 h-2 bg-gray-100 rounded-full overflow-hidden flex">
                {Object.entries(stats?.statusDistribution || {}).map(([status, count]) => {
                  const total = stats?.totalOrders || 1
                  const percentage = (count / total) * 100
                  const colors = {
                    pending: 'bg-amber-400',
                    confirmed: 'bg-blue-400',
                    shipped: 'bg-purple-400',
                    completed: 'bg-emerald-400',
                    cancelled: 'bg-red-400'
                  }
                  return (
                    <div
                      key={status}
                      className={`${colors[status] || 'bg-gray-400'} h-full`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Tools & Insights */}
          <div className="space-y-8">
            {/* Quick Tools */}
            <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl -ml-20 -mb-20"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                    <Settings size={20} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">Công cụ nhanh</h3>
                </div>

                <div className="space-y-3">
                  <QuickLink
                    to="/farmer/products"
                    icon={<Package size={18} />}
                    label="Quản lý sản phẩm"
                    count={stats?.totalProducts}
                  />
                  <QuickLink
                    to="/farmer/orders"
                    icon={<ShoppingBag size={18} />}
                    label="Đơn hàng"
                    count={stats?.totalOrders}
                    badge={stats?.statusDistribution?.pending}
                  />
                  <QuickLink
                    to="/farmer/chats"
                    icon={<Users size={18} />}
                    label="Tin nhắn"
                    count={3}
                    badge={3}
                  />
                  <QuickLink
                    to="/farmer/stats"
                    icon={<TrendingUp size={18} />}
                    label="Thống kê chi tiết"
                  />
                </div>

                <Link
                  to="/farmer/products/create"
                  className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all font-medium"
                >
                  <Plus size={18} />
                  <span>Đăng sản phẩm mới</span>
                </Link>
              </div>
            </div>

            {/* Business Tips */}
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <AlertCircle size={20} className="text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Mẹo kinh doanh</h3>
              </div>

              <div className="space-y-4">
                <TipItem
                  title="Tối ưu hình ảnh sản phẩm"
                  description="Sản phẩm có ảnh thực tế từ trang trại tăng 40% tỷ lệ chốt đơn"
                />
                <TipItem
                  title="Phản hồi nhanh"
                  description="Trả lời tin nhắn trong vòng 1 giờ giúp tăng uy tín"
                />
                <TipItem
                  title="Cập nhật tồn kho"
                  description="Cập nhật số lượng thường xuyên để tránh hết hàng đột ngột"
                />
              </div>

              <Link
                to="/farmer/guide"
                className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-all font-medium text-sm"
              >
                <Truck size={16} />
                <span>Xem hướng dẫn đầy đủ</span>
              </Link>
            </div>

            {/* Rating Summary Real Data */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star size={24} className="fill-white" />
                  <span className="text-2xl font-bold">{stats?.rating || '0.0'}</span>
                </div>
                <span className="text-amber-100">/5.0</span>
              </div>
              <p className="text-amber-100 mb-2">Đánh giá thực tế từ {stats?.totalReviews || 0} khách hàng</p>
              <div className="text-xs text-amber-100 opacity-70 italic">
                Phản hồi trực tiếp từ người mua nông sản của bạn
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <MetricCard
            title="Tỉ lệ hoàn thành"
            value={`${stats?.totalOrders ? Math.round((stats.statusDistribution?.completed || 0) / stats.totalOrders * 100) : 0}%`}
            subtext={`${stats?.statusDistribution?.completed || 0}/${stats?.totalOrders || 0} đơn`}
            icon={<CheckCircle />}
            color="emerald"
          />
          <MetricCard
            title="Đơn đang xử lý"
            value={(stats?.statusDistribution?.pending || 0) + (stats?.statusDistribution?.confirmed || 0)}
            subtext="Chờ xác nhận & đang giao"
            icon={<Clock />}
            color="amber"
          />
          <MetricCard
            title="Giá trị TB đơn"
            value={formatCurrency(stats?.totalOrders ? stats.totalRevenue / stats.totalOrders : 0)}
            subtext="Trung bình mỗi đơn"
            icon={<DollarSign />}
            color="blue"
          />
          <MetricCard
            title="Sản phẩm tồn kho"
            value={formatNumber(stats?.totalProducts)}
            subtext="Đang được bán"
            icon={<Package />}
            color="purple"
          />
        </div>
      </div>
    </div>
  )
}

// Sub-components
const StatCard = ({ title, value, icon, trend, color, subtext }) => {
  const colors = {
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', trend: 'text-emerald-500' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', trend: 'text-blue-500' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', trend: 'text-purple-500' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600', trend: 'text-amber-500' }
  }
  const style = colors[color] || colors.emerald

  return (
    <div className="bg-white rounded-xl shadow-sm border border-emerald-100/50 p-6 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${style.bg} flex items-center justify-center`}>
          {React.cloneElement(icon, { className: style.text })}
        </div>
        {trend && (
          <div className={`flex items-center text-sm font-medium ${style.trend}`}>
            <ArrowUpRight size={16} className="mr-1" />
            {trend}
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <div className="text-2xl font-bold text-gray-800 mb-1">{value}</div>
      <p className="text-xs text-gray-400">{subtext}</p>
    </div>
  )
}

const QuickLink = ({ to, icon, label, count, badge }) => (
  <Link
    to={to}
    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10"
  >
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
        {React.cloneElement(icon, { className: "text-white" })}
      </div>
      <span className="font-medium">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {count !== undefined && (
        <span className="text-sm text-white/70">{count}</span>
      )}
      {badge > 0 && (
        <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
          {badge}
        </span>
      )}
      <ChevronRight size={16} className="text-white/50" />
    </div>
  </Link>
)

const TipItem = ({ title, description }) => (
  <div className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
    <h4 className="font-medium text-gray-800 text-sm mb-1">{title}</h4>
    <p className="text-xs text-gray-500">{description}</p>
  </div>
)

const MetricCard = ({ title, value, subtext, icon, color }) => {
  const colors = {
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600'
  }
  const style = colors[color] || colors.emerald

  return (
    <div className="bg-white rounded-xl shadow-sm border border-emerald-100/50 p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${style} flex items-center justify-center`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{subtext}</p>
      </div>
    </div>
  )
}

export default FarmerDashboard