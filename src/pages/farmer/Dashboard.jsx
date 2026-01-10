import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, ShoppingBag, DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react'
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

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Xin chào, {profile?.full_name}!</h1>
        <p className="text-gray-600">Đây là tình hình kinh doanh nông sản của bạn.</p>
      </div>

      {/* Thẻ thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Package className="text-green-600"/>} label="Sản phẩm" value={stats?.totalProducts} color="bg-green-100" />
        <StatCard icon={<ShoppingBag className="text-blue-600"/>} label="Đơn hàng" value={stats?.totalOrders} color="bg-blue-100" />
        <StatCard icon={<DollarSign className="text-purple-600"/>} label="Doanh thu" value={formatCurrency(stats?.totalRevenue || 0)} color="bg-purple-100" />
        <StatCard icon={<TrendingUp className="text-orange-600"/>} label="Hoàn thành" value={`${stats?.statusDistribution?.completed || 0} đơn`} color="bg-orange-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bảng đơn hàng gần đây */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6">Đơn hàng mới nhất</h2>
          <div className="space-y-4">
            {stats?.recentOrders?.length > 0 ? stats.recentOrders.map(order => (
              <div key={order.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-medium text-green-700">Mã đơn: #{order.id.slice(0,8)}</p>
                  <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(order.total_amount)}</p>
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">{order.status}</span>
                </div>
              </div>
            )) : <p className="text-gray-500 text-center py-4">Chưa có đơn hàng nào.</p>}
          </div>
        </div>

        {/* Thao tác nhanh */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Thao tác nhanh</h2>
          <div className="space-y-3">
            <Link to="/farmer/products/create" className="w-full flex items-center p-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Package className="mr-2 h-5 w-5"/> Đăng sản phẩm mới
            </Link>
            <button onClick={fetchDashboardData} className="w-full flex items-center p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              <Clock className="mr-2 h-5 w-5"/> Làm mới dữ liệu
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 flex items-center">
    <div className={`h-12 w-12 ${color} rounded-lg flex items-center justify-center mr-4`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
)

export default FarmerDashboard