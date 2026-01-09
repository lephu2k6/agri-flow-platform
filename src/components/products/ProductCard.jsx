import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MessageCircle, Phone, MapPin } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [orderQuantity, setOrderQuantity] = useState(1)
  const [showPhone, setShowPhone] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          profiles(full_name, phone, province, avatar_url),
          categories(name),
          product_images(image_url, is_primary)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      setProduct(data)
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Không tìm thấy sản phẩm')
      navigate('/products')
    } finally {
      setLoading(false)
    }
  }

  const handleOrder = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đặt hàng')
      navigate('/login')
      return
    }

    if (orderQuantity > product.quantity) {
      toast.error('Số lượng đặt vượt quá số lượng có sẵn')
      return
    }

    try {
      const { error } = await supabase
        .from('orders')
        .insert([{
          buyer_id: user.id,
          product_id: product.id,
          farmer_id: product.farmer_id,
          quantity: orderQuantity,
          unit_price: product.price_per_unit,
          buyer_name: profile?.full_name,
          buyer_phone: profile?.phone,
          status: 'pending'
        }])

      if (error) throw error

      // Update product quantity
      await supabase
        .from('products')
        .update({ 
          quantity: product.quantity - orderQuantity,
          ...(product.quantity - orderQuantity <= 0 && { status: 'sold_out' })
        })
        .eq('id', product.id)

      toast.success('Đặt hàng thành công! Vui lòng chờ người bán xác nhận.')
      navigate('/orders')
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Lỗi khi đặt hàng')
    }
  }

  const handleContact = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để liên hệ')
      navigate('/login')
      return
    }
    setShowPhone(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!product) return null

  const primaryImage = product.product_images?.find(img => img.is_primary)
  const totalPrice = orderQuantity * product.price_per_unit

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Quay lại
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            {primaryImage ? (
              <img
                src={primaryImage.image_url}
                alt={product.title}
                className="w-full h-96 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Chưa có ảnh</span>
              </div>
            )}
            
            {/* Thumbnails */}
            {product.product_images && product.product_images.length > 1 && (
              <div className="flex space-x-2 mt-4 overflow-x-auto">
                {product.product_images.map((img, index) => (
                  <img
                    key={index}
                    src={img.image_url}
                    alt={`${product.title} ${index + 1}`}
                    className="w-20 h-20 object-cover rounded cursor-pointer"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.title}
              </h1>
              
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="h-5 w-5 mr-1" />
                <span>{product.province}</span>
                {product.district && <span>, {product.district}</span>}
              </div>

              <div className="text-3xl font-bold text-primary-500 mb-6">
                {product.price_per_unit.toLocaleString()} đ/{product.unit}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số lượng còn: {product.quantity} {product.unit}
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      min="1"
                      max={product.quantity}
                      value={orderQuantity}
                      onChange={(e) => setOrderQuantity(Number(e.target.value))}
                      className="w-32 px-3 py-2 border rounded-lg"
                    />
                    <span className="text-gray-600">{product.unit}</span>
                  </div>
                </div>

                <div className="text-xl font-semibold">
                  Tổng tiền: {totalPrice.toLocaleString()} đ
                </div>

                <button
                  onClick={handleOrder}
                  disabled={product.quantity <= 0 || product.status !== 'available'}
                  className="w-full py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {product.quantity <= 0 ? 'HẾT HÀNG' : 'ĐẶT HÀNG NGAY'}
                </button>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Thông tin người bán</h3>
              
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-primary-600 font-semibold">
                    {product.profiles.full_name?.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium">{product.profiles.full_name}</h4>
                  <p className="text-sm text-gray-600">
                    {product.profiles.province}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleContact}
                  className="w-full flex items-center justify-center py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Nhắn tin
                </button>
                
                {showPhone ? (
                  <a
                    href={`tel:${product.profiles.phone}`}
                    className="w-full flex items-center justify-center py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    {product.profiles.phone}
                  </a>
                ) : (
                  <button
                    onClick={() => setShowPhone(true)}
                    className="w-full flex items-center justify-center py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    Hiển thị số điện thoại
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Mô tả sản phẩm</h3>
              <div className="prose max-w-none">
                {product.description ? (
                  <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
                ) : (
                  <p className="text-gray-500 italic">Chưa có mô tả</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail