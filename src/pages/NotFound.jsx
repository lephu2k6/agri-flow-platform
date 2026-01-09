import React from 'react'
import { Link } from 'react-router-dom'
import { Home, Search } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="h-24 w-24 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="h-12 w-12 text-red-500" />
        </div>
        
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Không tìm thấy trang</h2>
        
        <p className="text-gray-600 mb-8">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-green-500 hover:bg-green-600"
          >
            <Home className="h-5 w-5 mr-2" />
            Về trang chủ
          </Link>
          
          <p className="text-sm text-gray-500">
            Hoặc{' '}
            <Link to="/products" className="text-green-600 hover:text-green-500 font-medium">
              xem sản phẩm
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFound