import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Package, ShoppingBag, DollarSign, TrendingUp, Clock, 
  ChevronRight, Plus, RefreshCw, Star, ArrowUpRight ,CheckCircle 
} from 'lucide-react'
import { farmerService } from '../../services/farmer.service'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

const FarmerDashboard = () => {
  const { profile } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.id) fetchDashboardData()
  }, [profile?.id])

  const fetchDashboardData = async () => {
    setLoading(true)
    const result = await farmerService.getFarmerStats(profile.id)
    if (result.success) setStats(result.stats)
    else toast.error(result.error)
    setLoading(false)
  }

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(val)

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-50 text-amber-600 border-amber-100',
      completed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      cancelled: 'bg-rose-50 text-rose-600 border-rose-100',
      shipping: 'bg-blue-50 text-blue-600 border-blue-100'
    }
    return colors[status] || 'bg-gray-50 text-gray-600'
  }

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              Chào buổi sáng, <span className="text-emerald-600">{profile?.full_name?.split(' ').pop()}!</span>
            </h1>
            <p className="text-gray-500 font-medium mt-1">Hôm nay trang trại của bạn có gì mới không?</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={fetchDashboardData}
              className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-emerald-600 hover:shadow-md transition-all"
            >
              <RefreshCw size={20} />
            </button>
            <Link 
              to="/farmer/products/create"
              className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-gray-200"
            >
              <Plus size={20} /> Đăng sản phẩm
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Thẻ thống kê High-end */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard 
            icon={<Package size={24} />} 
            label="Tổng sản phẩm" 
            value={stats?.totalProducts || 0} 
            sub="Sản phẩm đang bán"
            color="emerald" 
          />
          <StatCard 
            icon={<ShoppingBag size={24} />} 
            label="Đơn hàng mới" 
            value={stats?.totalOrders || 0} 
            sub="Cần xử lý ngay"
            color="blue" 
          />
          <StatCard 
            icon={<DollarSign size={24} />} 
            label="Doanh thu thực" 
            value={formatCurrency(stats?.totalRevenue || 0)} 
            sub="Đơn đã hoàn thành"
            color="purple" 
          />
          <StatCard 
            icon={<TrendingUp size={24} />} 
            label="Tỷ lệ chốt" 
            value={`${stats?.statusDistribution?.completed || 0}`} 
            sub="Đơn thành công"
            color="orange" 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Bảng đơn hàng gần đây */}
          <div className="lg:col-span-8 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-gray-900">Đơn hàng vừa về</h2>
              <Link to="/farmer/orders" className="text-emerald-600 font-bold text-sm hover:underline flex items-center gap-1">
                Xem tất cả <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="space-y-4">
              {stats?.recentOrders?.length > 0 ? stats.recentOrders.map(order => (
                <div key={order.id} className="group flex items-center justify-between p-5 border border-gray-50 rounded-3xl hover:border-emerald-100 hover:bg-emerald-50/30 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-white transition-colors">
                      <ShoppingBag size={24} />
                    </div>
                    <div>
                      <p className="font-black text-gray-900 group-hover:text-emerald-700 transition-colors">
                        #{order.id.slice(0,8).toUpperCase()}
                      </p>
                      <p className="text-xs font-bold text-gray-400 flex items-center gap-1 mt-1">
                        <Clock size={12} /> {new Date(order.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-black text-gray-900">{formatCurrency(order.total_amount)}</p>
                    <span className={`inline-block mt-1 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                  <p className="text-gray-400 font-medium">Chưa có đơn hàng nào hôm nay</p>
                </div>
              )}
            </div>
          </div>

          {/* Cột phụ: Thao tác & Insight */}
          <div className="lg:col-span-4 space-y-8">
            {/* Quick Actions Card */}
            <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-gray-200">
              <h3 className="text-xl font-bold mb-6 italic text-emerald-400">Tăng trưởng ngay</h3>
              <div className="space-y-4">
                <QuickActionLink 
                  icon={<Star className="text-amber-400" />} 
                  title="Quản lý đánh giá" 
                  desc="Phản hồi khách hàng"
                />
                <QuickActionLink 
                  icon={<TrendingUp className="text-emerald-400" />} 
                  title="Khuyến mãi" 
                  desc="Tạo mã giảm giá mới"
                />
              </div>
            </div>

            {/* Farm Status Mini Card */}
            <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white">
               <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                    <CheckCircle className="text-white" />
                  </div>
                  <ArrowUpRight size={24} className="text-white/50" />
               </div>
               <p className="text-emerald-100 font-bold text-sm uppercase tracking-widest">Trạng thái gian hàng</p>
               <h4 className="text-2xl font-black mt-2">Hoạt động tốt</h4>
               <p className="text-emerald-100/70 text-sm mt-2">Gian hàng của bạn đang tiếp cận hơn 500 khách hàng tiềm năng.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ icon, label, value, sub, color }) => {
  const themes = {
    emerald: 'text-emerald-600 bg-emerald-50',
    blue: 'text-blue-600 bg-blue-50',
    purple: 'text-purple-600 bg-purple-50',
    orange: 'text-orange-600 bg-orange-50'
  }
  
  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all">
      <div className={`h-14 w-14 ${themes[color]} rounded-2xl flex items-center justify-center mb-6`}>
        {icon}
      </div>
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-gray-900 tracking-tight">{value}</p>
      <p className="text-xs font-bold text-gray-400 mt-2 flex items-center gap-1">
        {sub}
      </p>
    </div>
  )
}

const QuickActionLink = ({ icon, title, desc }) => (
  <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 text-left group">
    <div className="p-2 bg-white/10 rounded-xl group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div>
      <p className="font-bold text-sm">{title}</p>
      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{desc}</p>
    </div>
  </button>
)

export default FarmerDashboard