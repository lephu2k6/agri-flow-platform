import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Edit, Trash2, ArrowLeft, BarChart, MapPin, 
  Image as ImageIcon, Star, Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'

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
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0 })
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    // Chờ Auth load xong hẳn mới chạy
    if (!authLoading) {
      if (!user) {
        toast.error('Vui lòng đăng nhập để tiếp tục')
        navigate('/login')
        return
      }
      fetchProductDetails()
    }
  }, [id, user, authLoading])

  const fetchProductDetails = async () => {
    try {
      setLoading(true)
      
      // BƯỚC 1: Fetch sản phẩm và ép kiểm tra farmer_id
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name),
          product_images(id, image_url, is_primary),
          orders(id, status, total_amount)
        `)
        .eq('id', id)
        .eq('farmer_id', user.id) // Luôn dùng user.id từ Auth hook
        .maybeSingle() // Dùng maybeSingle để tránh lỗi nếu không tìm thấy

      if (error) throw error

      // BƯỚC 2: Nếu data trả về null nghĩa là ID sản phẩm không thuộc về farmer_id này
      if (!data) {
        toast.error('Bạn không có quyền truy cập sản phẩm này')
        navigate('/farmer/products')
        return
      }
      
      setProduct(data)
      
      // Tính toán thống kê
      const validOrders = data.orders?.filter(o => ['completed', 'shipped'].includes(o.status)) || []
      setStats({
        totalOrders: data.orders?.length || 0,
        totalRevenue: validOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
      })
      
    } catch (error) {
      console.error('Security Error:', error.message)
      toast.error('Lỗi bảo mật dữ liệu')
      navigate('/farmer/products')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      const result = await farmerService.deleteProduct(id)
      if (result.success) {
        toast.success('Đã xóa sản phẩm')
        navigate('/farmer/products')
      }
    } catch (err) {
      toast.error('Không thể xóa sản phẩm')
    }
  }

  // Loading tổng hợp: Chờ cả Auth và Dữ liệu
  if (authLoading || loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-green-600" size={40} />
        <p className="text-gray-500 font-medium">Đang xác thực quyền truy cập...</p>
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 animate-in fade-in duration-500">
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
      />

      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <button 
          onClick={() => navigate('/farmer/products')} 
          className="flex items-center text-gray-600 hover:text-green-600 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2"/> 
          <span className="font-medium">Quay lại danh sách</span>
        </button>
        <div className="flex gap-2">
          <Link 
            to={`/farmer/products/edit/${id}`} 
            className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Edit size={18} className="mr-2"/> Sửa
          </Link>
          <button 
            onClick={() => setShowDeleteModal(true)} 
            className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <Trash2 size={18} className="mr-2"/> Xóa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
               <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
               <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">
                 {product.categories?.name}
               </span>
            </div>
            <ProductImageGallery images={product.product_images} />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="font-bold text-lg mb-4 text-gray-900">Mô tả sản phẩm</h2>
            <div className="prose max-w-none text-gray-600 whitespace-pre-line text-sm leading-relaxed">
              {product.description || 'Sản phẩm này chưa có mô tả chi tiết.'}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="font-bold flex items-center mb-4 text-blue-600">
              <BarChart className="mr-2" size={20}/> Hiệu suất kinh doanh
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Tổng đơn hàng</p>
                <p className="text-2xl font-black text-gray-800">{stats.totalOrders}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-xs text-green-600 uppercase font-bold mb-1">Doanh thu ước tính</p>
                <p className="text-2xl font-black text-green-700">
                  {new Intl.NumberFormat('vi-VN').format(stats.totalRevenue)}đ
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="font-bold flex items-center mb-4 text-orange-600">
              <MapPin className="mr-2" size={20}/> Thông tin nguồn gốc
            </h2>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-800">{product.farm_address}</p>
              <p className="text-sm text-gray-600">{product.district}, {product.province}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FarmerProductDetail