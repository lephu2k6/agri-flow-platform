import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Package, ShoppingBag, DollarSign, TrendingUp, Clock, 
  ChevronRight, Plus, RefreshCw, Star, ArrowUpRight, CheckCircle,
  Leaf, BarChart3, Users, Truck, MapPin, Calendar, TrendingDown
} from 'lucide-react'
import { farmerService } from '../../services/farmer.service'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

const FarmerDashboard = () => {
  const { profile } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('week') // week, month, year

  useEffect(() => {
    if (profile?.id) fetchDashboardData()
  }, [profile?.id, timeRange])

  const fetchDashboardData = async () => {
    setLoading(true)
    const result = await farmerService.getFarmerStats(profile.id, timeRange)
    if (result.success) setStats(result.stats)
    else toast.error(result.error)
    setLoading(false)
  }

  const formatCurrency = (val) => {
    if (!val) return '0 ₫'
    return new Intl.NumberFormat('vi-VN').format(val) + ' ₫'
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
      shipping: 'bg-blue-100 text-blue-700 border-blue-200',
      processing: 'bg-purple-100 text-purple-700 border-purple-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Chờ xác nhận',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
      shipping: 'Đang giao',
      processing: 'Đang xử lý'
    }
    return labels[status] || status
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Leaf className="h-8 w-8 text-white animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-emerald-600 font-semibold">Đang tải dữ liệu...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white">
      {/* Top Gradient Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 pt-8 pb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <Leaf className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-400 rounded-full border-4 border-emerald-700"></div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black">
                  Chào buổi sáng, <span className="text-emerald-200">{profile?.full_name?.split(' ').pop()}! 👋</span>
                </h1>
                <p className="text-emerald-100 mt-2">Cập nhật mới nhất về trang trại của bạn</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={fetchDashboardData}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all"
              >
                <RefreshCw size={18} />
                Làm mới
              </button>
              <Link 
                to="/farmer/products/create"
                className="flex items-center gap-2 bg-white text-emerald-600 px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-50 transition-all shadow-lg"
              >
                <Plus size={20} />
                Đăng sản phẩm mới
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8 pb-12">
        {/* Time Range Selector */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-2 inline-flex border border-emerald-100">
            {['week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
                  timeRange === range
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                {range === 'week' ? 'Tuần này' : 
                 range === 'month' ? 'Tháng này' : 
                 'Năm nay'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard 
            icon={<Package className="text-emerald-600" size={24} />}
            label="Sản phẩm đang bán"
            value={stats?.totalProducts || 0}
            trend={{ value: stats?.productTrend || 0, isPositive: stats?.productTrend > 0 }}
            color="emerald"
          />
          <StatCard 
            icon={<ShoppingBag className="text-blue-600" size={24} />}
            label="Đơn hàng mới"
            value={stats?.totalOrders || 0}
            trend={{ value: stats?.orderTrend || 0, isPositive: stats?.orderTrend > 0 }}
            color="blue"
          />
          <StatCard 
            icon={<DollarSign className="text-purple-600" size={24} />}
            label="Doanh thu"
            value={formatCurrency(stats?.totalRevenue || 0)}
            trend={{ value: stats?.revenueTrend || 0, isPositive: stats?.revenueTrend > 0 }}
            color="purple"
          />
          <StatCard 
            icon={<Users className="text-amber-600" size={24} />}
            label="Khách hàng mới"
            value={stats?.newCustomers || 0}
            trend={{ value: stats?.customerTrend || 0, isPositive: stats?.customerTrend > 0 }}
            color="amber"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingBag className="text-emerald-600" size={20} />
                  Đơn hàng gần đây
                </h2>
                <Link to="/farmer/orders" className="text-emerald-600 font-semibold text-sm hover:text-emerald-700 flex items-center gap-1">
                  Xem tất cả <ChevronRight size={16} />
                </Link>
              </div>
              
              <div className="space-y-3">
                {stats?.recentOrders?.length > 0 ? stats.recentOrders.map(order => (
                  <div 
                    key={order.id} 
                    className="group flex items-center justify-between p-4 bg-gray-50 hover:bg-emerald-50 rounded-xl border border-gray-100 hover:border-emerald-200 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${getStatusColor(order.status).split(' ')[0]} border`}>
                        {order.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : order.status === 'shipping' ? (
                          <Truck className="h-5 w-5" />
                        ) : (
                          <Clock className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900 group-hover:text-emerald-700">
                            #{order.id.slice(0,8).toUpperCase()}
                          </p>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(order.created_at).toLocaleDateString('vi-VN')}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {order.shipping_city || order.shipping_province}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(order.total_amount)}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <span>{order.item_count} sản phẩm</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12 bg-gradient-to-br from-emerald-50 to-sky-50 rounded-2xl border-2 border-dashed border-emerald-200">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="h-8 w-8 text-emerald-400" />
                    </div>
                    <p className="text-gray-600 font-medium">Chưa có đơn hàng nào trong khoảng thời gian này</p>
                    <p className="text-sm text-gray-500 mt-2">Cập nhật sản phẩm để thu hút khách hàng</p>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Chart Area */}
            <div className="mt-8 bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="text-emerald-600" size={20} />
                Hiệu suất bán hàng
              </h3>
              <div className="h-64 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-sky-50 rounded-xl border border-emerald-100">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                  <p className="text-gray-600">Biểu đồ hiệu suất</p>
                  <p className="text-sm text-gray-500">Dữ liệu sẽ hiển thị sau khi có đủ thông tin</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Insights & Quick Actions */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Star className="text-amber-300" size={20} />
                Hành động nhanh
              </h3>
              <div className="space-y-3">
                <QuickActionLink 
                  icon={<Package className="text-emerald-600" />}
                  title="Thêm sản phẩm mới"
                  desc="Mở rộng danh mục sản phẩm"
                  to="/farmer/products/create"
                />
                <QuickActionLink 
                  icon={<TrendingUp className="text-emerald-600" />}
                  title="Xem phân tích"
                  desc="Theo dõi hiệu suất bán hàng"
                  to="/farmer/analytics"
                />
                <QuickActionLink 
                  icon={<Users className="text-emerald-600" />}
                  title="Khách hàng mới"
                  desc="Xem thông tin khách hàng"
                  to="/farmer/customers"
                />
                <QuickActionLink 
                  icon={<Truck className="text-emerald-600" />}
                  title="Quản lý vận chuyển"
                  desc="Cập nhật trạng thái đơn hàng"
                  to="/farmer/shipping"
                />
              </div>
            </div>

            {/* Insights */}
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Thông tin chuyên sâu</h3>
              <div className="space-y-4">
                <InsightItem 
                  title="Tỷ lệ chốt đơn"
                  value="85%"
                  trend="+5.2%"
                  isPositive={true}
                  icon={<CheckCircle className="text-emerald-600" size={16} />}
                />
                <InsightItem 
                  title="Đánh giá trung bình"
                  value="4.8"
                  trend="+0.3"
                  isPositive={true}
                  icon={<Star className="text-amber-600" size={16} />}
                />
                <InsightItem 
                  title="Thời gian xử lý"
                  value="12h"
                  trend="-2h"
                  isPositive={true}
                  icon={<Clock className="text-blue-600" size={16} />}
                />
                <InsightItem 
                  title="Tỷ lệ hủy đơn"
                  value="3.2%"
                  trend="+0.5%"
                  isPositive={false}
                  icon={<TrendingDown className="text-red-600" size={16} />}
                />
              </div>
            </div>

            {/* Farm Status */}
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
                    <Leaf className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">Trạng thái gian hàng</h4>
                    <p className="text-sm text-gray-500">Cập nhật mới nhất</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  stats?.farmStatus === 'active' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {stats?.farmStatus === 'active' ? 'Hoạt động' : 'Tạm nghỉ'}
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Gian hàng của bạn đang tiếp cận <span className="font-bold text-emerald-600">500+</span> khách hàng tiềm năng.
                Duy trì <span className="font-bold text-emerald-600">95%</span> đánh giá tích cực.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ icon, label, value, trend, color }) => {
  const colorClasses = {
    emerald: 'bg-emerald-50 border-emerald-100',
    blue: 'bg-blue-50 border-blue-100',
    purple: 'bg-purple-50 border-purple-100',
    amber: 'bg-amber-50 border-amber-100'
  }

  return (
    <div className={`rounded-2xl border p-6 transition-all hover:shadow-xl hover:-translate-y-1 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          color === 'emerald' ? 'bg-emerald-100' :
          color === 'blue' ? 'bg-blue-100' :
          color === 'purple' ? 'bg-purple-100' : 'bg-amber-100'
        }`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${
            trend.isPositive ? 'text-emerald-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend.value > 0 ? '+' : ''}{trend.value}%
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500 font-medium mb-2">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

const QuickActionLink = ({ icon, title, desc, to }) => (
  <Link 
    to={to}
    className="flex items-center gap-3 p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all group"
  >
    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center group-hover:scale-110 transition-transform">
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <div className="flex-1">
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-emerald-100/70">{desc}</p>
    </div>
    <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
  </Link>
)

const InsightItem = ({ title, value, trend, isPositive, icon }) => (
  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
        isPositive ? 'bg-emerald-50' : 'bg-red-50'
      }`}>
        {icon}
      </div>
      <div>
        <p className="font-medium text-gray-700">{title}</p>
        <p className="text-sm text-gray-500">So với kỳ trước</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className={`text-sm font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
        {trend}
      </p>
    </div>
  </div>
)

export default FarmerDashboard