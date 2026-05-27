import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Leaf, Lock, LogIn, Mail, Shield, Store, User } from 'lucide-react'
import toast from 'react-hot-toast'

import { authService } from '../services/auth/auth.service'
import { SocialAuthService } from '../services/auth/social-auth.service'

const demoAccounts = {
  farmer: { label: 'Nông dân', email: 'phulhm1749@ut.edu.vn', password: 'Lll123456@' },
  buyer: { label: 'Người mua', email: 'gatv3102006@gmail.com', password: 'Ll123456@' },
  admin: { label: 'Admin', email: 'nguyendinhvuhoang00@gmail.com', password: 'Hoang0366090120@' },
}

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/products'

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      toast.error('Vui lòng nhập đầy đủ email và mật khẩu')
      return
    }

    setLoading(true)
    try {
      const result = await authService.login(formData.email, formData.password)

      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success(`Đăng nhập thành công. Chào ${result.profile?.full_name || result.user?.email}`)

      setTimeout(() => {
        if (result.profile?.role === 'farmer') navigate('/farmer/dashboard', { replace: true })
        else if (result.profile?.role === 'buyer') navigate('/products', { replace: true })
        else if (result.profile?.role === 'admin') navigate('/admin/dashboard', { replace: true })
        else navigate(from, { replace: true })
      }, 700)
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Có lỗi xảy ra: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = (role) => {
    const account = demoAccounts[role]
    setFormData({ email: account.email, password: account.password })
    toast.success(`Đã điền tài khoản ${account.label}`)
  }

  const handleSocialLogin = async (provider) => {
    setLoading(true)
    try {
      const result = provider === 'google'
        ? await SocialAuthService.loginWithGoogle()
        : await SocialAuthService.loginWithGithub()

      if (!result.success) toast.error(result.error)
    } catch (error) {
      toast.error('Lỗi đăng nhập: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="market-surface min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[0.92fr_1.08fr]">
        <aside className="hidden border-r border-gray-200 bg-emerald-900 px-12 py-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-white text-emerald-700">
                <Leaf size={22} />
              </div>
              <div>
                <p className="text-xl font-black leading-none">Agri-Flow</p>
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-200">Market</p>
              </div>
            </Link>

            <div className="mt-16 max-w-md">
              <p className="text-sm font-black uppercase tracking-wide text-emerald-200">Nền tảng nông sản trực tiếp</p>
              <h1 className="mt-4 text-4xl font-black leading-tight">Đăng nhập để quản lý giao dịch nông sản</h1>
              <p className="mt-4 text-sm leading-6 text-emerald-50/80">
                Một tài khoản dùng chung cho người mua, nông dân và quản trị. Dữ liệu đơn hàng, sản phẩm và thanh toán được giữ trong cùng hệ thống.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            <InfoRow icon={Store} title="Chợ nông sản" text="Tìm nguồn hàng và đặt mua trực tiếp." />
            <InfoRow icon={Shield} title="Quản trị đồng bộ" text="Admin, buyer và farmer dùng cùng phong cách giao diện." />
          </div>
        </aside>

        <main className="flex items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-700 text-white">
                  <Leaf size={20} />
                </div>
                <div>
                  <p className="text-lg font-black text-gray-900">Agri-Flow Market</p>
                  <p className="text-xs font-bold text-emerald-700">Chợ nông sản trực tiếp</p>
                </div>
              </Link>
            </div>

            <section className="market-panel p-6 sm:p-8">
              <div className="mb-6">
                <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Đăng nhập</p>
                <h2 className="mt-2 text-2xl font-black text-gray-900">Chào mừng trở lại</h2>
                <p className="mt-2 text-sm text-gray-500">Nhập thông tin tài khoản để tiếp tục.</p>
              </div>

              <div className="mb-5 grid grid-cols-3 gap-2 rounded-md border border-gray-200 bg-gray-50 p-2">
                {Object.entries(demoAccounts).map(([role, account]) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleDemoLogin(role)}
                    className="rounded-md bg-white px-2 py-2 text-xs font-black text-gray-700 shadow-sm hover:text-emerald-700"
                  >
                    {account.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <FieldLabel label="Email">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="market-input h-11 w-full pl-10 pr-3 text-sm"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </FieldLabel>

                <FieldLabel label="Mật khẩu">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    className="market-input h-11 w-full pl-10 pr-10 text-sm"
                    placeholder="Nhập mật khẩu"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    aria-label="Ẩn hoặc hiện mật khẩu"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </FieldLabel>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-gray-600">
                    <input type="checkbox" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                    Ghi nhớ đăng nhập
                  </label>
                  <Link to="/forgot-password" className="font-bold text-emerald-700 hover:text-emerald-800">Quên mật khẩu?</Link>
                </div>

                <button type="submit" disabled={loading} className="market-button h-11 w-full justify-center text-sm disabled:opacity-60">
                  {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <LogIn size={18} />}
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
              </form>

              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-gray-200" />
                <span className="text-xs font-bold uppercase text-gray-400">hoặc</span>
                <span className="h-px flex-1 bg-gray-200" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => handleSocialLogin('google')} disabled={loading} className="h-10 rounded-md border border-gray-200 bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-60">
                  Google
                </button>
                <button type="button" onClick={() => handleSocialLogin('github')} disabled={loading} className="h-10 rounded-md border border-gray-200 bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-60">
                  GitHub
                </button>
              </div>

              <p className="mt-6 text-center text-sm text-gray-500">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="font-black text-emerald-700 hover:text-emerald-800">Đăng ký ngay</Link>
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

const FieldLabel = ({ label, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-black uppercase tracking-wide text-gray-600">{label}</span>
    <div className="relative">{children}</div>
  </label>
)

const InfoRow = ({ icon: Icon, title, text }) => (
  <div className="flex gap-3 rounded-md border border-white/10 bg-white/8 p-4">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/10 text-emerald-100">
      <Icon size={20} />
    </div>
    <div>
      <p className="font-black">{title}</p>
      <p className="mt-1 text-xs font-semibold text-emerald-50/70">{text}</p>
    </div>
  </div>
)

export default Login
