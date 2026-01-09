import { Link } from 'react-router-dom'
import { Package, Facebook, Instagram, Mail } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center mb-4">
              <Package className="h-8 w-8 text-green-400 mr-2" />
              <span className="text-xl font-bold">AgriFlow</span>
            </div>
            <p className="text-gray-400 text-sm">
              Kết nối nông dân và người mua nông sản trực tiếp.
              Giảm thiểu trung gian, tối ưu chi phí.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white text-sm">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-400 hover:text-white text-sm">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-white text-sm">
                  Đăng nhập
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-400 hover:text-white text-sm">
                  Đăng ký
                </Link>
              </li>
            </ul>
          </div>

          {/* For Farmers */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Dành cho Nông dân</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/farmer/dashboard" className="text-gray-400 hover:text-white text-sm">
                  Bảng điều khiển
                </Link>
              </li>
              <li>
                <Link to="/farmer/products" className="text-gray-400 hover:text-white text-sm">
                  Quản lý sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/farmer/orders" className="text-gray-400 hover:text-white text-sm">
                  Đơn hàng
                </Link>
              </li>
              <li>
                <Link to="/farmer/stats" className="text-gray-400 hover:text-white text-sm">
                  Thống kê
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm text-gray-400">support@agriflow.com</span>
              </div>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <Instagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} AgriFlow. Tất cả quyền được bảo lưu.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Phát triển bởi đội ngũ AgriFlow
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer