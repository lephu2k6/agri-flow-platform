import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export const useProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    category_id: null,
    province: null,
    search: '',
    sortBy: 'newest'
  })

  // 1. Fetch danh sách sản phẩm (Dùng useCallback để tránh re-render vô tận)
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          profiles:farmer_id (id, full_name, phone, province),
          categories:category_id (id, name),
          product_images (id, image_url, is_primary)
        `)
        .eq('status', 'available')

      // Áp dụng bộ lọc
      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id)
      }
      if (filters.province) {
        query = query.eq('province', filters.province)
      }
      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`)
      }

      // Sắp xếp
      const sortMap = {
        newest: { col: 'created_at', asc: false },
        price_low: { col: 'price_per_unit', asc: true },
        price_high: { col: 'price_per_unit', asc: false }
      }
      const sort = sortMap[filters.sortBy] || sortMap.newest
      query = query.order(sort.col, { ascending: sort.asc })

      const { data, error } = await query
      if (error) throw error
      
      setProducts(data || [])
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Không thể tải danh sách sản phẩm')
    } finally {
      setLoading(false)
    }
  }, [filters])

  // 2. Tạo sản phẩm mới kèm upload ảnh
  const createProduct = async (productData, imageFiles) => {
    try {
      setLoading(true)
      
      // B1: Chèn thông tin sản phẩm
      const { data: product, error: pError } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single()

      if (pError) throw pError

      // B2: Upload ảnh lên Storage và lưu link vào DB
      if (imageFiles && imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(async (file, index) => {
          const fileExt = file.name.split('.').pop()
          const fileName = `${product.id}/${Date.now()}-${index}.${fileExt}`
          
          const { error: uError } = await supabase.storage
            .from('product-images')
            .upload(fileName, file)

          if (uError) throw uError

          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName)

          return {
            product_id: product.id,
            image_url: publicUrl,
            is_primary: index === 0 // Ảnh đầu tiên là ảnh chính
          }
        })

        const imagesToInsert = await Promise.all(uploadPromises)
        const { error: iError } = await supabase
          .from('product_images')
          .insert(imagesToInsert)

        if (iError) throw iError
      }

      toast.success('Đăng sản phẩm thành công!')
      return { success: true, data: product }
    } catch (error) {
      console.error('Create error:', error)
      toast.error(error.message || 'Lỗi khi đăng sản phẩm')
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }

  // 3. Xóa sản phẩm (Chuyển sang trạng thái archived)
  const deleteProduct = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return
    
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'archived' })
        .eq('id', id)

      if (error) throw error
      setProducts(prev => prev.filter(p => p.id !== id))
      toast.success('Đã xóa sản phẩm')
      return { success: true }
    } catch (error) {
      toast.error('Không thể xóa sản phẩm')
      return { success: false, error }
    }
  }

  // Tự động fetch khi bộ lọc thay đổi
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return {
    products,
    loading,
    filters,
    setFilters,
    createProduct,
    deleteProduct,
    refetch: fetchProducts
  }
}