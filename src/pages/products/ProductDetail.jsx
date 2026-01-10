import { useState, useEffect } from 'react'
import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ShoppingCart, MapPin, Package, User, MessageCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import ProductImageGallery from '../../components/products/ProductImageGallery'
import OrderForm from '../../components/orders/OrderForm'

const PublicProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [selectedQuantity, setSelectedQuantity] = useState(1)

  useEffect(() => {
    if (id) fetchProductDetails()
  }, [id])

  const fetchProductDetails = async () => {
    try {
      setLoading(true)
      
      // FIX: Loại bỏ hoàn toàn display_order và các cột không chắc chắn
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          profiles:farmer_id (
            id, 
            full_name, 
            province
          ),
          product_images (
            id, 
            image_url, 
            is_primary
          ),
          categories:category_id (
            name
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

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN').format(amount)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
    </div>
  )

  if (!product) return null

  // Sắp xếp ảnh: Ưu tiên ảnh is_primary lên đầu, nếu không có cột sắp xếp
  const sortedImages = product.product_images?.sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0)) || []

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {showOrderForm && (
        <OrderForm
          product={product}
          selectedQuantity={selectedQuantity}
          onClose={() => setShowOrderForm(false)}
          onSuccess={() => {
            setShowOrderForm(false)
            toast.success('Gửi yêu cầu mua hàng thành công!')
          }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* TRÁI: Gallery & Mô tả */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <ProductImageGallery images={sortedImages} />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4 border-b pb-2">Thông tin sản phẩm</h2>
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Danh mục:</span>
                  <span className="font-medium text-green-600">{product.categories?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Đơn vị:</span>
                  <span className="font-medium">{product.unit}</span>
                </div>
              </div>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                {product.description || 'Chưa có mô tả chi tiết.'}
              </p>
            </div>
          </div>

          {/* PHẢI: Mua hàng */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24 border border-gray-100">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>
              
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-3xl font-extrabold text-green-600">{formatCurrency(product.price_per_unit)}đ</span>
                <span className="text-gray-500 text-sm">/{product.unit}</span>
              </div>

              <div className="space-y-5 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Còn lại:</span>
                  <span className="font-bold">{product.quantity} {product.unit}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Số lượng mua:</span>
                  <div className="flex border rounded-lg overflow-hidden">
                    <button 
                      onClick={() => setSelectedQuantity(q => Math.max(product.min_order_quantity || 1, q - 1))}
                      className="px-3 py-1 bg-gray-50 hover:bg-gray-100 border-r"
                    >-</button>
                    <input 
                      type="text" readOnly value={selectedQuantity}
                      className="w-12 text-center text-sm font-bold focus:outline-none"
                    />
                    <button 
                      onClick={() => setSelectedQuantity(q => Math.min(product.quantity, q + 1))}
                      className="px-3 py-1 bg-gray-50 hover:bg-gray-100 border-l"
                    >+</button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => user ? setShowOrderForm(true) : navigate('/login')}
                  className="w-full py-4 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-lg shadow-green-100 transition-all"
                >
                  MUA NGAY
                </button>
                <button
                  onClick={() => navigate(`/chat/${product.profiles?.id}`)}
                  className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} /> Chat với người bán
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="text-gray-400" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Người đăng bán</p>
                  <p className="font-bold text-gray-900">{product.profiles?.full_name}</p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <MapPin size={12} className="mr-1" /> {product.profiles?.province}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PublicProductDetail