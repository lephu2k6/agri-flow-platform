import React, { createContext, useState, useEffect, useContext } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { chatService } from '../services/chat.service'

const ChatContext = createContext({})

export const ChatProvider = ({ children }) => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchConversations()
      fetchUnreadCount()
      const unsubscribe = subscribeToMessages()
      return () => {
        if (unsubscribe) unsubscribe()
      }
    } else {
      setConversations([])
      setMessages([])
      setUnreadCount(0)
    }
  }, [user])

  const fetchConversations = async () => {
    if (!user) return

    try {
      setLoading(true)
      const result = await chatService.getUserConversations(user.id)
      
      if (result.success) {
        setConversations(result.conversations)
      }
    } catch (error) {
      console.error('Fetch conversations error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId) => {
    try {
      setLoading(true)
      const result = await chatService.getMessages(conversationId)
      
      if (result.success) {
        setMessages(result.messages)
        
        // Đánh dấu đã đọc
        await chatService.markConversationAsRead(conversationId)
        fetchUnreadCount()
      }
    } catch (error) {
      console.error('Fetch messages error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    if (!user) return

    try {
      const result = await chatService.getUnreadCount(user.id)
      if (result.success) {
        setUnreadCount(result.count)
      }
    } catch (error) {
      console.error('Fetch unread count error:', error)
    }
  }

  const subscribeToMessages = () => {
    if (!user) return () => {}

    const channel = supabase
      .channel(`messages:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        },
        (payload) => {
          // Nếu đang xem conversation này, thêm message vào danh sách
          setMessages(prev => {
            if (activeConversation?.id === payload.new.conversation_id) {
              return [...prev, payload.new]
            }
            return prev
          })
          // Đánh dấu đã đọc nếu đang xem conversation
          if (activeConversation?.id === payload.new.conversation_id) {
            chatService.markAsRead(payload.new.id)
          }
          // Cập nhật unread count
          fetchUnreadCount()
          // Refresh conversations để cập nhật last_message_at
          fetchConversations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const sendMessage = async (conversationId, receiverId, content) => {
    try {
      const result = await chatService.sendMessage(conversationId, receiverId, content)
      
      if (result.success) {
        // Thêm message vào danh sách ngay lập tức (optimistic update)
        setMessages(prev => [...prev, result.message])
        // Refresh conversations
        fetchConversations()
        return { success: true, message: result.message }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Send message error:', error)
      return { success: false, error: error.message }
    }
  }

  const openConversation = async (conversationId) => {
    const conversation = conversations.find(c => c.id === conversationId)
    if (conversation) {
      setActiveConversation(conversation)
      await fetchMessages(conversationId)
    }
  }

  const createOrOpenConversation = async (farmerId, buyerId, productId = null) => {
    try {
      const result = await chatService.getOrCreateConversation(farmerId, buyerId, productId)
      
      if (result.success) {
        // Refresh conversations
        await fetchConversations()
        // Mở conversation
        await openConversation(result.conversation.id)
        return { success: true, conversation: result.conversation }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Create or open conversation error:', error)
      return { success: false, error: error.message }
    }
  }

  return (
    <ChatContext.Provider value={{
      conversations,
      activeConversation,
      messages,
      unreadCount,
      loading,
      sendMessage,
      openConversation,
      createOrOpenConversation,
      fetchConversations,
      fetchMessages,
      setActiveConversation
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within ChatProvider')
  }
  return context
}
