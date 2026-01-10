import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    description: '',
    quantity: '',
    unit: 'kg',
    price_per_unit: '',
    province: '',
    status: 'available'
  });

  useEffect(() => {
    if (id && user) fetchProduct();
  }, [id, user]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      // Fix lỗi Schema Cache bằng cú pháp select bảng liên quan chuẩn
      const { data: product, error } = await supabase
        .from('products')
        .select(`
          *,
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
        toast.error("Bạn không có quyền sửa!");
        return navigate('/farmer/products');
      }

      // Chỉ lấy các trường thuộc bảng products để tránh lỗi update
      setFormData({
        title: product.title || '',
        category_id: product.category_id || '',
        description: product.description || '',
        quantity: product.quantity || '',
        unit: product.unit || 'kg',
        price_per_unit: product.price_per_unit || '',
        province: product.province || '',
        status: product.status || 'available'
      });
      setExistingImages(product.product_images || []);
    } catch (err) {
      toast.error(err.message);
      navigate('/farmer/products');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('farmer_id', user.id);

      if (error) throw error;
      toast.success("Cập nhật thành công!");
      navigate('/farmer/products');
    } catch (err) {
      toast.error("Lỗi: " + err.message);
    } finally { setSaving(false); }
  };

  if (loading) return <div className="p-20 text-center text-green-600 font-bold">Đang tải...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="flex items-center mb-6 text-gray-600">
        <ArrowLeft size={20} className="mr-2"/> Quay lại
      </button>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4">Hình ảnh sản phẩm</h2>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {existingImages.map(img => (
              <img key={img.id} src={img.image_url} className="rounded-lg h-24 w-full object-cover border" alt="product" />
            ))}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tên sản phẩm</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-green-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Giá bán (đ/{formData.unit})</label>
              <input type="number" value={formData.price_per_unit} onChange={e => setFormData({...formData, price_per_unit: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-green-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mô tả</label>
              <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 disabled:opacity-50 shadow-lg shadow-green-100">
          {saving ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}
        </button>
      </form>
    </div>
  );
};

export default EditProduct;