import React from 'react'
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, User, AlertCircle, Leaf, ChevronRight, LogIn, Shield, Truck } from 'lucide-react'
import { authService } from '../services/auth/auth.service'
import { SocialAuthService } from '../services/auth/social-auth.service'
import toast from 'react-hot-toast'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()
  
  const from = location.state?.from?.pathname || '/dashboard'

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const { email, password } = formData
    
    // Basic validation
    if (!email || !password) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }

    setLoading(true)
    
    try {
      // Use auth service for login
      const result = await authService.login(email, password)
      
      if (!result.success) {
        toast.error(result.error)
        return
      }

      // Show success message
      toast.success(
        <div className="space-y-1">
          <p className="font-semibold">Đăng nhập thành công! 🎉</p>
          <p className="text-sm">Chào mừng {result.profile?.full_name || result.user?.email}</p>
        </div>
      )

      // Redirect based on role
      setTimeout(() => {
        if (result.profile?.role === 'farmer') {
          navigate('/farmer/dashboard', { replace: true })
        } else if (result.profile?.role === 'buyer') {
          navigate('/products', { replace: true })
        } else {
          navigate(from, { replace: true })
        }
      }, 1000)

    } catch (error) {
      console.error('Login error:', error)
      toast.error('Có lỗi xảy ra: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = (role) => {
    const demoAccounts = {
      farmer: { 
        email: 'phulhm1749@ut.edu.vn', 
        password: 'Lll123456@' 
      },
      buyer: { 
        email: 'nguoimua@demo.com', 
        password: 'Demo@123' 
      }
    }

    setFormData({
      email: demoAccounts[role].email,
      password: demoAccounts[role].password
    })

    toast.info(`Đã điền thông tin demo cho ${role === 'farmer' ? 'nông dân' : 'người mua'}`)
  }

  const handleSocialLogin = async (provider) => {
    setLoading(true)
    
    try {
      let result
      
      switch (provider) {
        case 'google':
          result = await SocialAuthService.loginWithGoogle()
          break
        case 'github':
          result = await SocialAuthService.loginWithGithub()
          break
        default:
          throw new Error('Provider không được hỗ trợ')
      }

      if (!result.success) {
        toast.error(result.error)
      }

    } catch (error) {
      toast.error('Lỗi đăng nhập: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-50 via-white to-sky-50">
      {/* Left Panel - Illustration */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/20 to-sky-100/20"></div>
        
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-xl">
              <Leaf className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                AGRI-FLOW
              </h1>
              <p className="text-emerald-600 font-medium">Dòng chảy nông sản</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Truck className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">Kết nối trực tiếp</h3>
                  <p className="text-sm text-gray-600">Nông dân - Người mua - Vận chuyển</p>
                </div>
              </div>
            </div>

            {/* <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-400 p-4 rounded-xl border border-emerald-100 text-center">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                  <span className="text-sm font-bold text-emerald-600"></span>
                </div>
                <p className="text-xs text-gray-600">Đơn vị vận chuyển</p>
              </div>
              <div className="bg-white/80 p-4 rounded-xl border border-sky-100 text-center">
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-2">
                  <span className="text-sm font-bold text-sky-600">156</span>
                </div>
                <p className="text-xs text-gray-600">Nông dân tham gia</p>
              </div>
              <div className="bg-white/80 p-4 rounded-xl border border-amber-100 text-center">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
                  <span className="text-sm font-bold text-amber-600">89</span>
                </div>
                <p className="text-xs text-gray-600">Doanh nghiệp mua</p>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="lg:hidden flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <Leaf className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Đăng nhập AgriFlow</h2>
            <p className="text-gray-600">
              Kết nối với cộng đồng nông sản Việt
            </p>
          </div>

          {/* Demo Accounts */}
          <div className="mb-8">
            <p className="text-sm font-medium text-gray-700 mb-3">Trải nghiệm với tài khoản demo:</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => handleDemoLogin('farmer')}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                <User size={16} />
                Nông dân Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('buyer')}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-xl font-semibold hover:from-sky-600 hover:to-sky-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                <User size={16} />
                Người mua Demo
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-sm text-gray-500">Hoặc đăng nhập bằng</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              className="w-full inline-flex justify-center items-center py-3.5 px-4 border border-gray-200 rounded-xl bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 shadow-sm hover:shadow"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('github')}
              disabled={loading}
              className="w-full inline-flex justify-center items-center py-3.5 px-4 border border-gray-200 rounded-xl bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 shadow-sm hover:shadow"
            >
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-sm text-gray-500">Đăng nhập bằng tài khoản</span>
            </div>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all hover:border-emerald-300"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all hover:border-emerald-300"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-xl p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500 hover:text-gray-700 transition-colors" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                Quên mật khẩu? <ChevronRight size={14} />
              </Link>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl text-base font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Đăng nhập
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1">
                Đăng ký ngay <ChevronRight size={14} />
              </Link>
            </p>
            
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-100">
              <Link to="/privacy" className="text-xs text-gray-500 hover:text-emerald-600">
                Bảo mật
              </Link>
              <Link to="/terms" className="text-xs text-gray-500 hover:text-emerald-600">
                Điều khoản
              </Link>
              <Link to="/support" className="text-xs text-gray-500 hover:text-emerald-600">
                Hỗ trợ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login