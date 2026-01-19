import { supabase } from '../lib/supabase'

export const reviewService = {
  // Tạo đánh giá mới
  async createReview(reviewData) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([{
          product_id: reviewData.product_id,
          buyer_id: reviewData.buyer_id,
          order_id: reviewData.order_id,
          rating: reviewData.rating,
          comment: reviewData.comment,
          images: reviewData.images || []
        }])
        .select()
        .single()

      if (error) throw error

      // Cập nhật rating trung bình của sản phẩm
      await this.updateProductRating(reviewData.product_id)

      return { success: true, data }
    } catch (error) {
      console.error('Create review error:', error)
      return { success: false, error: error.message }
    }
  },

  // Lấy đánh giá của sản phẩm
  async getProductReviews(productId, limit = 10, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:buyer_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Get reviews error:', error)
      return { success: false, error: error.message, data: [] }
    }
  },

  // Cập nhật rating trung bình của sản phẩm
  async updateProductRating(productId) {
    try {
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', productId)

      if (!reviews || reviews.length === 0) return

      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      const totalReviews = reviews.length

      await supabase
        .from('products')
        .update({
          average_rating: Math.round(avgRating * 10) / 10,
          total_reviews: totalReviews
        })
        .eq('id', productId)

      return { success: true }
    } catch (error) {
      console.error('Update rating error:', error)
      return { success: false, error: error.message }
    }
  },

  // Kiểm tra xem người dùng đã đánh giá chưa
  async hasUserReviewed(productId, buyerId) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('id')
        .eq('product_id', productId)
        .eq('buyer_id', buyerId)
        .single()

      return { success: true, hasReviewed: !!data }
    } catch (error) {
      return { success: true, hasReviewed: false }
    }
  },

  // Lấy đánh giá của người dùng cho sản phẩm
  async getUserReview(productId, buyerId) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('buyer_id', buyerId)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}
