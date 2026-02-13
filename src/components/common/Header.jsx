
import React, { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Package, LogOut, Menu, X,
  LayoutDashboard, PlusCircle,
  Store, ClipboardList, ShoppingBag,
  Leaf, ShoppingCart, MessageCircle, ChevronDown, Warehouse, User
} from "lucide-react"
import { supabase } from "../../lib/supabase"
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../contexts/CartContext'
import { useChat } from '../../contexts/ChatContext'
import NotificationBell from '../notifications/NotificationBell'
import logo from '../../assets/img/logo.png';

const Header = () => {
  const { user, profile } = useAuth()
  const { getCartItemCount } = useCart()
  const { unreadCount } = useChat()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      window.location.href = "/login"
    }
  }

  const closeMenu = () => setMobileMenuOpen(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
      <div className={`flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold ${config.color} border border-white shadow-sm`}>
        <Icon size={10} />
        <span>{config.label}</span>
      </div>
    )
  }

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm font-sans h-[70px]">
      <div className="container mx-auto px-4 h-full relative">
        <div className="flex items-center justify-between h-full">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center space-x-3 group z-10">
            <div className="relative">
              <img src={logo} alt="Logo" className="w-10 h-10 object-contain"></img>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-emerald-700 tracking-tight leading-none">
                AGRI-FLOW
              </span>
              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                Dòng chảy nông sản
              </span>
            </div>
          </Link>

          {/* CENTER NAVIGATION - Desktop Only - ABSOLUTE CENTERED */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0">
            <nav className="flex items-center gap-1 bg-emerald-50/80 backdrop-blur-sm p-1.5 rounded-full border border-emerald-100/50 shadow-sm">
              
              {/* Tin nhắn - Visible for everyone */}
              {user && (
                <Link
                  to="/chat"
                  className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-gray-600 hover:text-emerald-700 hover:bg-white rounded-full transition-all relative group"
                >
                  <MessageCircle size={18} className="group-hover:scale-110 transition-transform"/>
                  <span>Tin nhắn</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              )}

              {/* FARMER NAVIGATION */}
              {profile?.role === "farmer" && (
                <>
                  <div className="w-px h-4 bg-emerald-200 mx-1"></div>
                  {/* Farmer: Sản phẩm (Quản lý) */}
                  <Link
                    to="/farmer/products"
                    className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-gray-600 hover:text-emerald-700 hover:bg-white rounded-full transition-all group"
                  >
                    <Package size={18} className="group-hover:scale-110 transition-transform"/>
                    <span>Sản phẩm</span>
                  </Link>
                  {/* Farmer: Đơn hàng (Quản lý) */}
                  <Link
                    to="/farmer/orders"
                    className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-gray-600 hover:text-emerald-700 hover:bg-white rounded-full transition-all group"
                  >
                    <ClipboardList size={18} className="group-hover:scale-110 transition-transform"/>
                    <span>Đơn hàng</span>
                  </Link>
                </>
              )}

               {/* BUYER NAVIGATION */}
               {profile?.role === "buyer" && (
                <>
                  <div className="w-px h-4 bg-emerald-200 mx-1"></div>
                  {/* Buyer: Chợ Nông Sản (Mua hàng) */}
                  <Link
                    to="/products"
                    className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-gray-600 hover:text-emerald-700 hover:bg-white rounded-full transition-all group"
                  >
                    <Store size={18} className="group-hover:scale-110 transition-transform"/>
                    <span>Chợ Nông Sản</span>
                  </Link>
                  {/* Buyer: Đơn hàng (Của tôi) */}
                  <Link
                    to="/buyer/orders"
                    className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-gray-600 hover:text-emerald-700 hover:bg-white rounded-full transition-all group"
                  >
                    <ClipboardList size={18} className="group-hover:scale-110 transition-transform"/>
                    <span>Đơn hàng</span>
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-3 z-10">
            
            {/* BUTTON ĐĂNG BÁN - ONLY for Farmer */}
            {profile?.role === "farmer" && (
               <Link
               to="/farmer/products/create"
               className="hidden lg:flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 mr-2"
             >
               <PlusCircle size={18} />
               <span>Đăng bán</span>
             </Link>
            )}

            {/* Cart - Hide for Farmer */}
            {profile?.role !== "farmer" && (
              <Link
                to="/cart"
                className="relative p-2.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all"
              >
                <ShoppingCart size={22} />
                {getCartItemCount() > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {getCartItemCount()}
                  </span>
                )}
              </Link>
            )}

            {user && (
              <>
                <div className="hidden md:block">
                    <NotificationBell />
                </div>
                
                {/* User Avatar with Dropdown */}
                <div className="relative pl-2" ref={dropdownRef}>
                  <button 
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 pr-2 hover:bg-gray-50 rounded-full transition-all border border-transparent hover:border-gray-200"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-700 font-bold text-lg border-2 border-white shadow-sm">
                        {profile?.full_name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="hidden md:flex flex-col items-start mr-1">
                         <span className="text-sm font-bold text-gray-800 leading-none mb-0.5 capitalize">
                            {profile?.full_name?.split(' ').pop() || "User"}
                        </span>
                        {getRoleBadge()}
                    </div>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      
                      {/* User Info Header in Dropdown */}
                      <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
                         <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl border-2 border-emerald-100">
                            {profile?.full_name?.charAt(0).toUpperCase()}
                         </div>
                         <div className="flex flex-col">
                             <span className="font-bold text-gray-900 capitalize text-sm">
                                {profile?.full_name || "Người dùng"}
                             </span>
                             <span className="text-xs text-gray-500">{profile?.email}</span>
                         </div>
                      </div>

                      {/* ITEMS IN DROPDOWN */}
                      <div className="py-2 px-2">
                         {/* Common Items */}
                        <Link
                          to="/"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-all text-gray-700 font-medium"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <Store size={18} className="text-gray-500" />
                          <span>Trang chủ</span>
                        </Link>
                         
                         {/* Farmer Specific Dropdown Items */}
                        {profile?.role === "farmer" && (
                            <>
                                <Link
                                    to="/farmer/dashboard"
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 rounded-xl transition-all text-gray-700 font-medium"
                                    onClick={() => setUserDropdownOpen(false)}
                                >
                                    <LayoutDashboard size={18} className="text-emerald-600" />
                                    <span>Dashboard</span>
                                </Link>
                                <Link
                                    to="/farmer/inventory"
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 rounded-xl transition-all text-gray-700 font-medium"
                                    onClick={() => setUserDropdownOpen(false)}
                                >
                                    <Warehouse size={18} className="text-emerald-600" />
                                    <span>Kho hàng</span>
                                </Link>
                            </>
                        )}
                      </div>

                      <div className="h-px bg-gray-100 mx-4 my-1"></div>

                      {/* Profile & Logout */}
                      <div className="px-2 py-2">
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-all text-gray-700 font-medium"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <User size={18} className="text-gray-500" />
                          <span>Hồ sơ cá nhân</span>
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout()
                            setUserDropdownOpen(false)
                          }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 rounded-xl transition-all w-full font-medium"
                        >
                          <LogOut size={18} />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-full bg-gray-50 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU PANEL */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-white">
            <div className="p-4 flex justify-between items-center border-b border-gray-100">
               <span className="font-bold text-lg text-emerald-700">MENU</span>
               <button onClick={closeMenu} className="p-2 bg-gray-100 rounded-full"><X size={20}/></button>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-80px)]">
            
            {/* Mobile Actions */}
                {/* Farmer Mobile Actions */}
                {profile?.role === "farmer" && (
                    <Link
                        to="/farmer/products/create"
                        onClick={closeMenu}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 text-white rounded-xl font-bold mb-4 shadow-md"
                    >
                        <PlusCircle size={20} />
                        Đăng bán sản phẩm
                    </Link>
                )}

              {user && (
                <Link
                  to="/chat"
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl font-bold text-gray-700"
                  onClick={closeMenu}
                >
                    <MessageCircle size={22} className="text-emerald-600" />
                    Tin nhắn
                    {unreadCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {unreadCount} mới
                        </span>
                    )}
                </Link>
              )}
                
              {/* Buyer Mobile Menu */}
               {profile?.role === "buyer" && (
                <>
                   <Link
                      to="/products"
                      onClick={closeMenu}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl font-bold text-gray-700"
                   >
                      <Store size={22} className="text-emerald-600" />
                      Chợ Nông Sản
                   </Link>
                   <Link
                      to="/buyer/orders"
                      onClick={closeMenu}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl font-bold text-gray-700"
                   >
                      <ClipboardList size={22} className="text-emerald-600" />
                      Đơn hàng
                   </Link>
                </>
              )}

              {/* Farmer Mobile Menu */}
              {profile?.role === "farmer" && (
                <>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                     <Link
                        to="/farmer/products"
                        onClick={closeMenu}
                        className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-2xl shadow-sm"
                     >
                        <Package size={24} className="text-emerald-600 mb-2" />
                        <span className="font-bold text-sm text-gray-700">Sản phẩm</span>
                     </Link>
                     <Link
                        to="/farmer/orders"
                        onClick={closeMenu}
                        className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-2xl shadow-sm"
                     >
                        <ClipboardList size={24} className="text-emerald-600 mb-2" />
                        <span className="font-bold text-sm text-gray-700">Đơn hàng</span>
                     </Link>
                     <Link
                        to="/farmer/dashboard"
                        onClick={closeMenu}
                        className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-2xl shadow-sm"
                     >
                        <LayoutDashboard size={24} className="text-emerald-600 mb-2" />
                        <span className="font-bold text-sm text-gray-700">Dashboard</span>
                     </Link>
                     <Link
                        to="/farmer/inventory"
                        onClick={closeMenu}
                        className="flex flex-col items-center justify-center p-4 bg-white border border-gray-100 rounded-2xl shadow-sm"
                     >
                        <Warehouse size={24} className="text-emerald-600 mb-2" />
                        <span className="font-bold text-sm text-gray-700">Kho hàng</span>
                     </Link>
                  </div>
                </>
              )}

            {/* Logout Mobile */}
            {user && (
                 <button
                 onClick={() => {
                   handleLogout()
                   closeMenu()
                 }}
                 className="flex items-center justify-center gap-2 w-full py-3 mt-6 text-red-600 bg-red-50 rounded-xl font-bold"
               >
                 <LogOut size={20} />
                 Đăng xuất
               </button>
            )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header