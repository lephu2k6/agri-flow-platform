import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, MapPin, Star, Package, ShoppingCart } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import React from 'react'
const Products = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [provinces, setProvinces] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    province: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest'
  })
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchProvinces()
  }, [filters])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          profiles(full_name, phone, province, rating),
          categories(name),
          product_images(image_url, is_primary),
          orders(count)
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`)
      }
      
      if (filters.category) {
        query = query.eq('category_id', filters.category)
      }
      
      if (filters.province) {
        query = query.eq('province', filters.province)
      }
      
      if (filters.minPrice) {
        query = query.gte('price_per_unit', parseFloat(filters.minPrice))
      }
      
      if (filters.maxPrice) {
        query = query.lte('price_per_unit', parseFloat(filters.maxPrice))
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'price_low':
          query = query.order('price_per_unit', { ascending: true })
          break
        case 'price_high':
          query = query.order('price_per_unit', { ascending: false })
          break
        case 'popular':
          query = query.order('view_count', { ascending: false })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }

      const { data, error } = await query

      if (error) throw error

      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Không thể tải danh sách sản phẩm')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      
      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchProvinces = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('province')
        .not('province', 'is', null)
        .order('province')
      
      if (error) throw error
      
      const uniqueProvinces = [...new Set(data.map(item => item.province))]
      setProvinces(uniqueProvinces)
    } catch (error) {
      console.error('Error fetching provinces:', error)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const handleAddToCart = (product) => {
    toast.success(`Đã thêm ${product.title} vào giỏ hàng`)
  }

  const handleQuickView = (product) => {
    setSelectedProduct(product)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sản phẩm nông sản</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Khám phá các sản phẩm nông sản tươi ngon, chất lượng từ nông dân trên khắp cả nước
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tên sản phẩm..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Province */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tỉnh/Thành phố
              </label>
              <select
                value={filters.province}
                onChange={(e) => setFilters({ ...filters, province: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Tất cả địa điểm</option>
                {provinces.map(province => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sắp xếp
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="newest">Mới nhất</option>
                <option value="price_low">Giá thấp → cao</option>
                <option value="price_high">Giá cao → thấp</option>
                <option value="popular">Phổ biến nhất</option>
              </select>
            </div>
          </div>

          {/* Price Range */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá tối thiểu (VNĐ)
              </label>
              <input
                type="number"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá tối đa (VNĐ)
              </label>
              <input
                type="number"
                placeholder="1000000"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({
                  search: '',
                  category: '',
                  province: '',
                  minPrice: '',
                  maxPrice: '',
                  sortBy: 'newest'
                })}
                className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>

        {/* Products Count */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-600">
              Tìm thấy <span className="font-bold text-gray-900">{products.length}</span> sản phẩm
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <Filter className="h-4 w-4" />
              <span>Bộ lọc đang hoạt động</span>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-gray-500 mb-6">Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác</p>
            <button
              onClick={() => setFilters({
                search: '',
                category: '',
                province: '',
                minPrice: '',
                maxPrice: '',
                sortBy: 'newest'
              })}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              const primaryImage = product.product_images?.find(img => img.is_primary)
              const rating = product.profiles?.rating || 4.5
              
              return (
                <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  {/* Product Image */}
                  <Link to={`/products/${product.id}`}>
                    <div className="relative h-48 overflow-hidden">
                      {primaryImage ? (
                        <img
                          src={primaryImage.image_url}
                          alt={product.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Package className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.status === 'available' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.status === 'available' ? 'Còn hàng' : 'Hết hàng'}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-4">
                    <Link to={`/products/${product.id}`}>
                      <h3 className="font-semibold text-gray-900 mb-2 hover:text-green-600 line-clamp-1">
                        {product.title}
                      </h3>
                    </Link>
                    
                    {/* Seller & Location */}
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{product.province}</span>
                    </div>
                    
                    {/* Rating */}
                    <div className="flex items-center mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-2">
                        ({product.orders?.count || 0})
                      </span>
                    </div>
                    
                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(product.price_per_unit)}
                          <span className="text-sm text-gray-500">/{product.unit}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          Còn: {product.quantity} {product.unit}
                        </p>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Link
                        to={`/products/${product.id}`}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-center font-medium"
                      >
                        Xem chi tiết
                      </Link>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="p-2 border border-green-500 text-green-500 rounded-lg hover:bg-green-50"
                      >
                        <ShoppingCart className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {products.length > 0 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button className="px-3 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">
                ← Trước
              </button>
              <button className="px-3 py-2 border rounded-lg bg-green-500 text-white">
                1
              </button>
              <button className="px-3 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">
                3
              </button>
              <span className="px-2 text-gray-500">...</span>
              <button className="px-3 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">
                10
              </button>
              <button className="px-3 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">
                Sau →
              </button>
            </nav>
          </div>
        )}

        {/* Categories Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Danh mục sản phẩm</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setFilters({ ...filters, category: category.id })}
                className={`p-4 rounded-lg text-center transition-colors ${
                  filters.category === category.id
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
                }`}
              >
                <Package className="h-8 w-8 mx-auto mb-2" />
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Products