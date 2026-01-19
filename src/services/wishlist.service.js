import { supabase } from '../lib/supabase'

export const wishlistService = {
  // Thêm vào wishlist
  async addToWishlist(productId, userId) {
    try {
      // Kiểm tra xem đã có trong wishlist chưa
      const { data: existing } = await supabase
        .from('wishlists')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', userId)
        .single()

      if (existing) {
        return { success: true, message: 'Đã có trong danh sách yêu thích' }
      }

      const { data, error } = await supabase
        .from('wishlists')
        .insert([{
          product_id: productId,
          user_id: userId
        }])
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Add to wishlist error:', error)
      return { success: false, error: error.message }
    }
  },

  // Xóa khỏi wishlist
  async removeFromWishlist(productId, userId) {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('product_id', productId)
        .eq('user_id', userId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Remove from wishlist error:', error)
      return { success: false, error: error.message }
    }
  },

  // Lấy danh sách wishlist của user
  async getUserWishlist(userId) {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          products (
            *,
            product_images (image_url, is_primary),
            profiles:farmer_id (full_name, province),
            categories:category_id (name)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Get wishlist error:', error)
      return { success: false, error: error.message, data: [] }
    }
  },

  // Kiểm tra xem sản phẩm có trong wishlist không
  async isInWishlist(productId, userId) {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', userId)
        .single()

      return { success: true, isInWishlist: !!data }
    } catch (error) {
      return { success: true, isInWishlist: false }
    }
  }
}
