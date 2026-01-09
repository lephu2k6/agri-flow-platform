import React from 'react'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Package, ShoppingBag, DollarSign, TrendingUp, 
  Clock, CheckCircle, XCircle, AlertCircle 
} from 'lucide-react'
import { farmerService } from '../../services/farmer.service'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

const FarmerDashboard = () => {
  const { profile } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')

  useEffect(() => {
    if (profile?.id) {
      fetchDashboardData()
    }
  }, [profile?.id, period])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch statistics
      const statsResult = await farmerService.getFarmerStats(profile.id, period)
      
      if (statsResult.success) {
        setStats(statsResult.stats)
        setRecentOrders(statsResult.stats.recentOrders || [])
      } else {
        toast.error(statsResult.error)
      }
    } catch (error) {
      console.error('Fetch dashboard data error:', error)
      toast.error('Không thể tải dữ liệu dashboard')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Xin chào, {profile?.full_name}!</h1>
        <p className="text-gray-600 mt-2">Quản lý hoạt động bán hàng của bạn tại đây</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Sản phẩm đang bán</p>
              <p className="text-2xl font-bold">{stats?.totalProducts || 0}</p>
            </div>
          </div>
          <Link to="/farmer/products" className="text-sm text-green-600 hover:text-green-700 mt-4 block">
            Quản lý sản phẩm →
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng đơn hàng</p>
              <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
            </div>
          </div>
          <Link to="/farmer/orders" className="text-sm text-blue-600 hover:text-blue-700 mt-4 block">
            Xem đơn hàng →
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Doanh thu ({period})</p>
              <p className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</p>
            </div>
          </div>
          <button className="text-sm text-purple-600 hover:text-purple-700 mt-4">
            Xem chi tiết →
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tỉ lệ hoàn thành</p>
              <p className="text-2xl font-bold">
                {stats?.totalOrders ? 
                  Math.round(((stats.statusDistribution?.completed || 0) / stats.totalOrders) * 100) : 0}%
              </p>
            </div>
          </div>
          <div className="text-sm text-gray-500 mt-4">
            {stats?.statusDistribution?.completed || 0} / {stats?.totalOrders || 0} đơn
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Xem thống kê:</span>
          <div className="flex space-x-2">
            {['week', 'month', 'quarter', 'year'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  period === p
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {p === 'week' ? 'Tuần' : 
                 p === 'month' ? 'Tháng' : 
                 p === 'quarter' ? 'Quý' : 'Năm'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Đơn hàng gần đây</h2>
              <Link to="/farmer/orders" className="text-sm text-green-600 hover:text-green-700">
                Xem tất cả →
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Chưa có đơn hàng nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">ĐH#{order.id.slice(0, 8)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status === 'pending' ? 'Chờ xác nhận' :
                             order.status === 'confirmed' ? 'Đã xác nhận' :
                             order.status === 'shipped' ? 'Đang giao' :
                             order.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatCurrency(order.total_amount || 0)} • {new Date(order.created_at).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Người mua</p>
                        <p className="text-sm text-gray-600">Chờ cập nhật</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Thao tác nhanh</h2>
            <div className="space-y-3">
              <Link
                to="/farmer/products/create"
                className="flex items-center justify-between p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
              >
                <div className="flex items-center">
                  <Package className="h-5 w-5 mr-3" />
                  <span>Đăng sản phẩm mới</span>
                </div>
                <span>→</span>
              </Link>

              <Link
                to="/farmer/orders?status=pending"
                className="flex items-center justify-between p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
              >
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3" />
                  <span>Đơn hàng chờ xử lý</span>
                </div>
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {stats?.statusDistribution?.pending || 0}
                </span>
              </Link>

              <Link
                to="/farmer/chats"
                className="flex items-center justify-between p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100"
              >
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-3" />
                  <span>Tin nhắn chưa đọc</span>
                </div>
                <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                  {/* Will be implemented with chat feature */}
                  0
                </span>
              </Link>

              <button
                onClick={fetchDashboardData}
                className="w-full flex items-center justify-center p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                Làm mới dữ liệu
              </button>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Trạng thái đơn hàng</h2>
            <div className="space-y-4">
              {stats?.statusDistribution && Object.entries(stats.statusDistribution).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full mr-3 ${
                      status === 'completed' ? 'bg-green-500' :
                      status === 'confirmed' ? 'bg-blue-500' :
                      status === 'pending' ? 'bg-yellow-500' :
                      status === 'shipped' ? 'bg-purple-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm capitalize">
                      {status === 'pending' ? 'Chờ xác nhận' :
                       status === 'confirmed' ? 'Đã xác nhận' :
                       status === 'shipped' ? 'Đang giao' :
                       status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">{count}</span>
                    <span className="text-sm text-gray-500">
                      ({stats.totalOrders ? Math.round((count / stats.totalOrders) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Đơn hàng thành công</p>
              <p className="text-2xl font-bold mt-2">
                {stats?.statusDistribution?.completed || 0}
              </p>
            </div>
            <CheckCircle className="h-10 w-10 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Đơn hàng đang xử lý</p>
              <p className="text-2xl font-bold mt-2">
                {(stats?.statusDistribution?.pending || 0) + (stats?.statusDistribution?.confirmed || 0)}
              </p>
            </div>
            <Clock className="h-10 w-10 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Đánh giá trung bình</p>
              <p className="text-2xl font-bold mt-2">4.8/5.0</p>
            </div>
            <TrendingUp className="h-10 w-10 opacity-80" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default FarmerDashboard