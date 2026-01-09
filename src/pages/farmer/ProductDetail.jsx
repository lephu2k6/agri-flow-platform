import React from 'react'
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Edit, Trash2, ArrowLeft, Package, DollarSign,
  MapPin, Calendar, Tag, BarChart, Eye, ShoppingCart,
  AlertCircle, CheckCircle, XCircle, Upload, Image
} from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

import { farmerService } from '../../services/farmer.service'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import ProductImageGallery from '../../components/products/ProductImageGallery'
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal'

const FarmerProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  /* ================= FETCH PRODUCT DETAILS ================= */
  useEffect(() => {
    if (id) {
      fetchProductDetails()
    }
  }, [id])

  const fetchProductDetails = async () => {
    try {
      setLoading(true)
      
      // Fetch product with related data
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name),
          product_images(
            id,
            image_url,
            is_primary,
            display_order
          ),
          orders(
            id,
            status,
            quantity,
            total_price,
            created_at,
            profiles!orders_buyer_id_fkey(
              full_name,
              phone
            )
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      
      // Verify product belongs to current farmer
      if (data.farmer_id !== user?.id) {
        toast.error('Bạn không có quyền xem sản phẩm này')
        navigate('/farmer/products')
        return
      }
      
      setProduct(data)
      
      // Calculate statistics
      calculateStats(data)
      
    } catch (error) {
      console.error('Fetch product error:', error)
      toast.error('Không thể tải thông tin sản phẩm')
      navigate('/farmer/products')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (productData) => {
    if (!productData.orders) return
    
    const stats = {
      totalOrders: productData.orders.length,
      totalRevenue: productData.orders
        .filter(o => ['completed', 'shipped', 'confirmed'].includes(o.status))
        .reduce((sum, order) => sum + (order.total_price || 0), 0),
      pendingOrders: productData.orders.filter(o => o.status === 'pending').length,
      completedOrders: productData.orders.filter(o => o.status === 'completed').length,
      avgOrderValue: 0
    }
    
    const validOrders = productData.orders.filter(o => 
      ['completed', 'shipped', 'confirmed'].includes(o.status)
    )
    
    if (validOrders.length > 0) {
      stats.avgOrderValue = stats.totalRevenue / validOrders.length
    }
    
    setStats(stats)
  }

  /* ================= STATUS HANDLERS ================= */
  const handleUpdateStatus = async (newStatus) => {
    if (!product || updatingStatus) return
    
    try {
      setUpdatingStatus(true)
      
      const result = await farmerService.updateProduct(product.id, {
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      
      if (result.success) {
        setProduct(prev => ({ ...prev, status: newStatus }))
        toast.success(`Đã ${getStatusText(newStatus)} sản phẩm`)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Update status error:', error)
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái')
    } finally {
      setUpdatingStatus(false)
    }
  }

  /* ================= DELETE HANDLER ================= */
  const handleDelete = async () => {
    if (!product || deleting) return
    
    try {
      setDeleting(true)
      
      // Check if product has active orders
      const hasActiveOrders = product.orders?.some(o => 
        ['pending', 'confirmed', 'shipped'].includes(o.status)
      )
      
      if (hasActiveOrders) {
        toast.error('Không thể xóa sản phẩm có đơn hàng đang xử lý')
        return
      }
      
      const result = await farmerService.deleteProduct(product.id)
      
      if (result.success) {
        toast.success('Đã xóa sản phẩm thành công')
        navigate('/farmer/products')
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Delete product error:', error)
      toast.error('Có lỗi xảy ra khi xóa sản phẩm')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  /* ================= HELPER FUNCTIONS ================= */
  const getStatusBadge = (status) => {
    const statusConfig = {
      'draft': { color: 'bg-gray-100 text-gray-800', icon: <Edit size={14} />, label: 'Bản nháp' },
      'available': { color: 'bg-green-100 text-green-800', icon: <CheckCircle size={14} />, label: 'Đang bán' },
      'reserved': { color: 'bg-yellow-100 text-yellow-800', icon: <AlertCircle size={14} />, label: 'Đã đặt trước' },
      'sold': { color: 'bg-blue-100 text-blue-800', icon: <Package size={14} />, label: 'Đã bán hết' },
      'expired': { color: 'bg-red-100 text-red-800', icon: <XCircle size={14} />, label: 'Hết hạn' }
    }
    
    const config = statusConfig[status] || statusConfig['draft']
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </span>
    )
  }

  const getStatusText = (status) => {
    const map = {
      'draft': 'lưu bản nháp',
      'available': 'bán',
      'sold': 'ngừng bán',
      'expired': 'đánh dấu hết hạn'
    }
    return map[status] || status
  }

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi })
    } catch {
      return dateString
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount)
  }

  /* ================= RENDER LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin sản phẩm...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
          <p className="text-gray-600 mb-4">Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <button
            onClick={() => navigate('/farmer/products')}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <ArrowLeft className="mr-2" size={16} />
            Quay lại danh sách
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Xóa sản phẩm"
        message="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
        confirmText={deleting ? "Đang xóa..." : "Xóa sản phẩm"}
        confirmColor="red"
      />

      <div className="max-w-7xl mx-auto">
        {/* Header with Actions */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/farmer/products')}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {product.title}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  {getStatusBadge(product.status)}
                  <span className="text-gray-600 text-sm">
                    Mã sản phẩm: <span className="font-mono">{product.id.slice(0, 8)}</span>
                  </span>
                  <span className="text-gray-600 text-sm">
                    Đăng ngày: {formatDate(product.created_at)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {/* Status Actions */}
              {product.status === 'draft' && (
                <button
                  onClick={() => handleUpdateStatus('available')}
                  disabled={updatingStatus}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                >
                  {updatingStatus ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  ) : (
                    <Eye className="mr-2" size={16} />
                  )}
                  Đăng bán
                </button>
              )}
              
              {product.status === 'available' && (
                <button
                  onClick={() => handleUpdateStatus('sold')}
                  disabled={updatingStatus}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center"
                >
                  {updatingStatus ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  ) : (
                    <XCircle className="mr-2" size={16} />
                  )}
                  Ngừng bán
                </button>
              )}
              
              {/* Edit Button */}
              <Link
                to={`/farmer/products/edit/${product.id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Edit className="mr-2" size={16} />
                Chỉnh sửa
              </Link>
              
              {/* Delete Button */}
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                <Trash2 className="mr-2" size={16} />
                Xóa
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Product Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Images */}
            <div className="bg-white rounded-xl shadow p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Hình ảnh sản phẩm</h2>
                <span className="text-sm text-gray-500">
                  {product.product_images?.length || 0} ảnh
                </span>
              </div>
              
              {product.product_images?.length > 0 ? (
                <ProductImageGallery
                  images={product.product_images.map(img => ({
                    id: img.id,
                    url: img.image_url,
                    isPrimary: img.is_primary
                  }))}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Image className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-2">Sản phẩm chưa có hình ảnh</p>
                  <Link
                    to={`/farmer/products/edit/${product.id}`}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    Thêm hình ảnh ngay
                  </Link>
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="bg-white rounded-xl shadow p-4 md:p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin chi tiết</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Danh mục</label>
                    <p className="text-gray-900">{product.categories?.name || 'Chưa phân loại'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Mô tả</label>
                    <p className="text-gray-900 whitespace-pre-line">
                      {product.description || 'Chưa có mô tả'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Tiêu chuẩn chất lượng</label>
                    <p className="text-gray-900">
                      {product.quality_standard || 'Không yêu cầu'}
                    </p>
                  </div>
                </div>

                {/* Quantity & Price */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Số lượng hiện có</label>
                    <div className="flex items-center gap-2">
                      <Package className="text-gray-400" size={18} />
                      <span className="text-2xl font-bold text-gray-900">
                        {product.quantity} {product.unit}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Giá bán</label>
                    <div className="flex items-center gap-2">
                      <DollarSign className="text-gray-400" size={18} />
                      <span className="text-2xl font-bold text-green-600">
                        {formatCurrency(product.price_per_unit)}/{product.unit}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Đơn hàng tối thiểu</label>
                    <p className="text-gray-900">
                      {product.min_order_quantity || 1} {product.unit}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-white rounded-xl shadow p-4 md:p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="mr-2 text-red-500" size={20} />
                Địa điểm
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Tỉnh/Thành phố</label>
                  <p className="text-gray-900">{product.province}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Quận/Huyện</label>
                  <p className="text-gray-900">{product.district || 'Chưa có thông tin'}</p>
                </div>
                
                {product.farm_address && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Địa chỉ trang trại</label>
                    <p className="text-gray-900">{product.farm_address}</p>
                  </div>
                )}
              </div>
              
              {/* Map placeholder - can integrate Google Maps later */}
              {product.latitude && product.longitude && (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-500 mb-2">Vị trí trên bản đồ:</p>
                  <div className="h-48 bg-gray-200 rounded flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-red-500" />
                    <span className="ml-2 text-gray-600">
                      {product.latitude}, {product.longitude}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Statistics & Recent Orders */}
          <div className="space-y-6">
            {/* Statistics */}
            <div className="bg-white rounded-xl shadow p-4 md:p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart className="mr-2 text-blue-500" size={20} />
                Thống kê
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Tổng đơn hàng</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalOrders || 0}</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-blue-500" />
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Doanh thu</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(stats.totalRevenue || 0)} VND
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Đơn hàng chờ xử lý</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders || 0}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-yellow-500" />
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Đơn hàng hoàn thành</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completedOrders || 0}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Đơn hàng gần đây</h2>
                <Link
                  to={`/farmer/orders?product=${product.id}`}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  Xem tất cả
                </Link>
              </div>
              
              {product.orders && product.orders.length > 0 ? (
                <div className="space-y-3">
                  {product.orders.slice(0, 5).map(order => (
                    <div key={order.id} className="p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-gray-900">
                          {order.profiles?.full_name || 'Khách hàng'}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{order.quantity} {product.unit}</span>
                        <span className="font-medium">{formatCurrency(order.total_price)} VND</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(order.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Chưa có đơn hàng nào</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow p-4 md:p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
              
              <div className="space-y-2">
                <Link
                  to={`/farmer/products/edit/${product.id}`}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors group"
                >
                  <div className="flex items-center">
                    <Edit className="h-5 w-5 text-blue-500 mr-3" />
                    <span className="text-gray-700 group-hover:text-blue-700">Chỉnh sửa sản phẩm</span>
                  </div>
                  <span className="text-gray-400 group-hover:text-blue-500">→</span>
                </Link>
                
                <Link
                  to={`/farmer/products/clone/${product.id}`}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors group"
                >
                  <div className="flex items-center">
                    <Upload className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700 group-hover:text-green-700">Tạo bản sao</span>
                  </div>
                  <span className="text-gray-400 group-hover:text-green-500">→</span>
                </Link>
                
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors group"
                >
                  <div className="flex items-center">
                    <Trash2 className="h-5 w-5 text-red-500 mr-3" />
                    <span className="text-gray-700 group-hover:text-red-700">Xóa sản phẩm</span>
                  </div>
                  <span className="text-gray-400 group-hover:text-red-500">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-6 text-sm text-gray-500">
          <p>
            Sản phẩm được tạo: {formatDate(product.created_at)} • 
            Cập nhật lần cuối: {formatDate(product.updated_at || product.created_at)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default FarmerProductDetail