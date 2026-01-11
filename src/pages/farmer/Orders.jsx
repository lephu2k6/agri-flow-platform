import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  CheckCircle, Truck, XCircle, Phone, MapPin, Package, 
  User, Clock, DollarSign, ChevronRight, RefreshCw, Eye,
  TrendingUp, ShoppingBag, Calendar, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

const FarmerOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    shipped: 0,
    revenue: 0
  })
  const [activeFilter, setActiveFilter] = useState('all')

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('orders')
        .select('*, products(title, unit, price_per_unit), profiles:buyer_id(full_name, phone, avatar_url)')
        .eq('farmer_id', user?.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setOrders(data || [])
      calculateStats(data || [])
    } catch (error) {
      toast.error('Không thể tải đơn hàng')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (ordersData) => {
    const statsData = {
      total: ordersData.length,
      pending: ordersData.filter(o => o.status === 'pending').length,
      confirmed: ordersData.filter(o => o.status === 'confirmed').length,
      shipped: ordersData.filter(o => o.status === 'shipped').length,
      revenue: ordersData
        .filter(o => ['confirmed', 'shipped', 'completed'].includes(o.status))
        .reduce((sum, o) => sum + (o.total_amount || 0), 0)
    }
    setStats(statsData)
  }

  useEffect(() => { 
    fetchOrders() 
  }, [])

  const updateStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error
      
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle className="text-emerald-600" size={20} />
          <span className="font-semibold">Đã cập nhật trạng thái đơn hàng</span>
        </div>
      )
      fetchOrders()
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái')
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        label: 'Chờ xác nhận', 
        color: 'bg-amber-100 text-amber-700', 
        border: 'border-amber-200',
        icon: Clock 
      },
      confirmed: { 
        label: 'Đã xác nhận', 
        color: 'bg-blue-100 text-blue-700', 
        border: 'border-blue-200',
        icon: CheckCircle 
      },
      shipped: { 
        label: 'Đang giao hàng', 
        color: 'bg-purple-100 text-purple-700', 
        border: 'border-purple-200',
        icon: Truck 
      },
      completed: { 
        label: 'Hoàn thành', 
        color: 'bg-emerald-100 text-emerald-700', 
        border: 'border-emerald-200',
        icon: CheckCircle 
      },
      cancelled: { 
        label: 'Đã hủy', 
        color: 'bg-red-100 text-red-700', 
        border: 'border-red-200',
        icon: XCircle 
      }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold border ${config.color} ${config.border}`}>
        <Icon size={14} />
        {config.label}
      </span>
    )
  }

  const getStatusActions = (status, id) => {
    const actions = {
      pending: [
        { 
          label: 'Xác nhận đơn', 
          onClick: () => updateStatus(id, 'confirmed'),
          color: 'bg-emerald-500 hover:bg-emerald-600',
          icon: CheckCircle
        },
        { 
          label: 'Từ chối', 
          onClick: () => updateStatus(id, 'cancelled'),
          color: 'bg-red-500 hover:bg-red-600',
          icon: XCircle
        }
      ],
      confirmed: [
        { 
          label: 'Bắt đầu giao hàng', 
          onClick: () => updateStatus(id, 'shipped'),
          color: 'bg-blue-500 hover:bg-blue-600',
          icon: Truck
        }
      ],
      shipped: [
        { 
          label: 'Đánh dấu hoàn thành', 
          onClick: () => updateStatus(id, 'completed'),
          color: 'bg-emerald-500 hover:bg-emerald-600',
          icon: CheckCircle
        }
      ]
    }
    
    return actions[status] || []
  }

  const filteredOrders = activeFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeFilter)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
                <p className="text-emerald-100 text-sm">Theo dõi và xử lý đơn hàng từ khách hàng</p>
              </div>
            </div>
            <button
              onClick={fetchOrders}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all"
            >
              <RefreshCw size={18} />
              Làm mới
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-emerald-100">Tổng đơn</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{stats.pending}</div>
              <div className="text-sm text-emerald-100">Chờ xác nhận</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{stats.confirmed}</div>
              <div className="text-sm text-emerald-100">Đã xác nhận</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{stats.shipped}</div>
              <div className="text-sm text-emerald-100">Đang giao</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{formatCurrency(stats.revenue)}</div>
              <div className="text-sm text-emerald-100">Doanh thu</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 -mt-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Lọc đơn hàng</h2>
              <div className="flex flex-wrap gap-2">
                {['all', 'pending', 'confirmed', 'shipped', 'completed', 'cancelled'].map(filter => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeFilter === filter
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter === 'all' ? 'Tất cả' :
                     filter === 'pending' ? 'Chờ xác nhận' :
                     filter === 'confirmed' ? 'Đã xác nhận' :
                     filter === 'shipped' ? 'Đang giao' :
                     filter === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Hiển thị <span className="font-bold text-emerald-600">{filteredOrders.length}</span> đơn hàng
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-dashed border-emerald-200 p-12 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={40} className="text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Không có đơn hàng nào</h3>
            <p className="text-gray-600 mb-6">
              {activeFilter === 'all' 
                ? 'Bạn chưa có đơn hàng nào. Hãy tiếp tục bán sản phẩm!' 
                : `Không có đơn hàng nào ở trạng thái "${activeFilter}"`}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map(order => {
              const actions = getStatusActions(order.status, order.id)
              
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden hover:shadow-xl transition-all">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              {getStatusBadge(order.status)}
                              <span className="text-sm text-gray-500 font-mono">
                                #{order.id.slice(0,8).toUpperCase()}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{order.products?.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Package size={14} />
                                {order.quantity} {order.products?.unit}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign size={14} />
                                {formatCurrency(order.total_amount)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {new Date(order.created_at).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div className="flex items-center gap-4 mt-4 p-4 bg-gray-50 rounded-xl">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center text-emerald-600 font-bold">
                            {order.profiles?.full_name?.charAt(0).toUpperCase() || 'K'}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800">{order.profiles?.full_name}</div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                              <span className="flex items-center gap-1">
                                <Phone size={12} />
                                {order.profiles?.phone}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin size={12} />
                                {order.delivery_address}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions & Price */}
                      <div className="lg:w-64">
                        <div className="text-right mb-4">
                          <div className="text-2xl font-bold text-emerald-600">{formatCurrency(order.total_amount)}</div>
                          <div className="text-sm text-gray-500">Đã bao gồm phí vận chuyển</div>
                        </div>

                        {actions.length > 0 && (
                          <div className="space-y-2">
                            {actions.map((action, index) => {
                              const Icon = action.icon
                              return (
                                <button
                                  key={index}
                                  onClick={action.onClick}
                                  className={`w-full py-3 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl ${action.color}`}
                                >
                                  <Icon size={16} />
                                  {action.label}
                                </button>
                              )
                            })}
                          </div>
                        )}

                        <button className="w-full mt-3 py-2.5 border border-emerald-500 text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2">
                          <Eye size={16} />
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Summary */}
                  <div className="bg-emerald-50 border-t border-emerald-100 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <Truck size={14} className="text-emerald-600" />
                        </div>
                        <div>
                          <div className="text-gray-600">Giao hàng</div>
                          <div className="font-semibold text-gray-800">Miễn phí</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Clock size={14} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="text-gray-600">Thời gian tạo</div>
                          <div className="font-semibold text-gray-800">
                            {new Date(order.created_at).toLocaleTimeString('vi-VN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                          <AlertCircle size={14} className="text-amber-600" />
                        </div>
                        <div>
                          <div className="text-gray-600">Thanh toán</div>
                          <div className="font-semibold text-gray-800">COD khi nhận hàng</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Summary */}
        {!loading && filteredOrders.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-gray-600">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="text-emerald-600" size={20} />
                  <span className="font-semibold">Tổng kết</span>
                </div>
                <p className="text-sm">
                  Hiển thị {filteredOrders.length} đơn hàng • 
                  <span className="font-bold text-emerald-600 ml-2">
                    {formatCurrency(
                      filteredOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
                    )}
                  </span> tổng giá trị
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 border border-emerald-500 text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-colors"
              >
                In danh sách đơn hàng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FarmerOrders