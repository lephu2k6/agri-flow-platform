import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Phone, MapPin, Eye, EyeOff, Check, AlertCircle } from 'lucide-react'
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
    
    // Check password strength
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
            <p className="font-bold text-green-700">Đăng ký thành công! 🎉</p>
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
    'bg-green-500', 
    'bg-green-600'
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="md:flex">
            {/* Left Side - Form */}
            <div className="md:w-2/3 p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Tạo tài khoản AgriFlow</h2>
                <p className="mt-2 text-gray-600">
                  Đã có tài khoản?{' '}
                  <Link to="/login" className="font-semibold text-green-600 hover:text-green-500">
                    Đăng nhập ngay
                  </Link>
                </p>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-center space-x-8 mb-8">
                <div className={`flex items-center ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center ${
                    step >= 1 ? 'border-green-600 bg-green-50' : 'border-gray-300'
                  }`}>
                    {step > 1 ? <Check className="h-5 w-5" /> : '1'}
                  </div>
                  <span className="ml-3 font-medium hidden sm:inline">Thông tin</span>
                </div>
                
                <div className="h-0.5 w-16 bg-gray-300"></div>
                
                <div className={`flex items-center ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center ${
                    step >= 2 ? 'border-green-600 bg-green-50' : 'border-gray-300'
                  }`}>
                    2
                  </div>
                  <span className="ml-3 font-medium hidden sm:inline">Bảo mật</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                {/* Step 1: Personal Information */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
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
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            placeholder="Nguyễn Văn A"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            placeholder="you@example.com"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
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
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            placeholder="0987654321"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-2">
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
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none appearance-none"
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
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Bạn là? *
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className={`
                          relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200
                          ${formData.role === 'farmer' 
                            ? 'border-green-500 bg-green-50 ring-2 ring-green-200' 
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
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
                            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                              <User className="h-6 w-6 text-green-600" />
                            </div>
                            <span className="font-semibold text-gray-800">Nông dân</span>
                            <p className="text-sm text-gray-600 mt-1">Đăng bán nông sản</p>
                          </div>
                        </label>

                        <label className={`
                          relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200
                          ${formData.role === 'buyer' 
                            ? 'border-green-500 bg-green-50 ring-2 ring-green-200' 
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
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
                            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                              <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <span className="font-semibold text-gray-800">Người mua</span>
                            <p className="text-sm text-gray-600 mt-1">Mua nông sản trực tiếp</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Account Security */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
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
                            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                            )}
                          </button>
                        </div>
                        
                        {/* Password Strength */}
                        {formData.password && (
                          <div className="mt-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">Độ mạnh mật khẩu:</span>
                              <span className={`font-semibold ${
                                passwordStrength >= 4 ? 'text-green-600' :
                                passwordStrength >= 3 ? 'text-yellow-600' :
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
                            <ul className="mt-3 text-sm text-gray-600 space-y-1">
                              <li className={`flex items-center ${formData.password.length >= 8 ? 'text-green-600' : ''}`}>
                                <Check className={`h-4 w-4 mr-2 ${formData.password.length >= 8 ? '' : 'invisible'}`} />
                                Ít nhất 8 ký tự
                              </li>
                              <li className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}`}>
                                <Check className={`h-4 w-4 mr-2 ${/[A-Z]/.test(formData.password) ? '' : 'invisible'}`} />
                                Có chữ in hoa
                              </li>
                              <li className={`flex items-center ${/[0-9]/.test(formData.password) ? 'text-green-600' : ''}`}>
                                <Check className={`h-4 w-4 mr-2 ${/[0-9]/.test(formData.password) ? '' : 'invisible'}`} />
                                Có số
                              </li>
                              <li className={`flex items-center ${/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600' : ''}`}>
                                <Check className={`h-4 w-4 mr-2 ${/[^A-Za-z0-9]/.test(formData.password) ? '' : 'invisible'}`} />
                                Có ký tự đặc biệt
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
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
                            className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none ${
                              formData.confirmPassword && formData.password !== formData.confirmPassword
                                ? 'border-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:border-green-500'
                            }`}
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                            )}
                          </button>
                        </div>
                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                          <p className="mt-2 text-sm text-red-600">Mật khẩu xác nhận không khớp</p>
                        )}
                      </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start">
                        <input
                          id="terms"
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-0.5"
                        />
                        <label htmlFor="terms" className="ml-3 text-sm">
                          <span className="text-gray-700">
                            Tôi đồng ý với{' '}
                            <Link to="/terms" className="font-semibold text-green-600 hover:text-green-500">
                              Điều khoản dịch vụ
                            </Link>{' '}
                            và{' '}
                            <Link to="/privacy" className="font-semibold text-green-600 hover:text-green-500">
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
                <div className="flex space-x-4 mt-8">
                  {step === 2 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 py-3.5 px-4 border border-gray-300 rounded-xl text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      ← Quay lại
                    </button>
                  )}
                  
                  {step === 1 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex-1 py-3.5 px-4 border border-transparent rounded-xl text-base font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                    >
                      Tiếp theo →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading || !agreeTerms}
                      className="flex-1 py-3.5 px-4 border border-transparent rounded-xl text-base font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
              </form>
            </div>

            {/* Right Side - Info */}
            <div className="md:w-1/3 bg-gradient-to-b from-green-500 to-green-600 p-8 text-white">
              <div className="h-full flex flex-col justify-center">
                <div className="text-center">
                  <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <User className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Tham gia AgriFlow ngay!</h3>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center">
                      <Check className="h-5 w-5 mr-3" />
                      <span>Kết nối trực tiếp với nông dân/người mua</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-5 w-5 mr-3" />
                      <span>Đăng bán & mua nông sản dễ dàng</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-5 w-5 mr-3" />
                      <span>Quản lý đơn hàng thuận tiện</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-5 w-5 mr-3" />
                      <span>Hoàn toàn miễn phí</span>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Lưu ý quan trọng</p>
                        <p className="text-sm opacity-90 mt-1">
                          Sau khi đăng ký, vui lòng kiểm tra email để xác thực tài khoản.
                          Điều này giúp bảo mật tài khoản của bạn.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Bằng việc đăng ký, bạn đồng ý với các điều khoản của AgriFlow.
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-semibold text-green-600 hover:text-green-500">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register