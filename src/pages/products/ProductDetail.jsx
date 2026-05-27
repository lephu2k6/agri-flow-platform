import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ChevronLeft, Clock, Heart, Leaf, MapPin, MessageCircle,
  Package, Shield, ShoppingCart, Star, Truck, User
} from 'lucide-react'
import toast from 'react-hot-toast'

import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../contexts/CartContext'
import { supabase } from '../../lib/supabase'
import { wishlistService } from '../../services/wishlist.service'
import { reviewService } from '../../services/review.service'
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
  const [reviews, setReviews] = useState([])
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [farmerStats, setFarmerStats] = useState(null)
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  useEffect(() => {
    if (id) {
      fetchProductDetails()
      fetchReviews()
    }
  }, [id])

  useEffect(() => {
    if (product?.profiles?.id) fetchFarmerStats()
  }, [product?.profiles?.id])

  useEffect(() => {
    if (product?.id && user?.id) checkWishlist()
  }, [product?.id, user?.id])

  const fetchReviews = async () => {
    try {
      const result = await reviewService.getProductReviews(id)
      if (result.success) setReviews(result.data)
    } catch (error) {
      console.error('Fetch reviews error:', error)
    }
  }

  const checkWishlist = async () => {
    if (!user || !product?.id) return
    const result = await wishlistService.isInWishlist(product.id, user.id)
    if (result.success) setIsInWishlist(result.isInWishlist)
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

      setFarmerStats({ activeProducts: data?.length || 0 })
    } catch (error) {
      console.error('Failed to fetch farmer stats:', error)
    }
  }

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN').format(amount || 0)
  const calculateTotal = () => selectedQuantity * product.price_per_unit

  if (loading) return (
    <div className="market-surface min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="market-panel h-96 animate-pulse lg:col-span-2" />
          <div className="market-panel h-96 animate-pulse" />
        </div>
      </div>
    </div>
  )

  if (!product) return null

  const sortedImages = product.product_images?.sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0)) || []
  const minQty = product.min_order_quantity || 1
  const rating = product.average_rating > 0 ? Number(product.average_rating).toFixed(1) : '5.0'

  return (
    <div className="market-surface min-h-screen">
      {showOrderForm && (
        <OrderForm
          product={product}
          selectedQuantity={selectedQuantity}
          onClose={() => setShowOrderForm(false)}
          onSuccess={() => {
            setShowOrderForm(false)
            toast.success('Gửi yêu cầu mua hàng thành công')
          }}
        />
      )}

      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex min-w-0 items-center gap-2 text-sm text-gray-600">
            <Link to="/products" className="flex items-center gap-1 font-bold hover:text-emerald-600">
              <ChevronLeft size={16} /> Chợ nông sản
            </Link>
            <span className="text-gray-300">/</span>
            <span className="truncate font-semibold text-gray-900">{product.title}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          <main className="space-y-6">
            <section className="market-panel overflow-hidden">
              <ProductImageGallery images={sortedImages} />
            </section>

            {product.video_url && (
              <section className="market-panel overflow-hidden p-4">
                <ProductVideo videoUrl={product.video_url} title="Video giới thiệu sản phẩm" />
              </section>
            )}

            <section className="market-panel p-5">
              <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
                <h2 className="text-lg font-black text-gray-900">Thông tin sản phẩm</h2>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{product.categories?.name || 'Nông sản'}</span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoItem icon={Leaf} label="Danh mục" value={product.categories?.name || 'Chưa phân loại'} />
                <InfoItem icon={Package} label="Đơn vị tính" value={product.unit} />
                <InfoItem icon={Shield} label="Chất lượng" value={product.quality_standard || 'Loại A'} />
                <InfoItem icon={Truck} label="Vận chuyển" value="Hệ thống gợi ý" />
              </div>

              <div className="mt-6 border-t border-gray-100 pt-5">
                <h3 className="mb-3 font-black text-gray-900">Mô tả sản phẩm</h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
                  {product.description || 'Sản phẩm chất lượng cao, thu hoạch theo tiêu chuẩn an toàn thực phẩm.'}
                </p>
              </div>

              {product.harvest_date && (
                <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700">
                  <Clock size={15} /> Thu hoạch: {new Date(product.harvest_date).toLocaleDateString('vi-VN')}
                </div>
              )}
            </section>

            <section className="market-panel p-5">
              <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
                <h2 className="text-lg font-black text-gray-900">Đánh giá từ khách hàng</h2>
                <span className="text-sm font-semibold text-gray-500">{reviews.length} đánh giá</span>
              </div>

              {reviews.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
                  <div className="rounded-md bg-emerald-50 p-5 text-center">
                    <div className="text-4xl font-black text-emerald-600">{rating}</div>
                    <Stars value={Number(rating)} className="mt-2 justify-center" />
                    <p className="mt-2 text-xs font-black uppercase tracking-wide text-emerald-700">Điểm tin cậy</p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {reviews.map((review) => (
                      <div key={review.id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 font-black text-emerald-700">
                            {review.profiles?.full_name?.charAt(0).toUpperCase() || 'B'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <h4 className="font-bold text-gray-900">{review.profiles?.full_name}</h4>
                              <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <Stars value={review.rating} className="mt-1" size={13} />
                            <p className="mt-2 rounded-md bg-gray-50 p-3 text-sm text-gray-600">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <Star size={34} className="mx-auto mb-3 text-gray-300" />
                  <p className="font-bold text-gray-400">Sản phẩm chưa có đánh giá nào</p>
                </div>
              )}
            </section>
          </main>

          <aside className="space-y-6">
            <section className="market-panel sticky top-28 overflow-hidden">
              <div className="p-5">
                <h1 className="text-2xl font-black leading-tight text-gray-900">{product.title}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Stars value={Number(rating)} />
                  <span className="text-sm font-bold text-gray-900">{rating}</span>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm font-semibold text-gray-500">{product.total_reviews || 0} đánh giá</span>
                </div>

                <div className="mt-5">
                  <span className="text-3xl font-black text-emerald-600">{formatCurrency(product.price_per_unit)}đ</span>
                  <span className="ml-1 text-sm font-semibold text-gray-500">/{product.unit}</span>
                  <p className="mt-1 text-xs font-semibold text-gray-400">Giá tham khảo, chưa bao gồm điều kiện giao hàng riêng.</p>
                </div>

                <div className="mt-5 space-y-3 border-y border-gray-100 py-4">
                  <SummaryRow label="Tồn kho" value={`${product.quantity} ${product.unit}`} icon={Package} />
                  <SummaryRow label="Đơn tối thiểu" value={`${minQty} ${product.unit}`} icon={Shield} />
                  <SummaryRow label="Khu vực" value={product.province || product.profiles?.province || 'N/A'} icon={MapPin} />
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700">Số lượng</span>
                    <span className="text-sm font-semibold text-gray-500">Tổng: {formatCurrency(calculateTotal())}đ</span>
                  </div>
                  <div className="grid grid-cols-[44px_1fr_44px] overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                    <button onClick={() => setSelectedQuantity(q => Math.max(minQty, q - 1))} className="h-11 bg-white font-black text-gray-600 hover:bg-emerald-50">-</button>
                    <div className="flex h-11 items-center justify-center font-black text-gray-900">{selectedQuantity} <span className="ml-1 text-sm text-gray-500">{product.unit}</span></div>
                    <button onClick={() => setSelectedQuantity(q => Math.min(product.quantity, q + 1))} className="h-11 bg-white font-black text-gray-600 hover:bg-emerald-50">+</button>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <button onClick={() => user ? setShowOrderForm(true) : navigate('/login')} className="market-button h-11 w-full text-sm">
                    <ShoppingCart size={18} /> Mua ngay
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        if (!user) return navigate('/login')
                        addToCart(product, selectedQuantity)
                      }}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-emerald-200 bg-white text-sm font-bold text-emerald-700 hover:bg-emerald-50"
                    >
                      <ShoppingCart size={16} /> Giỏ hàng
                    </button>
                    <button
                      onClick={handleWishlistToggle}
                      disabled={wishlistLoading}
                      className={`inline-flex h-10 items-center justify-center gap-2 rounded-md border text-sm font-bold ${
                        isInWishlist ? 'border-pink-200 bg-pink-50 text-pink-600' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Heart size={16} className={isInWishlist ? 'fill-pink-500' : ''} /> {isInWishlist ? 'Đã thích' : 'Yêu thích'}
                    </button>
                  </div>
                  <ChatButton farmerId={product.farmer_id} buyerId={user?.id} productId={product.id} productTitle={product.title} className="w-full py-3" />
                </div>
              </div>
            </section>

            <section className="market-panel p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 font-black text-emerald-700">
                  {product.profiles?.full_name?.charAt(0).toUpperCase() || 'N'}
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-black text-gray-900">{product.profiles?.full_name}</h3>
                  <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                    <MapPin size={13} /> {product.profiles?.province || product.province}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-md bg-gray-50 p-3 text-center">
                  <div className="text-xl font-black text-emerald-600">{farmerStats?.activeProducts || 0}</div>
                  <div className="text-xs font-semibold text-gray-500">Sản phẩm</div>
                </div>
                <div className="rounded-md bg-gray-50 p-3 text-center">
                  <div className="text-xl font-black text-emerald-600">5.0</div>
                  <div className="text-xs font-semibold text-gray-500">Đánh giá</div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-md bg-gray-50 p-4">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white text-emerald-600">
      <Icon size={19} />
    </div>
    <div>
      <p className="text-xs font-black uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 font-bold text-gray-900">{value}</p>
    </div>
  </div>
)

const SummaryRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between gap-4 text-sm">
    <span className="flex items-center gap-2 text-gray-500"><Icon size={15} /> {label}</span>
    <span className="font-black text-gray-900">{value}</span>
  </div>
)

const Stars = ({ value, className = '', size = 16 }) => (
  <div className={`flex gap-1 ${className}`}>
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} size={size} className={s <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
    ))}
  </div>
)

export default PublicProductDetail
