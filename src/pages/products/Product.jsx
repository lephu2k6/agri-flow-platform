import React, { useEffect, useState } from 'react'
import {
  Search, Grid, List, SlidersHorizontal, 
  RotateCcw, PackageSearch
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
    })).sort((a, b) => b.isPrimary - a.isPrimary) // Đưa ảnh chính lên đầu
  }))
}

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  const [filters, setFilters] = useState({
    category_id: '', // Đổi từ category sang category_id để khớp với DB
    province: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest',
  })

  const [metadata, setMetadata] = useState({
    provinces: [],
    categories: []
  })

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    fetchMetadata()
    fetchProducts()
  }, [])

  // Fetch dữ liệu cho Sidebar (Tỉnh thành & Danh mục)
  const fetchMetadata = async () => {
    try {
      const [catRes, provRes] = await Promise.all([
        supabase.from('categories').select('id, name'),
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

  const fetchProducts = async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('products')
        .select(`
          *,
          profiles:farmer_id ( id, full_name, phone ),
          product_images ( id, image_url, is_primary ),
          categories:category_id ( id, name )
        `)
        .eq('status', 'available')

      // Áp dụng lọc tại Server (tối ưu hiệu năng)
      if (filters.category_id) query = query.eq('category_id', filters.category_id)
      if (filters.province) query = query.eq('province', filters.province)
      if (filters.minPrice) query = query.gte('price_per_unit', Number(filters.minPrice))
      if (filters.maxPrice) query = query.lte('price_per_unit', Number(filters.maxPrice))

      // Sắp xếp tại Server
      if (filters.sortBy === 'newest') query = query.order('created_at', { ascending: false })
      if (filters.sortBy === 'price_low') query = query.order('price_per_unit', { ascending: true })
      if (filters.sortBy === 'price_high') query = query.order('price_per_unit', { ascending: false })

      const { data, error } = await query
      if (error) throw error

      let result = normalizeProducts(data || [])

      // Tìm kiếm tại Client (để trải nghiệm mượt hơn)
      if (search.trim()) {
        const s = search.toLowerCase()
        result = result.filter(p =>
          p.title?.toLowerCase().includes(s) ||
          p.profiles?.full_name?.toLowerCase().includes(s)
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
    // Re-fetch sẽ được trigger do logic update
    setTimeout(fetchProducts, 100)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header & Search Bar */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <h1 className="text-xl font-bold text-gray-800 whitespace-nowrap">Chợ Nông Sản</h1>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Tìm sản phẩm, nông dân..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchProducts()}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <button 
              onClick={fetchProducts}
              className="bg-green-600 text-white px-6 py-2 rounded-full font-medium hover:bg-green-700 transition-colors"
            >
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar lọc */}
          <aside className="lg:w-1/4">
            <ProductFilterSidebar
              filters={filters}
              onFilterChange={(k, v) => setFilters(p => ({ ...p, [k]: v }))}
              provinces={metadata.provinces}
              categories={metadata.categories}
              onApply={fetchProducts}
              onClear={clearFilters}
            />
          </aside>

          {/* Danh sách sản phẩm */}
          <main className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Hiển thị <span className="font-bold text-gray-900">{products.length}</span> sản phẩm
              </p>
              <div className="flex items-center gap-2 border rounded-lg p-1 bg-white">
                <button className="p-1.5 bg-gray-100 rounded text-green-600"><Grid size={18}/></button>
                <button className="p-1.5 text-gray-400 hover:text-gray-600"><List size={18}/></button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white h-80 rounded-xl animate-pulse border"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed">
                <PackageSearch size={64} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Không tìm thấy sản phẩm nào</h3>
                <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                <button onClick={clearFilters} className="mt-4 text-green-600 font-semibold flex items-center gap-2">
                  <RotateCcw size={16}/> Đặt lại bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default Products