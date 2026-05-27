import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronRight, ShoppingBag } from 'lucide-react'
import { buyerService } from '../../services/buyer.service'

const statusConfig = {
  pending: { label: 'Chờ xác nhận', color: 'text-amber-700 bg-amber-50 border-amber-100', icon: Clock },
  confirmed: { label: 'Đã xác nhận', color: 'text-blue-700 bg-blue-50 border-blue-100', icon: CheckCircle },
  shipped: { label: 'Đang giao', color: 'text-indigo-700 bg-indigo-50 border-indigo-100', icon: Truck },
  completed: { label: 'Thành công', color: 'text-emerald-700 bg-emerald-50 border-emerald-100', icon: CheckCircle },
  cancelled: { label: 'Đã hủy', color: 'text-rose-700 bg-rose-50 border-rose-100', icon: XCircle }
}

const MyOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const result = await buyerService.getMyOrders()
        if (result.data) {
          setOrders(result.data)
        } else if (result.error) {
          console.error("Lỗi khi tải đơn hàng:", result.error)
        }
      } catch (error) {
        console.error("Lỗi khi tải đơn hàng:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  if (loading) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="mb-4 h-11 w-11 animate-spin rounded-full border-2 border-emerald-100 border-t-emerald-600"></div>
      <p className="font-semibold text-gray-500">Đang tải đơn hàng của bạn...</p>
    </div>
  )

  return (
    <div className="market-surface min-h-screen">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
              <Package size={24} />
            </div>
            <div>
              <h1 className="market-heading text-2xl">Đơn hàng của tôi</h1>
              <p className="text-sm text-gray-500">Theo dõi tiến độ mua hàng và lịch sử giao dịch.</p>
            </div>
          </div>
          <Link to="/products" className="market-button h-10 px-4 text-sm">
            Tiếp tục mua hàng
          </Link>
        </div>

        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="market-panel py-16 text-center">
              <ShoppingBag size={42} className="mx-auto mb-4 text-gray-300" />
              <p className="text-base font-bold text-gray-500">Bạn chưa có đơn hàng nào</p>
              <Link to="/products" className="market-button mt-5 h-10 px-5 text-sm">
                Đi chợ ngay
              </Link>
            </div>
          ) : (
            orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending
              const StatusIcon = status.icon
              const productImage = order.products?.product_images?.[0]?.image_url ||
                order.products?.image_url ||
                'https://via.placeholder.com/150'

              return (
                <Link
                  to={`/buyer/orders/${order.id}`}
                  key={order.id}
                  className="market-panel block p-4 transition hover:border-emerald-200 hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <img
                      src={productImage}
                      alt={order.products?.title}
                      className="h-24 w-24 rounded-md border border-gray-100 object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-black uppercase tracking-wide text-gray-400">#{order.id.slice(0, 8)}</span>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-black uppercase ${status.color}`}>
                          <StatusIcon size={12} /> {status.label}
                        </span>
                      </div>
                      <h3 className="line-clamp-1 text-lg font-black text-gray-900">{order.products?.title}</h3>
                      <p className="mt-1 text-sm font-semibold text-gray-500">
                        Số lượng: <span className="text-gray-900">{order.quantity} {order.products?.unit}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 md:block md:text-right">
                      <p className="text-xl font-black text-emerald-600">{order.total_amount?.toLocaleString()}đ</p>
                      <div className="mt-1 flex items-center text-sm font-bold text-gray-400 md:justify-end">
                        Chi tiết <ChevronRight size={16} className="ml-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default MyOrders
