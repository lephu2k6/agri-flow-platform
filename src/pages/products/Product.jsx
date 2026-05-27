import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Search, Grid, List, Filter, RotateCcw, PackageSearch,
  TrendingUp, Star, ChevronDown, SlidersHorizontal, ShieldCheck,
  Truck, Users
} from 'lucide-react'
import toast from 'react-hot-toast'

import { supabase } from '../../lib/supabase'
import ProductCard from '../../components/products/ProductCard'
import ProductFilterSidebar from '../../components/products/ProductFilterSidebar'

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
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [showSortMenu, setShowSortMenu] = useState(false)

  const [filters, setFilters] = useState({
    category_id: searchParams.get('category') || '',
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
    { value: 'price_low', label: 'Giá thấp đến cao', icon: TrendingUp },
    { value: 'price_high', label: 'Giá cao đến thấp', icon: TrendingUp },
    { value: 'popular', label: 'Phổ biến nhất', icon: Star }
  ]

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
        provinces: [...new Set(provRes.data?.map(p => p.province).filter(Boolean))]
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
        const avgPrice = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0
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

  const hasFilters = filters.category_id || filters.province || filters.minPrice || filters.maxPrice || search
  const activeCategory = metadata.categories.find(c => c.id === filters.category_id)

  return (
    <div className="market-surface min-h-screen pb-12">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-emerald-600">
                <ShieldCheck size={15} />
                Chợ nông sản trực tiếp
              </div>
              <h1 className="market-heading mt-2 text-3xl">Chợ Nông Sản AgriFlow</h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-500">
                Tìm nguồn hàng nông sản từ nông dân và hộ sản xuất, có thông tin giá, tồn kho và khu vực rõ ràng.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:w-[420px]">
              <StatBox label="Sản phẩm" value={stats.totalProducts} />
              <StatBox label="Người bán" value={stats.activeFarmers} />
              <StatBox label="Giá TB" value={`${stats.avgPrice.toLocaleString()}đ`} />
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Tìm sản phẩm, người bán, địa phương..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="market-input h-11 w-full pl-10 pr-4 text-sm"
              />
            </div>
            <button onClick={fetchProducts} className="market-button h-11 px-5 text-sm">
              <Search size={17} /> Tìm kiếm
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {metadata.categories.slice(0, 8).map((category) => (
              <button
                key={category.id}
                onClick={() => setFilters(prev => ({ ...prev, category_id: prev.category_id === category.id ? '' : category.id }))}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                  filters.category_id === category.id
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-200 hover:text-emerald-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <FeatureBox icon={Truck} title="Vận chuyển tối ưu" text="Hỗ trợ gợi ý logistics theo khu vực" />
          <FeatureBox icon={ShieldCheck} title="Nguồn hàng minh bạch" text="Hiển thị người bán, tồn kho, địa phương" />
          <FeatureBox icon={Users} title="Mua trực tiếp" text="Kết nối buyer với nông dân và hộ sản xuất" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <aside>
            <ProductFilterSidebar
              filters={filters}
              onFilterChange={(k, v) => setFilters(p => ({ ...p, [k]: v }))}
              provinces={metadata.provinces}
              categories={metadata.categories}
              onApply={fetchProducts}
              onClear={clearFilters}
            />
          </aside>

          <main className="min-w-0">
            <div className="market-panel mb-5 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    Hiển thị <span className="text-emerald-600">{products.length}</span> sản phẩm
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {activeCategory && <FilterTag label={activeCategory.name} />}
                    {filters.province && <FilterTag label={filters.province} />}
                    {search && <FilterTag label={`"${search}"`} />}
                    {hasFilters && (
                      <button onClick={clearFilters} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-500 hover:text-emerald-700">
                        <RotateCcw size={12} /> Xóa lọc
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      onClick={() => setShowSortMenu(!showSortMenu)}
                      className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-sm font-bold text-gray-600 hover:bg-gray-50"
                    >
                      <TrendingUp size={15} />
                      {sortOptions.find(o => o.value === filters.sortBy)?.label || 'Sắp xếp'}
                      <ChevronDown size={15} className={showSortMenu ? 'rotate-180' : ''} />
                    </button>

                    {showSortMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                        <div className="absolute right-0 z-50 mt-2 w-52 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                          {sortOptions.map((option) => {
                            const Icon = option.icon
                            return (
                              <button
                                key={option.value}
                                onClick={() => {
                                  setFilters(p => ({ ...p, sortBy: option.value }))
                                  setShowSortMenu(false)
                                }}
                                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold hover:bg-emerald-50 ${
                                  filters.sortBy === option.value ? 'text-emerald-700' : 'text-gray-600'
                                }`}
                              >
                                <Icon size={15} />
                                {option.label}
                              </button>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex overflow-hidden rounded-md border border-gray-200 bg-white">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                      title="Dạng lưới"
                    >
                      <Grid size={17} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                      title="Dạng danh sách"
                    >
                      <List size={17} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <ProductSkeleton viewMode={viewMode} />
            ) : products.length === 0 ? (
              <div className="market-panel flex flex-col items-center justify-center py-16 text-center">
                <PackageSearch size={42} className="mb-4 text-gray-300" />
                <h3 className="text-lg font-black text-gray-800">Không tìm thấy sản phẩm</h3>
                <p className="mt-2 max-w-md text-sm text-gray-500">Thử thay đổi từ khóa, bộ lọc hoặc khoảng giá để mở rộng kết quả.</p>
                <button onClick={clearFilters} className="market-button mt-5 h-10 px-4 text-sm">
                  <RotateCcw size={16} /> Xem tất cả sản phẩm
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div className="space-y-4">
                {products.map(p => <ProductCard key={p.id} product={p} viewMode="list" />)}
              </div>
            )}

            {products.length > 0 && !loading && (
              <div className="mt-8 text-center">
                <button className="rounded-md border border-emerald-600 bg-white px-5 py-2.5 text-sm font-black text-emerald-700 hover:bg-emerald-50">
                  Xem thêm sản phẩm
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

const StatBox = ({ label, value }) => (
  <div className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2">
    <p className="text-lg font-black text-gray-900">{value}</p>
    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
  </div>
)

const FeatureBox = ({ icon: Icon, title, text }) => (
  <div className="market-panel flex items-center gap-3 p-4">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
      <Icon size={20} />
    </div>
    <div>
      <p className="font-black text-gray-900">{title}</p>
      <p className="text-xs font-semibold text-gray-500">{text}</p>
    </div>
  </div>
)

const FilterTag = ({ label }) => (
  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
    {label}
  </span>
)

const ProductSkeleton = ({ viewMode }) => {
  const count = viewMode === 'grid' ? 6 : 4
  return (
    <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-4'}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="market-panel animate-pulse overflow-hidden">
          <div className={viewMode === 'grid' ? 'h-48 bg-gray-100' : 'h-40 bg-gray-100'} />
          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 rounded bg-gray-100" />
            <div className="h-4 w-1/2 rounded bg-gray-100" />
            <div className="h-7 w-24 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default Products
