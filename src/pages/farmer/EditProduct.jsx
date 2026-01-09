import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Save, Upload, X, Camera, Package,
  DollarSign, MapPin, Info, AlertCircle, Image
} from 'lucide-react'
import toast from 'react-hot-toast'

import { farmerService } from '../../services/farmer.service'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

const EditProduct = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [images, setImages] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [categories, setCategories] = useState([])

  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    description: '',
    quantity: '',
    unit: 'kg',
    price_per_unit: '',
    province: '',
    district: '',
    quality_standard: '',
    min_order_quantity: '1',
    status: 'draft'
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

  const statuses = [
    { value: 'draft', label: 'Bản nháp' },
    { value: 'available', label: 'Đang bán' },
    { value: 'sold', label: 'Đã bán hết' },
    { value: 'expired', label: 'Hết hạn' }
  ]

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (id) {
      fetchProductData()
      fetchCategories()
    }
  }, [id])

  const fetchProductData = async () => {
    try {
      setLoading(true)
      
      const { data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(id, name),
          product_images(id, image_url, is_primary, display_order)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      
      // Verify ownership
      if (product.farmer_id !== user?.id) {
        toast.error('Bạn không có quyền chỉnh sửa sản phẩm này')
        navigate('/farmer/products')
        return
      }

      // Set form data
      setFormData({
        title: product.title || '',
        category_id: product.category_id || '',
        description: product.description || '',
        quantity: product.quantity || '',
        unit: product.unit || 'kg',
        price_per_unit: product.price_per_unit || '',
        province: product.province || '',
        district: product.district || '',
        quality_standard: product.quality_standard || '',
        min_order_quantity: product.min_order_quantity || '1',
        status: product.status || 'draft'
      })

      // Set existing images
      if (product.product_images && product.product_images.length > 0) {
        setExistingImages(product.product_images)
      }

    } catch (error) {
      console.error('Fetch product error:', error)
      toast.error('Không thể tải thông tin sản phẩm')
      navigate('/farmer/products')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Fetch categories error:', error)
    }
  }

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + images.length + existingImages.length > 5) {
      toast.error('Tối đa 5 ảnh')
      return
    }

    const newImages = [...images, ...files]
    setImages(newImages)
    
    const newPreviews = files.map(f => URL.createObjectURL(f))
    setImagePreviews(prev => [...prev, ...newPreviews])
  }

  const removeExistingImage = async (imageId) => {
    try {
      // Delete from storage (you need to extract filename from URL)
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId)

      if (error) throw error

      // Update local state
      setExistingImages(prev => prev.filter(img => img.id !== imageId))
      toast.success('Đã xóa ảnh')

    } catch (error) {
      console.error('Delete image error:', error)
      toast.error('Không thể xóa ảnh')
    }
  }

  const removeNewImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index])
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user?.id) {
      toast.error('Vui lòng đăng nhập')
      return
    }

    setSaving(true)
    try {
      // Prepare update data
      const updateData = {
        ...formData,
        quantity: Number(formData.quantity),
        price_per_unit: Number(formData.price_per_unit),
        min_order_quantity: Number(formData.min_order_quantity),
        updated_at: new Date().toISOString()
      }

      // Update product
      const result = await farmerService.updateProduct(id, updateData)

      if (result.success) {
        // Upload new images if any
        if (images.length > 0) {
          await farmerService.uploadProductImages(id, images)
        }

        toast.success('Cập nhật sản phẩm thành công')
        navigate(`/farmer/products/${id}`)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Update product error:', error)
      toast.error('Có lỗi xảy ra khi cập nhật sản phẩm')
    } finally {
      setSaving(false)
    }
  }

  // Cleanup
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url))
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/farmer/products/${id}`)}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="mr-2" size={20} />
            Quay lại
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Chỉnh sửa sản phẩm</h1>
          <p className="text-gray-600 mt-2">Cập nhật thông tin sản phẩm của bạn</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images Section */}
          <section className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <Camera className="mr-2 text-green-500" size={20} /> Hình ảnh
              <span className="ml-2 text-sm text-gray-500">
                ({existingImages.length + images.length}/5)
              </span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {/* Existing Images */}
              {existingImages.map((img, i) => (
                <div key={img.id} className="relative group">
                  <img 
                    src={img.image_url} 
                    alt={`Existing ${i + 1}`}
                    className="h-32 w-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img.id)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                  {img.is_primary && (
                    <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Chính
                    </span>
                  )}
                </div>
              ))}

              {/* New Image Previews */}
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative group">
                  <img 
                    src={src} 
                    alt={`New ${i + 1}`}
                    className="h-32 w-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {/* Upload Button */}
              {(existingImages.length + images.length) < 5 && (
                <label className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center h-32 cursor-pointer hover:border-green-500 transition-colors">
                  <Upload className="text-gray-400 mb-2" size={24} />
                  <span className="text-sm text-gray-500">Thêm ảnh</span>
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

          {/* Status & Category */}
          <section className="bg-white p-6 rounded-xl shadow grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </section>

          {/* ... Rest of the form similar to CreateProduct.jsx ... */}

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate(`/farmer/products/${id}`)}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={18} />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProduct