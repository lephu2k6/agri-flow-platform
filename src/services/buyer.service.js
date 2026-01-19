import { supabase } from '../lib/supabase'

export const buyerService = {
  // Tạo đơn hàng mới + TỰ ĐỘNG TRỪ KHO
  async createOrder(orderData) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Vui lòng đăng nhập để mua hàng')

      // 1. Chặn tự mua hàng của chính mình
      if (user.id === orderData.farmer_id) {
        throw new Error('Bạn không thể tự mua sản phẩm của chính mình')
      }

      // 2. Kiểm tra tồn kho thực tế trước khi đặt
      const { data: product, error: pError } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', orderData.product_id)
        .single()

      if (pError || !product) throw new Error('Sản phẩm không tồn tại')
      if (product.quantity < orderData.quantity) {
        throw new Error(`Kho không đủ hàng (Chỉ còn ${product.quantity})`)
      }

      const totalAmount = orderData.total_amount || (orderData.quantity * orderData.unit_price)

      // 3. Chèn đơn hàng mới
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          buyer_id: user.id,
          product_id: orderData.product_id,
          farmer_id: orderData.farmer_id,
          quantity: orderData.quantity,
          unit: orderData.unit,
          unit_price: orderData.unit_price,
          total_amount: totalAmount,
          delivery_address: orderData.delivery_address,
          delivery_province: orderData.delivery_province,
          delivery_district: orderData.delivery_district,
          notes: orderData.notes,
          payment_method: orderData.payment_method,
          status: 'pending' // Giá trị hợp lệ: pending, confirmed, shipped, shipping, completed, cancelled, processing
        }])
        .select()

      if (error) throw error

      // 4. THỰC HIỆN TRỪ KHO (Giảm số lượng kg tồn kho)
      await supabase
        .from('products')
        .update({ quantity: product.quantity - orderData.quantity })
        .eq('id', orderData.product_id)

      return { success: true, data }
    } catch (error) {
      console.error('Create Order Error:', error)
      return { success: false, error: error.message }
    }
  },

  // Lấy danh sách đơn hàng (Đã sửa để tránh lỗi 400)
  async getMyOrders() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { data: [], error: 'Not authenticated' }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products (
            title, 
            unit,
            image_url,
            product_images (
              image_url,
              is_primary
            )
          )
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  async getOrderDetail(orderId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          products (*),
          profiles:farmer_id (full_name, phone_number)
        `)
        .eq('id', orderId)
        .single()
      return { data, error }
    } catch (error) {
      return { data: null, error: error.message }
    }
  }
}
