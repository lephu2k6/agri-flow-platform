import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { 
  Package, User, LogOut, Menu, X, 
  LayoutDashboard, PlusCircle, 
  Store, ClipboardList, ShoppingBag
} from "lucide-react"
import { useAuth } from "../../hooks/useAuth"

const Header = () => {
  const { user, profile, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate("/")
  }

  const closeMenu = () => setMobileMenuOpen(false)

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-green-600 p-1.5 rounded-xl group-hover:rotate-12 transition-transform shadow-sm">
              <Package className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tighter italic uppercase">AgriFlow</span>
          </Link>

          {/* DESKTOP MENU */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link to="/products" className="px-4 py-2 text-gray-600 hover:text-green-600 font-bold flex items-center gap-2 transition-all">
              <Store size={18}/> Chợ Nông Sản
            </Link>

            {/* FARMER MENU: Chỉ hiện các mục quản lý bán hàng */}
            {profile?.role === "farmer" && (
              <div className="flex items-center border-l border-gray-200 ml-2 pl-2 space-x-1">
                <Link to="/farmer/dashboard" className="px-4 py-2 text-gray-600 hover:bg-green-50 hover:text-green-600 rounded-xl transition-all flex items-center gap-2">
                  <LayoutDashboard size={18}/> Dashboard
                </Link>
                <Link to="/farmer/products" className="px-4 py-2 text-gray-600 hover:bg-green-50 hover:text-green-600 rounded-xl transition-all flex items-center gap-2 font-medium">
                   Quản lý sản phẩm
                </Link>
                <Link to="/farmer/orders" className="px-4 py-2 text-gray-600 hover:bg-green-50 hover:text-green-600 rounded-xl transition-all flex items-center gap-2 font-medium text-blue-600">
                  <ClipboardList size={18}/> Đơn khách đặt
                </Link>
                <Link to="/farmer/products/create" className="px-4 py-2 bg-green-600 text-white rounded-xl shadow-md hover:bg-green-700 transition-all flex items-center gap-2 ml-2 font-bold">
                  <PlusCircle size={18}/> Đăng bán
                </Link>
              </div>
            )}

            {/* BUYER MENU: Chỉ hiện cho Buyer thực thụ */}
            {profile?.role === "buyer" && (
              <Link to="/buyer/orders" className="px-4 py-2 text-gray-600 hover:text-green-600 font-bold flex items-center gap-2 transition-all">
                <ShoppingBag size={18}/> Đơn hàng của tôi
              </Link>
            )}
          </nav>

          {/* DESKTOP USER ACTION */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center bg-gray-50 p-1 rounded-2xl border border-gray-100">
                <Link to="/profile" className="flex items-center space-x-2 px-3 py-1.5 hover:bg-white rounded-xl transition-all">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-black text-sm">
                    {profile?.full_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="text-xs font-black text-gray-800 leading-none">{profile?.full_name || "User"}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="px-5 py-2 text-gray-700 font-bold hover:text-green-600 transition-colors">Đăng nhập</Link>
                <Link to="/register" className="px-5 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 shadow-md transition-all">Đăng ký</Link>
              </div>
            )}
          </div>

          {/* MOBILE BUTTON */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-xl bg-gray-50 border border-gray-100">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2 border-t pt-4">
            <Link to="/products" className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl font-bold text-gray-800" onClick={closeMenu}>
              <Store size={20} className="text-green-600"/> Chợ Nông Sản
            </Link>

            {profile?.role === "farmer" && (
              <div className="space-y-1 bg-green-50 p-3 rounded-2xl border border-green-100">
                <p className="text-[10px] font-black text-green-700 uppercase ml-2 mb-2 tracking-widest">Quản lý bán hàng</p>
                <Link to="/farmer/dashboard" className="flex items-center gap-3 p-3 hover:bg-white rounded-xl transition-all font-bold text-gray-700" onClick={closeMenu}>
                  Dashboard
                </Link>
                <Link to="/farmer/products" className="flex items-center gap-3 p-3 hover:bg-white rounded-xl transition-all font-bold text-gray-700" onClick={closeMenu}>
                  Danh sách sản phẩm
                </Link>
                <Link to="/farmer/orders" className="flex items-center gap-3 p-3 hover:bg-white rounded-xl transition-all font-bold text-blue-600" onClick={closeMenu}>
                  <ClipboardList size={20}/> Đơn khách đặt
                </Link>
                <Link to="/farmer/products/create" className="flex items-center gap-3 p-3 bg-green-600 text-white rounded-xl font-bold" onClick={closeMenu}>
                  <PlusCircle size={20}/> Đăng bán mới
                </Link>
              </div>
            )}

            {profile?.role === "buyer" && (
              <Link to="/buyer/orders" className="flex items-center gap-3 p-4 hover:bg-gray-50 rounded-2xl font-bold text-gray-800" onClick={closeMenu}>
                <ShoppingBag size={20} className="text-blue-600"/> Đơn hàng của tôi
              </Link>
            )}

            <div className="pt-4 flex flex-col gap-2">
              {user ? (
                <button onClick={handleLogout} className="flex items-center gap-3 p-4 text-red-600 font-black bg-red-50 rounded-2xl">
                  <LogOut size={20}/> Đăng xuất
                </button>
              ) : (
                <Link to="/login" className="py-3 text-center font-bold bg-green-600 text-white rounded-xl shadow-lg" onClick={closeMenu}>Bắt đầu ngay</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header