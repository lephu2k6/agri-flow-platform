import React from 'react'
import { MessageCircle, User, Package, Clock } from 'lucide-react'
import { useChat } from '../../contexts/ChatContext'
import { useAuth } from '../../hooks/useAuth'
import { formatDistanceToNow } from 'date-fns'

const ChatList = ({ onSelectConversation }) => {
  const { conversations, unreadCount, loading } = useChat()
  const { user } = useAuth()

  const getOtherUser = (conversation) => {
    return user.id === conversation.farmer_id 
      ? conversation.buyer 
      : conversation.farmer
  }

  const getUnreadCount = (conversationId) => {
    // Có thể tính từ messages chưa đọc
    return 0 // TODO: Implement unread count per conversation
  }

  const formatTime = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return ''
    }
  }

  const getProductImage = (product) => {
    if (product?.product_images?.length > 0) {
      const primary = product.product_images.find(img => img.is_primary)
      return primary?.image_url || product.product_images[0]?.image_url
    }
    return product?.image_url || null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {conversations.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <MessageCircle size={32} className="text-emerald-400" />
          </div>
          <p className="text-gray-600 font-medium">Chưa có cuộc trò chuyện nào</p>
          <p className="text-sm text-gray-400 mt-2">Bắt đầu trò chuyện từ trang sản phẩm</p>
        </div>
      ) : (
        conversations.map((conversation) => {
          const otherUser = getOtherUser(conversation)
          const unread = getUnreadCount(conversation.id)
          const productImage = getProductImage(conversation.product)

          return (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className="w-full p-4 bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all text-left group"
            >
              <div className="flex items-start gap-3">
                {/* Avatar/Product Image */}
                <div className="relative flex-shrink-0">
                  {productImage ? (
                    <img
                      src={productImage}
                      alt={conversation.product?.title}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center">
                      <User size={20} className="text-emerald-600" />
                    </div>
                  )}
                  {unread > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unread > 9 ? '9+' : unread}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors truncate">
                      {otherUser?.full_name || 'Người dùng'}
                    </h4>
                    {conversation.last_message_at && (
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {formatTime(conversation.last_message_at)}
                      </span>
                    )}
                  </div>
                  
                  {conversation.product && (
                    <p className="text-xs text-emerald-600 font-medium mb-1 truncate">
                      {conversation.product.title}
                    </p>
                  )}
                  
                  <p className="text-sm text-gray-500 truncate">
                    {/* Last message preview - có thể thêm sau */}
                    Nhấn để xem tin nhắn
                  </p>
                </div>
              </div>
            </button>
          )
        })
      )}
    </div>
  )
}

export default ChatList
