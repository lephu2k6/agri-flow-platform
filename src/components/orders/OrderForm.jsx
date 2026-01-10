import { useState } from 'react'
import { X, Package, DollarSign, Truck } from 'lucide-react'
import toast from 'react-hot-toast'
import { buyerService } from '../../services/buyer.service'
import React from 'react'
const OrderForm = ({ product, initialQuantity, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    quantity: initialQuantity || 1,
    delivery_address: '',
    delivery_province: '',
    delivery_district: '',
    notes: '',
    payment_method: 'cash'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!product) return
    
    try {
      setLoading(true)
      
      const orderData = {
        product_id: product.id,
        farmer_id: product.farmer_id,
        quantity: parseFloat(formData.quantity),
        unit: product.unit,
        delivery_address: formData.delivery_address,
        delivery_province: formData.delivery_province,
        delivery_district: formData.delivery_district,
        notes: formData.notes,
        payment_method: formData.payment_method
      }

      const result = await buyerService.createOrder(orderData)
      
      if (result.success) {
        toast.success('Đặt hàng thành công!')
        onSuccess()
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Order error:', error)
      toast.error('Có lỗi xảy ra khi đặt hàng')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const totalPrice = formData.quantity * product.price_per_unit

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Đặt hàng</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start">
              <div className="h-16 w-16 bg-gray-200 rounded mr-4 shrink-0">
                {product.images?.[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="h-full w-full object-cover rounded"
                  />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{product.title}</h3>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center">
                    <Package size={16} className="mr-2 text-gray-500" />
                    <span>{product.quantity} {product.unit} còn lại</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign size={16} className="mr-1 text-green-600" />
                    <span className="text-green-600 font-bold">
                      {product.price_per_unit.toLocaleString()}/{product.unit}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng ({product.unit})
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                max={product.quantity}
                required
                className="w-full p-2 border rounded"
              />
              <p className="text-sm text-gray-500 mt-1">
                Đơn hàng tối thiểu: {product.min_order_quantity || 1} {product.unit}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ giao hàng *
              </label>
              <textarea
                name="delivery_address"
                value={formData.delivery_address}
                onChange={handleChange}
                rows={3}
                required
                className="w-full p-2 border rounded"
                placeholder="Số nhà, đường, phường/xã..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tỉnh/Thành phố *
                </label>
                <input
                  type="text"
                  name="delivery_province"
                  value={formData.delivery_province}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quận/Huyện *
                </label>
                <input
                  type="text"
                  name="delivery_district"
                  value={formData.delivery_district}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú cho người bán
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                className="w-full p-2 border rounded"
                placeholder="Yêu cầu đặc biệt, thời gian giao hàng..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phương thức thanh toán
              </label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="cash">Thanh toán khi nhận hàng</option>
                <option value="bank">Chuyển khoản ngân hàng</option>
                <option value="momo">Ví điện tử MoMo</option>
              </select>
            </div>

            {/* Order Summary */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Đơn giá:</span>
                <span>{product.price_per_unit.toLocaleString()} VND/{product.unit}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Số lượng:</span>
                <span>{formData.quantity} {product.unit}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="text-green-600">Liên hệ sau</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between">
                  <span className="font-semibold">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {totalPrice.toLocaleString()} VND
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default OrderForm