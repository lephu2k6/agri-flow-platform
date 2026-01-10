import { supabase } from '../lib/supabase'

export const farmerService = {
  // =============== QUẢN LÝ SẢN PHẨM ===============

  // 1. Tạo sản phẩm mới
  async createProduct(productData, images) {
    try {
      const { data: product, error: pError } = await supabase
        .from('products')
        .insert([{
          farmer_id: productData.farmer_id,
          title: productData.title.trim(),
          category_id: productData.category_id,
          description: productData.description,
          quantity: parseFloat(productData.quantity),
          unit: productData.unit,
          price_per_unit: parseFloat(productData.price_per_unit),
          province: productData.province,
          status: 'available',
          min_order_quantity: parseFloat(productData.min_order_quantity || 1)
        }])
        .select().single()

      if (pError) throw pError

      // Upload ảnh nếu có
      if (images && images.length > 0) {
        await this.uploadProductImages(product.id, images)
      }

      return { success: true, product }
    } catch (error) {
      console.error("Lỗi CreateProduct:", error)
      return { success: false, error: error.message }
    }
  },

  // 2. Cập nhật sản phẩm (FIX LỖI: updateProduct is not a function)
  async updateProduct(productId, updateData) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error("Lỗi UpdateProduct:", error.message)
      return { success: false, error: error.message }
    }
  },

  // 3. Hàm bổ trợ upload ảnh (Dùng chung cho Create và Edit)
  async uploadProductImages(productId, files) {
    try {
      const imageInserts = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${productId}/${Date.now()}-${i}.${fileExt}`
        
        const { error: uError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file)

        if (!uError) {
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName)
          
          imageInserts.push({
            product_id: productId,
            image_url: publicUrl,
            is_primary: i === 0 
          })
        }
      }

      if (imageInserts.length > 0) {
        await supabase.from('product_images').insert(imageInserts)
      }
      return { success: true }
    } catch (error) {
      console.error("Lỗi Upload images:", error)
      return { success: false, error: error.message }
    }
  },

  // 4. Lấy danh sách sản phẩm của nông dân
  async getFarmerProducts(farmerId) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *, 
        categories(name), 
        product_images(image_url, is_primary)
      `)
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false })
    
    return { success: !error, products: data || [], error: error?.message }
  },

  // =============== THỐNG KÊ DASHBOARD ===============
  async getFarmerStats(farmerId) {
    try {
      const { data: products } = await supabase
        .from('products')
        .select('id')
        .eq('farmer_id', farmerId)
      
      const productIds = products?.map(p => p.id) || []

      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .in('product_id', productIds)

      if (error) throw error

      const stats = {
        totalProducts: products?.length || 0,
        totalOrders: orders?.length || 0,
        totalRevenue: orders?.filter(o => o.status === 'completed')
                            .reduce((sum, o) => sum + (o.total_amount || 0), 0),
        statusDistribution: orders?.reduce((acc, o) => {
          acc[o.status] = (acc[o.status] || 0) + 1
          return acc
        }, { pending: 0, confirmed: 0, shipped: 0, completed: 0, cancelled: 0 }),
        recentOrders: orders?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)
      }

      return { success: true, stats }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },
}