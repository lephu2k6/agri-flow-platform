import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, MapPin, Package, Calendar } from 'lucide-react'

const OrderDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    const fetchOrder = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, products(*, product_images(*))')
        .eq('id', id).single()
      setOrder(data)
    }
    fetchOrder()
  }, [id])

  if (!order) return <div className="p-10 text-center">Đang tải...</div>

  return (
    <div className="max-w-2xl mx-auto p-6 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 mb-6 hover:text-green-600">
        <ArrowLeft size={20} className="mr-2"/> Quay lại
      </button>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-green-600 p-8 text-white text-center">
          <p className="uppercase text-xs font-bold opacity-80 mb-2">Trạng thái đơn hàng</p>
          <h2 className="text-3xl font-black uppercase italic">{order.status}</h2>
        </div>
        
        <div className="p-8">
           <div className="flex gap-4 mb-8 border-b pb-8">
              <img src={order.products?.product_images?.[0]?.image_url} className="w-24 h-24 rounded-2xl object-cover" />
              <div>
                <h3 className="font-bold text-xl">{order.products?.title}</h3>
                <p className="text-gray-500">Số lượng: {order.quantity} {order.products?.unit}</p>
                <p className="text-2xl font-black text-green-600 mt-1">{order.total_amount?.toLocaleString()}đ</p>
              </div>
           </div>

           <div className="space-y-6">
              <div className="flex gap-4">
                <MapPin className="text-red-500 shrink-0" />
                <div>
                  <p className="font-bold text-gray-800">Địa chỉ nhận hàng</p>
                  <p className="text-gray-600 text-sm">{order.delivery_address}, {order.delivery_district}, {order.delivery_province}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Calendar className="text-blue-500 shrink-0" />
                <div>
                  <p className="font-bold text-gray-800">Thời gian đặt</p>
                  <p className="text-gray-600 text-sm">{new Date(order.created_at).toLocaleString('vi-VN')}</p>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
export default OrderDetail