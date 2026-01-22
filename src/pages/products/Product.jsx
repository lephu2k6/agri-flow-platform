import React, { useEffect, useState } from 'react'
import {
  Search, Grid, List, Filter,
  RotateCcw, PackageSearch, MapPin, Leaf, TrendingUp,
  Truck, Star, ChevronDown
} from 'lucide-react'
import toast from 'react-hot-toast'

import { supabase } from '../../lib/supabase'
import ProductCard from '../../components/products/ProductCard'
import ProductFilterSidebar from '../../components/products/ProductFilterSidebar'

/* ================= HELPER: Chuẩn hóa dữ liệu ảnh ================= */
const normalizeProducts = (products) => {
  return products.map(p => ({
    ...p,
    images: (p.product_images || []).map(img => ({
      id: img.id,
      url: img.image_url,
      isPrimary: img.is_primary
    })).sort((a, b) => b.isPrimary - a.isPrimary)
  }))
}

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [showSortMenu, setShowSortMenu] = useState(false)
  
  const [filters, setFilters] = useState({
    category_id: '',
    province: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest',
  })

  const [metadata, setMetadata] = useState({
    provinces: [],
    categories: []
  })

  const [stats, setStats] = useState({
    totalProducts: 0,
    avgPrice: 0,
    activeFarmers: 0
  })

  const sortOptions = [
    { value: 'newest', label: 'Mới nhất', icon: TrendingUp },
    { value: 'price_low', label: 'Giá thấp → cao', icon: TrendingUp },
    { value: 'price_high', label: 'Giá cao → thấp', icon: TrendingUp },
    { value: 'popular', label: 'Phổ biến nhất', icon: Star }
  ]

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    fetchMetadata()
    fetchProducts()
    fetchStats()
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts()
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [search, filters])

  const fetchMetadata = async () => {
    try {
      const [catRes, provRes] = await Promise.all([
        supabase.from('categories').select('id, name, icon'),
        supabase.from('products').select('province').not('province', 'is', null)
      ])

      setMetadata({
        categories: catRes.data || [],
        provinces: [...new Set(provRes.data?.map(p => p.province))]
      })
    } catch (err) {
      console.error('Metadata error:', err)
    }
  }

  const fetchStats = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select('price_per_unit, farmer_id')
        .eq('status', 'available')

      if (data) {
        const prices = data.map(p => p.price_per_unit).filter(Boolean)
        const avgPrice = prices.length ? 
          Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0
        
        const uniqueFarmers = [...new Set(data.map(p => p.farmer_id))]
        
        setStats({
          totalProducts: data.length,
          avgPrice,
          activeFarmers: uniqueFarmers.length
        })
      }
    } catch (err) {
      console.error('Stats error:', err)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('products')
        .select(`
          *,
          profiles:farmer_id ( id, full_name, phone, avatar_url ),
          product_images ( id, image_url, is_primary ),
          categories:category_id ( id, name, icon )
        `)
        .eq('status', 'available')

      if (filters.category_id) query = query.eq('category_id', filters.category_id)
      if (filters.province) query = query.eq('province', filters.province)
      if (filters.minPrice) query = query.gte('price_per_unit', Number(filters.minPrice))
      if (filters.maxPrice) query = query.lte('price_per_unit', Number(filters.maxPrice))

      if (filters.sortBy === 'newest') query = query.order('created_at', { ascending: false })
      if (filters.sortBy === 'price_low') query = query.order('price_per_unit', { ascending: true })
      if (filters.sortBy === 'price_high') query = query.order('price_per_unit', { ascending: false })
      if (filters.sortBy === 'popular') query = query.order('views_count', { ascending: false })

      const { data, error } = await query
      if (error) throw error

      let result = normalizeProducts(data || [])

      if (search.trim()) {
        const s = search.toLowerCase()
        result = result.filter(p =>
          p.title?.toLowerCase().includes(s) ||
          p.profiles?.full_name?.toLowerCase().includes(s) ||
          p.description?.toLowerCase().includes(s)
        )
      }

      setProducts(result)
    } catch (err) {
      console.error(err)
      toast.error('Không thể tải sản phẩm')
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setFilters({
      category_id: '',
      province: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest',
    })
    setSearch('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white pb-20">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-emerald-600 to-emerald-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-100">
                Chợ Nông Sản AgriFlow
              </span>
            </h1>
            <p className="text-lg text-emerald-100 max-w-2xl mx-auto">
              Kết nối trực tiếp với nông dân, mua nông sản tươi ngon với giá tốt nhất
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-sky-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative bg-white rounded-xl shadow-2xl">
                <div className="flex flex-col md:flex-row gap-2 p-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
                    <input 
                      type="text"
                      placeholder="Tìm kiếm sản phẩm, nông dân, địa phương..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-white border-none rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800 placeholder-gray-400"
                    />
                  </div>
                  <button 
                    onClick={fetchProducts}
                    className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Tìm kiếm
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-white">{stats.totalProducts}</div>
                <div className="text-sm text-emerald-100">Sản phẩm</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-white">{stats.activeFarmers}</div>
                <div className="text-sm text-emerald-100">Nông dân</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-white">
                  {stats.avgPrice.toLocaleString()}₫
                </div>
                <div className="text-sm text-emerald-100">Giá trung bình</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 -mt-8 relative">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 border border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Truck className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Vận chuyển tối ưu</div>
                <div className="font-bold text-gray-800">Giảm 15-20% chi phí</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border border-sky-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
                <Leaf className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Nông sản tươi</div>
                <div className="font-bold text-gray-800">Thu hoạch hàng ngày</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border border-amber-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Khu vực phục vụ</div>
                <div className="font-bold text-gray-800">Miền Trung - Nam</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Sidebar */}
          <aside className="lg:w-1/4">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
                <div className="p-6 border-b border-emerald-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Filter className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">Bộ lọc</h3>
                      <p className="text-sm text-gray-500">Tìm sản phẩm phù hợp</p>
                    </div>
                  </div>
                </div>
                <ProductFilterSidebar
                  filters={filters}
                  onFilterChange={(k, v) => setFilters(p => ({ ...p, [k]: v }))}
                  provinces={metadata.provinces}
                  categories={metadata.categories}
                  onApply={fetchProducts}
                  onClear={clearFilters}
                />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:w-3/4">
            {/* Controls Bar */}
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium text-gray-600">
                    Hiển thị <span className="font-bold text-emerald-600">{products.length}</span> sản phẩm
                  </div>
                  {filters.category_id && (
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                      {metadata.categories.find(c => c.id === filters.category_id)?.name}
                    </span>
                  )}
                  {filters.province && (
                    <span className="px-2 py-1 bg-sky-100 text-sky-700 text-xs font-medium rounded-full">
                      {filters.province}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* Sort Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSortMenu(!showSortMenu)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
                    >
                      <TrendingUp size={16} />
                      {sortOptions.find(o => o.value === filters.sortBy)?.label || 'Sắp xếp'}
                      <ChevronDown size={16} className={`transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showSortMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)}></div>
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 py-2">
                          {sortOptions.map((option) => {
                            const Icon = option.icon
                            return (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setFilters(p => ({ ...p, sortBy: option.value }))
                                  setShowSortMenu(false)
                                }}
                                className={`w-full px-4 py-2.5 text-left flex items-center gap-3 hover:bg-emerald-50 transition-colors ${
                                  filters.sortBy === option.value 
                                    ? 'text-emerald-600 font-semibold bg-emerald-50' 
                                    : 'text-gray-700'
                                }`}
                              >
                                <Icon size={16} />
                                {option.label}
                              </button>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2.5 transition-all ${
                        viewMode === 'grid' 
                          ? 'bg-emerald-500 text-white' 
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Grid size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2.5 transition-all ${
                        viewMode === 'list' 
                          ? 'bg-emerald-500 text-white' 
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <List size={18} />
                    </button>
                  </div>

                  {/* Clear Filters Button */}
                  {(filters.category_id || filters.province || filters.minPrice || filters.maxPrice) && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                    >
                      <RotateCcw size={16} />
                      Đặt lại
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden animate-pulse">
                    <div className="h-48 bg-gradient-to-r from-emerald-100 to-emerald-50"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-lg border border-dashed border-emerald-200">
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center">
                    <PackageSearch size={40} className="text-emerald-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Leaf size={16} className="text-amber-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy sản phẩm nào</h3>
                <p className="text-gray-500 text-center max-w-md mb-6">
                  Thử thay đổi bộ lọc, từ khóa tìm kiếm hoặc khám phá các sản phẩm khác
                </p>
                <button 
                  onClick={clearFilters}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <RotateCcw size={16} />
                  Xem tất cả sản phẩm
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {products.map(p => (
                  <ProductCard key={p.id} product={p} viewMode="list" />
                ))}
              </div>
            )}

            {/* Load More Button */}
            {products.length > 0 && !loading && (
              <div className="text-center mt-12">
                <button className="px-8 py-3.5 border-2 border-emerald-500 text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition-all hover:scale-105 active:scale-95">
                  Xem thêm sản phẩm
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-3xl hover:scale-110 transition-all">
        <Filter size={24} />
      </button>
    </div>
  )
}

export default Products