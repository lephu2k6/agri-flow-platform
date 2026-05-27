import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import {
  CheckCircle, Truck, XCircle, Phone, MapPin, Package,
  User, Clock, DollarSign, RefreshCw, Eye, TrendingUp,
  ShoppingBag, Calendar
} from 'lucide-react'
import toast from 'react-hot-toast'

const statusConfig = {
  pending: { label: 'Chờ xác nhận', color: 'bg-amber-50 text-amber-700 border-amber-100', icon: Clock },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-50 text-blue-700 border-blue-100', icon: CheckCircle },
  shipped: { label: 'Đang giao hàng', color: 'bg-indigo-50 text-indigo-700 border-indigo-100', icon: Truck },
  completed: { label: 'Hoàn thành', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle },
  cancelled: { label: 'Đã hủy', color: 'bg-rose-50 text-rose-700 border-rose-100', icon: XCircle }
}

const FarmerOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, shipped: 0, revenue: 0 })
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)

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
    setStats({
      total: ordersData.length,
      pending: ordersData.filter(o => o.status === 'pending').length,
      confirmed: ordersData.filter(o => o.status === 'confirmed').length,
      shipped: ordersData.filter(o => o.status === 'shipped').length,
      revenue: ordersData
        .filter(o => ['confirmed', 'shipped', 'completed'].includes(o.status))
        .reduce((sum, o) => sum + (o.total_amount || 0), 0)
    })
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const updateStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      toast.success('Đã cập nhật trạng thái đơn hàng')
      fetchOrders()
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái')
    }
  }

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-black uppercase ${config.color}`}>
        <Icon size={12} /> {config.label}
      </span>
    )
  }

  const getStatusActions = (status, id) => {
    const actions = {
      pending: [
        { label: 'Xác nhận đơn', onClick: () => updateStatus(id, 'confirmed'), className: 'bg-emerald-600 hover:bg-emerald-700', icon: CheckCircle },
        { label: 'Từ chối', onClick: () => updateStatus(id, 'cancelled'), className: 'bg-rose-600 hover:bg-rose-700', icon: XCircle }
      ],
      confirmed: [
        { label: 'Bắt đầu giao', onClick: () => updateStatus(id, 'shipped'), className: 'bg-blue-600 hover:bg-blue-700', icon: Truck }
      ],
      shipped: [
        { label: 'Hoàn thành', onClick: () => updateStatus(id, 'completed'), className: 'bg-emerald-600 hover:bg-emerald-700', icon: CheckCircle }
      ]
    }
    return actions[status] || []
  }

  const filteredOrders = activeFilter === 'all' ? orders : orders.filter(order => order.status === activeFilter)
  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN').format(amount || 0) + 'đ'

  return (
    <div className="market-surface min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
              <ShoppingBag size={24} />
            </div>
            <div>
              <h1 className="market-heading text-2xl">Quản lý đơn hàng</h1>
              <p className="text-sm text-gray-500">Theo dõi và xử lý đơn hàng từ khách mua.</p>
            </div>
          </div>
          <button onClick={fetchOrders} className="inline-flex h-10 items-center gap-2 rounded-md border border-gray-200 bg-white px-4 text-sm font-bold text-gray-600 hover:bg-gray-50">
            <RefreshCw size={16} /> Làm mới
          </button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <Metric label="Tổng đơn" value={stats.total} />
          <Metric label="Chờ xác nhận" value={stats.pending} />
          <Metric label="Đã xác nhận" value={stats.confirmed} />
          <Metric label="Đang giao" value={stats.shipped} />
          <Metric label="Doanh thu" value={formatCurrency(stats.revenue)} />
        </div>

        <div className="market-panel mb-6 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-black text-gray-900">Lọc đơn hàng</h2>
              <p className="text-sm text-gray-500">Hiển thị {filteredOrders.length} đơn hàng</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'confirmed', 'shipped', 'completed', 'cancelled'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`h-9 rounded-md px-3 text-xs font-black uppercase ${
                    activeFilter === filter
                      ? 'bg-emerald-600 text-white'
                      : 'border border-gray-200 bg-white text-gray-500 hover:border-emerald-200 hover:text-emerald-700'
                  }`}
                >
                  {filter === 'all' ? 'Tất cả' : statusConfig[filter].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, index) => <div key={index} className="market-panel h-28 animate-pulse bg-white" />)}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="market-panel p-12 text-center">
            <ShoppingBag size={40} className="mx-auto mb-3 text-gray-300" />
            <h3 className="font-black text-gray-700">Không có đơn hàng nào</h3>
            <p className="mt-1 text-sm text-gray-500">Các đơn hàng mới sẽ xuất hiện tại đây.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => {
              const actions = getStatusActions(order.status, order.id)
              return (
                <div key={order.id} className="market-panel overflow-hidden">
                  <div className="p-5">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          {getStatusBadge(order.status)}
                          <span className="font-mono text-xs font-bold uppercase text-gray-400">#{order.id.slice(0, 8)}</span>
                        </div>
                        <h3 className="text-lg font-black text-gray-900">{order.products?.title}</h3>
                        <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold text-gray-600">
                          <span className="flex items-center gap-1"><Package size={14} /> {order.quantity} {order.products?.unit}</span>
                          <span className="flex items-center gap-1"><DollarSign size={14} /> {formatCurrency(order.total_amount)}</span>
                          <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(order.created_at).toLocaleDateString('vi-VN')}</span>
                        </div>

                        <div className="mt-4 flex items-start gap-3 rounded-md bg-gray-50 p-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 font-black text-emerald-700">
                            {order.profiles?.full_name?.charAt(0).toUpperCase() || 'K'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-gray-900">{order.profiles?.full_name || 'Khách hàng'}</div>
                            <div className="mt-1 flex flex-wrap gap-3 text-xs font-semibold text-gray-500">
                              <span className="flex items-center gap-1"><Phone size={12} /> {order.profiles?.phone || 'N/A'}</span>
                              <span className="flex items-center gap-1"><MapPin size={12} /> {order.delivery_address}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="w-full lg:w-64">
                        <div className="mb-3 lg:text-right">
                          <div className="text-xl font-black text-emerald-600">{formatCurrency(order.total_amount)}</div>
                          <div className="text-xs text-gray-400">COD khi nhận hàng</div>
                        </div>
                        <div className="space-y-2">
                          {actions.map((action, index) => {
                            const Icon = action.icon
                            return (
                              <button key={index} onClick={action.onClick} className={`flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-bold text-white ${action.className}`}>
                                <Icon size={16} /> {action.label}
                              </button>
                            )
                          })}
                          <button onClick={() => setSelectedOrder(order)} className="flex w-full items-center justify-center gap-2 rounded-md border border-emerald-200 px-4 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-50">
                            <Eye size={16} /> Xem chi tiết
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && filteredOrders.length > 0 && (
          <div className="market-panel mt-6 flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-gray-600">
              <div className="mb-1 flex items-center gap-2 font-bold text-gray-900">
                <TrendingUp className="text-emerald-600" size={18} /> Tổng kết
              </div>
              {filteredOrders.length} đơn • <span className="font-black text-emerald-600">{formatCurrency(filteredOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0))}</span>
            </div>
            <button onClick={() => window.print()} className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50">
              In danh sách
            </button>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/50" onClick={() => setSelectedOrder(null)} />
          <div className="market-panel relative max-h-[90vh] w-full max-w-2xl overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="font-black text-gray-900">Chi tiết đơn hàng</h3>
                  <p className="font-mono text-xs text-gray-400">#{selectedOrder.id.toUpperCase()}</p>
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="rounded-md p-2 text-gray-400 hover:bg-gray-100">
                <XCircle size={22} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="rounded-md border border-gray-100 bg-gray-50 p-4">
                <div className="mb-2 text-xs font-black uppercase text-gray-400">Trạng thái</div>
                {getStatusBadge(selectedOrder.status)}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoBlock title="Sản phẩm" icon={ShoppingBag}>
                  <p className="font-black text-gray-900">{selectedOrder.products?.title}</p>
                  <p className="mt-1 text-sm text-gray-500">{selectedOrder.quantity} {selectedOrder.products?.unit} x {formatCurrency(selectedOrder.products?.price_per_unit || 0)}</p>
                  <p className="mt-3 border-t border-gray-100 pt-3 font-black text-emerald-600">{formatCurrency(selectedOrder.total_amount)}</p>
                </InfoBlock>

                <InfoBlock title="Khách hàng" icon={User}>
                  <p className="font-black text-gray-900">{selectedOrder.profiles?.full_name}</p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-gray-600"><Phone size={14} /> {selectedOrder.profiles?.phone}</p>
                  <p className="mt-2 flex items-start gap-2 text-sm text-gray-600"><MapPin size={14} className="mt-0.5" /> {selectedOrder.delivery_address}</p>
                </InfoBlock>
              </div>

              {selectedOrder.note && (
                <div className="rounded-md border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
                  <span className="font-black">Ghi chú:</span> {selectedOrder.note}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-gray-100 bg-gray-50 p-5">
              <button onClick={() => setSelectedOrder(null)} className="rounded-md px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200">
                Đóng
              </button>
              {getStatusActions(selectedOrder.status, selectedOrder.id).map((action, index) => {
                const Icon = action.icon
                return (
                  <button key={index} onClick={() => { action.onClick(); setSelectedOrder(null) }} className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold text-white ${action.className}`}>
                    <Icon size={16} /> {action.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const Metric = ({ label, value }) => (
  <div className="market-panel p-4">
    <div className="text-xs font-bold uppercase tracking-wide text-gray-400">{label}</div>
    <div className="mt-2 text-xl font-black text-gray-900">{value}</div>
  </div>
)

const InfoBlock = ({ title, icon: Icon, children }) => (
  <div className="rounded-md border border-gray-100 bg-white p-4">
    <h4 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-gray-400">
      <Icon size={14} /> {title}
    </h4>
    {children}
  </div>
)

export default FarmerOrders
