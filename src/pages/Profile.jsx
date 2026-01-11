import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Phone, MapPin, Edit, Save,
  Mail, ShieldCheck, Home, ArrowLeft,
  Calendar, Award, Globe, Settings,
  CheckCircle, Bell, CreditCard, Leaf,
  Truck, Package, Star, Camera
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'

const Profile = () => {
  const navigate = useNavigate()
  const { user, profile, updateProfile } = useAuth()
  
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    province: '',
    district: '',
    address: '',
    bio: '',
    website: ''
  })

  // Sync profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        province: profile.province || '',
        district: profile.district || '',
        address: profile.address || '',
        bio: profile.bio || '',
        website: profile.website || ''
      })
    }
  }, [profile])

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const result = await updateProfile(formData)
      if (result.success) {
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle className="text-emerald-600" size={20} />
            <span className="font-semibold">Cập nhật thông tin thành công!</span>
          </div>
        )
        setEditing(false)
      } else {
        toast.error(result.error || 'Cập nhật thất bại')
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi kết nối server')
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadge = () => {
    if (!profile?.role) return null
    
    const roleConfig = {
      farmer: { label: 'Nông dân', color: 'bg-emerald-100 text-emerald-700', icon: Leaf },
      buyer: { label: 'Người mua', color: 'bg-blue-100 text-blue-700', icon: Package },
      logistics: { label: 'Vận chuyển', color: 'bg-amber-100 text-amber-700', icon: Truck },
      admin: { label: 'Quản trị', color: 'bg-purple-100 text-purple-700', icon: Settings }
    }
    
    const config = roleConfig[profile.role]
    if (!config) return null
    
    const Icon = config.icon
    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${config.color}`}>
        <Icon size={14} />
        {config.label}
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white flex flex-col items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center mb-6">
          <User className="h-12 w-12 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Vui lòng đăng nhập</h3>
        <p className="text-gray-600 mb-6">Đăng nhập để xem thông tin cá nhân</p>
        <button 
          onClick={() => navigate('/login')} 
          className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
        >
          Đăng nhập ngay
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center text-emerald-100 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Quay lại
            </button>
            <h1 className="text-2xl font-bold">Tài khoản cá nhân</h1>
            <div className="w-10"></div> {/* Spacer */}
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-white">
                {profile?.total_orders || 0}
              </div>
              <div className="text-sm text-emerald-100">Đơn hàng</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-white">
                {profile?.rating || '4.8'}
              </div>
              <div className="text-sm text-emerald-100">Đánh giá</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-white">
                {profile?.member_since || '2024'}
              </div>
              <div className="text-sm text-emerald-100">Tham gia</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="text-2xl font-bold text-white">100%</div>
              <div className="text-sm text-emerald-100">Hoàn thành</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-32"></div>
              <div className="px-6 pb-6 relative">
                {/* Avatar */}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 border-4 border-white flex items-center justify-center text-emerald-600 font-bold text-2xl shadow-lg">
                      {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white hover:bg-emerald-600 transition-colors">
                      <Camera size={14} />
                    </button>
                  </div>
                </div>

                <div className="pt-16 text-center">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{profile?.full_name || 'Khách hàng'}</h2>
                  <div className="mb-4">{getRoleBadge()}</div>
                  
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mb-6">
                    <CheckCircle size={14} className="text-emerald-500" />
                    <span>Tài khoản đã xác minh</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-4 border-t border-gray-100 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Mail size={18} className="text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">Email</div>
                      <div className="font-medium text-gray-800 truncate">{user.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Phone size={18} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">Điện thoại</div>
                      <div className="font-medium text-gray-800">{profile?.phone || 'Chưa cập nhật'}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                      <Calendar size={18} className="text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500">Tham gia</div>
                      <div className="font-medium text-gray-800">Tháng 6, 2024</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-4">
              <nav className="space-y-1">
                {[
                  { id: 'profile', label: 'Thông tin cá nhân', icon: User },
                  { id: 'orders', label: 'Đơn hàng của tôi', icon: Package },
                  { id: 'security', label: 'Bảo mật', icon: ShieldCheck },
                  { id: 'notifications', label: 'Thông báo', icon: Bell },
                  { id: 'payment', label: 'Thanh toán', icon: CreditCard }
                ].map(tab => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-emerald-50 text-emerald-700 font-semibold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={18} />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
              {/* Header */}
              <div className="border-b border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {activeTab === 'profile' && 'Thông tin cá nhân'}
                      {activeTab === 'orders' && 'Đơn hàng của tôi'}
                      {activeTab === 'security' && 'Bảo mật tài khoản'}
                      {activeTab === 'notifications' && 'Cài đặt thông báo'}
                      {activeTab === 'payment' && 'Phương thức thanh toán'}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {activeTab === 'profile' && 'Quản lý thông tin cá nhân và địa chỉ giao hàng'}
                    </p>
                  </div>
                  
                  {activeTab === 'profile' && !editing && (
                    <button 
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-all"
                    >
                      <Edit size={16} />
                      Chỉnh sửa
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {activeTab === 'profile' ? (
                  editing ? (
                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <User size={16} />
                            Họ và tên *
                          </label>
                          <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none hover:border-emerald-300 transition-colors"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Phone size={16} />
                            Số điện thoại
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none hover:border-emerald-300 transition-colors"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <MapPin size={16} />
                            Tỉnh / Thành phố
                          </label>
                          <input
                            type="text"
                            name="province"
                            value={formData.province}
                            onChange={handleChange}
                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none hover:border-emerald-300 transition-colors"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <MapPin size={16} />
                            Quận / Huyện
                          </label>
                          <input
                            type="text"
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none hover:border-emerald-300 transition-colors"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Home size={16} />
                            Địa chỉ cụ thể
                          </label>
                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none hover:border-emerald-300 transition-colors"
                            placeholder="Số nhà, tên đường, phường/xã..."
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Globe size={16} />
                            Website / Trang cá nhân
                          </label>
                          <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none hover:border-emerald-300 transition-colors"
                            placeholder="https://..."
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Award size={16} />
                            Giới thiệu bản thân
                          </label>
                          <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none hover:border-emerald-300 transition-colors"
                            placeholder="Giới thiệu về bản thân, kinh nghiệm, sở thích..."
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => setEditing(false)}
                          className="px-6 py-3 border-2 border-emerald-500 text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-all"
                        >
                          Hủy bỏ
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              <Save size={18} />
                              Lưu thay đổi
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-8">
                      {/* Personal Info */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <User className="text-emerald-600" size={20} />
                          Thông tin cá nhân
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InfoItem label="Họ và tên" value={profile?.full_name} />
                          <InfoItem label="Số điện thoại" value={profile?.phone} />
                          <InfoItem label="Email" value={user.email} />
                          <InfoItem label="Vai trò" value={
                            profile?.role === 'farmer' ? 'Nông dân' :
                            profile?.role === 'buyer' ? 'Người mua' :
                            profile?.role === 'logistics' ? 'Đơn vị vận chuyển' : 'Quản trị viên'
                          } />
                        </div>
                      </div>

                      {/* Address */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <MapPin className="text-emerald-600" size={20} />
                          Địa chỉ
                        </h4>
                        <div className="bg-gray-50 rounded-xl p-6">
                          <p className="text-gray-800 font-medium">
                            {[profile?.address, profile?.district, profile?.province].filter(Boolean).join(', ') || 'Chưa cập nhật địa chỉ'}
                          </p>
                        </div>
                      </div>

                      {/* Additional Info */}
                      {(profile?.bio || profile?.website) && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Award className="text-emerald-600" size={20} />
                            Thông tin bổ sung
                          </h4>
                          <div className="space-y-4">
                            {profile?.bio && (
                              <div>
                                <div className="text-sm text-gray-500 mb-1">Giới thiệu</div>
                                <p className="text-gray-700">{profile.bio}</p>
                              </div>
                            )}
                            {profile?.website && (
                              <div>
                                <div className="text-sm text-gray-500 mb-1">Website</div>
                                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                                  {profile.website}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Last Update */}
                      <div className="pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            Lần cuối cập nhật: {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                          </div>
                          <div className="flex items-center gap-2">
                            <ShieldCheck size={14} />
                            ID: {user.id.slice(0,8).toUpperCase()}...
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center mx-auto mb-4">
                      {activeTab === 'orders' && <Package className="h-8 w-8 text-emerald-400" />}
                      {activeTab === 'security' && <ShieldCheck className="h-8 w-8 text-emerald-400" />}
                      {activeTab === 'notifications' && <Bell className="h-8 w-8 text-emerald-400" />}
                      {activeTab === 'payment' && <CreditCard className="h-8 w-8 text-emerald-400" />}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {activeTab === 'orders' && 'Đơn hàng của tôi'}
                      {activeTab === 'security' && 'Bảo mật tài khoản'}
                      {activeTab === 'notifications' && 'Cài đặt thông báo'}
                      {activeTab === 'payment' && 'Phương thức thanh toán'}
                    </h3>
                    <p className="text-gray-600 mb-6">Tính năng đang được phát triển</p>
                    <button 
                      onClick={() => navigate(activeTab === 'orders' ? '/farmer/orders' : '/')}
                      className="px-6 py-2.5 border-2 border-emerald-500 text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-all"
                    >
                      {activeTab === 'orders' ? 'Xem đơn hàng' : 'Quay lại trang chủ'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Info Item Component
const InfoItem = ({ label, value }) => (
  <div className="space-y-1">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="font-medium text-gray-900">{value || 'Chưa cập nhật'}</div>
  </div>
)

export default Profile