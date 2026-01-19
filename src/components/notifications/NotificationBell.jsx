import React, { useState, useRef, useEffect } from 'react'
import { Bell, X, Check, Trash2, Package, ShoppingBag, MessageCircle, AlertCircle } from 'lucide-react'
import { useNotifications } from '../../contexts/NotificationContext'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <ShoppingBag size={18} className="text-blue-500" />
      case 'product':
        return <Package size={18} className="text-emerald-500" />
      case 'message':
        return <MessageCircle size={18} className="text-purple-500" />
      default:
        return <AlertCircle size={18} className="text-amber-500" />
    }
  }

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }

    // Navigate based on notification type
    if (notification.link) {
      navigate(notification.link)
      setIsOpen(false)
    }
  }

  const formatTime = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'Vừa xong'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-emerald-100 z-50 max-h-[600px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-white">
              <h3 className="font-bold text-gray-900">Thông báo</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    Đọc tất cả
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                    <Bell size={32} className="text-emerald-400" />
                  </div>
                  <p className="text-gray-600 font-medium">Chưa có thông báo nào</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-emerald-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          !notification.read ? 'bg-emerald-100' : 'bg-gray-100'
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className={`font-semibold text-sm mb-1 ${
                                !notification.read ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatTime(notification.created_at)}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors flex-shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationBell
