import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Package, Plus, Edit, Trash2, TrendingUp, TrendingDown,
  AlertCircle, CheckCircle, ChevronLeft, BarChart3
} from 'lucide-react'
import { farmerService } from '../../services/farmer.service'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const Inventory = () => {
  const { profile } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0
  })

  useEffect(() => {
    if (profile?.id) {
      fetchInventory()
    }
  }, [profile?.id])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const result = await farmerService.getFarmerProducts(profile.id)
      
      if (result.success) {
        setProducts(result.products || [])
        calculateStats(result.products || [])
      } else {
        toast.error('Không thể tải kho hàng')
      }
    } catch (error) {
      console.error('Fetch inventory error:', error)
      toast.error('Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (productList) => {
    const totalProducts = productList.length
    const lowStock = productList.filter(p => p.quantity < 10 && p.quantity > 0).length
    const outOfStock = productList.filter(p => p.quantity <= 0).length
    const totalValue = productList.reduce((sum, p) => 
      sum + (p.quantity * p.price_per_unit), 0
    )

    setStats({ totalProducts, lowStock, outOfStock, totalValue })
  }

  const handleUpdateStock = async (productId, newQuantity) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ quantity: parseFloat(newQuantity) })
        .eq('id', productId)

      if (error) throw error

      toast.success('Đã cập nhật tồn kho')
      fetchInventory()
    } catch (error) {
      console.error('Update stock error:', error)
      toast.error('Không thể cập nhật tồn kho')
    }
  }

  const handleDelete = async (productId) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error

      toast.success('Đã xóa sản phẩm')
      fetchInventory()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Không thể xóa sản phẩm')
    }
  }

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN').format(amount)

  const getStockStatus = (quantity) => {
    if (quantity <= 0) return { label: 'Hết hàng', color: 'bg-red-100 text-red-700', icon: AlertCircle }
    if (quantity < 10) return { label: 'Sắp hết', color: 'bg-amber-100 text-amber-700', icon: AlertCircle }
    return { label: 'Còn hàng', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-emerald-100 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
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
            to="/farmer/dashboard" 
            className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold mb-4"
          >
            <ChevronLeft size={18} />
            Quay lại Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <Package className="text-emerald-600" size={32} />
                Quản lý kho hàng
              </h1>
              <p className="text-gray-600 mt-2">Theo dõi và quản lý tồn kho sản phẩm</p>
            </div>
            <Link
              to="/farmer/products/create"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg"
            >
              <Plus size={20} />
              Thêm sản phẩm
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Package className="text-emerald-600" size={24} />
              </div>
              <TrendingUp className="text-emerald-500" size={20} />
            </div>
            <p className="text-sm text-gray-500 mb-1">Tổng sản phẩm</p>
            <p className="text-2xl font-black text-gray-900">{stats.totalProducts}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <AlertCircle className="text-amber-600" size={24} />
              </div>
              <TrendingDown className="text-amber-500" size={20} />
            </div>
            <p className="text-sm text-gray-500 mb-1">Sắp hết hàng</p>
            <p className="text-2xl font-black text-gray-900">{stats.lowStock}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertCircle className="text-red-600" size={24} />
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-1">Hết hàng</p>
            <p className="text-2xl font-black text-gray-900">{stats.outOfStock}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <BarChart3 className="text-purple-600" size={24} />
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-1">Tổng giá trị</p>
            <p className="text-2xl font-black text-gray-900">{formatCurrency(stats.totalValue)}₫</p>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Danh sách sản phẩm</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Tồn kho
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Giá trị
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                        <Package size={32} className="text-emerald-400" />
                      </div>
                      <p className="text-gray-600 font-medium">Chưa có sản phẩm nào</p>
                      <Link
                        to="/farmer/products/create"
                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
                      >
                        <Plus size={16} />
                        Thêm sản phẩm đầu tiên
                      </Link>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const stockStatus = getStockStatus(product.quantity)
                    const productValue = product.quantity * product.price_per_unit
                    const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0]

                    return (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-100 to-emerald-50 flex-shrink-0">
                              {primaryImage ? (
                                <img 
                                  src={primaryImage.image_url} 
                                  alt={product.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-full h-full text-emerald-400 p-3" />
                              )}
                            </div>
                            <div>
                              <Link
                                to={`/farmer/products/${product.id}`}
                                className="font-bold text-gray-900 hover:text-emerald-600 transition-colors"
                              >
                                {product.title}
                              </Link>
                              <p className="text-sm text-gray-500 mt-1">
                                {product.categories?.name || 'Chưa phân loại'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              value={product.quantity}
                              onChange={(e) => handleUpdateStock(product.id, e.target.value)}
                              onBlur={(e) => {
                                if (e.target.value !== product.quantity.toString()) {
                                  handleUpdateStock(product.id, e.target.value)
                                }
                              }}
                              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-semibold"
                              min="0"
                            />
                            <span className="text-gray-500 text-sm">{product.unit}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">
                            {formatCurrency(product.price_per_unit)}₫
                          </div>
                          <div className="text-xs text-gray-500">/{product.unit}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${stockStatus.color}`}>
                            <stockStatus.icon size={14} />
                            {stockStatus.label}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">
                            {formatCurrency(productValue)}₫
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/farmer/products/edit/${product.id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit size={18} />
                            </Link>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Inventory
