import React, { useState, useEffect } from 'react';
import {
    ShoppingCart, Search, Filter, Clock, CheckCircle2,
    Truck, XCircle, MoreVertical, Eye, Download,
    MapPin, User, Calendar, CreditCard, DollarSign
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    profiles:buyer_id (full_name, email)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching admin orders:', error);
            toast.error('Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            pending: { label: 'Chờ xử lý', color: 'amber', icon: Clock },
            confirmed: { label: 'Đã xác nhận', color: 'blue', icon: CheckCircle2 },
            shipped: { label: 'Đang giao', color: 'indigo', icon: Truck },
            completed: { label: 'Hoàn thành', color: 'emerald', icon: CheckCircle2 },
            cancelled: { label: 'Đã hủy', color: 'rose', icon: XCircle },
        };
        return configs[status] || configs.pending;
    };

    const filteredOrders = orders.filter(o => filterStatus === 'all' || o.status === filterStatus);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg text-emerald-600 border border-emerald-50">
                            <ShoppingCart size={24} />
                        </div>
                        Quản lý đơn hàng
                    </h1>
                    <p className="text-gray-500 font-medium ml-16 -mt-3">Theo dõi toàn bộ giao dịch trên sàn và xử lý khiếu nại.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl font-black text-xs text-gray-600 hover:bg-gray-50 uppercase tracking-widest shadow-sm transition-all group">
                    <Download size={16} className="group-hover:translate-y-0.5 transition-transform" /> Xuất Excel
                </button>
            </div>

            {/* Content Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/20 overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-lg">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo Mã đơn hoặc tên Khách hàng..."
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all font-mediumShadow font-mediumShadow"
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                        {['all', 'pending', 'confirmed', 'shipped', 'completed', 'cancelled'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`px-4 py-2 text-xs font-black rounded-xl transition-all whitespace-nowrap ${filterStatus === s
                                        ? 'bg-emerald-600 text-white shadow-md'
                                        : 'text-gray-500 hover:bg-gray-50 border border-transparent hover:border-emerald-100'
                                    }`}
                            >
                                {s === 'all' ? 'Tất cả' : getStatusConfig(s).label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto text-sm">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 uppercase tracking-widest">
                                <th className="px-8 py-6 font-black text-gray-400 text-[10px]">Mã đơn</th>
                                <th className="px-6 py-6 font-black text-gray-400 text-[10px]">Ngày đặt</th>
                                <th className="px-6 py-6 font-black text-gray-400 text-[10px]">Khách hàng</th>
                                <th className="px-6 py-6 font-black text-gray-400 text-[10px]">Giá trị</th>
                                <th className="px-6 py-6 font-black text-gray-400 text-[10px]">Trạng thái</th>
                                <th className="px-8 py-6 font-black text-gray-400 text-[10px] text-center">Tác vụ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-8 py-10 h-20 bg-gray-50/50"></td>
                                    </tr>
                                ))
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-50 text-emerald-200">
                                            <ShoppingCart size={32} />
                                        </div>
                                        <p className="text-gray-400 font-bold italic uppercase tracking-widest">Danh sách đơn hàng trống</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => {
                                    const config = getStatusConfig(order.status);
                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50/30 transition-colors group">
                                            <td className="px-8 py-6">
                                                <span className="font-black text-emerald-600 uppercase">#{order.id.slice(0, 8)}</span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-2 text-gray-500 font-bold">
                                                    <Calendar size={14} className="text-gray-300" />
                                                    {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-xs font-black text-gray-500">
                                                        {order.profiles?.full_name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900 leading-none mb-1">{order.profiles?.full_name || 'Khách vãng lai'}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold tracking-tight lowercase">{order.profiles?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <p className="text-lg font-black text-gray-900 tracking-tight">{(order.total_amount || 0).toLocaleString()}₫</p>
                                                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-black uppercase">
                                                    <CreditCard size={10} /> Đã thanh toán
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-${config.color}-50 text-${config.color}-600 border border-${config.color}-100`}>
                                                    <config.icon size={12} />
                                                    {config.label}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all shadow-none hover:shadow-lg shadow-emerald-100">
                                                        <Eye size={18} />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                                        <MoreVertical size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 bg-gray-50/50 border-t border-gray-100 text-center">
                    <button className="px-8 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-black text-gray-500 hover:bg-gray-100 transition-all uppercase tracking-widest select-none">
                        Tải thêm dữ liệu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminOrders;
