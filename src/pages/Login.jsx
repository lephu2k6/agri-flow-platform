import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, User, Leaf, ChevronRight, LogIn, Shield, Truck, Sparkles, Star } from 'lucide-react'
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

  const from = location.state?.from?.pathname || '/products'

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

    if (!email || !password) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }

    setLoading(true)

    try {
      const result = await authService.login(email, password)

      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success(
        <div className="space-y-1 text-sm">
          <p className="font-bold text-emerald-700">Đăng nhập thành công! 🎉</p>
          <p className="text-gray-600">Chào mừng {result.profile?.full_name || result.user?.email}</p>
        </div>
      )

      // Redirect based on role
      setTimeout(() => {
        if (result.profile?.role === 'farmer') {
          navigate('/farmer/dashboard', { replace: true })
        } else if (result.profile?.role === 'buyer') {
          navigate('/products', { replace: true })
        } else if (result.profile?.role === 'admin') {
          navigate('/admin/dashboard', { replace: true })
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
      admin: {
        email: 'nguyendinhvuhoang00@gmail.com',
        password: 'Hoang0366090120@'
      },
      farmer: {
        email: 'phulhm1749@ut.edu.vn',
        password: 'Lll123456@'
      },
      buyer: {
        email: 'gatv3102006@gmail.com',
        password: 'Ll123456@'
      }
    }

    setFormData({
      email: demoAccounts[role].email,
      password: demoAccounts[role].password
    })

    const roleName = role === 'admin' ? 'Quản trị viên' : role === 'farmer' ? 'Nông dân' : 'Người mua';
    toast.success(`Đã điền thông tin tự động cho ${roleName}!`);
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
    <div className="min-h-screen flex bg-slate-50 text-slate-800 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* NỬA TRÁI - GIAO DIỆN HÌNH ẢNH DOANH NGHIỆP CAO CẤP (CHỈ HIỂN THỊ TRÊN DESKTOP) */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-16 relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white">
        {/* Dynamic Pattern Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#022c22_1px,transparent_1px),linear-gradient(to_bottom,#022c22_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"></div>
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        
        <div className="relative z-10 max-w-lg space-y-12">
          {/* Logo Brand */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-950/50">
              <Leaf className="h-7 w-7 text-slate-950" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-white to-emerald-200">
                AGRI-FLOW
              </h1>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1">Dòng chảy nông sản</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-extrabold tracking-tight leading-tight text-slate-100">
              Tham gia hệ sinh thái kết nối <span className="text-emerald-400">Nông Sản Việt</span> trực tiếp
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm sm:text-base">
              Rút ngắn khoảng cách giữa nhà nông và doanh nghiệp thu mua. Tối ưu logistics chiều về, minh bạch chất lượng và bảo chứng thanh toán an toàn.
            </p>
          </div>

          {/* Floating Glass Card */}
          <div className="p-6 bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800/80 shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30 shrink-0">
                <Truck size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">Giải pháp Logistics Hai Chiều</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Thuật toán định tuyến ghép xe tải lạnh trống chiều về thông minh, giúp giảm cước vận chuyển trung bình từ 15-20%.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex gap-8 text-xs text-slate-400 border-t border-slate-800/60 pt-8">
            <div className="flex items-center gap-2">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              <span>Bảo chứng giao dịch an tâm</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-teal-400" />
              <span>Hỗ trợ AI Chuyên Sâu 24/7</span>
            </div>
          </div>
        </div>
      </div>

      {/* NỬA PHẢI - KHUNG FORM ĐĂNG NHẬP SANG TRỌNG */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 md:p-16 bg-white lg:bg-slate-50/20 relative">
        <div className="w-full max-w-[420px] space-y-8 bg-white lg:p-8 lg:rounded-3xl lg:border lg:border-slate-100 lg:shadow-xl">
          
          {/* Logo Mobile Only */}
          <div className="lg:hidden flex flex-col items-center text-center space-y-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
              <Leaf className="h-6 w-6 text-slate-950" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">AGRI-FLOW</h2>
              <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest">Dòng chảy nông sản</p>
            </div>
          </div>

          {/* Form Header */}
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Chào Mừng Trở Lại</h2>
            <p className="text-sm text-slate-400">Đăng nhập tài khoản của bạn để tiếp tục phiên giao dịch</p>
          </div>

          {/* DEMO ACCOUNTS BOX */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-lg space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-400">
              <Sparkles size={12} />
              <span>Trải Nghiệm Nhanh Hệ Thống (Demo)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('farmer')}
                className="px-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 border border-emerald-500/30"
              >
                <User size={10} /> Farmer
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('buyer')}
                className="px-2 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 border border-sky-500/30"
              >
                <User size={10} /> Buyer
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="px-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 border border-indigo-500/30"
              >
                <Shield size={10} /> Admin
              </button>
            </div>
          </div>

          {/* Social Signin Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
              className="w-full inline-flex justify-center items-center py-3 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('github')}
              disabled={loading}
              className="w-full inline-flex justify-center items-center py-3 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span className="px-3 bg-white">Hoặc dùng tài khoản riêng</span>
            </div>
          </div>

          {/* Form Credentials */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              
              {/* Input Email */}
              <div className="space-y-1">
                <label htmlFor="email" className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Email Đăng Ký
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* Input Password */}
              <div className="space-y-1">
                <label htmlFor="password" className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Mật Khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Checkbox Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="h-4.5 w-4.5 text-emerald-600 focus:ring-emerald-500/20 border-slate-300 rounded-md cursor-pointer"
                />
                <span className="text-slate-600 text-xs font-medium">Ghi nhớ đăng nhập</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>ĐĂNG NHẬP NGAY</span>
                </>
              )}
            </button>
          </form>

          {/* Switch to Register Page */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-500 font-medium">
              Chưa có tài khoản giao dịch?{' '}
              <Link to="/register" className="font-extrabold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-0.5">
                <span>Đăng ký thành viên</span>
                <ChevronRight size={14} />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login