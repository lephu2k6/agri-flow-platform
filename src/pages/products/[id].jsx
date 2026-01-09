import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, ShoppingCart, Heart, Share2, Star, 
  MapPin, Package, Truck, Shield, MessageCircle, 
  Phone, Calendar, Check, Minus, Plus 
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { profile, user } = useAuth()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [showPhone, setShowPhone] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)

  useEffect(() => {
    if (id) {
      fetchProduct()
      fetchRelatedProducts()
      
      // Track view count
      trackViewCount()
    }
  }, [id])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          profiles(id, full_name, phone, province, avatar_url, rating, total_transactions),
          categories(name),
          product_images(image_url, is_primary)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      
      setProduct(data)
      
      // Set first image as selected
      if (data.product_images && data.product_images.length > 0) {
        setSelectedImage(0)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Không tìm thấy sản phẩm')
      navigate('/products')
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          profiles(full_name),
          categories(name),
          product_images(image_url, is_primary)
        `)
        .eq('status', 'available')
        .neq('id', id)
        .limit(4)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRelatedProducts(data || [])
    } catch (error) {
      console.error('Error fetching related products:', error)
    }
  }

  const trackViewCount = async () => {
    try {
      await supabase
        .from('products')
        .update({ view_count: supabase.sql`view_count + 1` })
        .eq('id', id)
    } catch (error) {
      console.error('Error tracking view count:', error)
    }
  }

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng')
      navigate('/login')
      return
    }

    setAddingToCart(true)
    
    try {
      // Check if product already in cart
      const { data: existingCart } = await supabase
        .from('cart_items')
        .select('*')
        .eq('product_id', id)
        .eq('user_id', user.id)
        .single()

      if (existingCart) {
        // Update quantity
        await supabase
          .from('cart_items')
          .update({ quantity: existingCart.quantity + quantity })
          .eq('id', existingCart.id)
      } else {
        // Add new item
        await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: id,
            quantity: quantity,
            price_per_unit: product.price_per_unit
          })
      }

      toast.success(`Đã thêm ${product.title} vào giỏ hàng!`)
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Không thể thêm vào giỏ hàng')
    } finally {
      setAddingToCart(false)
    }
  }

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đặt hàng')
      navigate('/login')
      return
    }

    if (quantity > product.quantity) {
      toast.error('Số lượng đặt vượt quá số lượng có sẵn')
      return
    }

    setPlacingOrder(true)
    
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .insert([{
          buyer_id: user.id,
          product_id: product.id,
          farmer_id: product.farmer_id,
          quantity: quantity,
          unit_price: product.price_per_unit,
          total_amount: quantity * product.price_per_unit,
          buyer_name: profile?.full_name || '',
          buyer_phone: profile?.phone || '',
          status: 'pending'
        }])
        .select()
        .single()

      if (error) throw error

      // Update product quantity
      await supabase
        .from('products')
        .update({ 
          quantity: product.quantity - quantity,
          ...(product.quantity - quantity <= 0 && { status: 'sold_out' })
        })
        .eq('id', product.id)

      toast.success(
        <div className="space-y-2">
          <p className="font-bold">Đặt hàng thành công! 🎉</p>
          <p className="text-sm">Mã đơn hàng: #{order.id.slice(0, 8)}</p>
          <p className="text-sm">Vui lòng chờ người bán xác nhận</p>
        </div>
      )

      // Navigate to orders page
      setTimeout(() => {
        if (profile?.role === 'buyer') {
          navigate('/buyer/orders')
        } else {
          navigate('/orders')
        }
      }, 2000)

    } catch (error) {
      console.error('Error placing order:', error)
      toast.error('Không thể đặt hàng. Vui lòng thử lại!')
    } finally {
      setPlacingOrder(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!product) return null

  const totalPrice = quantity * product.price_per_unit
  const images = product.product_images || []
  const seller = product.profiles

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Quay lại danh sách
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div>
            {/* Main Image */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]?.image_url}
                  alt={product.title}
                  className="w-full h-96 object-contain rounded-lg"
                />
              ) : (
                <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`border-2 rounded-lg overflow-hidden ${
                      selectedImage === index
                        ? 'border-green-500'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div>
            {/* Product Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {product.title}
                  </h1>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(seller?.rating || 4.5)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-gray-600">
                        ({seller?.total_transactions || 0} đánh giá)
                      </span>
                    </div>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600">{product.view_count || 0} lượt xem</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-red-500">
                    <Heart className="h-6 w-6" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-blue-500">
                    <Share2 className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {formatCurrency(product.price_per_unit)}
                  <span className="text-lg text-gray-500">/{product.unit}</span>
                </div>
                <p className="text-gray-600">
                  Còn: <span className="font-bold">{product.quantity}</span> {product.unit}
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Số lượng
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 w-16 text-center font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                      disabled={quantity >= product.quantity}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-gray-600">
                    Tối đa: {product.quantity} {product.unit}
                  </span>
                </div>
              </div>

              {/* Total Price */}
              <div className="mb-6">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="font-medium text-gray-700">Tổng tiền:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.quantity <= 0}
                  className="flex items-center justify-center px-6 py-3 border-2 border-green-500 text-green-500 rounded-lg hover:bg-green-50 disabled:opacity-50"
                >
                  {addingToCart ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500 mr-2"></div>
                      Đang thêm...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Thêm vào giỏ
                    </>
                  )}
                </button>
                
                <button
                  onClick={handlePlaceOrder}
                  disabled={placingOrder || product.quantity <= 0}
                  className="flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  {placingOrder ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    'Đặt hàng ngay'
                  )}
                </button>
              </div>
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Thông tin người bán</h3>
              
              <div className="flex items-start mb-4">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-600 font-semibold text-lg">
                    {seller?.full_name?.charAt(0) || 'N'}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{seller?.full_name || 'Nông dân'}</h4>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{seller?.province || product.province}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(seller?.rating || 4.5)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {seller?.total_transactions || 0} giao dịch
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowPhone(!showPhone)}
                  className="flex items-center justify-center py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  {showPhone ? (seller?.phone || 'Chưa có số') : 'Hiện số điện thoại'}
                </button>
                
                <Link
                  to={`/messages?order=${product.id}`}
                  className="flex items-center justify-center py-2.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Nhắn tin
                </Link>
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Thông tin chi tiết</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Danh mục</p>
                  <p className="font-medium">{product.categories?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Đơn vị tính</p>
                  <p className="font-medium">{product.unit}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Địa điểm</p>
                  <p className="font-medium">{product.province}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <p className={`font-medium ${
                    product.status === 'available' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {product.status === 'available' ? 'Còn hàng' : 'Hết hàng'}
                  </p>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Mô tả sản phẩm</h4>
                  <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
                </div>
              )}

              {/* Quality Standards */}
              {product.quality_standard && (
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Tiêu chuẩn chất lượng</h4>
                  <p className="text-gray-700">{product.quality_standard}</p>
                </div>
              )}

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-sm">Đảm bảo chất lượng</span>
                </div>
                <div className="flex items-center">
                  <Truck className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-sm">Giao hàng linh hoạt</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-sm">Cập nhật mới nhất</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => {
                const primaryImage = relatedProduct.product_images?.find(img => img.is_primary)
                
                return (
                  <Link
                    key={relatedProduct.id}
                    to={`/products/${relatedProduct.id}`}
                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {primaryImage ? (
                      <img
                        src={primaryImage.image_url}
                        alt={relatedProduct.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-2 line-clamp-1">
                        {relatedProduct.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{relatedProduct.province}</span>
                      </div>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(relatedProduct.price_per_unit)}/{relatedProduct.unit}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetail