import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { authService } from '../services/auth.service'
import toast from 'react-hot-toast'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Vui lòng nhập email')
      return
    }

    setLoading(true)
    
    try {
      const result = await authService.forgotPassword(email)
      
      if (result.success) {
        setSent(true)
        toast.success(result.message)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Email đã được gửi!</h2>
          <p className="text-gray-600 mb-6">
            Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến <strong>{email}</strong>.
            Vui lòng kiểm tra hộp thư đến và thư mục spam.
          </p>
          <div className="space-y-3">
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại đăng nhập
            </Link>
            <button
              onClick={() => {
                setSent(false)
                setEmail('')
              }}
              className="text-sm text-green-600 hover:text-green-500"
            >
              Gửi lại email
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại đăng nhập
          </Link>
          
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Quên mật khẩu</h2>
            <p className="mt-2 text-gray-600">
              Nhập email của bạn để nhận liên kết đặt lại mật khẩu
            </p>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email đăng ký
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="you@example.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang xử lý...
              </div>
            ) : (
              'Gửi liên kết đặt lại'
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-medium text-green-600 hover:text-green-500">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword