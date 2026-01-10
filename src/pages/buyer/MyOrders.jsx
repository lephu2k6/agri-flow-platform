import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronRight, ShoppingBag } from 'lucide-react'
import { buyerService } from '../../services/buyer.service'

const MyOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await buyerService.getMyOrders()
        if (data) setOrders(data)
      } catch (error) {
        console.error("Lỗi khi tải đơn hàng:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  // Cấu hình màu sắc và icon cho từng trạng thái
  const statusConfig = {
    pending: { label: 'Chờ xác nhận', color: 'text-amber-600 bg-amber-50', icon: <Clock size={14}/> },
    confirmed: { label: 'Đã xác nhận', color: 'text-blue-600 bg-blue-50', icon: <CheckCircle size={14}/> },
    shipped: { label: 'Đang giao', color: 'text-purple-600 bg-purple-50', icon: <Truck size={14}/> },
    completed: { label: 'Thành công', color: 'text-green-600 bg-green-50', icon: <CheckCircle size={14}/> },
    cancelled: { label: 'Đã hủy', color: 'text-red-600 bg-red-50', icon: <XCircle size={14}/> }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
      <p className="text-gray-500 font-bold italic">Đang tải đơn hàng của bạn...</p>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6 py-10">
      {/* Tiêu đề trang */}
      <div className="flex items-center gap-4 mb-10">
        <div className="p-4 bg-green-600 rounded-2xl text-white shadow-xl shadow-green-100">
          <Package size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase italic leading-none">Lịch sử mua hàng</h1>
          <p className="text-gray-500 text-sm mt-1">Theo dõi tiến độ nông sản đang về vườn nhà bạn</p>
        </div>
      </div>

      {/* Danh sách đơn hàng */}
      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200">
            <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Bạn chưa có đơn hàng nào đâu!</p>
            <Link to="/products" className="mt-4 inline-block bg-green-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-green-700 transition-all uppercase tracking-tighter">
              Đi chợ ngay
            </Link>
          </div>
        ) : (
          orders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending
            // Lấy ảnh đầu tiên của sản phẩm
            const productImage = order.products?.product_images?.[0]?.image_url || 'https://via.placeholder.com/150'

            return (
              <Link 
                to={`/buyer/orders/${order.id}`} 
                key={order.id} 
                className="block bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-green-100 transition-all group relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Ảnh sản phẩm */}
                  <div className="relative">
                    <img 
                      src={productImage} 
                      alt={order.products?.title}
                      className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-50 group-hover:scale-105 transition-transform" 
                    />
                    <div className={`absolute -top-2 -left-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 shadow-sm ${status.color}`}>
                      {status.icon} {status.label}
                    </div>
                  </div>

                  {/* Thông tin đơn hàng */}
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-[10px] text-gray-400 font-bold mb-1 tracking-widest uppercase">Mã đơn: #{order.id.slice(0, 8)}</p>
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                      {order.products?.title}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">
                      Số lượng: <span className="text-gray-900 font-bold">{order.quantity} {order.products?.unit}</span>
                    </p>
                  </div>

                  {/* Giá tiền và Nút bấm */}
                  <div className="flex flex-col items-center md:items-end gap-2">
                    <p className="text-2xl font-black text-green-600 tracking-tighter">
                      {order.total_amount?.toLocaleString()}đ
                    </p>
                    <div className="flex items-center text-sm font-bold text-gray-400 group-hover:text-green-600 transition-colors">
                      Chi tiết <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}

export default MyOrders