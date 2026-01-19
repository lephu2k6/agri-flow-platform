import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  ShoppingCart, Trash2, Plus, Minus, Package, 
  MapPin, CreditCard, ArrowRight, ChevronLeft, AlertCircle
} from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { buyerService } from '../services/buyer.service'

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [deliveryInfo, setDeliveryInfo] = useState({
    address: '',
    district: '',
    province: '',
    payment_method: 'cash'
  })

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thanh toán')
      navigate('/login')
      return
    }

    if (cartItems.length === 0) {
      toast.error('Giỏ hàng trống')
      return
    }

    if (!deliveryInfo.address || !deliveryInfo.district || !deliveryInfo.province) {
      toast.error('Vui lòng nhập đầy đủ thông tin giao hàng')
      return
    }

    try {
      setLoading(true)
      
      // Create orders for each item (since they might be from different farmers)
      const orderPromises = cartItems.map(item => 
        buyerService.createOrder({
          product_id: item.product_id,
          farmer_id: item.farmer_id,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.price_per_unit,
          total_amount: item.price_per_unit * item.quantity,
          delivery_address: deliveryInfo.address,
          delivery_province: deliveryInfo.province,
          delivery_district: deliveryInfo.district,
          payment_method: deliveryInfo.payment_method,
          notes: ''
        })
      )

      const results = await Promise.all(orderPromises)
      const failed = results.filter(r => !r.success)
      
      if (failed.length > 0) {
        toast.error(`${failed.length} đơn hàng không thể tạo. Vui lòng kiểm tra lại.`)
        return
      }

      clearCart()
      toast.success('🎉 Đặt hàng thành công!')
      navigate('/buyer/orders')
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Có lỗi xảy ra khi đặt hàng')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN').format(amount)

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-12 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center mx-auto mb-6">
              <ShoppingCart size={48} className="text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Giỏ hàng trống</h2>
            <p className="text-gray-600 mb-8">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg"
            >
              <Package size={18} />
              Mua sắm ngay
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/products" 
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold mb-4"
          >
            <ChevronLeft size={18} />
            Tiếp tục mua sắm
          </Link>
          <h1 className="text-3xl font-black text-gray-900">Giỏ hàng của tôi</h1>
          <p className="text-gray-600 mt-2">{cartItems.length} sản phẩm trong giỏ hàng</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div 
                key={item.product_id} 
                className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6"
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <Link 
                    to={`/products/${item.product_id}`}
                    className="w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-100 to-emerald-50 flex-shrink-0"
                  >
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-full h-full text-emerald-400 p-4" />
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1">
                    <Link to={`/products/${item.product_id}`}>
                      <h3 className="text-lg font-bold text-gray-900 hover:text-emerald-600 transition-colors mb-2">
                        {item.title}
                      </h3>
                    </Link>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <MapPin size={14} />
                      {item.province}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xl font-black text-emerald-600">
                        {formatCurrency(item.price_per_unit)}₫
                        <span className="text-sm font-normal text-gray-500">/{item.unit}</span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-emerald-200 rounded-xl overflow-hidden bg-emerald-50">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            disabled={item.quantity <= item.min_order_quantity}
                            className="w-10 h-10 bg-white hover:bg-emerald-50 flex items-center justify-center text-gray-600 hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-12 text-center font-bold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            disabled={item.quantity >= item.available_quantity}
                            className="w-10 h-10 bg-white hover:bg-emerald-50 flex items-center justify-center text-gray-600 hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {formatCurrency(item.price_per_unit * item.quantity)}₫
                          </div>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {item.quantity >= item.available_quantity && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                        <AlertCircle size={14} />
                        Số lượng tối đa có sẵn: {item.available_quantity} {item.unit}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Clear Cart Button */}
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 font-semibold text-sm"
            >
              Xóa toàn bộ giỏ hàng
            </button>
          </div>

          {/* Checkout Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>

                {/* Delivery Info */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <MapPin size={14} className="inline mr-1" />
                      Địa chỉ giao hàng
                    </label>
                    <textarea
                      value={deliveryInfo.address}
                      onChange={(e) => setDeliveryInfo({...deliveryInfo, address: e.target.value})}
                      placeholder="Số nhà, tên đường..."
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                      rows="2"
                    />
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <input
                        type="text"
                        value={deliveryInfo.district}
                        onChange={(e) => setDeliveryInfo({...deliveryInfo, district: e.target.value})}
                        placeholder="Quận/Huyện"
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                      />
                      <input
                        type="text"
                        value={deliveryInfo.province}
                        onChange={(e) => setDeliveryInfo({...deliveryInfo, province: e.target.value})}
                        placeholder="Tỉnh/TP"
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <CreditCard size={14} className="inline mr-1" />
                      Phương thức thanh toán
                    </label>
                    <select
                      value={deliveryInfo.payment_method}
                      onChange={(e) => setDeliveryInfo({...deliveryInfo, payment_method: e.target.value})}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    >
                      <option value="cash">Tiền mặt (COD)</option>
                      <option value="bank">Chuyển khoản</option>
                    </select>
                  </div>
                </div>

                {/* Summary */}
                <div className="border-t border-gray-200 pt-4 space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính:</span>
                    <span>{formatCurrency(getCartTotal())}₫</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển:</span>
                    <span className="text-emerald-600 font-semibold">Miễn phí</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Tổng cộng:</span>
                    <span className="text-2xl font-black text-emerald-600">
                      {formatCurrency(getCartTotal())}₫
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={loading || !user}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      Thanh toán
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                {!user && (
                  <p className="text-sm text-center text-gray-500 mt-3">
                    <Link to="/login" className="text-emerald-600 hover:underline">
                      Đăng nhập
                    </Link> để thanh toán
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
