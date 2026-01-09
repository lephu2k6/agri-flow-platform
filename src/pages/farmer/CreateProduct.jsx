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
//   const { profile } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)

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
    setImagePreviews(newImages.map(f => URL.createObjectURL(f)))
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!profile?.id) return toast.error('Vui lòng đăng nhập')
    if (!images.length) return toast.error('Cần ít nhất 1 ảnh')

    setLoading(true)
    try {
      const payload = {
        ...formData,
        farmer_id: profile.id,
        quantity: Number(formData.quantity),
        price_per_unit: Number(formData.price_per_unit),
        min_order_quantity: Number(formData.min_order_quantity)
      }

      const res = await farmerService.createProduct(payload, images)

      if (res.success) {
        toast.success('Đăng sản phẩm thành công')
        navigate('/farmer/products')
      } else {
        toast.error(res.error || 'Thất bại')
      }
    } catch (err) {
      console.error(err)
      toast.error('Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Đăng sản phẩm mới</h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Images */}
          <section className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold mb-4 flex items-center">
              <Camera className="mr-2 text-green-500" /> Hình ảnh
            </h3>

            <div className="grid grid-cols-3 gap-4">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative">
                  <img src={src} className="h-32 w-full object-cover rounded" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {imagePreviews.length < 5 && (
                <label className="border-2 border-dashed rounded flex items-center justify-center h-32 cursor-pointer">
                  <Upload />
                  <input type="file" multiple hidden onChange={handleImageChange} />
                </label>
              )}
            </div>
          </section>

          {/* Basic info */}
          <section className="bg-white p-6 rounded-xl shadow grid md:grid-cols-2 gap-6">
            <input
              name="title"
              placeholder="Tên sản phẩm"
              value={formData.title}
              onChange={handleChange}
              required
              className="input"
            />

            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              className="input"
            >
              <option value="">
                {loadingCategories ? 'Đang tải...' : 'Chọn danh mục'}
              </option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </section>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/farmer/products')}
              className="btn-secondary"
            >
              Hủy
            </button>
            <button
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Đang xử lý...' : 'Đăng sản phẩm'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default CreateProduct
