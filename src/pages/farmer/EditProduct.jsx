import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, Image as ImageIcon, Package, DollarSign, 
  MapPin, Scale, Edit3, AlertCircle, Loader2, Camera, X,
  BarChart3, TrendingUp, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
<<<<<<< HEAD
import VideoUploader from '../../components/products/VideoUploader';
=======
import { farmerService } from '../../services/farmer.service';
import DeleteConfirmationModal from '../../components/modals/DeleteConfirmationModal';
>>>>>>> c96e419563bbbe5cf86eb774ba45544f0c8ed5d6

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoUrl, setVideoUrl] = useState(null);
  const [categories, setCategories] = useState([]);
  const [productStats, setProductStats] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    description: '',
    quantity: '',
    unit: 'kg',
    price_per_unit: '',
    province: '',
    status: 'available',
    min_order_quantity: '1',
    quality_standard: 'standard'
  });

  useEffect(() => {
    if (id && user) {
      fetchProduct();
      fetchCategories();
      fetchProductStats();
    }
  }, [id, user]);
  const handleDeleteProduct = async () => {
  try {
    setDeleting(true);

    // Thay vì .delete(), ta dùng .update() để ẩn sản phẩm đi
    const { error } = await supabase
      .from('products')
      .update({ 
        status: 'archived',
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .eq('farmer_id', user.id);

    if (error) throw error;

    toast.success('Sản phẩm đã được lưu trữ (ẩn khỏi cửa hàng)');
    navigate('/farmer/products');
  } catch (err) {
    toast.error('Lỗi: ' + err.message);
  } finally {
    setDeleting(false);
    setShowDeleteModal(false);
  }
};

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(id, name),
          product_images (
            id,
            image_url,
            is_primary
          )
        `)
        .eq('id', id)
        .single();

      if (error || !product) throw new Error("Không tìm thấy sản phẩm");
      if (product.farmer_id !== user.id) {
        toast.error("Bạn không có quyền sửa sản phẩm này!");
        return navigate('/farmer/products');
      }

      setFormData({
        title: product.title || '',
        category_id: product.category_id || '',
        description: product.description || '',
        quantity: product.quantity || '',
        unit: product.unit || 'kg',
        price_per_unit: product.price_per_unit || '',
        province: product.province || '',
        status: product.status || 'available',
        min_order_quantity: product.min_order_quantity || '1',
        quality_standard: product.quality_standard || 'standard'
      });
      
      setExistingImages(product.product_images || []);
      setVideoUrl(product.video_url || null);
    } catch (err) {
      toast.error(err.message);
      navigate('/farmer/products');
    } finally { 
      setLoading(false); 
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (data) setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProductStats = async () => {
    try {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('product_id', id);
      
      if (data) {
        const completedOrders = data.filter(order => order.status === 'completed');
        const revenue = completedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        
        setProductStats({
          totalOrders: data.length,
          completedOrders: completedOrders.length,
          totalRevenue: revenue
        });
      }
    } catch (error) {
      console.error('Error fetching product stats:', error);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + existingImages.length + newImages.length > 5) {
      toast.error('Tối đa 5 ảnh cho mỗi sản phẩm');
      return;
    }
    
    setNewImages([...newImages, ...files]);
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeExistingImage = async (imageId) => {
    try {
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;
      
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      toast.success('Đã xóa ảnh');
    } catch (error) {
      toast.error('Không thể xóa ảnh');
    }
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Update product info
      const { error: productError } = await supabase
        .from('products')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('farmer_id', user.id);

      if (productError) throw productError;

      // Upload new images
      for (const image of newImages) {
        const formData = new FormData();
        formData.append('file', image);
        
        // In a real app, you would upload to storage and then save to product_images table
        // This is a simplified version
      }

      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle className="text-emerald-600" size={20} />
          <span className="font-semibold">Cập nhật sản phẩm thành công!</span>
        </div>
      );
      
      navigate('/farmer/products');
    } catch (err) {
      toast.error("Lỗi: " + err.message);
    } finally { 
      setSaving(false); 
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 animate-pulse"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Package className="h-8 w-8 text-white animate-pulse" />
        </div>
      </div>
      <p className="mt-4 text-emerald-600 font-semibold">Đang tải thông tin sản phẩm...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/farmer/products')}
                className="flex items-center text-emerald-100 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                Quay lại
              </button>
              <div className="hidden md:block h-6 w-px bg-emerald-500"></div>
              <div>
                <h1 className="text-2xl font-bold">Chỉnh sửa sản phẩm</h1>
                <p className="text-emerald-100 text-sm">Cập nhật thông tin sản phẩm của bạn</p>
              </div>
            </div>
            
            {productStats && (
              <div className="hidden md:flex items-center gap-6">
                <div className="text-right">
                  <div className="text-sm text-emerald-100">Tổng đơn hàng</div>
                  <div className="text-2xl font-bold">{productStats.totalOrders}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-emerald-100">Doanh thu</div>
                  <div className="text-2xl font-bold">{formatCurrency(productStats.totalRevenue)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Images Section */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Camera className="text-emerald-600" size={20} />
                        Hình ảnh sản phẩm
                      </h3>
                      <span className="text-sm text-gray-500">
                        {existingImages.length + newImages.length}/5 ảnh
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {/* Existing Images */}
                      {existingImages.map((img, index) => (
                        <div key={img.id} className="relative group">
                          <img 
                            src={img.image_url} 
                            className="w-full h-40 rounded-xl object-cover border-2 border-emerald-100 group-hover:border-emerald-300 transition-colors"
                            alt={`Product ${index + 1}`}
                          />
                          {img.is_primary && (
                            <div className="absolute top-2 left-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                              Ảnh chính
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeExistingImage(img.id)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}

                      {/* New Images */}
                      {imagePreviews.map((src, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={src} 
                            className="w-full h-40 rounded-xl object-cover border-2 border-emerald-100 group-hover:border-emerald-300 transition-colors"
                            alt={`New image ${index + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}

                      {/* Add Image Button */}
                      {(existingImages.length + newImages.length) < 5 && (
                        <label className="aspect-square h-40 border-2 border-dashed border-emerald-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-300 transition-all">
                          <Camera className="text-emerald-400 mb-2" size={24} />
                          <span className="text-sm text-emerald-600 font-medium">Thêm ảnh</span>
                          <span className="text-xs text-gray-500">
                            {existingImages.length + newImages.length}/5
                          </span>
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

                  {/* Video Section */}
                  <div>
                    <VideoUploader
                      productId={id}
                      existingVideoUrl={videoUrl}
                      onVideoUploaded={(url) => setVideoUrl(url)}
                      onVideoDeleted={() => setVideoUrl(null)}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Edit3 className="text-emerald-600" size={20} />
                      Thông tin sản phẩm
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          <span className="flex items-center gap-2">
                            <Package size={16} className="text-emerald-600" />
                            Tên sản phẩm *
                          </span>
                        </label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={e => setFormData({...formData, title: e.target.value})}
                          required
                          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none hover:border-emerald-300 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          <span className="flex items-center gap-2">
                            <BarChart3 size={16} className="text-emerald-600" />
                            Danh mục
                          </span>
                        </label>
                        <select
                          value={formData.category_id}
                          onChange={e => setFormData({...formData, category_id: e.target.value})}
                          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none hover:border-emerald-300 transition-colors"
                        >
                          <option value="">Chọn danh mục</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          <span className="flex items-center gap-2">
                            <DollarSign size={16} className="text-emerald-600" />
                            Giá bán (₫) *
                          </span>
                        </label>
                        <input
                          type="number"
                          value={formData.price_per_unit}
                          onChange={e => setFormData({...formData, price_per_unit: e.target.value})}
                          required
                          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none hover:border-emerald-300 transition-colors text-lg font-bold text-emerald-600"
                        />
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
                          Số lượng có sẵn *
                        </label>
                        <input
                          type="number"
                          value={formData.quantity}
                          onChange={e => setFormData({...formData, quantity: e.target.value})}
                          required
                          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none hover:border-emerald-300 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Đơn tối thiểu *
                        </label>
                        <input
                          type="number"
                          value={formData.min_order_quantity}
                          onChange={e => setFormData({...formData, min_order_quantity: e.target.value})}
                          required
                          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none hover:border-emerald-300 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          <span className="flex items-center gap-2">
                            <MapPin size={16} className="text-emerald-600" />
                            Tỉnh/Thành phố *
                          </span>
                        </label>
                        <input
                          type="text"
                          value={formData.province}
                          onChange={e => setFormData({...formData, province: e.target.value})}
                          required
                          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none hover:border-emerald-300 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Trạng thái
                        </label>
                        <select
                          value={formData.status}
                          onChange={e => setFormData({...formData, status: e.target.value})}
                          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none hover:border-emerald-300 transition-colors"
                        >
                          <option value="available">Đang bán</option>
                          <option value="draft">Bản nháp</option>
                          <option value="out_of_stock">Hết hàng</option>
                          <option value="archived">Đã lưu trữ</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Mô tả sản phẩm
                      </label>
                      <textarea
                        rows={6}
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none hover:border-emerald-300 transition-colors resize-none"
                        placeholder="Mô tả chi tiết về sản phẩm của bạn..."
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between pt-8 border-t border-gray-100">
  {/* Delete */}
  <button
    type="button"
    onClick={() => setShowDeleteModal(true)}
    className="px-8 py-3 border-2 border-red-500 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-all"
  >
    Xoá sản phẩm
  </button>

  {/* Save / Cancel */}
  <div className="flex gap-3">
    <button
      type="button"
      onClick={() => navigate('/farmer/products')}
      className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
    >
      Hủy bỏ
    </button>

    <button
      type="submit"
      disabled={saving}
      className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {saving ? (
        <>
          <Loader2 className="animate-spin h-5 w-5" />
          Đang lưu...
        </>
      ) : (
        <>
          <Save size={20} />
          Lưu thay đổi
        </>
      )}
    </button>
  </div>
</div>
                </form>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Tips */}
          <div className="space-y-8">
            {/* Product Stats */}
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="text-emerald-600" size={20} />
                Thống kê sản phẩm
              </h3>
              
              {productStats ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Package className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Tổng đơn hàng</div>
                        <div className="text-lg font-bold text-gray-900">{productStats.totalOrders}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Đơn hoàn thành</div>
                        <div className="text-lg font-bold text-gray-900">{productStats.completedOrders}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Doanh thu</div>
                        <div className="text-lg font-bold text-gray-900">{formatCurrency(productStats.totalRevenue)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-gray-400" />
                  </div>
                  <p>Chưa có thống kê</p>
                </div>
              )}
            </div>

            {/* Tips Card */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <AlertCircle size={20} />
                Mẹo chỉnh sửa
              </h3>
              <ul className="space-y-3 text-sm text-emerald-100">
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs">1</span>
                  </div>
                  <span>Cập nhật ảnh thực tế để tăng độ tin cậy</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs">2</span>
                  </div>
                  <span>Mô tả chi tiết giúp khách hàng hiểu rõ sản phẩm</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs">3</span>
                  </div>
                  <span>Đặt giá cạnh tranh dựa trên thị trường</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs">4</span>
                  </div>
                  <span>Cập nhật số lượng thực tế để tránh thiếu hàng</span>
                </li>
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Hành động nhanh</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/products/${id}`)}
                  target="_blank"
                  className="w-full text-left p-3 bg-gray-50 hover:bg-emerald-50 rounded-xl transition-colors flex items-center gap-3"
                >
                  <ImageIcon className="text-emerald-600" size={18} />
                  <div>
                    <div className="font-medium">Xem công khai</div>
                    <div className="text-xs text-gray-500">Xem sản phẩm dưới góc độ khách hàng</div>
                  </div>
                </button>
                <button
                  onClick={() => navigate(`/farmer/products/${id}/duplicate`)}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-emerald-50 rounded-xl transition-colors flex items-center gap-3"
                >
                  <Save className="text-emerald-600" size={18} />
                  <div>
                    <div className="font-medium">Nhân bản sản phẩm</div>
                    <div className="text-xs text-gray-500">Tạo sản phẩm mới từ bản sao</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DeleteConfirmationModal
  isOpen={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
  onConfirm={handleDeleteProduct}
  title="Xoá sản phẩm"
  message="Bạn có chắc chắn muốn xoá sản phẩm này? Hành động này không thể hoàn tác."
  confirmText="Xoá"
  cancelText="Hủy"
  isLoading={deleting}
/>

    </div>
    
  );
};

export default EditProduct;