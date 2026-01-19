import React, { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { useChat } from '../../contexts/ChatContext'
import { useAuth } from '../../hooks/useAuth'
import ChatWindow from './ChatWindow'
import toast from 'react-hot-toast'

const ChatButton = ({ farmerId, buyerId, productId = null, productTitle = null, className = "" }) => {
  const { user } = useAuth()
  const { createOrOpenConversation, activeConversation, openConversation } = useChat()
  const [showChat, setShowChat] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleOpenChat = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để chat')
      return
    }

    // Không cho phép tự chat với chính mình
    if (user.id === farmerId) {
      toast.error('Bạn không thể chat với chính mình')
      return
    }

    setLoading(true)
    try {
      const result = await createOrOpenConversation(farmerId, buyerId || user.id, productId)
      
      if (result.success) {
        setShowChat(true)
      } else {
        toast.error(result.error || 'Không thể mở chat')
      }
    } catch (error) {
      console.error('Open chat error:', error)
      toast.error('Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  if (showChat && activeConversation) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden">
          <ChatWindow
            conversation={activeConversation}
            onClose={() => setShowChat(false)}
          />
        </div>
      </div>
    )
  }

  const buttonText = className.includes('bg-white') ? 'Chat ngay' : 'Chat với nông dân'
  const defaultClassName = className.includes('bg-white') 
    ? 'flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-colors disabled:opacity-50'
    : 'flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50'

  return (
    <button
      onClick={handleOpenChat}
      disabled={loading}
      className={`${defaultClassName} ${className}`}
    >
      <MessageCircle size={18} />
      {loading ? 'Đang mở...' : buttonText}
    </button>
  )
}

export default ChatButton
