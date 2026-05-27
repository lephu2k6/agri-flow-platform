import React, { useState } from 'react'
import { MessageCircle, X, Sparkles, MessageSquare, AlertCircle, ShieldAlert, ArrowLeft } from 'lucide-react'
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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-500 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold mb-3">
              <Sparkles size={12} />
              <span>Giao Thương Trực Tiếp Real-time</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <MessageCircle className="text-emerald-500" size={32} />
              <span>Trung Tâm Tin Nhắn</span>
            </h1>
            <p className="text-sm text-slate-400 mt-2">Trao đổi trực tiếp, đàm phán giá cả và theo dõi hợp đồng cung ứng nông sản.</p>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold bg-white px-4 py-2.5 rounded-xl border border-slate-100 shadow-xs">
            <AlertCircle size={14} className="text-emerald-500" />
            <span>Mọi cuộc trò chuyện đều được mã hóa bảo chứng giao dịch</span>
          </div>
        </div>

        {/* Sleek Mobile View back button if a chat is active on small screens */}
        {activeConversation && showChatWindow && (
          <button 
            onClick={handleCloseChat}
            className="lg:hidden flex items-center gap-2 text-emerald-600 font-bold text-sm mb-4 px-1"
          >
            <ArrowLeft size={16} />
            <span>Quay lại danh sách hội thoại</span>
          </button>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[650px] relative">
          
          {/* LEFT PANEL - CHAT LIST (HIDDEN ON MOBILE IF CHAT WINDOW IS ACTIVE) */}
          <div className={`lg:col-span-4 h-full ${
            activeConversation && showChatWindow ? 'hidden lg:block' : 'block'
          }`}>
            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 h-full flex flex-col relative overflow-hidden group">
              {/* Border decoration */}
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 to-teal-500"></div>
              
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Hộp Thư Hội Thoại</h2>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-full uppercase">
                  Trực tuyến
                </span>
              </div>
              
              {/* Chat list wrapper with custom scroll */}
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                <ChatList onSelectConversation={handleSelectConversation} />
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - CHAT WINDOW (HIDDEN ON MOBILE IF LIST IS ACTIVE) */}
          <div className={`lg:col-span-8 h-full ${
            activeConversation && showChatWindow ? 'block' : 'hidden lg:block'
          }`}>
            {activeConversation && showChatWindow ? (
              <div className="h-full bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden flex flex-col relative">
                {/* Border decoration */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 to-teal-500 z-10"></div>
                
                <div className="flex-1 h-full">
                  <ChatWindow
                    conversation={activeConversation}
                    onClose={handleCloseChat}
                  />
                </div>
              </div>
            ) : (
              // Empty State - Glassmorphism banner
              <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-12 text-center h-full flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/10 to-teal-50/10"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors"></div>
                
                <div className="relative z-10 max-w-sm space-y-6">
                  <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mx-auto shadow-inner border-2 border-white ring-8 ring-emerald-50 animate-pulse">
                    <MessageSquare size={44} className="text-emerald-600" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Chọn Cuộc Trò Chuyện</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Chọn một cuộc hội thoại từ danh sách bên trái để bắt đầu thương thảo giá cả, trao đổi hình ảnh thực tế nông sản trực tiếp.
                    </p>
                  </div>

                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-left text-xs text-emerald-800 space-y-2 leading-relaxed">
                    <p className="font-bold flex items-center gap-1.5 text-emerald-700">
                      <Sparkles size={12} /> Mẹo đàm phán an toàn:
                    </p>
                    <p>• Hãy yêu cầu nông dân gửi hình ảnh, video chất lượng thực tế ngay tại ruộng vườn.</p>
                    <p>• Sử dụng chức năng **Bảo chứng giao dịch** của AgriFlow khi thực hiện đặt hàng để bảo vệ nguồn vốn của bạn.</p>
                  </div>
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
