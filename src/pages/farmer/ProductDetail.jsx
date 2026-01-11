import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Edit, Trash2, ArrowLeft, BarChart, MapPin, 
  Image as ImageIcon, Star, Loader2, Package, DollarSign, TrendingUp,
  Users, Calendar, Truck, Shield, Eye, Link as LinkIcon, Copy,
  CheckCircle, Clock, AlertCircle, Leaf,ShoppingBag 
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

import { farmerService } from '../../services/farmer.service'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import ProductImageGallery from '../../components/products/ProductImageGallery'
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal'

const FarmerProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth() 
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ 
    totalOrders: 0, 
    totalRevenue: 0,
    pendingOrders: 0,
    conversionRate: 0
  })
  const [productMetrics, setProductMetrics] = useState({
    views: 0,
    favorites: 0,
    inquiries: 0
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        toast.error('Vui lòng đăng nhập để tiếp tục')
        navigate('/login')
        return
      }
      fetchProductDetails()
      fetchProductMetrics()
    }
  }, [id, user, authLoading])

  const fetchProductDetails = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name, icon),
          product_images(id, image_url, is_primary),
          orders(id, status, total_amount, created_at),
          profiles:farmer_id(full_name, avatar_url)
        `)
        .eq('id', id)
        .eq('farmer_id', user.id)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        toast.error('Bạn không có quyền truy cập sản phẩm này')
        navigate('/farmer/products')
        return
      }
      
      setProduct(data)
      
      // Calculate stats
      const validOrders = data.orders?.filter(o => ['completed', 'shipped'].includes(o.status)) || []
      const pendingOrders = data.orders?.filter(o => o.status === 'pending') || []
      const conversionRate = data.orders?.length > 0 ? 
        Math.round((validOrders.length / (data.orders?.length || 1)) * 100) : 0
      
      setStats({
        totalOrders: data.orders?.length || 0,
        totalRevenue: validOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
        pendingOrders: pendingOrders.length,
        conversionRate
      })
      
    } catch (error) {
      console.error('Error:', error.message)
      toast.error('Không thể tải thông tin sản phẩm')
      navigate('/farmer/products')
    } finally {
      setLoading(false)
    }
  }

  const fetchProductMetrics = async () => {
    try {
      // In a real app, you would fetch these from your analytics service
      setProductMetrics({
        views: Math.floor(Math.random() * 500) + 100,
        favorites: Math.floor(Math.random() * 50) + 10,
        inquiries: Math.floor(Math.random() * 20) + 5
      })
    } catch (error) {
      console.error('Error fetching metrics:', error)
    }
  }

  const handleDelete = async () => {
    try {
      const result = await farmerService.deleteProduct(id)
      if (result.success) {
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle className="text-emerald-600" size={20} />
            <span className="font-semibold">Đã xóa sản phẩm thành công</span>
          </div>
        )
        navigate('/farmer/products')
      }
    } catch (err) {
      toast.error('Không thể xóa sản phẩm')
    }
  }

  const copyProductLink = () => {
    const productUrl = `${window.location.origin}/products/${id}`
    navigator.clipboard.writeText(productUrl)
    toast.success('Đã sao chép link sản phẩm')
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Leaf className="h-8 w-8 text-white animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-emerald-600 font-semibold">Đang tải thông tin sản phẩm...</p>
      </div>
    )
  }

  if (!product) return null

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫'
  }

  const getProductStatusBadge = () => {
    const statusConfig = {
      available: { label: 'Đang bán', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
      draft: { label: 'Bản nháp', color: 'bg-gray-100 text-gray-700', icon: AlertCircle },
      out_of_stock: { label: 'Hết hàng', color: 'bg-amber-100 text-amber-700', icon: Clock },
      archived: { label: 'Đã lưu trữ', color: 'bg-gray-100 text-gray-700', icon: AlertCircle }
    }
    const config = statusConfig[product.status] || statusConfig.draft
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold ${config.color}`}>
        <Icon size={14} />
        {config.label}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white">
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa sản phẩm"
        message="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/farmer/products')} 
                className="flex items-center text-emerald-100 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} className="mr-2"/> 
                <span className="font-medium">Quay lại</span>
              </button>
              <div className="hidden md:block h-6 w-px bg-emerald-500"></div>
              <div>
                <h1 className="text-2xl font-bold truncate max-w-2xl">{product.title}</h1>
                <div className="flex items-center gap-2 mt-1">
                  {getProductStatusBadge()}
                  <span className="text-emerald-100 text-sm">
                    {product.categories?.name}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyProductLink}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all"
              >
                <LinkIcon size={16} />
                <span className="hidden sm:inline">Chia sẻ</span>
              </button>
              <Link 
                to={`/products/${id}`}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all"
              >
                <Eye size={16} />
                <span className="hidden sm:inline">Xem công khai</span>
              </Link>
              <Link 
                to={`/farmer/products/edit/${id}`}
                className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-all"
              >
                <Edit size={16} />
                <span className="hidden sm:inline">Chỉnh sửa</span>
              </Link>
              <button 
                onClick={() => setShowDeleteModal(true)} 
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all"
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">Xóa</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
              <ProductImageGallery images={product.product_images} />
            </div>

            {/* Product Details Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Chi tiết sản phẩm</h2>
                <div className="flex items-center gap-2">
                  {getProductStatusBadge()}
                  <span className="text-sm text-gray-500">
                    ID: {product.id.slice(0,8).toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                      <Package size={16} />
                      Thông tin cơ bản
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Đơn vị:</span>
                        <span className="font-semibold">{product.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sản lượng:</span>
                        <span className="font-bold text-gray-800">{product.quantity} {product.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Đơn tối thiểu:</span>
                        <span className="font-bold text-emerald-600">{product.min_order_quantity} {product.unit}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                      <Calendar size={16} />
                      Thời gian
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngày đăng:</span>
                        <span className="font-semibold">
                          {format(new Date(product.created_at), 'dd/MM/yyyy')}
                        </span>
                      </div>
                      {product.harvest_date && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Thu hoạch:</span>
                          <span className="font-semibold">
                            {format(new Date(product.harvest_date), 'dd/MM/yyyy')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                      <DollarSign size={16} />
                      Giá cả
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-gray-600">Giá bán:</span>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-emerald-600">
                            {formatCurrency(product.price_per_unit)}
                          </div>
                          <div className="text-sm text-gray-500">/{product.unit}</div>
                        </div>
                      </div>
                      {product.original_price && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Giá gốc:</span>
                          <span className="text-gray-500 line-through">
                            {formatCurrency(product.original_price)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                      <MapPin size={16} />
                      Vị trí
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tỉnh/TP:</span>
                        <span className="font-semibold">{product.province}</span>
                      </div>
                      {product.district && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Quận/Huyện:</span>
                          <span className="font-semibold">{product.district}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Mô tả sản phẩm</h3>
                <div className="prose prose-emerald max-w-none">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {product.description || 'Sản phẩm này chưa có mô tả chi tiết.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-8">
            {/* Performance Stats */}
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BarChart className="text-emerald-600" size={20} />
                Hiệu suất kinh doanh
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="text-emerald-600" size={16} />
                    <div className="text-xs text-emerald-700 font-semibold">ĐƠN HÀNG</div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
                  <div className="text-xs text-gray-600 mt-1">{stats.pendingOrders} đang chờ</div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="text-blue-600" size={16} />
                    <div className="text-xs text-blue-700 font-semibold">DOANH THU</div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</div>
                  <div className="text-xs text-gray-600 mt-1">Từ {stats.totalOrders} đơn</div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="text-amber-600" size={16} />
                    <div className="text-xs text-amber-700 font-semibold">TỶ LỆ CHỐT</div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</div>
                  <div className="text-xs text-gray-600 mt-1">Đơn thành công</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="text-purple-600" size={16} />
                    <div className="text-xs text-purple-700 font-semibold">LƯỢT XEM</div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{productMetrics.views}</div>
                  <div className="text-xs text-gray-600 mt-1">{productMetrics.favorites} yêu thích</div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Hành động nhanh</h3>
                <div className="space-y-2">
                  <Link 
                    to={`/farmer/orders?product=${id}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-emerald-50 rounded-xl transition-colors group"
                  >
                    <ShoppingBag className="text-gray-400 group-hover:text-emerald-600" size={18} />
                    <div>
                      <div className="font-medium text-gray-800">Xem đơn hàng</div>
                      <div className="text-xs text-gray-500">{stats.totalOrders} đơn liên quan</div>
                    </div>
                  </Link>
                  <button 
                    onClick={() => navigate(`/farmer/products/${id}/promote`)}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-amber-50 rounded-xl transition-colors group text-left"
                  >
                    <TrendingUp className="text-gray-400 group-hover:text-amber-600" size={18} />
                    <div>
                      <div className="font-medium text-gray-800">Quảng cáo sản phẩm</div>
                      <div className="text-xs text-gray-500">Tăng hiển thị và doanh số</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Shield className="text-emerald-600" size={20} />
                Thông tin sản phẩm
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mã sản phẩm:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">{product.id.slice(0,8).toUpperCase()}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(product.id)
                        toast.success('Đã sao chép mã')
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Trạng thái:</span>
                  {getProductStatusBadge()}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Lượt xem:</span>
                  <span className="font-semibold">{productMetrics.views}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Yêu thích:</span>
                  <span className="font-semibold">{productMetrics.favorites}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tin nhắn:</span>
                  <span className="font-semibold">{productMetrics.inquiries}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Chất lượng & Tiêu chuẩn</h4>
                <div className="space-y-2">
                  {product.quality_standard && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-emerald-600" size={16} />
                      <span className="text-sm">Tiêu chuẩn: {product.quality_standard}</span>
                    </div>
                  )}
                  {product.is_organic && (
                    <div className="flex items-center gap-2">
                      <Leaf className="text-emerald-600" size={16} />
                      <span className="text-sm">Sản phẩm hữu cơ</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Truck className="text-blue-600" size={16} />
                    <span className="text-sm">Vận chuyển: Miễn phí</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Updates */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">Cập nhật nhanh</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate(`/farmer/products/${id}/update-stock`)}
                  className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors flex items-center gap-3"
                >
                  <Package size={18} />
                  <div>
                    <div className="font-medium">Cập nhật tồn kho</div>
                    <div className="text-sm text-emerald-100/70">Hiện có: {product.quantity} {product.unit}</div>
                  </div>
                </button>
                <button 
                  onClick={() => navigate(`/farmer/products/${id}/update-price`)}
                  className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors flex items-center gap-3"
                >
                  <DollarSign size={18} />
                  <div>
                    <div className="font-medium">Điều chỉnh giá</div>
                    <div className="text-sm text-emerald-100/70">Hiện tại: {formatCurrency(product.price_per_unit)}</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FarmerProductDetail