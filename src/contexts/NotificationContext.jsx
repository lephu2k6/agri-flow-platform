import React, { createContext, useState, useEffect, useContext } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

const NotificationContext = createContext({})

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchNotifications()
      subscribeToNotifications()
    } else {
      setNotifications([])
      setUnreadCount(0)
    }

    return () => {
      // Cleanup subscription if needed
    }
  }, [user])

  const fetchNotifications = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        // Nếu lỗi là table not found hoặc schema cache
        if (error.code === 'PGRST205' || error.message?.includes('not found') || error.message?.includes('schema cache')) {
          console.warn(
            'Lỗi schema cache hoặc bảng notifications. ' +
            'Có thể bảng đã tồn tại nhưng cache chưa được refresh. ' +
            'Vui lòng: 1) Refresh trang, 2) Chạy script: database/refresh_schema_cache.sql'
          )
          setNotifications([])
          setUnreadCount(0)
          return
        }
        throw error
      }

      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.read).length || 0)
    } catch (error) {
      console.error('Fetch notifications error:', error)
      // Không set error state để tránh crash app
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToNotifications = () => {
    if (!user) return

    try {
      const channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            setNotifications(prev => [payload.new, ...prev])
            setUnreadCount(prev => prev + 1)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    } catch (error) {
      // Nếu subscription fail (do table chưa có hoặc cache issue), không crash app
      console.warn('Notification subscription error:', error)
      return () => {}
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId)

      if (error) throw error

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Mark as read error:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) throw error

      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Mark all as read error:', error)
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error

      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Delete notification error:', error)
    }
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      refreshNotifications: fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}
