import { useState, useEffect } from 'react'
import { X, Package, AlertTriangle, MapPin, CreditCard, Notebook, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { buyerService } from '../../services/buyer.service'
import { supabase } from '../../lib/supabase'
import React from 'react'

const OrderForm = ({ product, initialQuantity, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  
  const currentUnitPrice = product.price_per_unit || product.price || 0

  const [formData, setFormData] = useState({
    quantity: initialQuantity || 1,
    delivery_address: '',
    delivery_province: '',
    delivery_district: '',
    notes: '',
    payment_method: 'cash'
  })

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
    }
    checkUser()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!product || !currentUser) return

    const orderQty = parseFloat(formData.quantity)

    if (currentUser.id === product.farmer_id) {
      return toast.error("Bạn không thể đặt mua sản phẩm của chính mình!")
    }

    if (orderQty > product.quantity) {
      return toast.error(`Kho chỉ còn ${product.quantity} ${product.unit}. Vui lòng giảm số lượng!`)
    }

    if (orderQty < (product.min_order_quantity || 1)) {
      return toast.error(`Số lượng tối thiểu là ${product.min_order_quantity} ${product.unit}`)
    }

    try {
      setLoading(true)
      const orderData = {
        product_id: product.id,
        farmer_id: product.farmer_id,
        quantity: orderQty,
        unit: product.unit,
        unit_price: currentUnitPrice,
        total_amount: orderQty * currentUnitPrice,
        delivery_address: formData.delivery_address,
        delivery_province: formData.delivery_province,
        delivery_district: formData.delivery_district,
        notes: formData.notes,
        payment_method: formData.payment_method
      }

      const result = await buyerService.createOrder(orderData)
      
      if (result.success) {
        toast.success('🎉 Đặt hàng thành công!')
        onSuccess()
        onClose()
      } else {
        toast.error(`Lỗi: ${result.error}`)
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xử lý đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const totalPrice = formData.quantity * currentUnitPrice
  const isOverStock = formData.quantity > product.quantity

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      {/* Overlay với hiệu ứng mờ cao cấp */}
      <div className="fixed inset-0 bg-emerald-900/20 backdrop-blur-md" onClick={onClose} />
      
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] max-w-2xl w-full overflow-hidden transition-all border border-emerald-50">
          
          {/* Header với dải màu nhẹ */}
          <div className="bg-gradient-to-r from-emerald-50 to-white px-8 py-6 border-b border-emerald-100 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Xác nhận đơn hàng</h2>
              <p className="text-emerald-600 text-sm font-semibold">Cảm ơn bạn đã tin chọn nông sản sạch</p>
            </div>
            <button 
              onClick={onClose} 
              className="p-3 hover:bg-white hover:text-red-500 rounded-2xl transition-all border border-transparent hover:border-red-100 text-gray-400"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            {/* Tóm tắt sản phẩm - Đồng bộ Card UI */}
            <div className={`p-4 rounded-3xl border transition-all flex gap-4 items-center ${isOverStock ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
              <div className="h-20 w-20 bg-white rounded-2xl overflow-hidden shadow-sm border border-emerald-50 shrink-0">
                <img src={product.image_url || product.product_images?.[0]?.image_url} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-800 leading-tight">{product.title}</h3>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-emerald-700 font-bold">
                    {currentUnitPrice.toLocaleString()}₫ <span className="text-gray-400 text-sm font-normal">/{product.unit}</span>
                  </span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${isOverStock ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-emerald-100 text-emerald-700'}`}>
                    {isOverStock ? <AlertTriangle size={12} /> : <Package size={12} />}
                    {isOverStock ? 'Vượt quá tồn kho' : `Sẵn có: ${product.quantity} ${product.unit}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Số lượng */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 ml-1">
                   <CheckCircle2 size={16} className="text-emerald-500" /> Số lượng đặt mua
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className={`w-full p-4 bg-gray-50 border-2 rounded-2xl focus:ring-4 transition-all font-black text-xl ${isOverStock ? 'border-red-200 focus:ring-red-500/10 text-red-600' : 'border-transparent focus:border-emerald-500 focus:ring-emerald-500/10 text-gray-900'}`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">{product.unit}</span>
                </div>
              </div>

              {/* Phương thức thanh toán */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 ml-1">
                   <CreditCard size={16} className="text-emerald-500" /> Thanh toán
                </label>
                <select 
                  name="payment_method" 
                  value={formData.payment_method} 
                  onChange={handleChange} 
                  className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 font-bold appearance-none cursor-pointer"
                >
                  <option value="cash">Tiền mặt (COD)</option>
                  <option value="bank">Chuyển khoản</option>
                </select>
              </div>
            </div>

            {/* Địa chỉ - Đồng bộ style input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 ml-1">
                 <MapPin size={16} className="text-emerald-500" /> Thông tin nhận hàng
              </label>
              <textarea 
                name="delivery_address" 
                value={formData.delivery_address} 
                onChange={handleChange} 
                required 
                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 transition-all min-h-[100px]" 
                placeholder="Số nhà, tên đường, tổ/xóm..." 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" 
                name="delivery_district" 
                placeholder="Quận / Huyện" 
                value={formData.delivery_district} 
                onChange={handleChange} 
                required 
                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 font-semibold" 
              />
              <input 
                type="text" 
                name="delivery_province" 
                placeholder="Tỉnh / Thành phố" 
                value={formData.delivery_province} 
                onChange={handleChange} 
                required 
                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 font-semibold" 
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 ml-1">
                 <Notebook size={16} className="text-emerald-500" /> Ghi chú cho nhà vườn
              </label>
              <input 
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Ví dụ: Giao vào giờ hành chính..."
                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 font-semibold"
              />
            </div>

            {/* Footer: Tổng tiền & Nút - Style AgriFlow High-end */}
            <div className="bg-gray-900 rounded-[2rem] p-6 text-white flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl">
              <div className="text-center sm:text-left">
                <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mb-1">Tổng thanh toán</p>
                <p className="text-3xl font-black text-emerald-400 tracking-tighter">
                  {totalPrice.toLocaleString()}₫
                </p>
              </div>
              <button
                type="submit"
                disabled={loading || isOverStock}
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-[0_10px_20px_-5px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:bg-gray-700 disabled:shadow-none transform active:scale-95"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang xử lý...
                  </div>
                ) : 'Xác nhận ngay'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default OrderForm