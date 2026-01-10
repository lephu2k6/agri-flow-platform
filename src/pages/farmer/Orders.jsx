import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { CheckCircle, Truck, XCircle, Phone, MapPin, Package } from 'lucide-react'
import toast from 'react-hot-toast'

const FarmerOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('orders')
      .select('*, products(title, unit), profiles:buyer_id(full_name, phone)')
      .eq('farmer_id', user?.id)
      .order('created_at', { ascending: false })
    
    if (data) setOrders(data)
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [])

  const updateStatus = async (id, status) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (!error) {
      toast.success('Cập nhật trạng thái thành công')
      fetchOrders()
    }
  }

  if (loading) return <div className="p-10 text-center">Đang tải đơn hàng...</div>

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><Package className="text-green-600"/> Đơn hàng khách đặt</h1>
      <div className="grid gap-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col md:flex-row justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded uppercase">{order.status}</span>
                <span className="text-gray-400 text-xs italic">#{order.id.slice(0,8)}</span>
              </div>
              <h3 className="font-bold text-lg">{order.products?.title}</h3>
              <p className="text-gray-600">Số lượng: {order.quantity} {order.products?.unit}</p>
              <div className="mt-3 text-sm space-y-1">
                <p className="flex items-center gap-2"><Phone size={14}/> {order.profiles?.full_name}: {order.profiles?.phone}</p>
                <p className="flex items-center gap-2 text-gray-500"><MapPin size={14}/> {order.delivery_address}, {order.delivery_district}</p>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-2 md:w-48">
              <p className="text-xl font-black text-green-600 text-right mb-2">{order.total_amount?.toLocaleString()}đ</p>
              {order.status === 'pending' && (
                <button onClick={() => updateStatus(order.id, 'confirmed')} className="bg-green-600 text-white py-2 rounded-lg font-bold text-sm">Xác nhận đơn</button>
              )}
              {order.status === 'confirmed' && (
                <button onClick={() => updateStatus(order.id, 'shipped')} className="bg-blue-600 text-white py-2 rounded-lg font-bold text-sm">Giao hàng</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
export default FarmerOrders