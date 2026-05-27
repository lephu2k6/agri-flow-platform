import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    Package, Search, CheckCircle2, XCircle, Eye,
    MapPin, AlertCircle, ShoppingBag, Clock, RefreshCw, Archive
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const statusConfig = {
    available: { label: 'Đang bán', className: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle2 },
    draft: { label: 'Chờ duyệt', className: 'bg-amber-50 text-amber-700 border-amber-100', icon: Clock },
    out_of_stock: { label: 'Hết hàng', className: 'bg-rose-50 text-rose-700 border-rose-100', icon: AlertCircle },
    archived: { label: 'Đã ẩn', className: 'bg-gray-50 text-gray-700 border-gray-200', icon: XCircle }
}

const AdminProducts = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('products')
                .select(`
                    *,
                    categories:category_id (name, icon),
                    profiles:farmer_id (full_name),
                    product_images (image_url, is_primary)
                `)
                .order('created_at', { ascending: false })

            if (error) throw error
            setProducts(data || [])
        } catch (error) {
            console.error('Error fetching admin products:', error)
            toast.error('Không thể tải danh sách sản phẩm')
        } finally {
            setLoading(false)
        }
    }

    const getImageUrl = (product) => {
        if (product.product_images && product.product_images.length > 0) {
            const primaryImage = product.product_images.find(img => img.is_primary)
            return primaryImage?.image_url || product.product_images[0]?.image_url
        }
        return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800'
    }

    const handleApprove = async (productId) => {
        try {
            const { error } = await supabase.from('products').update({ status: 'available' }).eq('id', productId)
            if (error) throw error
            toast.success('Duyệt sản phẩm thành công')
            fetchProducts()
        } catch (error) {
            toast.error('Lỗi khi duyệt sản phẩm')
        }
    }

    const handleReject = async (productId) => {
        try {
            const { error } = await supabase.from('products').update({ status: 'archived' }).eq('id', productId)
            if (error) throw error
            toast.success('Đã ẩn sản phẩm')
            fetchProducts()
        } catch (error) {
            toast.error('Lỗi khi ẩn sản phẩm')
        }
    }

    const filteredProducts = products.filter((product) => {
        const keyword = searchTerm.trim().toLowerCase()
        const matchesStatus = filterStatus === 'all' || product.status === filterStatus
        const matchesSearch = !keyword ||
            product.title?.toLowerCase().includes(keyword) ||
            product.profiles?.full_name?.toLowerCase().includes(keyword) ||
            product.categories?.name?.toLowerCase().includes(keyword)
        return matchesStatus && matchesSearch
    })

    const pendingCount = products.filter(p => p.status === 'draft').length
    const activeCount = products.filter(p => p.status === 'available').length
    const archivedCount = products.filter(p => p.status === 'archived').length

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                        <Package size={24} />
                    </div>
                    <div>
                        <h1 className="market-heading text-2xl">Kiểm duyệt sản phẩm</h1>
                        <p className="text-sm text-gray-500">Quản lý chất lượng, trạng thái hiển thị và nội dung sản phẩm trên sàn.</p>
                    </div>
                </div>
                <button onClick={fetchProducts} className="inline-flex h-10 items-center gap-2 rounded-md border border-gray-200 bg-white px-4 text-sm font-bold text-gray-600 hover:bg-gray-50">
                    <RefreshCw size={16} /> Làm mới
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Metric icon={Package} label="Tổng sản phẩm" value={products.length} />
                <Metric icon={Clock} label="Chờ duyệt" value={pendingCount} />
                <Metric icon={CheckCircle2} label="Đang bán" value={activeCount} />
                <Metric icon={Archive} label="Đã ẩn" value={archivedCount} />
            </div>

            <div className="market-panel p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative max-w-xl flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm sản phẩm, người bán, danh mục..."
                            className="market-input h-10 w-full pl-10 pr-4 text-sm"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto">
                        {['all', 'draft', 'available', 'out_of_stock', 'archived'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`h-9 whitespace-nowrap rounded-md px-3 text-xs font-black uppercase ${
                                    filterStatus === status
                                        ? 'bg-emerald-600 text-white'
                                        : 'border border-gray-200 bg-white text-gray-500 hover:border-emerald-200 hover:text-emerald-700'
                                }`}
                            >
                                {status === 'all' ? 'Tất cả' : statusConfig[status].label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="market-panel border-dashed p-12 text-center">
                    <Package size={42} className="mx-auto mb-3 text-gray-300" />
                    <p className="font-bold text-gray-400">Không có sản phẩm phù hợp</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredProducts.map((product) => (
                        <AdminProductCard
                            key={product.id}
                            product={product}
                            imageUrl={getImageUrl(product)}
                            onApprove={handleApprove}
                            onReject={handleReject}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

const AdminProductCard = ({ product, imageUrl, onApprove, onReject }) => {
    const status = statusConfig[product.status] || statusConfig.archived
    const StatusIcon = status.icon

    return (
        <div className="market-panel group overflow-hidden transition hover:border-emerald-200 hover:shadow-md">
            <div className="relative h-48 overflow-hidden bg-gray-100">
                <img src={imageUrl} alt={product.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                <div className="absolute left-3 top-3">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-black uppercase ${status.className}`}>
                        <StatusIcon size={12} /> {status.label}
                    </span>
                </div>
            </div>

            <div className="p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-600">
                        {product.categories?.name || 'Chưa phân loại'}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                        <MapPin size={12} /> {product.province || 'N/A'}
                    </span>
                </div>
                <h3 className="line-clamp-2 min-h-11 text-base font-black text-gray-900">{product.title}</h3>

                <div className="mt-4 grid grid-cols-2 gap-3">
                    <InfoBox label="Giá bán" value={`${(product.price_per_unit || 0).toLocaleString('vi-VN')}đ/${product.unit || ''}`} />
                    <InfoBox label="Tồn kho" value={`${product.quantity || 0} ${product.unit || ''}`} />
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-gray-500">
                    <ShoppingBag size={13} className="text-emerald-500" />
                    <span className="truncate">{product.profiles?.full_name || 'Người bán'}</span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <Link to={`/products/${product.id}`} className="inline-flex items-center gap-1 text-sm font-bold text-gray-600 hover:text-emerald-700">
                        <Eye size={15} /> Xem công khai
                    </Link>
                    {product.status === 'draft' ? (
                        <div className="flex gap-2">
                            <button onClick={() => onReject(product.id)} className="rounded-md border border-gray-200 px-3 py-2 text-xs font-black text-gray-500 hover:bg-gray-50">
                                Từ chối
                            </button>
                            <button onClick={() => onApprove(product.id)} className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-black text-white hover:bg-emerald-700">
                                Duyệt
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => onReject(product.id)} className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-3 py-2 text-xs font-black text-gray-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700">
                            <XCircle size={14} /> Ẩn
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

const Metric = ({ icon: Icon, label, value }) => (
    <div className="market-panel p-4">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{label}</p>
                <p className="mt-2 text-2xl font-black text-gray-900">{value}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                <Icon size={20} />
            </div>
        </div>
    </div>
)

const InfoBox = ({ label, value }) => (
    <div className="rounded-md bg-gray-50 p-3">
        <p className="text-xs font-semibold text-gray-500">{label}</p>
        <p className="mt-1 text-sm font-black text-gray-900">{value}</p>
    </div>
)

const ProductSkeleton = () => (
    <div className="market-panel animate-pulse overflow-hidden">
        <div className="h-48 bg-gray-100" />
        <div className="space-y-3 p-4">
            <div className="h-4 w-2/3 rounded bg-gray-100" />
            <div className="h-4 w-1/2 rounded bg-gray-100" />
            <div className="grid grid-cols-2 gap-3">
                <div className="h-14 rounded bg-gray-100" />
                <div className="h-14 rounded bg-gray-100" />
            </div>
        </div>
    </div>
)

export default AdminProducts
