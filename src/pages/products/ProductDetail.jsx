import { useState, useEffect } from 'react'
import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ShoppingCart, MapPin, Package, User, MessageCircle, Truck, Shield, Clock, Leaf, ChevronLeft, Star, CheckCircle, Heart
} from 'lucide-react'
import toast from 'react-hot-toast'

import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../contexts/CartContext'
import { supabase } from '../../lib/supabase'
import { wishlistService } from '../../services/wishlist.service'
import ProductImageGallery from '../../components/products/ProductImageGallery'
import ProductVideo from '../../components/products/ProductVideo'
import OrderForm from '../../components/orders/OrderForm'
import ChatButton from '../../components/chat/ChatButton'

const PublicProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [farmerStats, setFarmerStats] = useState(null)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  useEffect(() => {
    if (id) {
      fetchProductDetails()
    }
  }, [id])

  useEffect(() => {
    if (product?.profiles?.id) {
      fetchFarmerStats()
    }
  }, [product?.profiles?.id])

  useEffect(() => {
    if (product?.id && user?.id) {
      checkWishlist()
    }
  }, [product?.id, user?.id])

  const checkWishlist = async () => {
    if (!user || !product?.id) return
    const result = await wishlistService.isInWishlist(product.id, user.id)
    if (result.success) {
      setIsInWishlist(result.isInWishlist)
    }
  }

  const handleWishlistToggle = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    setWishlistLoading(true)
    try {
      if (isInWishlist) {
        const result = await wishlistService.removeFromWishlist(product.id, user.id)
        if (result.success) {
          setIsInWishlist(false)
          toast.success('Đã xóa khỏi danh sách yêu thích')
        }
      } else {
        const result = await wishlistService.addToWishlist(product.id, user.id)
        if (result.success) {
          setIsInWishlist(true)
          toast.success('Đã thêm vào danh sách yêu thích')
        }
      }
    } catch (error) {
      console.error('Wishlist toggle error:', error)
      toast.error('Có lỗi xảy ra')
    } finally {
      setWishlistLoading(false)
    }
  }

  const fetchProductDetails = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          profiles:farmer_id (
            id, 
            full_name, 
            province,
            avatar_url,
            phone
          ),
          product_images (
            id, 
            image_url, 
            is_primary
          ),
          categories:category_id (
            name,
            icon
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      
      setProduct(data)
      setSelectedQuantity(data.min_order_quantity || 1)

    } catch (error) {
      console.error('Fetch error:', error.message)
      toast.error('Không thể tải sản phẩm')
      navigate('/products')
    } finally {
      setLoading(false)
    }
  }

  const fetchFarmerStats = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('id, status')
        .eq('farmer_id', product.profiles.id)
        .eq('status', 'available')

      setFarmerStats({
        activeProducts: data?.length || 0
      })
    } catch (error) {
      console.error('Failed to fetch farmer stats:', error)
    }
  }

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN').format(amount)

  const calculateTotal = () => {
    return selectedQuantity * product.price_per_unit
  }

  const getHarvestBadge = () => {
    if (!product.harvest_date) return null
    
    const harvestDate = new Date(product.harvest_date)
    const now = new Date()
    const diffDays = Math.floor((harvestDate - now) / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 3 && diffDays >= 0) {
      return (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
          <Clock size={14} className="text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-700">Thu hoạch trong {diffDays} ngày</span>
        </div>
      )
    }
    return null
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Gallery Skeleton */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="h-96 bg-gradient-to-r from-emerald-100 to-emerald-50 rounded-xl animate-pulse"></div>
            </div>
          </div>
          {/* Product Info Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (!product) return null

  const sortedImages = product.product_images?.sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0)) || []

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white">
      {showOrderForm && (
        <OrderForm
          product={product}
          selectedQuantity={selectedQuantity}
          onClose={() => setShowOrderForm(false)}
          onSuccess={() => {
            setShowOrderForm(false)
            toast.success('🎉 Gửi yêu cầu mua hàng thành công!')
          }}
        />
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-emerald-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/products" className="hover:text-emerald-600 flex items-center gap-1">
              <ChevronLeft size={16} />
              Chợ Nông Sản
            </Link>
            <span className="text-gray-300">/</span>
            <Link to={`/products?category=${product.category_id}`} className="hover:text-emerald-600">
              {product.categories?.name}
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-800 font-medium truncate">{product.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Gallery & Description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Gallery */}
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
              <ProductImageGallery images={sortedImages} />
            </div>

            {/* Product Video */}
            {product.video_url && (
              <ProductVideo videoUrl={product.video_url} title="Video giới thiệu sản phẩm" />
            )}

            {/* Product Details */}
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-emerald-100">
                Thông tin sản phẩm
              </h2>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Leaf size={20} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Danh mục</p>
                      <p className="font-semibold text-gray-800">{product.categories?.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center">
                      <Package size={20} className="text-sky-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Đơn vị tính</p>
                      <p className="font-semibold text-gray-800">{product.unit}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                      <Shield size={20} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Chất lượng</p>
                      <p className="font-semibold text-gray-800">
                        {product.quality_standard || 'Loại A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                      <Truck size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Vận chuyển</p>
                      <p className="font-semibold text-emerald-600">Miễn phí</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Mô tả sản phẩm</h3>
                <div className="prose prose-emerald max-w-none">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {product.description || 'Sản phẩm chất lượng cao, thu hoạch theo tiêu chuẩn an toàn thực phẩm.'}
                  </p>
                </div>
              </div>

              {/* Harvest Badge */}
              {getHarvestBadge() && (
                <div className="mt-6">
                  {getHarvestBadge()}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Purchase Info */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Purchase Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden mb-6">
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">{product.title}</h1>
                  
                  {/* Price Section */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl font-black text-emerald-600">
                        {formatCurrency(product.price_per_unit)}
                        <span className="text-lg font-semibold text-gray-500">₫</span>
                      </span>
                      <span className="text-gray-500 text-sm">/{product.unit}</span>
                    </div>
                    <p className="text-sm text-gray-500">Giá đã bao gồm VAT</p>
                  </div>

                  {/* Stats */}
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">Tồn kho</div>
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-emerald-500" />
                        <span className="font-bold text-gray-800">
                          {product.quantity} {product.unit}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">Đơn tối thiểu</div>
                      <div className="font-bold text-gray-800">
                        {product.min_order_quantity || 1} {product.unit}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Selector */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-700">Số lượng</span>
                      <span className="text-sm text-gray-500">Tổng: {formatCurrency(calculateTotal())}₫</span>
                    </div>
                    <div className="flex items-center border border-emerald-200 rounded-xl overflow-hidden bg-emerald-50">
                      <button 
                        onClick={() => setSelectedQuantity(q => Math.max(product.min_order_quantity || 1, q - 1))}
                        className="w-12 h-12 bg-white hover:bg-emerald-50 flex items-center justify-center text-gray-600 hover:text-emerald-600 border-r border-emerald-200 text-lg font-bold"
                      >
                        -
                      </button>
                      <div className="flex-1 text-center">
                        <span className="text-xl font-bold text-gray-800">{selectedQuantity}</span>
                        <span className="text-sm text-gray-500 ml-1">{product.unit}</span>
                      </div>
                      <button 
                        onClick={() => setSelectedQuantity(q => Math.min(product.quantity, q + 1))}
                        className="w-12 h-12 bg-white hover:bg-emerald-50 flex items-center justify-center text-gray-600 hover:text-emerald-600 border-l border-emerald-200 text-lg font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => user ? setShowOrderForm(true) : navigate('/login')}
                      className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:scale-95"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <ShoppingCart size={20} />
                        MUA NGAY
                      </div>
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          if (!user) {
                            navigate('/login')
                            return
                          }
                          addToCart(product, selectedQuantity)
                        }}
                        className="py-3 bg-white border-2 border-emerald-500 text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={18} />
                        Giỏ hàng
                      </button>
                      
                      <button
                        onClick={handleWishlistToggle}
                        disabled={wishlistLoading}
                        className={`py-3 border-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                          isInWishlist
                            ? 'bg-pink-50 border-pink-500 text-pink-600 hover:bg-pink-100'
                            : 'bg-white border-emerald-500 text-emerald-600 hover:bg-emerald-50'
                        } disabled:opacity-50`}
                      >
                        <Heart size={18} className={isInWishlist ? 'fill-pink-500' : ''} />
                        {isInWishlist ? 'Đã thích' : 'Yêu thích'}
                      </button>
                    </div>
                    
                    <div className="w-full">
                      <ChatButton
                        farmerId={product.farmer_id}
                        buyerId={user?.id}
                        productId={product.id}
                        productTitle={product.title}
                        className="w-full py-3"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Farmer Info Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center text-emerald-600 font-bold text-xl">
                      {product.profiles?.full_name?.charAt(0).toUpperCase() || 'N'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-800">{product.profiles?.full_name}</h3>
                      {product.profiles?.verification_status === 'verified' && (
                        <Shield size={14} className="text-emerald-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <MapPin size={14} />
                      {product.profiles?.province}
                    </div>
                  </div>
                </div>

                {/* Farmer Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-emerald-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-emerald-600">{farmerStats?.activeProducts || 0}</div>
                    <div className="text-xs text-gray-600">Sản phẩm</div>
                  </div>
                  <div className="bg-sky-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-sky-600">4.8</div>
                    <div className="text-xs text-gray-600">Đánh giá</div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Điện thoại:</span>
                    <span className="font-medium text-gray-800">{product.profiles?.phone || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Tham gia:</span>
                    <span className="font-medium text-gray-800">6 tháng</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/farmers/${product.profiles?.id}`)}
                  className="w-full mt-4 py-2.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  Xem trang nông dân →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">Cần tư vấn thêm về sản phẩm?</h3>
              <p className="text-emerald-100">Đội ngũ AgriFlow luôn sẵn sàng hỗ trợ bạn 24/7</p>
            </div>
            <div className="flex gap-3">
              <ChatButton
                farmerId={product.farmer_id}
                buyerId={user?.id}
                productId={product.id}
                productTitle={product.title}
                className="px-6 py-3 bg-white text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition-all shadow-lg"
              />
              <button
                onClick={() => navigate('/support')}
                className="px-6 py-3 border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 transition-all"
              >
                Gọi hỗ trợ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PublicProductDetail