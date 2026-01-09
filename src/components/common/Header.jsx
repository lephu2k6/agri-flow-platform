import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, LogOut, Package, Menu, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useState } from 'react'

const Header = () => {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Package className="h-8 w-8 text-green-500" />
            <span className="text-xl font-bold text-gray-800">AgriFlow</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/products" className="text-gray-600 hover:text-green-500">
              Sản phẩm
            </Link>
            
            {profile?.role === 'farmer' && (
              <>
                <Link to="/farmer/dashboard" className="text-gray-600 hover:text-green-500">
                  Bảng điều khiển
                </Link>
                <Link to="/farmer/products/create" className="text-gray-600 hover:text-green-500">
                  Đăng bán
                </Link>
              </>
            )}
            
            {profile?.role === 'buyer' && (
              <Link to="/buyer/dashboard" className="text-gray-600 hover:text-green-500">
                Đơn hàng
              </Link>
            )}
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/profile" className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <span>{profile?.full_name || 'Tài khoản'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Đăng xuất</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-green-600 hover:text-green-700"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="space-y-3">
              <Link
                to="/products"
                className="block px-3 py-2 text-gray-600 hover:text-green-500 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sản phẩm
              </Link>
              
              {profile?.role === 'farmer' && (
                <>
                  <Link
                    to="/farmer/dashboard"
                    className="block px-3 py-2 text-gray-600 hover:text-green-500 hover:bg-gray-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Bảng điều khiển
                  </Link>
                  <Link
                    to="/farmer/products/create"
                    className="block px-3 py-2 text-gray-600 hover:text-green-500 hover:bg-gray-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng bán
                  </Link>
                </>
              )}
              
              {profile?.role === 'buyer' && (
                <Link
                  to="/buyer/dashboard"
                  className="block px-3 py-2 text-gray-600 hover:text-green-500 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đơn hàng
                </Link>
              )}
              
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="block px-3 py-2 text-gray-600 hover:text-green-500 hover:bg-gray-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Hồ sơ
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-gray-600 hover:text-green-500 hover:bg-gray-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Đăng ký
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