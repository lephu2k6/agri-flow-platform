import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Phone, MapPin, Edit, Save,
  Mail, ShieldCheck, Home, ArrowLeft
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'

const Profile = () => {
  const navigate = useNavigate()
  const { user, profile, updateProfile } = useAuth()
  
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    province: '',
    district: '',
    address: ''
  })

  // Đồng bộ dữ liệu từ profile vào form khi load
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        province: profile.province || '',
        district: profile.district || '',
        address: profile.address || ''
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
        toast.success('Cập nhật thông tin thành công')
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

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-pulse mb-4 text-gray-400"><User size={48} /></div>
        <p className="text-gray-600">Vui lòng đăng nhập để xem thông tin</p>
        <button onClick={() => navigate('/login')} className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg">Đăng nhập</button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header với nút quay lại */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-green-600 transition-colors">
            <ArrowLeft size={20} className="mr-1" /> Quay lại
          </button>
          <div className="text-right">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Tài khoản cá nhân</h1>
            <p className="text-sm text-gray-500">ID: {user.id.slice(0, 8)}...</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* CỘT TRÁI: THẺ TỔNG QUAN */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-green-600 h-24"></div>
              <div className="px-6 pb-6">
                <div className="relative -mt-12 mb-4 text-center">
                  <div className="inline-block p-1 bg-white rounded-full shadow-lg">
                    <div className="bg-green-100 p-4 rounded-full">
                      <User className="h-12 w-12 text-green-600" />
                    </div>
                  </div>
                </div>
                
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">{profile?.full_name || 'Khách hàng'}</h2>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                    profile?.user_type === 'farmer' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {profile?.user_type === 'farmer' ? '👨‍🌾 Nông dân' : '🛒 Người mua'}
                  </span>
                </div>

                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center text-gray-600 text-sm">
                    <Mail size={16} className="mr-3 text-gray-400" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Phone size={16} className="mr-3 text-gray-400" />
                    <span>{profile?.phone || 'Chưa cập nhật số ĐT'}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <ShieldCheck size={16} className="mr-3 text-gray-400" />
                    <span>Trạng thái: Hoạt động</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: CHI TIẾT & CHỈNH SỬA */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="text-lg font-bold flex items-center">
                  {editing ? <Edit className="mr-2 text-green-600" size={20} /> : <Home className="mr-2 text-green-600" size={20} />}
                  Thông tin chi tiết
                </h3>
                {!editing && (
                  <button 
                    onClick={() => setEditing(true)}
                    className="text-sm font-medium text-green-600 hover:underline"
                  >
                    Chỉnh sửa
                  </button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Họ và tên</label>
                      <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Số điện thoại</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tỉnh / Thành phố</label>
                      <input type="text" name="province" value={formData.province} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Quận / Huyện</label>
                      <input type="text" name="district" value={formData.district} onChange={handleChange} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Địa chỉ cụ thể</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="Số nhà, tên đường..." />
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={() => setEditing(false)} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Hủy</button>
                    <button type="submit" disabled={loading} className="px-8 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center">
                      {loading ? <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full mr-2"></div> : <Save size={18} className="mr-2" />}
                      Lưu thông tin
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <InfoItem label="Họ và tên" value={profile?.full_name} />
                  <InfoItem label="Số điện thoại" value={profile?.phone} />
                  <InfoItem label="Địa chỉ" value={
                    [profile?.address, profile?.district, profile?.province].filter(Boolean).join(', ') || 'Chưa cập nhật'
                  } />
                  <InfoItem label="Loại tài khoản" value={profile?.user_type === 'farmer' ? 'Nông dân bán hàng' : 'Người mua hàng'} />
                  
                  <div className="pt-6 border-t mt-8">
                    <p className="text-xs text-gray-400 italic">Lần cuối cập nhật: {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString('vi-VN') : 'N/A'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Component phụ cho hiển thị thông tin scannable
const InfoItem = ({ label, value }) => (
  <div className="group border-b border-gray-50 pb-3 last:border-0">
    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</label>
    <p className="text-gray-800 font-medium">{value || '---'}</p>
  </div>
)

export default Profile