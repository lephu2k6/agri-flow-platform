import { supabase } from '../lib/supabase'

export const buyerService = {
  // Tạo đơn hàng mới
  async createOrder(orderData) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Vui lòng đăng nhập để mua hàng')

      const { data, error } = await supabase
        .from('orders')
        .insert([{
          buyer_id: user.id,
          product_id: orderData.product_id,
          farmer_id: orderData.farmer_id,
          quantity: orderData.quantity,
          total_amount: orderData.total_amount,
          delivery_address: orderData.delivery_address,
          delivery_province: orderData.delivery_province,
          delivery_district: orderData.delivery_district,
          notes: orderData.notes,
          payment_method: orderData.payment_method,
          status: 'pending'
        }])
        .select()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // Lấy danh sách đơn hàng của tôi
  async getMyOrders() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('orders')
      .select('*, products(title, unit, product_images(image_url))')
      .eq('buyer_id', user?.id)
      .order('created_at', { ascending: false })
    return { data, error }
  }
}