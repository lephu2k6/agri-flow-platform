import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, MapPin, Package, RefreshCw, ChevronRight, Plus, Edit, Eye, BarChart3, Filter, TrendingUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

const Products = () => {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    sortBy: 'newest'
  })

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      if (data) setCategories(data)
    }
    fetchCategories()
  }, [])

  // Fetch products with filters
  const fetchMyProducts = useCallback(async () => {
    if (!user?.id) return
    
    setLoading(true)
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories:category_id (name, icon),
          product_images (image_url, is_primary)
        `)
        .eq('farmer_id', user.id)

      if (filters.search) query = query.ilike('title', `%${filters.search}%`)
      if (filters.category) query = query.eq('category_id', filters.category)
      if (filters.status) query = query.eq('status', filters.status)

      const sortMap = {
        price_low: { col: 'price_per_unit', asc: true },
        price_high: { col: 'price_per_unit', asc: false },
        newest: { col: 'created_at', asc: false },
        popular: { col: 'views_count', asc: false }
      }
      const sort = sortMap[filters.sortBy] || sortMap.newest
      query = query.order(sort.col, { ascending: sort.asc })

      const { data, error } = await query
      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      toast.error('Không thể tải danh sách sản phẩm')
      console.error(error)
    } finally { 
      setLoading(false) 
    }
  }, [filters, user?.id])

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login')
      } else {
        fetchMyProducts()
      }
    }
  }, [fetchMyProducts, authLoading, user, navigate])

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { label: 'Đang bán', color: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200' },
      draft: { label: 'Bản nháp', color: 'bg-gray-100 text-gray-700', border: 'border-gray-200' },
      out_of_stock: { label: 'Hết hàng', color: 'bg-amber-100 text-amber-700', border: 'border-amber-200' },
      archived: { label: 'Đã lưu trữ', color: 'bg-gray-100 text-gray-700', border: 'border-gray-200' }
    }
    const config = statusConfig[status] || statusConfig.draft
    return (
      <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${config.color} ${config.border}`}>
        {config.label}
      </span>
    )
  }

  if (authLoading) return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
    </div>
  )

  const activeProducts = products.filter(p => p.status === 'available').length
  const totalStock = products.reduce((sum, p) => sum + (p.quantity || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Quản lý sản phẩm</h1>
              <p className="text-emerald-100">Quản lý và cập nhật sản phẩm của bạn</p>
            </div>
            <Link 
              to="/farmer/products/create"
              className="inline-flex items-center gap-2 bg-white text-emerald-600 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              Đăng sản phẩm mới
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{products.length}</div>
              <div className="text-sm text-emerald-100">Tổng sản phẩm</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{activeProducts}</div>
              <div className="text-sm text-emerald-100">Đang bán</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{totalStock}</div>
              <div className="text-sm text-emerald-100">Tổng tồn kho</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-white">{categories.length}</div>
              <div className="text-sm text-emerald-100">Danh mục</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 -mt-6">
        {/* Filters Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm sản phẩm theo tên..."
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none hover:border-emerald-300 transition-colors"
                  onChange={e => setFilters({...filters, search: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              <select 
                className="px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none hover:border-emerald-300 transition-colors"
                onChange={e => setFilters({...filters, category: e.target.value})}
              >
                <option value="">Tất cả danh mục</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <select 
                className="px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none hover:border-emerald-300 transition-colors"
                onChange={e => setFilters({...filters, status: e.target.value})}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="available">Đang bán</option>
                <option value="draft">Bản nháp</option>
                <option value="out_of_stock">Hết hàng</option>
              </select>

              <select 
                className="px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none hover:border-emerald-300 transition-colors"
                onChange={e => setFilters({...filters, sortBy: e.target.value})}
              >
                <option value="newest">Mới nhất</option>
                <option value="price_low">Giá thấp → cao</option>
                <option value="price_high">Giá cao → thấp</option>
                <option value="popular">Phổ biến nhất</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(filters.category || filters.status || filters.search) && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Đang lọc:</span>
                {filters.category && (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
                    {categories.find(c => c.id === filters.category)?.name}
                  </span>
                )}
                {filters.status && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                    {filters.status === 'available' ? 'Đang bán' : 
                     filters.status === 'draft' ? 'Bản nháp' : 
                     'Hết hàng'}
                  </span>
                )}
                {filters.search && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                    "{filters.search}"
                  </span>
                )}
                <button 
                  onClick={() => setFilters({ search: '', category: '', status: '', sortBy: 'newest' })}
                  className="ml-2 text-sm text-gray-500 hover:text-emerald-600"
                >
                  Xóa tất cả
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Products List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-4 animate-pulse">
                <div className="h-48 bg-gradient-to-r from-emerald-100 to-emerald-50 rounded-xl mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-dashed border-emerald-200 p-12 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center mx-auto mb-6">
              <Package size={40} className="text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có sản phẩm nào</h3>
            <p className="text-gray-600 mb-6">Bắt đầu bằng cách đăng bán sản phẩm đầu tiên của bạn</p>
            <Link 
              to="/farmer/products/create"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              Đăng sản phẩm mới
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => {
              const mainImage = product.product_images?.find(img => img.is_primary)?.image_url || 
                               product.product_images?.[0]?.image_url || 
                               'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2070&auto=format&fit=crop'
              
              return (
                <div key={product.id} className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden hover:shadow-xl transition-all group">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={mainImage} 
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      {getStatusBadge(product.status)}
                    </div>
                    <div className="absolute top-3 right-3">
                      <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full">
                        <Eye size={10} />
                        {product.views_count || 0}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                          {product.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-emerald-500 font-medium">
                            {product.categories?.name}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin size={12} />
                            {product.province}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Tồn kho</div>
                        <div className="flex items-center gap-2">
                          <Package size={14} className="text-emerald-500" />
                          <span className="font-bold text-gray-800">
                            {product.quantity} {product.unit}
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Giá</div>
                        <div className="font-bold text-emerald-600">
                          {new Intl.NumberFormat('vi-VN').format(product.price_per_unit)}₫
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <Link 
                        to={`/products/${product.id}`}
                        target="_blank"
                        className="text-sm text-gray-600 hover:text-emerald-600 flex items-center gap-1"
                      >
                        <Eye size={14} />
                        Xem công khai
                      </Link>
                      <div className="flex items-center gap-2">
                        <Link 
                          to={`/farmer/products/${product.id}/edit`}
                          className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          <Edit size={16} />
                        </Link>
                        <Link 
                          to={`/farmer/products/${product.id}`}
                          className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                        >
                          <ChevronRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination / View All */}
        {products.length > 0 && !loading && (
          <div className="text-center mt-12">
            <div className="text-sm text-gray-600 mb-4">
              Hiển thị {products.length} sản phẩm • 
              <button 
                onClick={fetchMyProducts}
                className="ml-2 text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mx-auto"
              >
                <RefreshCw size={14} />
                Cập nhật danh sách
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Products