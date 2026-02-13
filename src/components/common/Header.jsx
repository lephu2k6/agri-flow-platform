import React, { useState } from "react"
import { Link } from "react-router-dom"
import {
  Package, LogOut, Menu, X,
  LayoutDashboard, PlusCircle,
  Store, ClipboardList, ShoppingBag,
  Leaf, BarChart3, ShoppingCart, MessageCircle
} from "lucide-react"
import { supabase } from "../../lib/supabase"
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../contexts/CartContext'
import { useChat } from '../../contexts/ChatContext'
import NotificationBell from '../notifications/NotificationBell'

const Header = () => {
  const { user, profile } = useAuth()
  const { getCartItemCount } = useCart()
  const { unreadCount } = useChat()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      window.location.href = "/login"
    }
  }

  const closeMenu = () => setMobileMenuOpen(false)

  const getRoleBadge = () => {
    if (!profile?.role) return null

    const roleConfig = {
      farmer: { label: "Nông dân", color: "bg-emerald-100 text-emerald-700", icon: Leaf },
      buyer: { label: "Người mua", color: "bg-blue-100 text-blue-700", icon: ShoppingBag }
    }

    const config = roleConfig[profile.role]
    if (!config) return null

    const Icon = config.icon
    return (
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <Icon size={10} />
        <span>{config.label}</span>
      </div>
    )
  }

  return (
    <header className="bg-white/95 backdrop-blur-sm sticky top-0 z-50 border-b border-neutral-100 shadow-sm">
      <div className="container mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between">

          {/* LOGO - Left */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-neutral-900 tracking-tight leading-none">
                AGRI-FLOW
              </span>
              <span className="text-[10px] text-emerald-600 font-medium uppercase tracking-wider">
                Business
              </span>
            </div>
          </Link>

          {/* RIGHT ACTIONS - Grouped */}
          <div className="flex items-center gap-1.5">
            {/* Cart - Hide for Farmer */}
            {profile?.role !== "farmer" && (
              <Link
                to="/cart"
                className="relative p-2 text-neutral-600 hover:text-emerald-600 hover:bg-neutral-50 rounded-lg transition-all"
              >
                <ShoppingCart size={20} />
                {getCartItemCount() > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {getCartItemCount()}
                  </span>
                )}
              </Link>
            )}

            {user && (
              <>
                <NotificationBell />
                <Link to="/profile" className="p-1 hover:bg-neutral-50 rounded-full transition-all">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs border border-emerald-200">
                    {profile?.full_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                </Link>
              </>
            )}

            <div className="w-px h-6 bg-neutral-200 mx-1"></div>

            {/* HAMBURGER */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-neutral-600 hover:text-emerald-600 hover:bg-neutral-50 transition-colors"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* HAMBURGER MENU PANEL */}
        {mobileMenuOpen && (
          <div className="mt-4 pb-4 space-y-3 border-t border-emerald-50 pt-4">
            {/* User Info */}
            {user && (
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-100 to-sky-100 flex items-center justify-center text-emerald-600 font-bold text-xl">
                    {profile?.full_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800">{profile?.full_name || "User"}</span>
                    <span className="text-sm text-gray-600">{profile?.email}</span>
                    {getRoleBadge()}
                  </div>
                </div>
              </div>
            )}

            {/* Main Links */}
            <div className="space-y-2">
              {/* Chỉ hiện Chợ Nông Sản cho Buyer hoặc Khách vãng lai, Farmer ẩn đi theo yêu cầu */}
              {profile?.role !== "farmer" && (
                <Link
                  to="/products"
                  className="flex items-center gap-4 p-4 bg-white border border-emerald-50 rounded-2xl font-semibold text-gray-800 hover:bg-emerald-50 transition-all"
                  onClick={closeMenu}
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Store size={20} className="text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold">Chợ Nông Sản</div>
                    <div className="text-xs text-gray-500">Giao dịch trực tiếp</div>
                  </div>
                </Link>
              )}

              {user && (
                <Link
                  to="/chat"
                  className="flex items-center gap-4 p-4 bg-white border border-emerald-50 rounded-2xl font-semibold text-gray-800 hover:bg-emerald-50 transition-all relative"
                  onClick={closeMenu}
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <MessageCircle size={20} className="text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold">Tin nhắn</div>
                    <div className="text-xs text-gray-500">Trò chuyện với khách hàng</div>
                  </div>
                  {unreadCount > 0 && (
                    <span className="w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              )}

              {profile?.role !== "farmer" && (
                <Link
                  to="/cart"
                  className="flex items-center gap-4 p-4 bg-white border border-emerald-50 rounded-2xl font-semibold text-gray-800 hover:bg-emerald-50 transition-all relative"
                  onClick={closeMenu}
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <ShoppingCart size={20} className="text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold">Giỏ hàng</div>
                    <div className="text-xs text-gray-500">{getCartItemCount()} sản phẩm</div>
                  </div>
                  {getCartItemCount() > 0 && (
                    <span className="w-6 h-6 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {getCartItemCount() > 9 ? '9+' : getCartItemCount()}
                    </span>
                  )}
                </Link>
              )}

              {/* FARMER MENU */}
              {profile?.role === "farmer" && (
                <div className="space-y-2 bg-gradient-to-r from-emerald-50/50 to-white p-4 rounded-2xl border border-emerald-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Leaf size={16} className="text-emerald-600" />
                    </div>
                    <span className="text-sm font-bold text-emerald-700 uppercase tracking-wider">Quản lý bán hàng</span>
                  </div>

                  <Link
                    to="/farmer/dashboard"
                    className="flex items-center gap-4 p-3 hover:bg-white rounded-xl transition-all font-semibold text-gray-700"
                    onClick={closeMenu}
                  >
                    <LayoutDashboard size={18} className="text-emerald-500" />
                    Dashboard
                  </Link>
                  <Link
                    to="/farmer/products"
                    className="flex items-center gap-4 p-3 hover:bg-white rounded-xl transition-all font-semibold text-gray-700"
                    onClick={closeMenu}
                  >
                    <BarChart3 size={18} className="text-emerald-500" />
                    Sản phẩm
                  </Link>
                  <Link
                    to="/farmer/orders"
                    className="flex items-center gap-4 p-3 hover:bg-white rounded-xl transition-all font-semibold text-blue-600"
                    onClick={closeMenu}
                  >
                    <ClipboardList size={18} className="text-blue-500" />
                    Đơn hàng
                  </Link>
                  <Link
                    to="/farmer/products/create"
                    className="flex items-center gap-4 p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold mt-2"
                    onClick={closeMenu}
                  >
                    <PlusCircle size={18} />
                    Đăng bán mới
                  </Link>
                </div>
              )}

              {/* BUYER MENU */}
              {profile?.role === "buyer" && (
                <Link
                  to="/buyer/orders"
                  className="flex items-center gap-4 p-4 bg-white border border-blue-50 rounded-2xl font-semibold text-blue-600 hover:bg-blue-50 transition-all"
                  onClick={closeMenu}
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <ShoppingBag size={20} className="text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold">Đơn hàng của tôi</div>
                    <div className="text-xs text-gray-500">Theo dõi & quản lý</div>
                  </div>
                </Link>
              )}
            </div>

            {/* Auth Actions */}
            <div className="pt-4 space-y-2">
              {user ? (
                <button
                  onClick={() => {
                    handleLogout()
                    closeMenu()
                  }}
                  className="flex items-center gap-3 justify-center p-4 text-red-600 font-semibold bg-red-50 rounded-2xl w-full hover:bg-red-100 transition-colors"
                >
                  <LogOut size={20} />
                  Đăng xuất
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block py-3.5 text-center font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                    onClick={closeMenu}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="block py-3.5 text-center font-semibold border-2 border-emerald-500 text-emerald-600 rounded-xl hover:bg-emerald-50 transition-all"
                    onClick={closeMenu}
                  >
                    Tạo tài khoản mới
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header