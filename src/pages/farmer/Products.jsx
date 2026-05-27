import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Search, MapPin, Package, RefreshCw, ChevronRight,
  Plus, Edit, Eye, BarChart3, Boxes, Tags, Archive
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

const statusConfig = {
  available: { label: 'Đang bán', className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  draft: { label: 'Bản nháp', className: 'bg-gray-50 text-gray-700 border-gray-200' },
  out_of_stock: { label: 'Hết hàng', className: 'bg-amber-50 text-amber-700 border-amber-100' },
  archived: { label: 'Đã lưu trữ', className: 'bg-slate-50 text-slate-700 border-slate-200' }
}

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
      if (!user) navigate('/login')
      else fetchMyProducts()
    }
  }, [fetchMyProducts, authLoading, user, navigate])

  if (authLoading) return (
    <div className="market-surface flex min-h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-100 border-t-emerald-600" />
    </div>
  )

  const activeProducts = products.filter(p => p.status === 'available').length
  const totalStock = products.reduce((sum, p) => sum + (p.quantity || 0), 0)
  const draftProducts = products.filter(p => p.status === 'draft').length
  const hasFilters = filters.category || filters.status || filters.search

  const resetFilters = () => setFilters({ search: '', category: '', status: '', sortBy: 'newest' })

  return (
    <div className="market-surface min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
              <Package size={26} />
            </div>
            <div>
              <h1 className="market-heading text-2xl">Quản lý sản phẩm</h1>
              <p className="text-sm text-gray-500">Theo dõi tồn kho, giá bán và trạng thái hiển thị của sản phẩm.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={fetchMyProducts} className="inline-flex h-10 items-center gap-2 rounded-md border border-gray-200 bg-white px-4 text-sm font-bold text-gray-600 hover:bg-gray-50">
              <RefreshCw size={16} /> Làm mới
            </button>
            <Link to="/farmer/products/create" className="market-button h-10 px-4 text-sm">
              <Plus size={18} /> Đăng sản phẩm mới
            </Link>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Metric icon={Boxes} label="Tổng sản phẩm" value={products.length} />
          <Metric icon={BarChart3} label="Đang bán" value={activeProducts} />
          <Metric icon={Archive} label="Tổng tồn kho" value={totalStock} />
          <Metric icon={Tags} label="Danh mục" value={categories.length} note={`${draftProducts} bản nháp`} />
        </div>

        <div className="market-panel mb-6 p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_200px_200px_200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={filters.search}
                placeholder="Tìm sản phẩm theo tên..."
                className="market-input h-11 w-full pl-10 pr-4 text-sm"
                onChange={e => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            <select
              value={filters.category}
              className="market-input h-11 px-3 text-sm"
              onChange={e => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select
              value={filters.status}
              className="market-input h-11 px-3 text-sm"
              onChange={e => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="available">Đang bán</option>
              <option value="draft">Bản nháp</option>
              <option value="out_of_stock">Hết hàng</option>
              <option value="archived">Đã lưu trữ</option>
            </select>

            <select
              value={filters.sortBy}
              className="market-input h-11 px-3 text-sm"
              onChange={e => setFilters({ ...filters, sortBy: e.target.value })}
            >
              <option value="newest">Mới nhất</option>
              <option value="price_low">Giá thấp đến cao</option>
              <option value="price_high">Giá cao đến thấp</option>
              <option value="popular">Phổ biến nhất</option>
            </select>
          </div>

          {hasFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4">
              <span className="text-sm font-semibold text-gray-500">Đang lọc:</span>
              {filters.category && <FilterTag label={categories.find(c => c.id === filters.category)?.name} />}
              {filters.status && <FilterTag label={statusConfig[filters.status]?.label} />}
              {filters.search && <FilterTag label={`"${filters.search}"`} />}
              <button onClick={resetFilters} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500 hover:text-emerald-700">
                Xóa tất cả
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, index) => <ProductSkeleton key={index} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="market-panel border-dashed p-12 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <Package size={38} />
            </div>
            <h3 className="text-xl font-black text-gray-900">Chưa có sản phẩm nào</h3>
            <p className="mt-2 text-sm text-gray-500">Bắt đầu bằng cách đăng bán sản phẩm đầu tiên của bạn.</p>
            <Link to="/farmer/products/create" className="market-button mt-6 h-11 px-5 text-sm">
              <Plus size={18} /> Đăng sản phẩm mới
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map(product => <FarmerProductCard key={product.id} product={product} />)}
          </div>
        )}

        {products.length > 0 && !loading && (
          <div className="mt-8 text-center text-sm font-semibold text-gray-500">
            Hiển thị {products.length} sản phẩm
          </div>
        )}
      </div>
    </div>
  )
}

const FarmerProductCard = ({ product }) => {
  const mainImage = product.product_images?.find(img => img.is_primary)?.image_url ||
    product.product_images?.[0]?.image_url ||
    'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop'
  const status = statusConfig[product.status] || statusConfig.draft

  return (
    <div className="market-panel group overflow-hidden transition hover:border-emerald-200 hover:shadow-md">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img src={mainImage} alt={product.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
        <div className="absolute left-3 top-3">
          <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black uppercase ${status.className}`}>
            {status.label}
          </span>
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-black/55 px-2 py-1 text-[11px] font-bold text-white">
          <Eye size={11} className="mr-1 inline" /> {product.views_count || 0}
        </div>
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold text-gray-500">
          <span className="truncate rounded-full bg-gray-100 px-2 py-0.5">{product.categories?.name || 'Chưa phân loại'}</span>
          <span className="flex items-center gap-1"><MapPin size={12} /> {product.province || 'N/A'}</span>
        </div>
        <h3 className="line-clamp-2 min-h-11 text-base font-black leading-snug text-gray-900">{product.title}</h3>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <InfoBox label="Tồn kho" value={`${product.quantity || 0} ${product.unit || ''}`} icon={Package} />
          <InfoBox label="Giá bán" value={`${new Intl.NumberFormat('vi-VN').format(product.price_per_unit || 0)}đ`} />
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <Link to={`/products/${product.id}`} target="_blank" className="inline-flex items-center gap-1 text-sm font-bold text-gray-600 hover:text-emerald-700">
            <Eye size={15} /> Xem công khai
          </Link>
          <div className="flex items-center gap-2">
            <Link to={`/farmer/products/${product.id}/edit`} className="rounded-md bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100" title="Chỉnh sửa">
              <Edit size={16} />
            </Link>
            <Link to={`/farmer/products/${product.id}`} className="rounded-md bg-gray-100 p-2 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700" title="Chi tiết">
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

const Metric = ({ icon: Icon, label, value, note }) => (
  <div className="market-panel p-4">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{label}</p>
        <p className="mt-2 text-2xl font-black text-gray-900">{value}</p>
        {note && <p className="mt-1 text-xs font-semibold text-gray-400">{note}</p>}
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
        <Icon size={20} />
      </div>
    </div>
  </div>
)

const InfoBox = ({ label, value, icon: Icon }) => (
  <div className="rounded-md bg-gray-50 p-3">
    <p className="text-xs font-semibold text-gray-500">{label}</p>
    <p className="mt-1 flex items-center gap-1 text-sm font-black text-gray-900">
      {Icon && <Icon size={14} className="text-emerald-600" />} {value}
    </p>
  </div>
)

const FilterTag = ({ label }) => (
  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{label}</span>
)

const ProductSkeleton = () => (
  <div className="market-panel animate-pulse overflow-hidden">
    <div className="h-48 bg-gray-100" />
    <div className="space-y-3 p-4">
      <div className="h-4 w-2/3 rounded bg-gray-100" />
      <div className="h-4 w-1/2 rounded bg-gray-100" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-14 rounded bg-gray-100" />
        <div className="h-14 rounded bg-gray-100" />
      </div>
    </div>
  </div>
)

export default Products
