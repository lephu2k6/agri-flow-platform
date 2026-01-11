import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X, Camera, Check, AlertTriangle, Leaf, Package, DollarSign, MapPin, Scale, Calendar, Truck, ChevronLeft, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

import { farmerService } from '../../services/farmer.service'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

const CreateProduct = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [activeStep, setActiveStep] = useState(1)

  const PRODUCT_OPTIONS = {
    "Trái cây vỏ dày": ["Cam", "Bưởi", "Dứa (Thơm)", "Chuối xanh", "Dừa", "Sầu riêng"],
    "Nông sản củ": ["Khoai lang", "Khoai mì (Sắn)", "Khoai môn", "Hành khô", "Tỏi"],
    "Nông sản khô": ["Lúa tươi", "Lúa phơi", "Bắp (Ngô)", "Đậu phộng (Lạc)", "Đậu xanh", "Đậu đen"]
  }

  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    description: '',
    quantity: '',
    unit: 'kg',
    price_per_unit: '',
    province: user?.user_metadata?.province || '',
    min_order_quantity: '1',
    harvest_date: '',
    quality_standard: 'standard'
  })

  const provinces = ['An Giang', 'Bến Tre', 'Cần Thơ', 'Đồng Tháp', 'Long An', 'Tiền Giang', 'Vĩnh Long', 'Đà Nẵng', 'TP.HCM']

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, icon')
          .in('name', ['Trái cây vỏ dày', 'Nông sản củ', 'Nông sản khô'])
        
        if (error) throw error
        setCategories(data || [])
      } catch (err) {
        toast.error('Lỗi tải danh mục')
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategories()
  }, [])

  const handleCategoryChange = (e) => {
    setFormData({
      ...formData,
      category_id: e.target.value,
      title: ''
    })
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + images.length > 5) {
      toast.error('Tối đa 5 ảnh')
      return
    }
    
    setImages([...images, ...files])
    const newPreviews = files.map(f => URL.createObjectURL(f))
    setImagePreviews(prev => [...prev, ...newPreviews])
  }

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index])
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!images.length) return toast.error('Cần ít nhất 1 ảnh')
    if (!formData.title) return toast.error('Vui lòng chọn tên sản phẩm')

    setLoading(true)
    try {
      const payload = { 
        ...formData, 
        farmer_id: user.id,
        status: 'available'
      }
      const res = await farmerService.createProduct(payload, images)
      if (res.success) {
        toast.success(
          <div className="flex items-center gap-2">
            <Check className="text-emerald-600" />
            <span className="font-semibold">Đăng bán thành công!</span>
          </div>
        )
        navigate('/farmer/products')
      } else {
        toast.error(res.error)
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const selectedCatObj = categories.find(c => String(c.id) === String(formData.category_id))
  const availableTitles = selectedCatObj ? PRODUCT_OPTIONS[selectedCatObj.name] : []

  const nextStep = () => {
    if (activeStep < 3) setActiveStep(activeStep + 1)
  }

  const prevStep = () => {
    if (activeStep > 1) setActiveStep(activeStep - 1)
  }

  const totalSteps = 3

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Đăng bán nông sản mới</h1>
                <p className="text-emerald-100 text-sm">Kết nối sản phẩm của bạn với thị trường</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/farmer/products')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all"
            >
              <ChevronLeft size={18} />
              Quay lại
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-8 mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center ${
                  step === activeStep 
                    ? 'border-white bg-white text-emerald-600' 
                    : step < activeStep 
                    ? 'border-emerald-300 bg-emerald-300 text-emerald-600' 
                    : 'border-white/30 text-white/50'
                }`}>
                  {step < activeStep ? <Check size={18} /> : step}
                </div>
                {step < totalSteps && (
                  <div className={`h-1 w-16 ${
                    step < activeStep ? 'bg-emerald-300' : 'bg-white/30'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 -mt-8">
        <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">
          {/* Step Content */}
          <div className="p-8">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Basic Info */}
              {activeStep === 1 && (
                <div className="space-y-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Thông tin cơ bản</h2>
                    <p className="text-gray-600">Chọn loại nông sản và đặt tên sản phẩm</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        <span className="text-emerald-600">1.</span> Chọn nhóm nông sản *
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {categories.map(category => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => handleCategoryChange({ target: { value: category.id } })}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                              formData.category_id === category.id
                                ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                                : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                formData.category_id === category.id
                                  ? 'bg-emerald-100 text-emerald-600'
                                  : 'bg-gray-100 text-gray-400'
                              }`}>
                                <Leaf size={20} />
                              </div>
                              <span className="font-semibold text-gray-800">{category.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {formData.category_id && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          <span className="text-emerald-600">2.</span> Chọn tên sản phẩm *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {availableTitles.map(title => (
                            <button
                              key={title}
                              type="button"
                              onClick={() => setFormData({ ...formData, title })}
                              className={`p-3 rounded-xl border text-center transition-all ${
                                formData.title === title
                                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold'
                                  : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                              }`}
                            >
                              {title}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        <span className="text-emerald-600">3.</span> Chất lượng sản phẩm
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {['standard', 'premium', 'organic'].map(quality => (
                          <button
                            key={quality}
                            type="button"
                            onClick={() => setFormData({ ...formData, quality_standard: quality })}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              formData.quality_standard === quality
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold'
                                : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                            }`}
                          >
                            {quality === 'standard' ? 'Tiêu chuẩn' : 
                             quality === 'premium' ? 'Cao cấp' : 'Hữu cơ'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Images & Details */}
              {activeStep === 2 && (
                <div className="space-y-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-4">
                      <Camera className="h-8 w-8 text-sky-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Hình ảnh & Thông tin chi tiết</h2>
                    <p className="text-gray-600">Thêm hình ảnh thực tế và mô tả sản phẩm</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                      Hình ảnh sản phẩm (Tối đa 5 ảnh) *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {imagePreviews.map((src, i) => (
                        <div key={i} className="relative group">
                          <img 
                            src={src} 
                            className="w-full h-40 rounded-xl object-cover border-2 border-emerald-100 group-hover:border-emerald-300 transition-colors"
                            alt="preview"
                          />
                          <button 
                            type="button" 
                            onClick={() => removeImage(i)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X size={14}/>
                          </button>
                          {i === 0 && (
                            <div className="absolute top-2 left-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                              Ảnh chính
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {imagePreviews.length < 5 && (
                        <label className="aspect-square h-40 border-2 border-dashed border-emerald-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-300 transition-all">
                          <Camera className="text-emerald-400 mb-2" size={24} />
                          <span className="text-sm text-emerald-600 font-medium">Thêm ảnh</span>
                          <span className="text-xs text-gray-500">{imagePreviews.length}/5</span>
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
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Mô tả sản phẩm</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={4}
                      className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none hover:border-emerald-300 transition-colors"
                      placeholder="Mô tả chi tiết về sản phẩm của bạn..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        <span className="flex items-center gap-2">
                          <Calendar size={16} className="text-emerald-600" />
                          Ngày thu hoạch dự kiến
                        </span>
                      </label>
                      <input
                        type="date"
                        value={formData.harvest_date}
                        onChange={(e) => setFormData({...formData, harvest_date: e.target.value})}
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none hover:border-emerald-300 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        <span className="flex items-center gap-2">
                          <MapPin size={16} className="text-emerald-600" />
                          Khu vực sản xuất *
                        </span>
                      </label>
                      <select
                        value={formData.province}
                        onChange={(e) => setFormData({...formData, province: e.target.value})}
                        required
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none hover:border-emerald-300 transition-colors"
                      >
                        <option value="">Chọn tỉnh/thành phố</option>
                        {provinces.map(province => (
                          <option key={province} value={province}>{province}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Pricing & Quantity */}
              {activeStep === 3 && (
                <div className="space-y-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="h-8 w-8 text-amber-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Định giá & Sản lượng</h2>
                    <p className="text-gray-600">Thiết lập giá bán và số lượng có sẵn</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        <span className="flex items-center gap-2">
                          <DollarSign size={16} className="text-emerald-600" />
                          Giá bán (₫) *
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="price_per_unit"
                          value={formData.price_per_unit}
                          onChange={(e) => setFormData({...formData, price_per_unit: e.target.value})}
                          required
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none hover:border-emerald-300 transition-colors text-lg font-bold text-emerald-600"
                          placeholder="0"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₫</div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        <span className="flex items-center gap-2">
                          <Scale size={16} className="text-emerald-600" />
                          Đơn vị tính *
                        </span>
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {['kg', 'tấn', 'bao'].map(unit => (
                          <button
                            key={unit}
                            type="button"
                            onClick={() => setFormData({...formData, unit})}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              formData.unit === unit
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold'
                                : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                            }`}
                          >
                            {unit === 'kg' ? 'Kilogram' : unit === 'tấn' ? 'Tấn' : 'Bao'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Sản lượng có sẵn *
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                        required
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none hover:border-emerald-300 transition-colors text-lg font-bold"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Đơn tối thiểu *
                      </label>
                      <input
                        type="number"
                        name="min_order_quantity"
                        value={formData.min_order_quantity}
                        onChange={(e) => setFormData({...formData, min_order_quantity: e.target.value})}
                        required
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none hover:border-emerald-300 transition-colors text-lg font-bold"
                        placeholder="1"
                      />
                    </div>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-gradient-to-r from-emerald-50 to-sky-50 border border-emerald-100 rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Sparkles size={20} className="text-emerald-600" />
                      Tóm tắt sản phẩm
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Tên sản phẩm</p>
                        <p className="font-semibold text-gray-800">{formData.title || 'Chưa chọn'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Giá bán</p>
                        <p className="font-semibold text-emerald-600">
                          {formData.price_per_unit ? 
                            new Intl.NumberFormat('vi-VN').format(formData.price_per_unit) + ' ₫/' + formData.unit : 
                            'Chưa đặt'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Sản lượng</p>
                        <p className="font-semibold text-gray-800">
                          {formData.quantity ? `${formData.quantity} ${formData.unit}` : 'Chưa đặt'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Hình ảnh</p>
                        <p className="font-semibold text-gray-800">{imagePreviews.length} ảnh</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 mt-8 border-t border-gray-100">
                {activeStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-8 py-3 border-2 border-emerald-500 text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-all"
                  >
                    ← Quay lại
                  </button>
                ) : (
                  <div></div>
                )}

                {activeStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    Tiếp theo →
                  </button>
                ) : (
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
                        <Check size={20} />
                        Xác nhận đăng bán
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Tips Section */}
          <div className="bg-emerald-50 border-t border-emerald-100 p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="text-amber-600 flex-shrink-0 mt-1" size={20}/>
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-1">Mẹo đăng bán hiệu quả</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Sử dụng hình ảnh thực tế, rõ nét để tăng độ tin cậy</li>
                  <li>• Mô tả chi tiết về chất lượng và phương pháp canh tác</li>
                  <li>• Đặt giá cạnh tranh dựa trên thị trường hiện tại</li>
                  <li>• Cập nhật sản lượng thực tế để tránh thiếu hàng</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateProduct