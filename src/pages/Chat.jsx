import React, { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { useChat } from '../contexts/ChatContext'
import ChatList from '../components/chat/ChatList'
import ChatWindow from '../components/chat/ChatWindow'

const Chat = () => {
  const { activeConversation, setActiveConversation } = useChat()
  const [showChatWindow, setShowChatWindow] = useState(false)

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation)
    setShowChatWindow(true)
  }

  const handleCloseChat = () => {
    setShowChatWindow(false)
    setActiveConversation(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <MessageCircle className="text-emerald-600" size={32} />
            Tin nhắn
          </h1>
          <p className="text-gray-600 mt-2">Trò chuyện với nông dân và người mua</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Cuộc trò chuyện</h2>
              <ChatList onSelectConversation={handleSelectConversation} />
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2">
            {activeConversation && showChatWindow ? (
              <div className="h-[600px]">
                <ChatWindow
                  conversation={activeConversation}
                  onClose={handleCloseChat}
                />
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-12 text-center h-[600px] flex items-center justify-center">
                <div>
                  <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                    <MessageCircle size={48} className="text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Chọn cuộc trò chuyện</h3>
                  <p className="text-gray-600">Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat
