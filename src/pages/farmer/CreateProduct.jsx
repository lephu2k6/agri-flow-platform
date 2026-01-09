import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload, X, Camera, Package, DollarSign,
  MapPin, Info, Check, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

import { farmerService } from '../../services/farmer.service'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

const CreateProduct = () => {
  const { user } = useAuth() // Thay đổi từ profile sang user
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  
  // Lấy profile từ user object
  const profile = user?.profile || {}

  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    description: '',
    quantity: '',
    unit: 'kg',
    price_per_unit: '',
    province: profile?.province || '',
    district: '',
    quality_standard: '',
    min_order_quantity: '1'
  })

  const provinces = [
    'Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng',
    'An Giang', 'Bình Dương', 'Đồng Nai', 'Long An', 'Tiền Giang',
    'Bến Tre', 'Vĩnh Long', 'Đồng Tháp', 'Kiên Giang', 'Hậu Giang'
  ]

  const units = [
    { value: 'kg', label: 'Kg' },
    { value: 'tấn', label: 'Tấn' },
    { value: 'bao', label: 'Bao' },
    { value: 'thùng', label: 'Thùng' },
    { value: 'quả', label: 'Quả' }
  ]

  const qualityStandards = [
    'VietGAP', 'GlobalGAP', 'Hữu cơ', 'Loại 1', 'Xuất khẩu'
  ]

  /* ================= FETCH CATEGORIES ================= */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        const { data, error } = await supabase
          .from('categories')
          .select('id, name')
          .order('name')

        if (error) throw error
        setCategories(data || [])
      } catch (err) {
        console.error(err)
        toast.error('Không tải được danh mục')
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + images.length > 5) {
      toast.error('Tối đa 5 ảnh')
      return
    }

    const newImages = [...images, ...files]
    setImages(newImages)
    
    // Tạo previews cho ảnh mới
    const newPreviews = files.map(f => URL.createObjectURL(f))
    setImagePreviews(prev => [...prev, ...newPreviews])
  }

  const removeImage = (index) => {
    // Giải phóng URL object
    URL.revokeObjectURL(imagePreviews[index])
    
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user?.id) {
      toast.error('Vui lòng đăng nhập')
      navigate('/login')
      return
    }
    
    if (!images.length) {
      toast.error('Cần ít nhất 1 ảnh')
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...formData,
        farmer_id: user.id,
        quantity: Number(formData.quantity),
        price_per_unit: Number(formData.price_per_unit),
        min_order_quantity: Number(formData.min_order_quantity) || 1
      }

      const res = await farmerService.createProduct(payload, images)

      if (res.success) {
        toast.success(res.message || 'Đăng sản phẩm thành công')
        navigate('/farmer/products')
      } else {
        toast.error(res.error || 'Đăng sản phẩm thất bại')
      }
    } catch (err) {
      console.error('Submit error:', err)
      toast.error(err.message || 'Có lỗi xảy ra khi đăng sản phẩm')
    } finally {
      setLoading(false)
    }
  }

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      // Giải phóng tất cả object URLs
      imagePreviews.forEach(url => URL.revokeObjectURL(url))
    }
  }, [])

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Đăng sản phẩm mới</h1>
          <p className="text-gray-600 mt-2">Điền đầy đủ thông tin sản phẩm của bạn</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Images Section */}
          <section className="bg-white p-4 md:p-6 rounded-xl shadow">
            <h3 className="font-semibold text-lg mb-4 flex items-center text-gray-800">
              <Camera className="mr-2 text-green-500" size={20} /> Hình ảnh sản phẩm
            </h3>
            <p className="text-gray-600 text-sm mb-4">Tối đa 5 ảnh. Ảnh đầu tiên sẽ là ảnh đại diện.</p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative group">
                  <img 
                    src={src} 
                    alt={`Preview ${i + 1}`}
                    className="h-32 w-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                  {i === 0 && (
                    <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Ảnh chính
                    </span>
                  )}
                </div>
              ))}

              {imagePreviews.length < 5 && (
                <label className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center h-32 cursor-pointer hover:border-green-500 transition-colors">
                  <Upload className="text-gray-400 mb-2" size={24} />
                  <span className="text-sm text-gray-500">Tải ảnh lên</span>
                  <span className="text-xs text-gray-400">JPG, PNG (max 5MB)</span>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    hidden 
                    onChange={handleImageChange} 
                  />
                </label>
              )}
            </div>
          </section>

          {/* Basic Info Section */}
          <section className="bg-white p-4 md:p-6 rounded-xl shadow">
            <h3 className="font-semibold text-lg mb-4 flex items-center text-gray-800">
              <Info className="mr-2 text-blue-500" size={20} /> Thông tin cơ bản
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên sản phẩm *
                </label>
                <input
                  name="title"
                  placeholder="Ví dụ: Cam sành Đồng Tháp"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  minLength={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục *
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">
                    {loadingCategories ? 'Đang tải danh mục...' : '-- Chọn danh mục --'}
                  </option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả sản phẩm
                </label>
                <textarea
                  name="description"
                  placeholder="Mô tả chi tiết về sản phẩm (xuất xứ, chất lượng, cách bảo quản...)"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* Quantity & Price Section */}
          <section className="bg-white p-4 md:p-6 rounded-xl shadow">
            <h3 className="font-semibold text-lg mb-4 flex items-center text-gray-800">
              <DollarSign className="mr-2 text-yellow-500" size={20} /> Số lượng & Giá cả
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số lượng *
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="quantity"
                    placeholder="0"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="0.1"
                    step="0.1"
                    required
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {units.map(unit => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá mỗi đơn vị (VND) *
                </label>
                <input
                  type="number"
                  name="price_per_unit"
                  placeholder="0"
                  value={formData.price_per_unit}
                  onChange={handleChange}
                  min="1000"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đơn hàng tối thiểu
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="min_order_quantity"
                    value={formData.min_order_quantity}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <span className="text-gray-600 whitespace-nowrap">{formData.unit}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu chuẩn chất lượng
                </label>
                <select
                  name="quality_standard"
                  value={formData.quality_standard}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">-- Không yêu cầu --</option>
                  {qualityStandards.map(standard => (
                    <option key={standard} value={standard}>{standard}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Location Section */}
          <section className="bg-white p-4 md:p-6 rounded-xl shadow">
            <h3 className="font-semibold text-lg mb-4 flex items-center text-gray-800">
              <MapPin className="mr-2 text-red-500" size={20} /> Địa điểm
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tỉnh/Thành phố *
                </label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">-- Chọn tỉnh/thành phố --</option>
                  {provinces.map(province => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quận/Huyện
                </label>
                <input
                  type="text"
                  name="district"
                  placeholder="Ví dụ: Châu Thành"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* Submit Buttons */}
          <div className="flex flex-col md:flex-row justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/farmer/products')}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Check className="mr-2" size={18} />
                  Đăng sản phẩm
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default CreateProduct