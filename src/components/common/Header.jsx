import React, { useState, useRef, useEffect } from "react"
import { Link, NavLink } from "react-router-dom"
import {
  Package, LogOut, Menu, X, LayoutDashboard, PlusCircle,
  Store, ClipboardList, ShoppingBag, ShoppingCart, MessageCircle,
  ChevronDown, Warehouse, User, Search, Heart, Grid3X3
} from "lucide-react"
import { supabase } from "../../lib/supabase"
import { useAuth } from "../../hooks/useAuth"
import { useCart } from "../../contexts/CartContext"
import { useChat } from "../../contexts/ChatContext"
import NotificationBell from "../notifications/NotificationBell"
import logo from "../../assets/img/logo.png"

const navLinkClass = ({ isActive }) =>
  `px-4 py-3 text-xs font-bold transition-colors ${
    isActive ? "text-emerald-600" : "text-gray-600 hover:text-emerald-600"
  }`

const Header = () => {
  const { user, profile } = useAuth()
  const { getCartItemCount } = useCart()
  const { unreadCount } = useChat()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const cartCount = getCartItemCount()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) window.location.href = "/login"
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const roleLabel = {
    farmer: "Người bán",
    buyer: "Người mua",
    admin: "Quản trị"
  }[profile?.role]

  const roleLinks = profile?.role === "farmer"
    ? [
        { to: "/farmer/dashboard", label: "Tổng quan", icon: LayoutDashboard },
        { to: "/farmer/products", label: "Sản phẩm", icon: Package },
        { to: "/farmer/orders", label: "Đơn hàng", icon: ClipboardList },
        { to: "/farmer/inventory", label: "Kho hàng", icon: Warehouse }
      ]
    : [
        { to: "/products", label: "Tất cả danh mục", icon: Store },
        { to: "/buyer/orders", label: "Đơn hàng của tôi", icon: ClipboardList },
        { to: "/wishlist", label: "Yêu thích", icon: Heart }
      ]

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-[72px] items-center gap-4">
          <Link to="/" className="flex min-w-[190px] items-center gap-3">
            <img src={logo} alt="Agri-Flow" className="h-11 w-11 object-contain" />
            <div className="leading-none">
              <div className="text-[11px] font-extrabold text-sky-600">Agri-Flow</div>
              <div className="mt-1 text-lg font-black uppercase text-emerald-700">Market</div>
            </div>
          </Link>

          <button className="hidden h-9 items-center gap-1 rounded border border-gray-300 bg-gray-50 px-3 text-gray-600 hover:border-emerald-300 hover:text-emerald-600 md:flex">
            <Grid3X3 size={16} />
            <ChevronDown size={14} />
          </button>

          <form className="hidden flex-1 items-center md:flex">
            <input
              type="search"
              placeholder="Tìm sản phẩm cần mua..."
              className="market-input h-9 min-w-0 flex-1 px-4 text-sm"
            />
            <Link to="/products" className="market-button h-9 w-12 rounded-l-none">
              <Search size={17} />
            </Link>
          </form>

          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            {user && (
              <Link to="/chat" className="relative hidden items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-emerald-600 sm:flex">
                <MessageCircle size={20} />
                <span>Tin nhắn</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-2 left-3 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {profile?.role === "buyer" && (
              <Link to="/cart" className="relative flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-emerald-600">
                <ShoppingCart size={20} />
                <span className="hidden sm:inline">Giỏ hàng</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 left-3 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {profile?.role === "farmer" && (
              <Link to="/farmer/products/create" className="market-button hidden h-9 px-4 text-sm lg:inline-flex">
                <PlusCircle size={16} />
                Đăng bán
              </Link>
            )}

            {user ? (
              <>
                <div className="hidden md:block">
                  <NotificationBell />
                </div>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 rounded border border-gray-200 bg-white px-2 py-1.5 hover:border-emerald-200 hover:bg-emerald-50"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-700">
                      {profile?.full_name?.charAt(0).toUpperCase() || "U"}
                    </span>
                    <span className="hidden text-left md:block">
                      <span className="block text-sm font-bold leading-tight text-gray-800">{profile?.full_name?.split(" ").pop() || "User"}</span>
                      <span className="block text-[10px] font-bold uppercase text-gray-400">{roleLabel}</span>
                    </span>
                    <ChevronDown size={15} className="text-gray-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 rounded-lg border border-gray-200 bg-white py-2 shadow-xl">
                      <div className="border-b border-gray-100 px-4 py-3">
                        <p className="text-sm font-bold text-gray-900">{profile?.full_name || "Người dùng"}</p>
                        <p className="truncate text-xs text-gray-500">{profile?.email}</p>
                      </div>
                      <div className="p-2">
                        <Link to="/" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                          <Store size={17} /> Trang chủ
                        </Link>
                        {roleLinks.map((item) => (
                          <Link key={item.to} to={item.to} onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-600">
                            <item.icon size={17} /> {item.label}
                          </Link>
                        ))}
                        <Link to="/profile" onClick={() => setUserDropdownOpen(false)} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                          <User size={17} /> Hồ sơ cá nhân
                        </Link>
                        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-emerald-600 hover:bg-emerald-50">
                          <LogOut size={17} /> Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link to="/login" className="px-3 py-2 text-sm font-bold text-gray-600 hover:text-emerald-600">Đăng nhập</Link>
                <Link to="/register" className="market-button h-9 px-4 text-sm">Đăng ký</Link>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded border border-gray-200 p-2 text-gray-600 lg:hidden"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </div>

      <div className="hidden border-t border-gray-100 bg-white lg:block">
        <nav className="mx-auto flex max-w-6xl items-center justify-center">
          <NavLink to="/" className={navLinkClass}>Trang Chủ</NavLink>
          <NavLink to="/products" className={navLinkClass}>Tất cả danh mục</NavLink>
          {user && roleLinks.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>{item.label}</NavLink>
          ))}
          <NavLink to="/chat" className={navLinkClass}>Tin nhắn</NavLink>
          <NavLink to="/register" className={navLinkClass}>Đăng ký bán hàng</NavLink>
        </nav>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white lg:hidden">
          <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
            <span className="text-lg font-black text-emerald-600">MENU</span>
            <button onClick={() => setMobileMenuOpen(false)} className="rounded bg-gray-100 p-2">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-2 p-4">
            <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 font-bold text-gray-700">
              <Store size={20} /> Chợ nông sản
            </Link>
            {user && (
              <Link to="/chat" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 font-bold text-gray-700">
                <MessageCircle size={20} /> Tin nhắn
              </Link>
            )}
            {user && roleLinks.map((item) => (
              <Link key={item.to} to={item.to} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 font-bold text-gray-700">
                <item.icon size={20} /> {item.label}
              </Link>
            ))}
            {!user ? (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block rounded-lg border border-gray-200 p-4 text-center font-bold text-gray-700">Đăng nhập</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="market-button w-full p-4">Đăng ký</Link>
              </>
            ) : (
              <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-50 p-4 font-bold text-emerald-600">
                <LogOut size={20} /> Đăng xuất
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
