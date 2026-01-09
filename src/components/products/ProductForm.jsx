import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

const productSchema = z.object({
  title: z.string().min(1, 'Tên sản phẩm là bắt buộc'),
  category_id: z.number().min(1, 'Vui lòng chọn danh mục'),
  description: z.string().optional(),
  quantity: z.number().min(1, 'Số lượng phải lớn hơn 0'),
  unit: z.string().min(1, 'Đơn vị là bắt buộc'),
  price_per_unit: z.number().min(1, 'Giá phải lớn hơn 0'),
  province: z.string().min(1, 'Tỉnh/TP là bắt buộc'),
  district: z.string().optional(),
})

const ProductForm = ({ product, onSubmit, loading }) => {
  const { profile } = useAuth()
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [categories, setCategories] = useState([])
  const [provinces] = useState([
    'Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng',
    'An Giang', 'Bình Dương', 'Đồng Nai', 'Long An', 'Tiền Giang'
  ])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: product || {
      unit: 'kg',
      province: profile?.province || ''
    }
  })

  // Fetch categories on mount
  useState(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      
      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    const newImages = [...images, ...files]
    
    if (newImages.length > 5) {
      alert('Tối đa 5 ảnh')
      return
    }
    
    setImages(newImages)
    
    // Create previews
    const previews = newImages.map(file => URL.createObjectURL(file))
    setImagePreviews(previews)
  }

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    
    setImages(newImages)
    setImagePreviews(newPreviews)
  }

  const handleFormSubmit = async (data) => {
    const productData = {
      ...data,
      farmer_id: profile.id
    }
    
    await onSubmit(productData, images)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Thông tin cơ bản</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên sản phẩm *
            </label>
            <input
              type="text"
              {...register('title')}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ví dụ: Cam sành Hàm Yên"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục *
            </label>
            <select
              {...register('category_id', { valueAsNumber: true })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Chọn danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số lượng *
            </label>
            <input
              type="number"
              step="0.01"
              {...register('quantity', { valueAsNumber: true })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ví dụ: 500"
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đơn vị *
            </label>
            <select
              {...register('unit')}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="kg">Kilogram (kg)</option>
              <option value="tấn">Tấn</option>
              <option value="tạ">Tạ</option>
              <option value="bao">Bao</option>
              <option value="thùng">Thùng</option>
            </select>
            {errors.unit && (
              <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giá bán (đơn vị) *
            </label>
            <input
              type="number"
              {...register('price_per_unit', { valueAsNumber: true })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ví dụ: 25000"
            />
            {errors.price_per_unit && (
              <p className="mt-1 text-sm text-red-600">{errors.price_per_unit.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Địa điểm</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tỉnh/Thành phố *
            </label>
            <select
              {...register('province')}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Chọn tỉnh/thành</option>
              {provinces.map(province => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
            {errors.province && (
              <p className="mt-1 text-sm text-red-600">{errors.province.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quận/Huyện
            </label>
            <input
              type="text"
              {...register('district')}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ví dụ: Hàm Yên"
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Mô tả sản phẩm</h3>
        
        <div>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Mô tả chi tiết về sản phẩm (chất lượng, tiêu chuẩn, cách thu hoạch...)"
          />
        </div>
      </div>

      {/* Images */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Hình ảnh sản phẩm</h3>
        <p className="text-sm text-gray-500 mb-4">Tối đa 5 ảnh, kích thước tối đa 5MB/ảnh</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
          {/* Image previews */}
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          
          {/* Upload button */}
          {imagePreviews.length < 5 && (
            <label className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Thêm ảnh</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Submit button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
        >
          {loading ? 'Đang xử lý...' : product ? 'Cập nhật' : 'Đăng bán'}
        </button>
      </div>
    </form>
  )
}

export default ProductForm