import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, MapPin, Package, RefreshCw, ChevronRight, Plus } from 'lucide-react'
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
    sortBy: 'newest'
  })

  // 1. Lấy danh mục để lọc
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').order('name')
      if (data) setCategories(data)
    }
    fetchCategories()
  }, [])

  // 2. Hàm fetch sản phẩm - QUAN TRỌNG: Thêm lọc theo user.id
  const fetchMyProducts = useCallback(async () => {
    if (!user?.id) return
    
    setLoading(true)
    try {
      let query = supabase
        .from('products')
        .select('*, categories(name), product_images(image_url, is_primary)')
        .eq('farmer_id', user.id) // FIX: Chỉ lấy sản phẩm của TÔI

      if (filters.search) query = query.ilike('title', `%${filters.search}%`)
      if (filters.category) query = query.eq('category_id', filters.category)

      const sortMap = {
        price_low: { col: 'price_per_unit', asc: true },
        price_high: { col: 'price_per_unit', asc: false },
        newest: { col: 'created_at', asc: false }
      }
      const sort = sortMap[filters.sortBy] || sortMap.newest
      query = query.order(sort.col, { ascending: sort.asc })

      const { data, error } = await query
      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      toast.error('Lỗi tải danh sách sản phẩm')
      console.error(error)
    } finally { setLoading(false) }
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

  if (authLoading) return <div className="p-20 text-center text-gray-500">Đang xác thực...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header & Nút thêm mới */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Sản phẩm của tôi</h1>
          <Link 
            to="/farmer/products/new" 
            className="bg-green-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-green-700 transition-all shadow-sm"
          >
            <Plus size={18} /> Đăng bán mới
          </Link>
        </div>

        {/* Bộ lọc */}
        <div className="bg-white p-4 rounded-2xl shadow-sm mb-6 flex flex-wrap gap-3 items-center border border-gray-100">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" placeholder="Tìm trong kho hàng..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-sm"
              onChange={e => setFilters({...filters, search: e.target.value})}
            />
          </div>
          <select 
            className="p-2 bg-gray-50 border-none rounded-xl text-sm outline-none cursor-pointer"
            onChange={e => setFilters({...filters, category: e.target.value})}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select 
            className="p-2 bg-gray-50 border-none rounded-xl text-sm outline-none cursor-pointer"
            onChange={e => setFilters({...filters, sortBy: e.target.value})}
          >
            <option value="newest">Mới đăng</option>
            <option value="price_low">Giá thấp nhất</option>
          </select>
        </div>

        {/* Danh sách */}
        {loading ? (
          <div className="text-center py-20 text-green-600"><RefreshCw className="animate-spin mx-auto" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed text-gray-400">
            <Package size={48} className="mx-auto mb-3 opacity-20" />
            <p className="mb-4">Bạn chưa có sản phẩm nào đang đăng bán</p>
            <Link to="/farmer/products/new" className="text-green-600 font-bold hover:underline">Đăng sản phẩm đầu tiên ngay</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map(product => {
              const img = product.product_images?.find(i => i.is_primary)?.image_url || 'https://via.placeholder.com/150'
              return (
                <div key={product.id} className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all group">
                  <img src={img} className="w-20 h-20 rounded-xl object-cover border" alt="" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase text-green-600 bg-green-50 px-2 py-0.5 rounded">
                        {product.categories?.name}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        product.status === 'available' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {product.status === 'available' ? 'Đang bán' : 'Bản nháp'}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 truncate group-hover:text-green-600 transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-xs text-gray-500">Kho: {product.quantity} {product.unit} • {product.province}</p>
                  </div>

                  <div className="text-right flex items-center gap-4">
                    <div>
                      <div className="text-lg font-black text-green-600">
                        {new Intl.NumberFormat('vi-VN').format(product.price_per_unit)}đ
                      </div>
                      <div className="text-[10px] text-gray-400 uppercase font-bold">mỗi {product.unit}</div>
                    </div>
                    <Link 
                      to={`/farmer/products/${product.id}`}
                      className="p-2 bg-gray-50 text-gray-400 rounded-full hover:bg-green-500 hover:text-white transition-all shadow-sm"
                    >
                      <ChevronRight size={20} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Products