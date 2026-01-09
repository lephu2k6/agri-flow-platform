import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User, Phone, MapPin, Edit, Save,
  Mail, Calendar, Package, ShoppingBag
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { authService } from '../services/auth/auth.service'

const Profile = () => {
  const navigate = useNavigate()
  const { user, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    province: '',
    district: '',
    address: ''
  })

  useEffect(() => {
    if (user?.profile) {
      setFormData({
        full_name: user.profile.full_name || '',
        phone: user.profile.phone || '',
        province: user.profile.province || '',
        district: user.profile.district || '',
        address: user.profile.address || ''
      })
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      const result = await updateProfile(formData)
      
      if (result.success) {
        toast.success('Cập nhật thông tin thành công')
        setEditing(false)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Vui lòng đăng nhập</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Thông tin cá nhân</h1>
          <p className="text-gray-600">Quản lý thông tin tài khoản của bạn</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="text-center">
                <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                  <User className="h-16 w-16 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user.profile?.full_name || 'Người dùng'}
                </h2>
                <p className="text-gray-600 capitalize">
                  {user.profile?.user_type === 'farmer' ? 'Nông dân' : 'Người mua'}
                </p>
                
                {user.profile?.farm_name && (
                  <p className="mt-2 text-green-600 font-medium">
                    {user.profile.farm_name}
                  </p>
                )}
                
                {user.profile?.business_name && (
                  <p className="mt-2 text-blue-600 font-medium">
                    {user.profile.business_name}
                  </p>
                )}
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center text-gray-600">
                  <Mail size={18} className="mr-3" />
                  <span>{user.email}</span>
                </div>
                
                {user.profile?.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone size={18} className="mr-3" />
                    <span>{user.profile.phone}</span>
                  </div>
                )}
                
                {user.profile?.province && (
                  <div className="flex items-center text-gray-600">
                    <MapPin size={18} className="mr-3" />
                    <span>{user.profile.province}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t">
                <button
                  onClick={() => setEditing(!editing)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
                >
                  {editing ? (
                    <>
                      <Save className="mr-2" size={18} />
                      Lưu thay đổi
                    </>
                  ) : (
                    <>
                      <Edit className="mr-2" size={18} />
                      Chỉnh sửa
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="md:col-span-2">
            {editing ? (
              <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Chỉnh sửa thông tin</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tỉnh/Thành phố
                    </label>
                    <input
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quận/Huyện
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ chi tiết
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin chi tiết</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Họ và tên</label>
                    <p className="text-gray-900">{user.profile?.full_name || 'Chưa cập nhật'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Số điện thoại</label>
                    <p className="text-gray-900">{user.profile?.phone || 'Chưa cập nhật'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Địa chỉ</label>
                    <p className="text-gray-900">
                      {[
                        user.profile?.address,
                        user.profile?.district,
                        user.profile?.province
                      ].filter(Boolean).join(', ') || 'Chưa cập nhật'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Loại tài khoản</label>
                    <p className="text-gray-900 capitalize">{user.profile?.user_type || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile