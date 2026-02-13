import React, { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { 
  Package, User, LogOut, Menu, X, 
  LayoutDashboard, PlusCircle, 
  Store, ClipboardList, ShoppingBag,
  Leaf, Truck, Users, BarChart3, ShoppingCart, Heart, MessageCircle, ChevronDown
} from "lucide-react"
import { supabase } from "../../lib/supabase";
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../contexts/CartContext';
import { useChat } from '../../contexts/ChatContext';
import NotificationBell from '../notifications/NotificationBell';
import logo from '../../assets/img/logo.png';

const Header = () => {
  const { user, profile, signOut, signIn } = useAuth()
  const { getCartItemCount } = useCart()
  const { unreadCount } = useChat()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false)
      }
    }

    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userDropdownOpen])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Logout failed:", error.message);
    } else {
      console.log("Logged out successfully!");
      window.location.href = "/login";
    }
  };

  const closeMenu = () => setMobileMenuOpen(false)

  // Hàm xác định role để hiển thị badge
  const getRoleBadge = () => {
    if (!profile?.role) return null;
    
    const roleConfig = {
      farmer: { label: "Nông dân", color: "bg-emerald-100 text-emerald-700", icon: Leaf },
      buyer: { label: "Người mua", color: "bg-blue-100 text-blue-700", icon: ShoppingBag },
      logistics: { label: "Vận chuyển", color: "bg-amber-100 text-amber-700", icon: Truck },
      admin: { label: "Quản trị", color: "bg-purple-100 text-purple-700", icon: Users }
    };
    
    const config = roleConfig[profile.role];
    if (!config) return null;
    
    const Icon = config.icon;
    return (
      <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <Icon size={10} />
        <span>{config.label}</span>
      </div>
    );
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm sticky top-0 z-50 border-b border-emerald-50/50 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img src= {logo}   alt="Avatar" className="w-17 h-17"></img>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black bg-linear-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent tracking-tight">
                AGRI-FLOW
              </span>
              <span className="text-[10px] text-emerald-500 font-medium uppercase tracking-wider">
                Dòng chảy nông sản
              </span>
            </div>
          </Link>

          {/* DESKTOP MENU */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link 
              to="/products" 
              className="px-5 py-2.5 text-gray-700 hover:text-emerald-600 font-semibold flex items-center gap-2 transition-all rounded-xl hover:bg-emerald-50"
            >
              <Store size={18} className="text-emerald-500"/> 
              <span>Chợ Nông Sản</span>
            </Link>

            {user && (
              <Link 
                to="/chat" 
                className="relative px-5 py-2.5 text-gray-700 hover:text-emerald-600 font-semibold flex items-center gap-2 transition-all rounded-xl hover:bg-emerald-50"
              >
                <MessageCircle size={18} className="text-emerald-500"/>
                <span>Tin nhắn</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* FARMER MENU */}
            {profile?.role === "farmer" && (
              <div className="flex items-center space-x-1 ml-2">
                <div className="h-8 w-px bg-emerald-100"></div>
                <Link 
                  to="/farmer/products" 
                  className="px-4 py-2.5 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all flex items-center gap-2 text-sm font-semibold"
                >
                  <BarChart3 size={16} className="text-emerald-500"/>
                  Sản phẩm
                </Link>
                <Link 
                  to="/farmer/products/create" 
                  className="ml-2 px-4 py-2.5 bg-linear-to-r from-emerald-500 to-emerald-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 font-semibold hover:from-emerald-600 hover:to-emerald-700"
                >
                  <PlusCircle size={18}/>
                  Đăng bán
                </Link>
              </div>
            )}

            {/* BUYER MENU - removed, now in dropdown */}
          </nav>

          {/* DESKTOP USER ACTION */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Cart, Wishlist & Notifications */}
            <Link 
              to="/cart"
              className="relative p-2.5 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
            >
              <ShoppingCart size={20} />
              {getCartItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {getCartItemCount() > 9 ? '9+' : getCartItemCount()}
                </span>
              )}
            </Link>

            {user && (
              <>
                <Link 
                  to="/wishlist"
                  className="p-2.5 text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all"
                >
                  <Heart size={20} />
                </Link>
                <NotificationBell />
              </>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                {getRoleBadge()}
                <div className="relative" ref={dropdownRef}>
                  <div className="flex items-center bg-white border border-emerald-100 p-1.5 rounded-2xl shadow-sm">
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center space-x-3 px-3 py-1.5 hover:bg-emerald-50 rounded-xl transition-all"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-linear-to-r from-emerald-100 to-sky-100 flex items-center justify-center text-emerald-600 font-bold text-lg">
                          {profile?.full_name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-bold text-gray-800 leading-tight">{profile?.full_name || "User"}</span>
                        <span className="text-xs text-gray-500">{profile?.email || ""}</span>
                      </div>
                      <ChevronDown size={16} className={`text-gray-500 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <button
                      onClick={handleLogout}
                      className="ml-2 p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-emerald-100 py-2 z-50">
                      {/* Profile Link */}
                      <Link 
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-all"
                      >
                        <User size={18} className="text-emerald-500"/>
                        <span className="font-semibold text-gray-700">Hồ sơ cá nhân</span>
                      </Link>

                      {/* Farmer Menu Items */}
                      {profile?.role === "farmer" && (
                        <>
                          <div className="h-px bg-emerald-100 my-2"></div>
                          <Link 
                            to="/farmer/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-all"
                          >
                            <LayoutDashboard size={18} className="text-emerald-500"/>
                            <span className="font-semibold text-gray-700">Dashboard</span>
                          </Link>
                          <Link 
                            to="/farmer/inventory"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-all"
                          >
                            <Package size={18} className="text-emerald-500"/>
                            <span className="font-semibold text-gray-700">Kho hàng</span>
                          </Link>
                          <Link 
                            to="/farmer/orders"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-all"
                          >
                            <ClipboardList size={18} className="text-blue-500"/>
                            <span className="font-semibold text-blue-600">Đơn hàng</span>
                          </Link>
                        </>
                      )}

                      {/* Buyer Menu Items */}
                      {profile?.role === "buyer" && (
                        <>
                          <div className="h-px bg-emerald-100 my-2"></div>
                          <Link 
                            to="/buyer/orders"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-all"
                          >
                            <ShoppingBag size={18} className="text-blue-500"/>
                            <span className="font-semibold text-blue-600">Đơn hàng của tôi</span>
                          </Link>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login" 
                  className="px-6 py-2.5 text-gray-700 font-semibold hover:text-emerald-600 transition-colors hover:bg-emerald-50 rounded-xl"
                >
                  Đăng nhập
                </Link>
                <Link 
                  to="/register" 
                  className="px-6 py-2.5 bg-linear-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE BUTTON */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="lg:hidden p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-colors"
          >
            {mobileMenuOpen ? <X size={22} className="text-emerald-600" /> : <Menu size={22} className="text-emerald-600" />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 space-y-3 border-t border-emerald-50 pt-4">
            {/* User Info */}
            {user && (
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-linear-to-r from-emerald-100 to-sky-100 flex items-center justify-center text-emerald-600 font-bold text-xl">
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
              <Link 
                to="/products" 
                className="flex items-center gap-4 p-4 bg-white border border-emerald-50 rounded-2xl font-semibold text-gray-800 hover:bg-emerald-50 transition-all"
                onClick={closeMenu}
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Store size={20} className="text-emerald-500"/>
                </div>
                <div className="flex-1">
                  <div className="font-bold">Chợ Nông Sản</div>
                  <div className="text-xs text-gray-500">Giao dịch trực tiếp</div>
                </div>
              </Link>

              <Link 
                to="/cart" 
                className="flex items-center gap-4 p-4 bg-white border border-emerald-50 rounded-2xl font-semibold text-gray-800 hover:bg-emerald-50 transition-all relative"
                onClick={closeMenu}
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <ShoppingCart size={20} className="text-emerald-500"/>
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

              {/* FARMER MENU */}
              {profile?.role === "farmer" && (
                <div className="space-y-2 bg-linear-to-r from-emerald-50/50 to-white p-4 rounded-2xl border border-emerald-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Leaf size={16} className="text-emerald-600"/>
                    </div>
                    <span className="text-sm font-bold text-emerald-700 uppercase tracking-wider">Quản lý bán hàng</span>
                  </div>
                  
                  <Link 
                    to="/farmer/dashboard" 
                    className="flex items-center gap-4 p-3 hover:bg-white rounded-xl transition-all font-semibold text-gray-700"
                    onClick={closeMenu}
                  >
                    <LayoutDashboard size={18} className="text-emerald-500"/>
                    Dashboard
                  </Link>
                  <Link 
                    to="/farmer/products" 
                    className="flex items-center gap-4 p-3 hover:bg-white rounded-xl transition-all font-semibold text-gray-700"
                    onClick={closeMenu}
                  >
                    <BarChart3 size={18} className="text-emerald-500"/>
                    Sản phẩm
                  </Link>
                  <Link 
                    to="/farmer/orders" 
                    className="flex items-center gap-4 p-3 hover:bg-white rounded-xl transition-all font-semibold text-blue-600"
                    onClick={closeMenu}
                  >
                    <ClipboardList size={18} className="text-blue-500"/>
                    Đơn hàng
                  </Link>
                  <Link 
                    to="/farmer/products/create" 
                    className="flex items-center gap-4 p-3 bg-linear-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold mt-2"
                    onClick={closeMenu}
                  >
                    <PlusCircle size={18}/>
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
                    <ShoppingBag size={20} className="text-blue-500"/>
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
                    handleLogout();
                    closeMenu();
                  }} 
                  className="flex items-center gap-3 justify-center p-4 text-red-600 font-semibold bg-red-50 rounded-2xl w-full hover:bg-red-100 transition-colors"
                >
                  <LogOut size={20}/>
                  Đăng xuất
                </button>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="block py-3.5 text-center font-semibold bg-linear-to-r from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
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