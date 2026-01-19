import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Heart, Package, MapPin, ShoppingCart, Trash2, 
  ChevronLeft, Star, Leaf
} from 'lucide-react'
import { wishlistService } from '../services/wishlist.service'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../contexts/CartContext'
import toast from 'react-hot-toast'

const Wishlist = () => {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchWishlist()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      const result = await wishlistService.getUserWishlist(user.id)
      
      if (result.success) {
        setWishlistItems(result.data)
      } else {
        toast.error('Không thể tải danh sách yêu thích')
      }
    } catch (error) {
      console.error('Fetch wishlist error:', error)
      toast.error('Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (productId) => {
    try {
      const result = await wishlistService.removeFromWishlist(productId, user.id)
      
      if (result.success) {
        setWishlistItems(wishlistItems.filter(item => item.product_id !== productId))
        toast.success('Đã xóa khỏi danh sách yêu thích')
      } else {
        toast.error('Không thể xóa')
      }
    } catch (error) {
      console.error('Remove error:', error)
      toast.error('Có lỗi xảy ra')
    }
  }

  const handleAddToCart = (product) => {
    if (product.products.quantity <= 0) {
      toast.error('Sản phẩm đã hết hàng')
      return
    }
    
    addToCart(product.products, 1)
    toast.success('Đã thêm vào giỏ hàng')
  }

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN').format(amount)

  const getProductImage = (product) => {
    if (product.products?.product_images?.length > 0) {
      const primaryImage = product.products.product_images.find(img => img.is_primary)
      return primaryImage?.image_url || product.products.product_images[0]?.image_url
    }
    return null
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <Heart size={48} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Vui lòng đăng nhập</h2>
          <p className="text-gray-600 mb-6">Đăng nhập để xem danh sách yêu thích của bạn</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <Link 
            to="/products" 
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold mb-8"
          >
            <ChevronLeft size={18} />
            Quay lại mua sắm
          </Link>

          <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-12 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-pink-100 flex items-center justify-center mx-auto mb-6">
              <Heart size={48} className="text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Danh sách yêu thích trống</h2>
            <p className="text-gray-600 mb-8">Bạn chưa có sản phẩm nào trong danh sách yêu thích</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg"
            >
              <Package size={18} />
              Khám phá sản phẩm
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <Heart className="text-pink-500" size={32} />
                Danh sách yêu thích
              </h1>
              <p className="text-gray-600 mt-2">{wishlistItems.length} sản phẩm</p>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => {
            const product = item.products
            if (!product) return null

            const imageUrl = getProductImage(item)
            const isOutOfStock = product.quantity <= 0

            return (
              <div 
                key={item.id} 
                className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden hover:shadow-xl transition-all group"
              >
                {/* Image */}
                <Link to={`/products/${product.id}`} className="relative block">
                  <div className="h-48 bg-gradient-to-br from-emerald-100 to-emerald-50 overflow-hidden">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <Package className="w-full h-full text-emerald-400 p-8" />
                    )}
                  </div>
                  
                  {isOutOfStock && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      Hết hàng
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleRemove(product.id)
                    }}
                    className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </Link>

                {/* Product Info */}
                <div className="p-5">
                  <Link to={`/products/${product.id}`}>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-emerald-600 transition-colors line-clamp-2">
                      {product.title}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <MapPin size={14} />
                    {product.profiles?.province || product.province}
                  </div>

                  {/* Rating */}
                  {product.average_rating && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            className={star <= Math.round(product.average_rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {product.average_rating} ({product.total_reviews || 0})
                      </span>
                    </div>
                  )}

                  {/* Price & Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <div className="text-xl font-black text-emerald-600">
                        {formatCurrency(product.price_per_unit)}₫
                      </div>
                      <div className="text-xs text-gray-500">/{product.unit}</div>
                    </div>

                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={isOutOfStock}
                      className="p-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Wishlist
