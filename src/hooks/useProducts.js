import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export const useProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    category: null,
    province: null,
    search: ''
  })

  const fetchProducts = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          profiles(full_name, phone, province),
          categories(name),
          product_images(image_url, is_primary)
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.category) {
        query = query.eq('category_id', filters.category)
      }
      if (filters.province) {
        query = query.eq('province', filters.province)
      }
      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Lỗi khi tải sản phẩm')
    } finally {
      setLoading(false)
    }
  }

  const createProduct = async (productData, images) => {
    try {
      // 1. Tạo sản phẩm
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single()

      if (productError) throw productError

      // 2. Upload ảnh
      if (images && images.length > 0) {
        const imagePromises = images.map(async (image, index) => {
          const fileName = `${product.id}/${Date.now()}-${index}`
          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, image)

          if (uploadError) throw uploadError

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName)

          // Save to product_images table
          return supabase
            .from('product_images')
            .insert({
              product_id: product.id,
              image_url: publicUrl,
              is_primary: index === 0
            })
        })

        await Promise.all(imagePromises)
      }

      toast.success('Đăng sản phẩm thành công')
      return { success: true, product }
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error('Lỗi khi đăng sản phẩm')
      return { success: false, error }
    }
  }

  const updateProduct = async (id, updates) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      toast.success('Cập nhật thành công')
      return { success: true }
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Lỗi khi cập nhật')
      return { success: false, error }
    }
  }

  const deleteProduct = async (id) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'archived' })
        .eq('id', id)

      if (error) throw error
      toast.success('Đã xóa sản phẩm')
      return { success: true }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Lỗi khi xóa')
      return { success: false, error }
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [filters])

  return {
    products,
    loading,
    filters,
    setFilters,
    createProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts
  }
}