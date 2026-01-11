import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Phone, MapPin, Eye, EyeOff, Check, AlertCircle, Leaf, Truck, Package, ChevronRight, Shield,BarChart  } from 'lucide-react'
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
          <div className="space-y-2">
            <p className="font-bold text-emerald-700">Đăng ký thành công! 🎉</p>
            <p className="text-sm">
              Vui lòng kiểm tra email <strong>{formData.email}</strong> để xác thực tài khoản.
            </p>
            <p className="text-xs text-gray-600">
              (Nếu không thấy email, kiểm tra thư mục spam)
            </p>
          </div>,
          { duration: 8000 }
        )
      }

      setTimeout(() => {
        navigate('/login')
      }, 2000)

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
    'bg-yellow-500', 
    'bg-emerald-500', 
    'bg-emerald-600'
  ]

  const getRoleIcon = (role) => {
    if (role === 'farmer') {
      return <Leaf className="h-6 w-6 text-emerald-600" />
    } else {
      return <Package className="h-6 w-6 text-sky-600" />
    }
  }

  const getRoleColor = (role) => {
    return role === 'farmer' ? 'emerald' : 'sky'
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-50 via-white to-sky-50">
      {/* Left Panel - Illustration */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/20 to-sky-100/20"></div>
        
        <div className="relative z-10 max-w-lg w-full">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-xl">
              <Leaf className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                AGRI-FLOW
              </h1>
              <p className="text-emerald-600 font-medium">Tham gia cộng đồng nông sản</p>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-emerald-100 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Lợi ích khi tham gia</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Truck className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Tối ưu vận chuyển</h4>
                    <p className="text-sm text-gray-600">Giảm 15-20% chi phí logistics với xe trống chiều về</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-sky-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Giao dịch an toàn</h4>
                    <p className="text-sm text-gray-600">Hệ thống bảo chứng và thanh toán bảo mật</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <BarChart className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Dự báo thị trường</h4>
                    <p className="text-sm text-gray-600">Thông tin giá và nhu cầu thị trường cập nhật</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/80 p-4 rounded-xl border border-emerald-100 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                  <span className="text-sm font-bold text-emerald-600">500+</span>
                </div>
                <p className="text-xs text-gray-600">Người dùng tích cực</p>
              </div>
              <div className="bg-white/80 p-4 rounded-xl border border-sky-100 text-center">
                <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-2">
                  <span className="text-sm font-bold text-sky-600">2.5K+</span>
                </div>
                <p className="text-xs text-gray-600">Giao dịch thành công</p>
              </div>
              <div className="bg-white/80 p-4 rounded-xl border border-amber-100 text-center">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-2">
                  <span className="text-sm font-bold text-amber-600">98%</span>
                </div>
                <p className="text-xs text-gray-600">Hài lòng</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-2xl">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                AGRI-FLOW
              </h1>
              <p className="text-sm text-emerald-600">Tạo tài khoản</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-emerald-100">
            {/* Progress Steps */}
            <div className="px-8 pt-8">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-900">Đăng ký tài khoản</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Bước {step}/2</span>
                  <span className="text-emerald-600 font-semibold">
                    {step === 1 ? 'Thông tin cá nhân' : 'Bảo mật tài khoản'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mb-8">
                <div className={`flex items-center ${step >= 1 ? 'text-emerald-600' : 'text-gray-400'}`}>
                  <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center ${
                    step >= 1 ? 'border-emerald-600 bg-emerald-50' : 'border-gray-300'
                  }`}>
                    {step > 1 ? <Check className="h-5 w-5" /> : '1'}
                  </div>
                  <span className="ml-3 font-medium">Thông tin</span>
                </div>
                
                <div className="h-1 flex-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-emerald-500 transition-all duration-300 ${step >= 2 ? 'w-full' : 'w-0'}`}
                  ></div>
                </div>
                
                <div className={`flex items-center ${step >= 2 ? 'text-emerald-600' : 'text-gray-400'}`}>
                  <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center ${
                    step >= 2 ? 'border-emerald-600 bg-emerald-50' : 'border-gray-300'
                  }`}>
                    2
                  </div>
                  <span className="ml-3 font-medium">Bảo mật</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Step 1: Personal Information */}
              {step === 1 && (
                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="full_name" className="block text-sm font-semibold text-gray-700">
                        Họ và tên *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="full_name"
                          name="full_name"
                          type="text"
                          value={formData.full_name}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none hover:border-emerald-300 transition-all"
                          placeholder="Nguyễn Văn A"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                        Email *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none hover:border-emerald-300 transition-all"
                          placeholder="you@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                        Số điện thoại *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none hover:border-emerald-300 transition-all"
                          placeholder="0987654321"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="province" className="block text-sm font-semibold text-gray-700">
                        Tỉnh/Thành phố
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          id="province"
                          name="province"
                          value={formData.province}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none hover:border-emerald-300 transition-all bg-white"
                        >
                          <option value="">Chọn tỉnh/thành</option>
                          {provinces.map(province => (
                            <option key={province} value={province}>{province}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                      Bạn là? *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className={`
                        relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-200
                        ${formData.role === 'farmer' 
                          ? `border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200` 
                          : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                        }
                      `}>
                        <input
                          type="radio"
                          name="role"
                          value="farmer"
                          checked={formData.role === 'farmer'}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className="flex flex-col items-center text-center">
                          <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                            {getRoleIcon('farmer')}
                          </div>
                          <span className="font-bold text-gray-800">Nông dân</span>
                          <p className="text-sm text-gray-600 mt-2">Đăng bán và quản lý nông sản</p>
                          <div className="mt-3 text-xs font-medium px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
                            Phù hợp: HTX, hộ nông dân
                          </div>
                        </div>
                      </label>

                      <label className={`
                        relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-200
                        ${formData.role === 'buyer' 
                          ? `border-sky-500 bg-sky-50 ring-2 ring-sky-200` 
                          : 'border-gray-200 hover:border-sky-300 hover:bg-sky-50/50'
                        }
                      `}>
                        <input
                          type="radio"
                          name="role"
                          value="buyer"
                          checked={formData.role === 'buyer'}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className="flex flex-col items-center text-center">
                          <div className="h-14 w-14 rounded-full bg-sky-100 flex items-center justify-center mb-4">
                            {getRoleIcon('buyer')}
                          </div>
                          <span className="font-bold text-gray-800">Người mua</span>
                          <p className="text-sm text-gray-600 mt-2">Tìm và mua nông sản trực tiếp</p>
                          <div className="mt-3 text-xs font-medium px-3 py-1 rounded-full bg-sky-100 text-sky-700">
                            Phù hợp: Doanh nghiệp, đại lý
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Account Security */}
              {step === 2 && (
                <div className="p-8 space-y-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                        Mật khẩu *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full pl-10 pr-10 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none hover:border-emerald-300 transition-all"
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
                      
                      {/* Password Strength */}
                      {formData.password && (
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Độ mạnh mật khẩu:</span>
                            <span className={`font-semibold ${
                              passwordStrength >= 4 ? 'text-emerald-600' :
                              passwordStrength >= 3 ? 'text-amber-600' :
                              passwordStrength >= 2 ? 'text-orange-500' :
                              'text-red-500'
                            }`}>
                              {passwordStrengthLabels[passwordStrength]}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${passwordStrengthColors[passwordStrength]} transition-all duration-300`}
                              style={{ width: `${(passwordStrength + 1) * 20}%` }}
                            ></div>
                          </div>
                          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <li className={`flex items-center ${formData.password.length >= 8 ? 'text-emerald-600 font-medium' : ''}`}>
                              <Check className={`h-4 w-4 mr-2 ${formData.password.length >= 8 ? '' : 'invisible'}`} />
                              Ít nhất 8 ký tự
                            </li>
                            <li className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-emerald-600 font-medium' : ''}`}>
                              <Check className={`h-4 w-4 mr-2 ${/[A-Z]/.test(formData.password) ? '' : 'invisible'}`} />
                              Có chữ in hoa
                            </li>
                            <li className={`flex items-center ${/[0-9]/.test(formData.password) ? 'text-emerald-600 font-medium' : ''}`}>
                              <Check className={`h-4 w-4 mr-2 ${/[0-9]/.test(formData.password) ? '' : 'invisible'}`} />
                              Có số
                            </li>
                            <li className={`flex items-center ${/[^A-Za-z0-9]/.test(formData.password) ? 'text-emerald-600 font-medium' : ''}`}>
                              <Check className={`h-4 w-4 mr-2 ${/[^A-Za-z0-9]/.test(formData.password) ? '' : 'invisible'}`} />
                              Ký tự đặc biệt
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                        Xác nhận mật khẩu *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-10 py-3.5 border rounded-xl focus:ring-2 outline-none transition-all ${
                            formData.confirmPassword && formData.password !== formData.confirmPassword
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                              : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 hover:border-emerald-300'
                          }`}
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-xl p-1"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                          )}
                        </button>
                      </div>
                      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="text-sm text-red-600 font-medium flex items-center gap-1">
                          <AlertCircle size={14} />
                          Mật khẩu xác nhận không khớp
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <div className="flex items-start">
                      <input
                        id="terms"
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded mt-0.5"
                      />
                      <label htmlFor="terms" className="ml-3 text-sm">
                        <span className="text-gray-700">
                          Tôi đồng ý với{' '}
                          <Link to="/terms" className="font-bold text-emerald-600 hover:text-emerald-700">
                            Điều khoản dịch vụ
                          </Link>{' '}
                          và{' '}
                          <Link to="/privacy" className="font-bold text-emerald-600 hover:text-emerald-700">
                            Chính sách bảo mật
                          </Link>{' '}
                          của AgriFlow
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="px-8 pb-8 pt-6 border-t border-gray-100">
                <div className="flex space-x-4">
                  {step === 2 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 py-3.5 px-4 border border-gray-300 rounded-xl text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-sm hover:shadow"
                    >
                      ← Quay lại
                    </button>
                  )}
                  
                  {step === 1 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex-1 py-3.5 px-4 border border-transparent rounded-xl text-base font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Tiếp theo <ChevronRight className="ml-2 h-5 w-5" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading || !agreeTerms}
                      className="flex-1 py-3.5 px-4 border border-transparent rounded-xl text-base font-semibold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang xử lý...
                        </div>
                      ) : (
                        'Hoàn tất đăng ký'
                      )}
                    </button>
                  )}
                </div>

                <div className="text-center mt-6">
                  <p className="text-sm text-gray-600">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1">
                      Đăng nhập ngay <ChevronRight size={14} />
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-6">
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <Link to="/privacy" className="hover:text-emerald-600">
                Bảo mật
              </Link>
              <Link to="/terms" className="hover:text-emerald-600">
                Điều khoản
              </Link>
              <Link to="/support" className="hover:text-emerald-600">
                Hỗ trợ
              </Link>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              © 2024 AGRI-FLOW. Dự án số hóa nông sản Việt Nam
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register