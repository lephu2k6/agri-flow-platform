import React, { useEffect, useState } from 'react'
import { X, Package, AlertTriangle, MapPin, CreditCard, Notebook, CheckCircle2, User, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import { buyerService } from '../../services/buyer.service'
import { supabase } from '../../lib/supabase'

const OrderForm = ({ product, initialQuantity, selectedQuantity, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  const currentUnitPrice = product.price_per_unit || product.price || 0
  const startQuantity = selectedQuantity || initialQuantity || product.min_order_quantity || 1

  const [formData, setFormData] = useState({
    quantity: startQuantity,
    full_name: '',
    phone_number: '',
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
      return toast.error('Bạn không thể đặt mua sản phẩm của chính mình')
    }

    if (orderQty > product.quantity) {
      return toast.error(`Kho chỉ còn ${product.quantity} ${product.unit}. Vui lòng giảm số lượng.`)
    }

    if (orderQty < (product.min_order_quantity || 1)) {
      return toast.error(`Số lượng tối thiểu là ${product.min_order_quantity || 1} ${product.unit}`)
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
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        delivery_address: formData.delivery_address,
        delivery_province: formData.delivery_province,
        delivery_district: formData.delivery_district,
        notes: formData.notes,
        payment_method: formData.payment_method
      }

      const result = await buyerService.createOrder(orderData)

      if (result.success) {
        if (formData.payment_method === 'vn_pay') {
          try {
            const orderId = result.data[0].id
            const res = await fetch('/api/create_payment_url', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId, amount: orderData.total_amount })
            })
            const vnpayData = await res.json()
            if (vnpayData.url) {
              window.location.href = vnpayData.url
              return
            }
          } catch (err) {
            console.error('VNPAY Error:', err)
            toast.error('Không thể tạo link thanh toán VNPAY')
          }
        }

        toast.success('Đặt hàng thành công')
        onSuccess?.()
        onClose?.()
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

  const totalPrice = Number(formData.quantity || 0) * currentUnitPrice
  const isOverStock = Number(formData.quantity || 0) > product.quantity
  const productImage = product.image_url || product.product_images?.find(img => img.is_primary)?.image_url || product.product_images?.[0]?.image_url

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto">
      <div className="fixed inset-0 bg-gray-900/50" onClick={onClose} />

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="market-panel relative w-full max-w-3xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="text-xl font-black text-gray-900">Xác nhận đơn hàng</h2>
              <p className="mt-1 text-sm text-gray-500">Kiểm tra sản phẩm, thông tin nhận hàng và phương thức thanh toán.</p>
            </div>
            <button onClick={onClose} className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-rose-600">
              <X size={22} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-5">
            <div className={`rounded-md border p-4 ${isOverStock ? 'border-rose-200 bg-rose-50' : 'border-gray-100 bg-gray-50'}`}>
              <div className="flex gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-gray-100 bg-white">
                  {productImage ? <img src={productImage} alt="" className="h-full w-full object-cover" /> : <Package className="h-full w-full p-5 text-gray-300" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 font-black text-gray-900">{product.title}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                    <span className="font-black text-emerald-600">{currentUnitPrice.toLocaleString('vi-VN')}đ/{product.unit}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${isOverStock ? 'bg-rose-100 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {isOverStock ? <AlertTriangle size={12} /> : <Package size={12} />}
                      {isOverStock ? 'Vượt tồn kho' : `Sẵn có: ${product.quantity} ${product.unit}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Số lượng đặt mua" icon={CheckCircle2}>
                <div className="relative">
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    min={product.min_order_quantity || 1}
                    max={product.quantity}
                    onChange={handleChange}
                    className={`market-input h-11 w-full px-3 pr-14 font-black ${isOverStock ? 'border-rose-300 text-rose-700' : ''}`}
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">{product.unit}</span>
                </div>
              </Field>

              <Field label="Thanh toán" icon={CreditCard}>
                <select name="payment_method" value={formData.payment_method} onChange={handleChange} className="market-input h-11 w-full px-3 text-sm font-semibold">
                  <option value="cash">Tiền mặt khi nhận hàng (COD)</option>
                  <option value="vn_pay">Thanh toán qua VNPAY</option>
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Người nhận" icon={User}>
                <input name="full_name" value={formData.full_name} onChange={handleChange} required placeholder="Họ và tên" className="market-input h-11 w-full px-3 text-sm" />
              </Field>
              <Field label="Số điện thoại" icon={Phone}>
                <input name="phone_number" value={formData.phone_number} onChange={handleChange} required placeholder="Số điện thoại" className="market-input h-11 w-full px-3 text-sm" />
              </Field>
            </div>

            <Field label="Thông tin nhận hàng" icon={MapPin}>
              <textarea
                name="delivery_address"
                value={formData.delivery_address}
                onChange={handleChange}
                required
                className="market-input min-h-[92px] w-full resize-none p-3 text-sm"
                placeholder="Số nhà, tên đường, tổ/xóm..."
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input name="delivery_district" value={formData.delivery_district} onChange={handleChange} required placeholder="Quận / Huyện" className="market-input h-11 px-3 text-sm" />
              <input name="delivery_province" value={formData.delivery_province} onChange={handleChange} required placeholder="Tỉnh / Thành phố" className="market-input h-11 px-3 text-sm" />
            </div>

            <Field label="Ghi chú cho người bán" icon={Notebook}>
              <input name="notes" value={formData.notes} onChange={handleChange} placeholder="Ví dụ: Giao vào giờ hành chính..." className="market-input h-11 w-full px-3 text-sm" />
            </Field>

            <div className="flex flex-col gap-4 rounded-md bg-gray-900 p-5 text-white sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-gray-400">Tổng thanh toán</p>
                <p className="mt-1 text-2xl font-black text-emerald-400">{totalPrice.toLocaleString('vi-VN')}đ</p>
              </div>
              <button type="submit" disabled={loading || isOverStock} className="market-button h-11 px-5 text-sm disabled:bg-gray-700 disabled:opacity-60">
                {loading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const Field = ({ label, icon: Icon, children }) => (
  <label className="block">
    <span className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-700">
      <Icon size={16} className="text-emerald-600" /> {label}
    </span>
    {children}
  </label>
)

export default OrderForm
