import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Package, Search, Filter, CheckCircle2, XCircle,
    MoreVertical, Eye, Image as ImageIcon, MapPin,
    Tag, Star, AlertCircle, ShoppingBag, Clock
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    categories:category_id (name, icon),
                    profiles:farmer_id (full_name),
                    product_images (image_url, is_primary)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching admin products:', error);
            toast.error('Không thể tải danh sách sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (product) => {
        if (product.product_images && product.product_images.length > 0) {
            const primaryImage = product.product_images.find(img => img.is_primary);
            return primaryImage?.image_url || product.product_images[0]?.image_url;
        }
        return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800';
    };

    const handleApprove = async (productId) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({ status: 'available' })
                .eq('id', productId);

            if (error) throw error;
            toast.success('Duyệt sản phẩm thành công!');
            fetchProducts();
        } catch (error) {
            toast.error('Lỗi khi duyệt sản phẩm');
        }
    };

    const handleReject = async (productId) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({ status: 'archived' })
                .eq('id', productId);

            if (error) throw error;
            toast.success('Đã ẩn sản phẩm');
            fetchProducts();
        } catch (error) {
            toast.error('Lỗi khi ẩn sản phẩm');
        }
    };

    const filteredProducts = products.filter(p => filterStatus === 'all' || p.status === filterStatus);

    const getStatusBadge = (status) => {
        const config = {
            available: { label: 'Đang bán', color: 'emerald', icon: CheckCircle2 },
            draft: { label: 'Chờ duyệt', color: 'amber', icon: Clock },
            out_of_stock: { label: 'Hết hàng', color: 'rose', icon: AlertCircle },
            archived: { label: 'Đã ẩn', color: 'gray', icon: XCircle }
        };
        const item = config[status] || config.archived;
        return (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-${item.color}-50 text-${item.color}-600 border border-${item.color}-200/50`}>
                <item.icon size={12} />
                <span>{item.label}</span>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg text-amber-600 border border-amber-50">
                            <Package size={24} />
                        </div>
                        Kiểm duyệt sản phẩm
                    </h1>
                    <p className="text-gray-500 font-medium ml-16 -mt-3">Quản lý nội dung, chất lượng nông sản trước khi công khai lên sàn.</p>
                </div>

                <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto scrollbar-hide">
                    {['all', 'draft', 'available', 'out_of_stock'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`px-4 py-2 text-xs font-black rounded-xl transition-all whitespace-nowrap ${filterStatus === s
                                ? 'bg-amber-500 text-white shadow-md'
                                : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            {s === 'all' ? 'Tất cả' : s === 'draft' ? 'Cần duyệt' : s === 'available' ? 'Đang bán' : 'Hết hàng'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {loading ? (
                    [...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-[2.5rem] p-6 animate-pulse opacity-50">
                            <div className="h-48 bg-gray-200 rounded-3xl mb-4"></div>
                            <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-50 rounded w-1/2"></div>
                        </div>
                    ))
                ) : filteredProducts.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200">
                        <Package size={64} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-400 font-bold italic text-lg uppercase tracking-widest">Chưa có sản phẩm nào cần xử lý</p>
                    </div>
                ) : (
                    filteredProducts.map((p) => (
                        <div key={p.id} className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-100/20 border border-gray-100 overflow-hidden group hover:-translate-y-2 transition-all duration-500">
                            {/* Product Image */}
                            <div className="relative h-56">
                                <img
                                    src={getImageUrl(p)}
                                    alt={p.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-4 left-4">
                                    {getStatusBadge(p.status)}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                    <Link
                                        to={`/products/${p.id}`}
                                        className="w-full py-3 bg-white/20 backdrop-blur-md text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/40 transition-colors"
                                    >
                                        <Eye size={18} /> Xem chi tiết
                                    </Link>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-8">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full border border-emerald-100 uppercase tracking-widest">
                                        {p.categories?.name || 'Chưa phân loại'}
                                    </span>
                                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                                        <Star size={12} fill="currentColor" /> {p.average_rating || 0}
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-gray-900 line-clamp-1 mb-2 tracking-tight">{p.title}</h3>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-black text-emerald-600 tracking-tighter">
                                            {p.price_per_unit?.toLocaleString()}₫
                                            <span className="text-xs text-gray-400 font-bold ml-1 tracking-normal">/{p.unit}</span>
                                        </span>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tồn kho</p>
                                            <p className="font-black text-gray-900">{p.quantity} {p.unit}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs font-bold text-gray-500 pt-4 border-t border-gray-50">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={14} className="text-gray-300" /> {p.province}
                                        </div>
                                        <div className="flex items-center gap-1.5 ml-auto">
                                            <ShoppingBag size={14} className="text-gray-300" /> {p.profiles?.full_name}
                                        </div>
                                    </div>
                                </div>

                                {/* Approval Actions */}
                                {p.status === 'draft' ? (
                                    <div className="grid grid-cols-2 gap-3 pt-4">
                                        <button
                                            onClick={() => handleReject(p.id)}
                                            className="py-3 px-4 bg-gray-50 text-gray-500 rounded-2xl font-black text-xs hover:bg-gray-100 transition-all uppercase tracking-widest"
                                        >
                                            Từ chối
                                        </button>
                                        <button
                                            onClick={() => handleApprove(p.id)}
                                            className="py-3 px-4 bg-emerald-600 text-white rounded-2xl font-black text-xs hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all uppercase tracking-widest"
                                        >
                                            Duyệt phẩm
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleReject(p.id)}
                                        className="w-full py-4 border-2 border-dashed border-gray-200 text-gray-400 rounded-2xl font-black text-xs hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                                    >
                                        <XCircle size={16} /> Ẩn sản phẩm
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminProducts;
