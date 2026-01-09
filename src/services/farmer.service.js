import { supabase } from '../lib/supabase'

export const farmerService = {
  // =============== PRODUCT MANAGEMENT ===============
  async createProduct(productData, images) {
    try {
      // 1. Validate product data
      const validationError = this.validateProductData(productData)
      if (validationError) {
        return { success: false, error: validationError }
      }

      // 2. Create product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([{
          farmer_id: productData.farmer_id,
          title: productData.title.trim(),
          category_id: productData.category_id,
          description: productData.description?.trim(),
          quantity: parseFloat(productData.quantity),
          unit: productData.unit,
          price_per_unit: parseFloat(productData.price_per_unit),
          province: productData.province,
          district: productData.district?.trim(),
          quality_standard: productData.quality_standard?.trim(),
          status: 'available',
          min_order_quantity: parseFloat(productData.min_order_quantity) || 1
        }])
        .select()
        .single()

      if (productError) {
        console.error('Create product error:', productError)
        return { success: false, error: 'Không thể tạo sản phẩm' }
      }

      // 3. Upload images if provided
      let imageUrls = []
      if (images && images.length > 0) {
        imageUrls = await this.uploadProductImages(product.id, images)
        
        // Save image URLs to database
        for (const [index, imageUrl] of imageUrls.entries()) {
          await supabase
            .from('product_images')
            .insert({
              product_id: product.id,
              image_url: imageUrl,
              is_primary: index === 0,
              display_order: index
            })
        }
      }

      return {
        success: true,
        product: { ...product, images: imageUrls },
        message: 'Đăng sản phẩm thành công!'
      }

    } catch (error) {
      console.error('Create product error:', error)
      return { success: false, error: 'Có lỗi xảy ra khi đăng sản phẩm' }
    }
  },

  async getFarmerProducts(farmerId, filters = {}) {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories(name),
          product_images(image_url, is_primary),
          orders!inner(count)
        `, { count: 'exact' })
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      
      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id)
      }

      const { data: products, error, count } = await query

      if (error) {
        console.error('Get farmer products error:', error)
        return { success: false, error: 'Không thể tải sản phẩm' }
      }

      return {
        success: true,
        products: products || [],
        total: count || 0
      }

    } catch (error) {
      console.error('Get farmer products error:', error)
      return { success: false, error: 'Có lỗi xảy ra khi tải sản phẩm' }
    }
  },

  async updateProduct(productId, updates) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select()
        .single()

      if (error) {
        console.error('Update product error:', error)
        return { success: false, error: 'Không thể cập nhật sản phẩm' }
      }

      return {
        success: true,
        product: data,
        message: 'Cập nhật sản phẩm thành công!'
      }

    } catch (error) {
      console.error('Update product error:', error)
      return { success: false, error: 'Có lỗi xảy ra khi cập nhật sản phẩm' }
    }
  },

  async deleteProduct(productId) {
    try {
      const { error } = await supabase
        .from('products')
        .update({ 
          status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)

      if (error) {
        console.error('Delete product error:', error)
        return { success: false, error: 'Không thể xóa sản phẩm' }
      }

      return {
        success: true,
        message: 'Đã xóa sản phẩm thành công!'
      }

    } catch (error) {
      console.error('Delete product error:', error)
      return { success: false, error: 'Có lỗi xảy ra khi xóa sản phẩm' }
    }
  },

  // =============== ORDER MANAGEMENT ===============
  async getFarmerOrders(farmerId, filters = {}) {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          products(title, price_per_unit, unit),
          profiles!orders_buyer_id_fkey(full_name, phone, province)
        `)
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from)
      }
      
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to)
      }

      const { data: orders, error } = await query

      if (error) {
        console.error('Get farmer orders error:', error)
        return { success: false, error: 'Không thể tải đơn hàng' }
      }

      return {
        success: true,
        orders: orders || []
      }

    } catch (error) {
      console.error('Get farmer orders error:', error)
      return { success: false, error: 'Có lỗi xảy ra khi tải đơn hàng' }
    }
  },

  async updateOrderStatus(orderId, status, notes = '') {
    try {
      const statusMap = {
        'pending': 'pending',
        'confirmed': 'confirmed',
        'shipped': 'shipped',
        'completed': 'completed',
        'cancelled': 'cancelled'
      }

      if (!statusMap[status]) {
        return { success: false, error: 'Trạng thái không hợp lệ' }
      }

      const updates = {
        status: statusMap[status],
        updated_at: new Date().toISOString()
      }

      // Add timestamps based on status
      if (status === 'confirmed') {
        updates.farmer_confirmed_at = new Date().toISOString()
      }

      if (notes) {
        updates.farmer_notes = notes
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId)
        .select()
        .single()

      if (error) {
        console.error('Update order status error:', error)
        return { success: false, error: 'Không thể cập nhật trạng thái đơn hàng' }
      }

      // If order is confirmed, update product quantity
      if (status === 'confirmed') {
        await this.updateProductQuantity(data.product_id, data.quantity, 'subtract')
      }

      return {
        success: true,
        order: data,
        message: `Đã ${this.getStatusText(status)} đơn hàng thành công!`
      }

    } catch (error) {
      console.error('Update order status error:', error)
      return { success: false, error: 'Có lỗi xảy ra khi cập nhật trạng thái đơn hàng' }
    }
  },

  // =============== STATISTICS & REPORTS ===============
  async getFarmerStats(farmerId, period = 'month') {
    try {
      const now = new Date()
      let startDate = new Date()
      
      switch (period) {
        case 'week':
          startDate.setDate(now.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(now.getMonth() - 1)
          break
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3)
          break
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1)
          break
        default:
          startDate.setMonth(now.getMonth() - 1)
      }

      // Get total products
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('farmer_id', farmerId)
        .eq('status', 'available')

      // Get total orders
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('farmer_id', farmerId)

      // Get recent orders
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('farmer_id', farmerId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(10)

      // Calculate total revenue
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('farmer_id', farmerId)
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString())

      const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

      // Get order status distribution
      const { data: statusData } = await supabase
        .from('orders')
        .select('status')
        .eq('farmer_id', farmerId)

      const statusDistribution = statusData?.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
      }, {}) || {}

      return {
        success: true,
        stats: {
          totalProducts: totalProducts || 0,
          totalOrders: totalOrders || 0,
          totalRevenue,
          recentOrders: recentOrders || [],
          statusDistribution,
          period
        }
      }

    } catch (error) {
      console.error('Get farmer stats error:', error)
      return { success: false, error: 'Không thể tải thống kê' }
    }
  },

  // =============== CHAT MANAGEMENT ===============
  async getFarmerChats(farmerId) {
    try {
      // Get all orders that have messages
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          total_amount,
          created_at,
          profiles!orders_buyer_id_fkey(
            full_name,
            phone,
            avatar_url
          ),
          messages(
            id,
            message,
            created_at,
            sender_id,
            read
          )
        `)
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Get farmer chats error:', error)
        return { success: false, error: 'Không thể tải tin nhắn' }
      }

      // Process chats to show last message and unread count
      const chats = orders.map(order => {
        const messages = order.messages || []
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null
        const unreadCount = messages.filter(msg => !msg.read && msg.sender_id !== farmerId).length

        return {
          orderId: order.id,
          buyer: order.profiles,
          lastMessage,
          unreadCount,
          orderStatus: order.status,
          totalAmount: order.total_amount,
          createdAt: order.created_at
        }
      })

      return {
        success: true,
        chats: chats.filter(chat => chat.lastMessage) // Only show chats with messages
      }

    } catch (error) {
      console.error('Get farmer chats error:', error)
      return { success: false, error: 'Có lỗi xảy ra khi tải tin nhắn' }
    }
  },

  async sendMessage(orderId, senderId, message) {
    try {
      if (!message.trim()) {
        return { success: false, error: 'Tin nhắn không được để trống' }
      }

      const { data, error } = await supabase
        .from('messages')
        .insert([{
          order_id: orderId,
          sender_id: senderId,
          message: message.trim(),
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error('Send message error:', error)
        return { success: false, error: 'Không thể gửi tin nhắn' }
      }

      return {
        success: true,
        message: data,
        notification: 'Đã gửi tin nhắn!'
      }

    } catch (error) {
      console.error('Send message error:', error)
      return { success: false, error: 'Có lỗi xảy ra khi gửi tin nhắn' }
    }
  },

  async markMessagesAsRead(orderId, userId) {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('order_id', orderId)
        .neq('sender_id', userId)
        .eq('read', false)

      if (error) {
        console.error('Mark messages as read error:', error)
        return { success: false, error: 'Không thể đánh dấu đã đọc' }
      }

      return { success: true }

    } catch (error) {
      console.error('Mark messages as read error:', error)
      return { success: false, error: 'Có lỗi xảy ra khi đánh dấu đã đọc' }
    }
  },

  // =============== HELPER METHODS ===============
  async uploadProductImages(productId, imageFiles, userId) {
  const imageUrls = []

  for (const [index, file] of imageFiles.entries()) {
    try {
      const fileExt = file.name.split('.').pop()

   
      const filePath = `${userId}/products/${productId}/${Date.now()}-${index}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) {
        console.error("Upload image error:", uploadError)
        continue
      }

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath)

      imageUrls.push(data.publicUrl)
    } catch (error) {
      console.error("Upload image error:", error)
    }
  }

  return imageUrls
},

  async updateProductQuantity(productId, quantity, operation = 'subtract') {
    try {
      const { data: product } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', productId)
        .single()

      if (!product) return

      const newQuantity = operation === 'subtract' 
        ? product.quantity - quantity 
        : product.quantity + quantity

      await supabase
        .from('products')
        .update({ 
          quantity: newQuantity,
          status: newQuantity <= 0 ? 'sold_out' : 'available'
        })
        .eq('id', productId)

    } catch (error) {
      console.error('Update product quantity error:', error)
    }
  },

  validateProductData(productData) {
    const { title, category_id, quantity, unit, price_per_unit, province } = productData

    if (!title || title.trim().length < 3) {
      return 'Tên sản phẩm phải có ít nhất 3 ký tự'
    }

    if (!category_id) {
      return 'Vui lòng chọn danh mục sản phẩm'
    }

    if (!quantity || quantity <= 0) {
      return 'Số lượng phải lớn hơn 0'
    }

    if (!unit) {
      return 'Vui lòng chọn đơn vị tính'
    }

    if (!price_per_unit || price_per_unit <= 0) {
      return 'Giá sản phẩm phải lớn hơn 0'
    }

    if (!province) {
      return 'Vui lòng chọn tỉnh/thành phố'
    }

    return null
  },

  getStatusText(status) {
    const statusMap = {
      'pending': 'chờ xác nhận',
      'confirmed': 'xác nhận',
      'shipped': 'giao hàng',
      'completed': 'hoàn thành',
      'cancelled': 'hủy'
    }
    return statusMap[status] || status
  }
}