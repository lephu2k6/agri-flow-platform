import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Phone, MapPin, Eye, EyeOff, Check, AlertCircle, Leaf, Truck, Package, ChevronRight, Shield, BarChart2, Sparkles, Star } from 'lucide-react'
import { authService } from '../services/auth/auth.service'
import { ValidationService } from '../services/auth/validation.service'
import toast from 'react-hot-toast'

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

  const provinces = [
    'Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng',
    'An Giang', 'Bình Dương', 'Đồng Nai', 'Long An', 'Tiền Giang',
    'Bến Tre', 'Vĩnh Long', 'Đồng Tháp', 'Kiên Giang', 'Hậu Giang'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (name === 'password') {
      const strength = ValidationService.calculatePasswordStrength(value)
      setPasswordStrength(strength)
    }
  }

  const validateStep1 = () => {
    const { full_name, email, phone, role } = formData
    
    if (!ValidationService.validateFullName(full_name)) {
      toast.error('Họ tên phải có ít nhất 2 ký tự')
      return false
    }
    
    if (!ValidationService.validateEmail(email)) {
      toast.error('Email không hợp lệ') 
      return false
    }
      
    if (!ValidationService.validatePhone(phone)) {
      toast.error('Số điện thoại không hợp lệ. VD: 0987654321')
      return false
    }
    
    if (!role || !['farmer', 'buyer'].includes(role)) {
      toast.error('Vui lòng chọn vai trò')
      return false
    }
    
    return true
  }

  const validateStep2 = () => {
    const { password, confirmPassword } = formData
    
    if (!password) {
      toast.error('Vui lòng nhập mật khẩu')
      return false
    }
    
    if (password.length < 8) {
      toast.error('Mật khẩu phải có ít nhất 8 ký tự')
      return false
    }
    
    if (passwordStrength < 3) {
      toast.error('Mật khẩu chưa đủ mạnh')
      return false
    }
    
    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp')
      return false
    }
    
    if (!agreeTerms) {
      toast.error('Vui lòng đồng ý với điều khoản dịch vụ')
      return false
    }
    
    return true
  }

  const nextStep = () => {
    if (validateStep1()) {
      setStep(2)
    }
  }

  const prevStep = () => {
    setStep(1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateStep2()) {
      return
    }

    setLoading(true)
    
    try {
      const result = await authService.register(formData)
      
      if (!result.success) {
        toast.error(result.error)
        return
      }

      if (result.requiresConfirmation) {
        toast.success(
          <div className="space-y-2 text-sm text-left">
            <p className="font-bold text-emerald-700">Đăng ký thành công! 🎉</p>
            <p className="text-gray-600">
              Vui lòng kiểm tra email <strong>{formData.email}</strong> để xác thực tài khoản.
            </p>
            <p className="text-[10px] text-gray-400">
              (Kiểm tra thêm cả hòm thư spam/quảng cáo nếu chưa thấy gửi đến nhé)
            </p>
          </div>,
          { duration: 8000 }
        )
      } else {
        toast.success('🎉 Đăng ký thành viên thành công!')
      }

      setTimeout(() => {
        navigate('/login')
      }, 2500)

    } catch (error) {
      toast.error('Có lỗi xảy ra: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const passwordStrengthLabels = ['Rất yếu', 'Yếu', 'Khá', 'Mạnh', 'Rất mạnh']
  const passwordStrengthColors = [
    'bg-red-500', 
    'bg-orange-500', 
    'bg-amber-500', 
    'bg-emerald-500', 
    'bg-emerald-600'
  ]

  const getRoleIcon = (role) => {
    if (role === 'farmer') {
      return <Leaf className="h-6 w-6 text-emerald-500" />
    } else {
      return <Package className="h-6 w-6 text-sky-500" />
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-slate-50 text-slate-800 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* NỬA TRÁI - ILLUSTRATION LỢI ÍCH (DESKTOP ONLY) */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-16 relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#022c22_1px,transparent_1px),linear-gradient(to_bottom,#022c22_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30"></div>
        <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>

        <div className="relative z-10 max-w-lg space-y-12 w-full">
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

          {/* Benefits List */}
          <div className="space-y-6">
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-100">Khởi tạo tương lai nông sản Việt số hóa</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Tạo tài khoản thành viên để tận hưởng toàn bộ tiện ích giao dịch bảo chứng, ghép xe logistics và trợ lý AI thông minh.
            </p>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-800/80 p-6 space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-white text-base">Quyền lợi thành viên</h3>
            
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Truck size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Logistics Tối Ưu Chiều Về</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Tiết kiệm từ 15-20% phí giao nhận nông sản nhờ đội ngũ vận tải liên kết.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                  <Shield size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Thanh Toán Bảo Chứng Ký Quỹ</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Tiền hàng được giữ an toàn và chỉ giải ngân sau khi nghiệm thu nông sản đạt yêu cầu.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <BarChart2 size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Báo Giá AI Trực Tuyến</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Xem chỉ số giá thị trường theo thời gian thực tại địa phương canh tác.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Core rating */}
          <div className="flex gap-4 items-center text-slate-400 text-xs">
            <Star size={14} className="text-amber-400 fill-amber-400 animate-pulse" />
            <span>Nền tảng thương mại nông nghiệp uy tín số 1 Việt Nam</span>
          </div>
        </div>
      </div>

      {/* NỬA PHẢI - FORM ĐĂNG KÝ SANG TRỌNG ĐA BƯỚC */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 md:p-12 bg-white lg:bg-slate-50/20">
        <div className="w-full max-w-[550px] space-y-6 bg-white lg:p-8 lg:rounded-3xl lg:border lg:border-slate-100 lg:shadow-xl">
          
          {/* Logo Mobile Only */}
          <div className="lg:hidden flex items-center gap-3 mb-4 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
              <Leaf className="h-5 w-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">AGRI-FLOW</h2>
              <p className="text-[8px] text-emerald-600 font-bold uppercase tracking-widest leading-none">Dòng chảy nông sản</p>
            </div>
          </div>

          {/* Step Progress Tracker */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Đăng Ký Thành Viên</h2>
              <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100">
                Bước {step}/2: {step === 1 ? 'Thông tin cá nhân' : 'Bảo mật tài khoản'}
              </span>
            </div>

            {/* Visual Process Line */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs ${
                  step >= 1 ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 text-slate-400'
                }`}>
                  {step > 1 ? <Check size={14} /> : '1'}
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">Hồ sơ</span>
              </div>

              <div className="flex-1 h-[2px] bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full bg-emerald-500 transition-all duration-500 ${step >= 2 ? 'w-full' : 'w-0'}`}></div>
              </div>

              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-emerald-600' : 'text-slate-400'}`}>
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs ${
                  step >= 2 ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 text-slate-400'
                }`}>
                  2
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">Bảo mật</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* STEP 1: PERSONAL INFORMATION */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label htmlFor="full_name" className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Họ và tên *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User size={16} />
                      </div>
                      <input
                        id="full_name"
                        name="full_name"
                        type="text"
                        value={formData.full_name}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/85 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm transition-all"
                        placeholder="Nguyễn Văn A"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label htmlFor="email" className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Địa chỉ Email *</label>
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
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/85 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm transition-all"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label htmlFor="phone" className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Số điện thoại *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone size={16} />
                      </div>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/85 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm transition-all"
                        placeholder="0987654321"
                        required
                      />
                    </div>
                  </div>

                  {/* Province */}
                  <div className="space-y-1">
                    <label htmlFor="province" className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Tỉnh / Thành Phố</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <MapPin size={16} />
                      </div>
                      <select
                        id="province"
                        name="province"
                        value={formData.province}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200/85 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Chọn khu vực của bạn</option>
                        {provinces.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none rotate-90" size={16} />
                    </div>
                  </div>
                </div>

                {/* Role Radio Selection */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Vai Trò Hoạt Động *</label>
                  <div className="grid sm:grid-cols-2 gap-4">
                    
                    {/* Farmer */}
                    <label className={`relative border-2 rounded-2xl p-5 cursor-pointer transition-all flex items-start gap-4 ${
                      formData.role === 'farmer' 
                        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/10' 
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}>
                      <input 
                        type="radio" 
                        name="role" 
                        value="farmer" 
                        checked={formData.role === 'farmer'} 
                        onChange={handleChange} 
                        className="sr-only" 
                      />
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-200 shrink-0">
                        <Leaf size={20} />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-800 text-sm block">Nông Dân & Hợp Tác Xã</span>
                        <span className="text-[11px] text-slate-500 mt-1 block">Tạo vườn cây, đăng tải nông sản VietGAP và giao thương trực tiếp.</span>
                      </div>
                    </label>

                    {/* Buyer */}
                    <label className={`relative border-2 rounded-2xl p-5 cursor-pointer transition-all flex items-start gap-4 ${
                      formData.role === 'buyer' 
                        ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/10' 
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}>
                      <input 
                        type="radio" 
                        name="role" 
                        value="buyer" 
                        checked={formData.role === 'buyer'} 
                        onChange={handleChange} 
                        className="sr-only" 
                      />
                      <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 border border-sky-200 shrink-0">
                        <Package size={20} />
                      </div>
                      <div>
                        <span className="font-extrabold text-slate-800 text-sm block">Doanh Nghiệp Thu Mua</span>
                        <span className="text-[11px] text-slate-500 mt-1 block">Đặt hàng số lượng lớn, theo dõi nguồn cung và kết nối logistics.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: SECURITY SETTINGS */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Input Password */}
                <div className="space-y-1">
                  <label htmlFor="password" className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Mật khẩu *</label>
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
                      className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200/85 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm transition-all"
                      placeholder="Tối thiểu 8 ký tự..."
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {formData.password && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-500">Mức độ an toàn:</span>
                        <span className={`${
                          passwordStrength >= 4 ? 'text-emerald-600' :
                          passwordStrength >= 3 ? 'text-amber-600' :
                          passwordStrength >= 2 ? 'text-orange-500' : 'text-red-500'
                        }`}>{passwordStrengthLabels[passwordStrength]}</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${passwordStrengthColors[passwordStrength]} transition-all duration-300`}
                          style={{ width: `${(passwordStrength + 1) * 20}%` }}
                        ></div>
                      </div>
                      <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-slate-500 font-bold mt-2">
                        <li className={`flex items-center gap-1 ${formData.password.length >= 8 ? 'text-emerald-600' : ''}`}>
                          <Check size={10} /> Ít nhất 8 ký tự
                        </li>
                        <li className={`flex items-center gap-1 ${/[A-Z]/.test(formData.password) ? 'text-emerald-600' : ''}`}>
                          <Check size={10} /> Chữ viết hoa
                        </li>
                        <li className={`flex items-center gap-1 ${/[0-9]/.test(formData.password) ? 'text-emerald-600' : ''}`}>
                          <Check size={10} /> Có chữ số
                        </li>
                        <li className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(formData.password) ? 'text-emerald-600' : ''}`}>
                          <Check size={10} /> Ký tự đặc biệt
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Input Confirm Password */}
                <div className="space-y-1">
                  <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Xác nhận mật khẩu *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-10 py-3 bg-slate-50 border rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm transition-all ${
                        formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? 'border-red-500'
                          : 'border-slate-200'
                      }`}
                      placeholder="Nhập lại mật khẩu..."
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-500 font-bold flex items-center gap-1 mt-1">
                      <AlertCircle size={12} />
                      Mật khẩu nhập lại chưa khớp xác thực
                    </p>
                  )}
                </div>

                {/* Terms and Conditions Accordion */}
                <label className="flex items-start gap-3 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="h-4.5 w-4.5 text-emerald-600 focus:ring-emerald-500/20 border-slate-300 rounded cursor-pointer mt-0.5"
                  />
                  <span className="text-xs text-slate-600 leading-normal font-medium">
                    Tôi đồng ý tuân thủ{' '}
                    <Link to="/terms" className="font-extrabold text-emerald-600 hover:text-emerald-700">Điều khoản hoạt động</Link>{' '}
                    và đồng ý với{' '}
                    <Link to="/privacy" className="font-extrabold text-emerald-600 hover:text-emerald-700">Chính sách bảo mật dữ liệu</Link>{' '}
                    của Agri-Flow.
                  </span>
                </label>
              </div>
            )}

            {/* Stepper Actions Buttons */}
            <div className="flex gap-4 pt-4 border-t border-slate-100">
              {step === 2 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="w-1/3 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
                >
                  QUAY LẠI
                </button>
              )}

              {step === 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transform hover:-translate-y-0.5 duration-200"
                >
                  <span>TIẾP TỤC HỒ SƠ</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !agreeTerms}
                  className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transform hover:-translate-y-0.5 duration-200 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                      <span>Đang xử lý đăng ký...</span>
                    </>
                  ) : (
                    <span>HOÀN TẤT ĐĂNG KÝ ĐIỆN TỬ</span>
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Back to Login Link */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-500 font-medium">
              Đã có tài khoản giao dịch?{' '}
              <Link to="/login" className="font-extrabold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-0.5">
                <span>Đăng nhập ngay</span>
                <ChevronRight size={14} />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register