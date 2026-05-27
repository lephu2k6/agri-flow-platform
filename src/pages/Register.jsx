import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, Check, Eye, EyeOff, Leaf, Lock, Mail, MapPin, Package, Phone, ShieldCheck, User } from 'lucide-react'
import toast from 'react-hot-toast'

import { authService } from '../services/auth/auth.service'
import { ValidationService } from '../services/auth/validation.service'

const provinces = [
  'Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng',
  'An Giang', 'Bình Dương', 'Đồng Nai', 'Long An', 'Tiền Giang',
  'Bến Tre', 'Vĩnh Long', 'Đồng Tháp', 'Kiên Giang', 'Hậu Giang'
]

const Register = () => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    province: '',
    role: 'buyer'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [agreeTerms, setAgreeTerms] = useState(false)

  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (name === 'password') {
      setPasswordStrength(ValidationService.calculatePasswordStrength(value))
    }
  }

  const validateStep1 = () => {
    if (!ValidationService.validateFullName(formData.full_name)) {
      toast.error('Họ tên phải có ít nhất 2 ký tự')
      return false
    }

    if (!ValidationService.validateEmail(formData.email)) {
      toast.error('Email không hợp lệ')
      return false
    }

    if (!ValidationService.validatePhone(formData.phone)) {
      toast.error('Số điện thoại không hợp lệ. Ví dụ: 0987654321')
      return false
    }

    if (!['farmer', 'buyer'].includes(formData.role)) {
      toast.error('Vui lòng chọn vai trò')
      return false
    }

    return true
  }

  const validateStep2 = () => {
    if (!formData.password) {
      toast.error('Vui lòng nhập mật khẩu')
      return false
    }

    if (formData.password.length < 8) {
      toast.error('Mật khẩu phải có ít nhất 8 ký tự')
      return false
    }

    if (passwordStrength < 3) {
      toast.error('Mật khẩu chưa đủ mạnh')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp')
      return false
    }

    if (!agreeTerms) {
      toast.error('Vui lòng đồng ý với điều khoản dịch vụ')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep2()) return

    setLoading(true)
    try {
      const result = await authService.register(formData)

      if (!result.success) {
        toast.error(result.error)
        return
      }

      if (result.requiresConfirmation) {
        toast.success(`Đăng ký thành công. Vui lòng kiểm tra email ${formData.email} để xác thực tài khoản.`, { duration: 8000 })
      } else {
        toast.success('Đăng ký tài khoản thành công')
      }

      setTimeout(() => navigate('/login'), 1800)
    } catch (error) {
      toast.error('Có lỗi xảy ra: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const passwordStrengthLabels = ['Rất yếu', 'Yếu', 'Khá', 'Mạnh', 'Rất mạnh']
  const passwordStrengthColors = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-600']

  return (
    <div className="market-surface min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
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
              <p className="text-sm font-black uppercase tracking-wide text-emerald-200">Tạo tài khoản giao dịch</p>
              <h1 className="mt-4 text-4xl font-black leading-tight">Một hệ thống cho mua bán nông sản trực tiếp</h1>
              <p className="mt-4 text-sm leading-6 text-emerald-50/80">
                Đăng ký làm người mua hoặc người bán để quản lý sản phẩm, đơn hàng, thanh toán và thông tin vận chuyển trong cùng một giao diện.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            <SideNote icon={Package} title="Người mua" text="Tìm nguồn hàng, đặt mua và theo dõi đơn hàng." />
            <SideNote icon={Leaf} title="Nông dân" text="Đăng bán sản phẩm và quản lý đơn từ dashboard." />
            <SideNote icon={ShieldCheck} title="Quản trị" text="Dữ liệu người dùng và sản phẩm đồng bộ toàn hệ thống." />
          </div>
        </aside>

        <main className="flex items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-2xl">
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
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Đăng ký</p>
                  <h2 className="mt-2 text-2xl font-black text-gray-900">Tạo tài khoản Agri-Flow</h2>
                  <p className="mt-2 text-sm text-gray-500">Hoàn tất 2 bước để bắt đầu giao dịch.</p>
                </div>
                <div className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
                  Bước {step}/2
                </div>
              </div>

              <div className="mb-7 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <StepMarker active done={step > 1} label="Hồ sơ" />
                <div className="h-px bg-gray-200" />
                <StepMarker active={step === 2} label="Bảo mật" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {step === 1 ? (
                  <div className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <TextField icon={User} label="Họ và tên" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Nguyễn Văn A" />
                      <TextField icon={Mail} label="Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
                      <TextField icon={Phone} label="Số điện thoại" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="0987654321" />

                      <label className="block">
                        <span className="mb-1.5 block text-xs font-black uppercase tracking-wide text-gray-600">Tỉnh / Thành phố</span>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <select name="province" value={formData.province} onChange={handleChange} className="market-input h-11 w-full appearance-none pl-10 pr-3 text-sm">
                            <option value="">Chọn khu vực</option>
                            {provinces.map(province => <option key={province} value={province}>{province}</option>)}
                          </select>
                        </div>
                      </label>
                    </div>

                    <div>
                      <span className="mb-2 block text-xs font-black uppercase tracking-wide text-gray-600">Vai trò</span>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <RoleCard
                          active={formData.role === 'buyer'}
                          icon={Package}
                          title="Người mua"
                          text="Tìm sản phẩm, đặt đơn và theo dõi thanh toán."
                          onClick={() => setFormData(prev => ({ ...prev, role: 'buyer' }))}
                        />
                        <RoleCard
                          active={formData.role === 'farmer'}
                          icon={Leaf}
                          title="Nông dân / Người bán"
                          text="Đăng bán sản phẩm và xử lý đơn hàng."
                          onClick={() => setFormData(prev => ({ ...prev, role: 'farmer' }))}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <PasswordField
                      label="Mật khẩu"
                      name="password"
                      value={formData.password}
                      show={showPassword}
                      onToggle={() => setShowPassword(prev => !prev)}
                      onChange={handleChange}
                      placeholder="Tối thiểu 8 ký tự"
                    />

                    {formData.password && (
                      <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                        <div className="mb-2 flex items-center justify-between text-xs font-bold">
                          <span className="text-gray-500">Độ mạnh mật khẩu</span>
                          <span className="text-emerald-700">{passwordStrengthLabels[passwordStrength]}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
                          <div className={`h-full ${passwordStrengthColors[passwordStrength]}`} style={{ width: `${(passwordStrength + 1) * 20}%` }} />
                        </div>
                      </div>
                    )}

                    <PasswordField
                      label="Xác nhận mật khẩu"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      show={showConfirmPassword}
                      onToggle={() => setShowConfirmPassword(prev => !prev)}
                      onChange={handleChange}
                      placeholder="Nhập lại mật khẩu"
                    />

                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="flex items-center gap-1 text-xs font-bold text-red-600">
                        <AlertCircle size={14} /> Mật khẩu xác nhận chưa khớp
                      </p>
                    )}

                    <label className="flex cursor-pointer items-start gap-3 rounded-md border border-emerald-100 bg-emerald-50 p-4 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-1 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>
                        Tôi đồng ý với <Link to="/terms" className="font-black text-emerald-700">Điều khoản</Link> và{' '}
                        <Link to="/privacy" className="font-black text-emerald-700">Chính sách bảo mật</Link> của Agri-Flow.
                      </span>
                    </label>
                  </div>
                )}

                <div className="flex gap-3 border-t border-gray-100 pt-5">
                  {step === 2 && (
                    <button type="button" onClick={() => setStep(1)} className="h-11 rounded-md border border-gray-200 bg-white px-5 text-sm font-black text-gray-700 hover:bg-gray-50">
                      Quay lại
                    </button>
                  )}
                  {step === 1 ? (
                    <button type="button" onClick={() => validateStep1() && setStep(2)} className="market-button h-11 flex-1 justify-center text-sm">
                      Tiếp tục
                    </button>
                  ) : (
                    <button type="submit" disabled={loading || !agreeTerms} className="market-button h-11 flex-1 justify-center text-sm disabled:opacity-60">
                      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Check size={18} />}
                      {loading ? 'Đang tạo tài khoản...' : 'Hoàn tất đăng ký'}
                    </button>
                  )}
                </div>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                Đã có tài khoản?{' '}
                <Link to="/login" className="font-black text-emerald-700 hover:text-emerald-800">Đăng nhập</Link>
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

const TextField = ({ icon: Icon, label, name, value, onChange, placeholder, type = 'text' }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-black uppercase tracking-wide text-gray-600">{label}</span>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input name={name} type={type} value={value} onChange={onChange} className="market-input h-11 w-full pl-10 pr-3 text-sm" placeholder={placeholder} />
    </div>
  </label>
)

const PasswordField = ({ label, name, value, show, onToggle, onChange, placeholder }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-black uppercase tracking-wide text-gray-600">{label}</span>
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input name={name} type={show ? 'text' : 'password'} value={value} onChange={onChange} className="market-input h-11 w-full pl-10 pr-10 text-sm" placeholder={placeholder} />
      <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700" aria-label="Ẩn hoặc hiện mật khẩu">
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </label>
)

const RoleCard = ({ active, icon: Icon, title, text, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-md border p-4 text-left transition-all ${
      active ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100' : 'border-gray-200 bg-white hover:border-emerald-200'
    }`}
  >
    <div className="mb-3 flex items-center gap-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-md ${active ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
        <Icon size={20} />
      </div>
      <p className="font-black text-gray-900">{title}</p>
    </div>
    <p className="text-xs font-semibold leading-5 text-gray-500">{text}</p>
  </button>
)

const StepMarker = ({ active, done, label }) => (
  <div className={`flex items-center gap-2 ${active ? 'text-emerald-700' : 'text-gray-400'}`}>
    <span className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-black ${active ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'}`}>
      {done ? <Check size={15} /> : label === 'Hồ sơ' ? '1' : '2'}
    </span>
    <span className="text-xs font-black uppercase tracking-wide">{label}</span>
  </div>
)

const SideNote = ({ icon: Icon, title, text }) => (
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

export default Register
