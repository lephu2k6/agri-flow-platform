import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X, Camera, Check, AlertTriangle } from 'lucide-react'
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

  // ĐỊNH NGHĨA DANH SÁCH TÊN SẢN PHẨM BẮT BUỘC CHỌN (Khớp với ảnh đề xuất)
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
    min_order_quantity: '1'
  })

  const provinces = ['An Giang', 'Bến Tre', 'Cần Thơ', 'Đồng Tháp', 'Long An', 'Tiền Giang', 'Vĩnh Long', 'Hà Nội', 'TP.HCM']

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        // Chỉ lấy những danh mục thuộc giai đoạn đầu (ID: 12, 13, 14 trong hình của bạn)
        const { data, error } = await supabase
          .from('categories')
          .select('id, name')
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
      title: '' // Reset tên sản phẩm khi đổi nhóm
    })
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + images.length > 5) return toast.error('Tối đa 5 ảnh')
    
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
      const payload = { ...formData, farmer_id: user.id }
      const res = await farmerService.createProduct(payload, images)
      if (res.success) {
        toast.success('Đăng bán thành công!')
        navigate('/farmer/products')
      } else {
        toast.error(res.error)
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  // Lấy danh sách tên sản phẩm dựa trên danh mục đã chọn
  const selectedCatObj = categories.find(c => String(c.id) === String(formData.category_id))
  const availableTitles = selectedCatObj ? PRODUCT_OPTIONS[selectedCatObj.name] : []

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-green-600 p-2 rounded-xl text-white">
            <Check size={24} strokeWidth={3}/>
          </div>
          <h1 className="text-2xl font-black text-gray-800 uppercase italic tracking-tight">Đăng bán nông sản</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECTION: HÌNH ẢNH */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <label className="block text-xs font-black uppercase text-gray-400 mb-4 tracking-widest">Hình ảnh thực tế (Tối đa 5)</label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative aspect-square">
                  <img src={src} className="w-full h-full object-cover rounded-2xl border" alt="preview" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12}/></button>
                </div>
              ))}
              {imagePreviews.length < 5 && (
                <label className="aspect-square border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-green-50 transition-all">
                  <Camera className="text-gray-300" />
                  <input type="file" multiple accept="image/*" hidden onChange={handleImageChange} />
                </label>
              )}
            </div>
          </div>

          {/* SECTION: THÔNG TIN LỰA CHỌN */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 grid md:grid-cols-2 gap-6">
            
            {/* 1. CHỌN NHÓM (DỮ LIỆU TỪ SUPABASE) */}
            <div>
              <label className="block text-xs font-black uppercase text-gray-500 mb-2">1. Nhóm nông sản *</label>
              <select 
                value={formData.category_id} 
                onChange={handleCategoryChange} 
                required
                className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-green-500 outline-none"
              >
                <option value="">{loadingCategories ? 'Đang tải...' : '-- Chọn nhóm --'}</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* 2. CHỌN TÊN (BẮT BUỘC TỪ DANH SÁCH) */}
            <div>
              <label className="block text-xs font-black uppercase text-gray-500 mb-2">2. Tên sản phẩm *</label>
              <select 
                name="title"
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                required
                disabled={!formData.category_id}
                className={`w-full p-4 border-none rounded-2xl font-bold focus:ring-2 focus:ring-green-500 outline-none ${!formData.category_id ? 'bg-gray-100 opacity-50' : 'bg-gray-50'}`}
              >
                <option value="">-- Chọn tên --</option>
                {availableTitles?.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-500 mb-2">Giá bán (đ/kg) *</label>
              <input type="number" name="price_per_unit" value={formData.price_per_unit} onChange={(e) => setFormData({...formData, price_per_unit: e.target.value})} required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold text-green-600 outline-none" placeholder="0" />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-500 mb-2">Sản lượng sẵn có *</label>
              <div className="flex gap-2">
                <input type="number" name="quantity" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} required className="flex-1 p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none" placeholder="0" />
                <select name="unit" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} className="w-24 p-4 bg-gray-50 border-none rounded-2xl font-bold">
                  <option value="kg">Kg</option>
                  <option value="tấn">Tấn</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black uppercase text-gray-500 mb-2">Khu vực vườn *</label>
              <select name="province" value={formData.province} onChange={(e) => setFormData({...formData, province: e.target.value})} required className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none">
                <option value="">-- Chọn tỉnh thành --</option>
                {provinces.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-2xl border border-amber-100">
              <AlertTriangle className="text-amber-600 flex-shrink-0" size={20}/>
              <p className="text-[11px] text-amber-700 font-medium">
                Sản phẩm đăng bán sẽ được kiểm duyệt dựa trên tiêu chuẩn vận chuyển an toàn (1-3 ngày). Hãy đảm bảo nông sản của bạn đúng với mô tả.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-green-600 text-white font-black rounded-3xl shadow-xl shadow-green-100 hover:bg-green-700 transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:bg-gray-300"
            >
              {loading ? 'Đang xử lý...' : 'Xác nhận đăng bán'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProduct