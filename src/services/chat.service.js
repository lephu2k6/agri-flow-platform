import { supabase } from '../lib/supabase'

export const chatService = {
  // Tạo hoặc lấy conversation giữa farmer và buyer
  async getOrCreateConversation(farmerId, buyerId, productId = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Vui lòng đăng nhập')

      // Kiểm tra conversation đã tồn tại chưa
      let query = supabase
        .from('conversations')
        .select('*')
        .eq('farmer_id', farmerId)
        .eq('buyer_id', buyerId)

      if (productId) {
        query = query.eq('product_id', productId)
      } else {
        query = query.is('product_id', null)
      }

      const { data: existing, error: checkError } = await query.single()

      if (existing && !checkError) {
        return { success: true, conversation: existing }
      }

      // Tạo conversation mới
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert([{
          farmer_id: farmerId,
          buyer_id: buyerId,
          product_id: productId
        }])
        .select()
        .single()

      if (createError) throw createError

      return { success: true, conversation: newConversation }
    } catch (error) {
      console.error('Get or create conversation error:', error)
      return { success: false, error: error.message }
    }
  },

  // Lấy danh sách conversations của user
  async getUserConversations(userId) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          farmer_profile:farmer_id (
            id,
            full_name,
            avatar_url,
            phone
          ),
          buyer_profile:buyer_id (
            id,
            full_name,
            avatar_url,
            phone
          ),
          product:product_id (
            id,
            title,
            image_url,
            product_images (
              image_url,
              is_primary
            )
          )
        `)
        .or(`farmer_id.eq.${userId},buyer_id.eq.${userId}`)
        .order('last_message_at', { ascending: false })

      if (error) {
        // Nếu lỗi do foreign key, thử query không dùng nested select
        if (error.code === 'PGRST200' || error.message?.includes('relationship')) {
          console.warn('Foreign key relationship not found, using alternative query')
          return await this.getUserConversationsAlternative(userId)
        }
        throw error
      }

      // Map lại tên để giữ tương thích
      const conversations = (data || []).map(conv => ({
        ...conv,
        farmer: conv.farmer_profile,
        buyer: conv.buyer_profile
      }))

      return { success: true, conversations }
    } catch (error) {
      console.error('Get conversations error:', error)
      return { success: false, error: error.message, conversations: [] }
    }
  },

  // Alternative method: Query riêng profiles
  async getUserConversationsAlternative(userId) {
    try {
      // Lấy conversations
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .or(`farmer_id.eq.${userId},buyer_id.eq.${userId}`)
        .order('last_message_at', { ascending: false })

      if (convError) throw convError
      if (!conversations || conversations.length === 0) {
        return { success: true, conversations: [] }
      }

      // Lấy tất cả user IDs
      const userIds = new Set()
      conversations.forEach(conv => {
        userIds.add(conv.farmer_id)
        userIds.add(conv.buyer_id)
      })

      // Lấy profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, phone')
        .in('id', Array.from(userIds))

      if (profilesError) throw profilesError

      const profilesMap = new Map((profiles || []).map(p => [p.id, p]))

      // Lấy product IDs
      const productIds = conversations
        .map(c => c.product_id)
        .filter(Boolean)

      let productsMap = new Map()
      if (productIds.length > 0) {
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select(`
            id,
            title,
            image_url,
            product_images (
              image_url,
              is_primary
            )
          `)
          .in('id', productIds)

        if (!productsError && products) {
          products.forEach(p => productsMap.set(p.id, p))
        }
      }

      // Merge data
      const result = conversations.map(conv => ({
        ...conv,
        farmer: profilesMap.get(conv.farmer_id) || null,
        buyer: profilesMap.get(conv.buyer_id) || null,
        product: conv.product_id ? productsMap.get(conv.product_id) || null : null
      }))

      return { success: true, conversations: result }
    } catch (error) {
      console.error('Get conversations alternative error:', error)
      return { success: false, error: error.message, conversations: [] }
    }
  },

  // Lấy messages của một conversation
  async getMessages(conversationId, limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender_profile:sender_id (
            id,
            full_name,
            avatar_url
          ),
          receiver_profile:receiver_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        // Nếu lỗi do foreign key, thử query không dùng nested select
        if (error.code === 'PGRST200' || error.message?.includes('relationship')) {
          console.warn('Foreign key relationship not found, using alternative query')
          return await this.getMessagesAlternative(conversationId, limit, offset)
        }
        throw error
      }

      // Map lại tên để giữ tương thích
      const messages = (data || []).map(msg => ({
        ...msg,
        sender: msg.sender_profile,
        receiver: msg.receiver_profile
      }))

      // Đảo ngược để hiển thị từ cũ đến mới
      return { success: true, messages: messages.reverse() }
    } catch (error) {
      console.error('Get messages error:', error)
      return { success: false, error: error.message, messages: [] }
    }
  },

  // Alternative method: Query riêng profiles
  async getMessagesAlternative(conversationId, limit = 50, offset = 0) {
    try {
      // Lấy messages
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (messagesError) throw messagesError
      if (!messages || messages.length === 0) {
        return { success: true, messages: [] }
      }

      // Lấy tất cả user IDs
      const userIds = new Set()
      messages.forEach(msg => {
        userIds.add(msg.sender_id)
        userIds.add(msg.receiver_id)
      })

      // Lấy profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', Array.from(userIds))

      if (profilesError) throw profilesError

      const profilesMap = new Map((profiles || []).map(p => [p.id, p]))

      // Merge data
      const result = messages.map(msg => ({
        ...msg,
        sender: profilesMap.get(msg.sender_id) || null,
        receiver: profilesMap.get(msg.receiver_id) || null
      }))

      // Đảo ngược để hiển thị từ cũ đến mới
      return { success: true, messages: result.reverse() }
    } catch (error) {
      console.error('Get messages alternative error:', error)
      return { success: false, error: error.message, messages: [] }
    }
  },

  // Gửi tin nhắn
  async sendMessage(conversationId, receiverId, content, messageType = 'text') {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Vui lòng đăng nhập')

      const { data, error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          sender_id: user.id,
          receiver_id: receiverId,
          content,
          message_type: messageType
        }])
        .select()
        .single()

      if (error) throw error

      return { success: true, message: data }
    } catch (error) {
      console.error('Send message error:', error)
      return { success: false, error: error.message }
    }
  },

  // Đánh dấu tin nhắn đã đọc
  async markAsRead(messageId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Vui lòng đăng nhập')

      const { error } = await supabase
        .from('messages')
        .update({
          read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('receiver_id', user.id)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Mark as read error:', error)
      return { success: false, error: error.message }
    }
  },

  // Đánh dấu tất cả tin nhắn trong conversation đã đọc
  async markConversationAsRead(conversationId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Vui lòng đăng nhập')

      const { error } = await supabase
        .from('messages')
        .update({
          read: true,
          read_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', user.id)
        .eq('read', false)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Mark conversation as read error:', error)
      return { success: false, error: error.message }
    }
  },

  // Đếm số tin nhắn chưa đọc
  async getUnreadCount(userId) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('receiver_id', userId)
        .eq('read', false)

      if (error) throw error

      return { success: true, count: data?.length || 0 }
    } catch (error) {
      console.error('Get unread count error:', error)
      return { success: false, error: error.message, count: 0 }
    }
  },

  // Xóa conversation
  async deleteConversation(conversationId) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Vui lòng đăng nhập')

      // Kiểm tra user có quyền xóa không
      const { data: conversation } = await supabase
        .from('conversations')
        .select('farmer_id, buyer_id')
        .eq('id', conversationId)
        .single()

      if (!conversation || (conversation.farmer_id !== user.id && conversation.buyer_id !== user.id)) {
        throw new Error('Không có quyền xóa conversation này')
      }

      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId)

      if (error) throw error

      return { success: true }
    } catch (error) {
      console.error('Delete conversation error:', error)
      return { success: false, error: error.message }
    }
  }
}
