import React, { useState, useEffect, useRef } from 'react'
import { Send, X, User, Image as ImageIcon, Loader2 } from 'lucide-react'
import { useChat } from '../../contexts/ChatContext'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

const ChatWindow = ({ conversation, onClose }) => {
  const { user } = useAuth()
  const { messages, sendMessage, fetchMessages } = useChat()
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (conversation) {
      fetchMessages(conversation.id)
    }
  }, [conversation?.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!messageText.trim() || sending) return

    const receiverId = user.id === conversation.farmer_id 
      ? conversation.buyer_id 
      : conversation.farmer_id

    setSending(true)
    const result = await sendMessage(conversation.id, receiverId, messageText.trim())
    
    if (result.success) {
      setMessageText('')
      inputRef.current?.focus()
    } else {
      toast.error(result.error || 'Không thể gửi tin nhắn')
    }
    setSending(false)
  }

  const getOtherUser = () => {
    if (!conversation) return null
    return user.id === conversation.farmer_id 
      ? conversation.buyer 
      : conversation.farmer
  }

  const formatTime = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'Vừa xong'
    }
  }

  const otherUser = getOtherUser()

  if (!conversation) return null

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold">
            {otherUser?.full_name?.charAt(0).toUpperCase() || <User size={20} />}
          </div>
          <div>
            <h3 className="font-bold">{otherUser?.full_name || 'Người dùng'}</h3>
            <p className="text-xs text-emerald-100">
              {conversation.product ? conversation.product.title : 'Trò chuyện chung'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Send size={32} className="text-emerald-400" />
            </div>
            <p className="text-gray-500">Chưa có tin nhắn nào</p>
            <p className="text-sm text-gray-400 mt-2">Bắt đầu cuộc trò chuyện!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === user.id
            const sender = message.sender

            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  {!isOwn && (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm flex-shrink-0">
                      {sender?.full_name?.charAt(0).toUpperCase() || <User size={16} />}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`rounded-2xl px-4 py-2 ${
                    isOwn
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}>
                    {!isOwn && (
                      <p className="text-xs font-semibold mb-1 text-gray-500">
                        {sender?.full_name || 'Người dùng'}
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <div className={`text-xs mt-1 ${
                      isOwn ? 'text-emerald-100' : 'text-gray-400'
                    }`}>
                      {formatTime(message.created_at)}
                      {isOwn && message.read && (
                        <span className="ml-1">✓✓</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend(e)
                }
              }}
              placeholder="Nhập tin nhắn..."
              rows={1}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none max-h-32"
            />
          </div>
          <button
            type="submit"
            disabled={!messageText.trim() || sending}
            className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {sending ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChatWindow
