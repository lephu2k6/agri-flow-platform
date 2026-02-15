import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Users, Package, ShoppingBag, DollarSign,
    ArrowUpRight, ArrowDownRight, Clock, CheckCircle2,
    TrendingUp, UserCheck, AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalQuantity: 0,
        pendingOrders: 0,
        pendingProducts: 0,
        completedOrders: 0,
        shippedOrders: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const [
                { count: usersCount },
                { count: productsCount },
                { count: ordersCount },
                { data: revenueData },
                { count: pendingProductsCount },
                { data: recentOrdersData }
            ] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('products').select('*', { count: 'exact', head: true }),
                supabase.from('orders').select('*', { count: 'exact', head: true }),
                supabase.from('orders').select('total_amount, quantity, unit_price, status'),
                supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
                supabase.from('orders').select('*, profiles:buyer_id(full_name)').order('created_at', { ascending: false }).limit(5)
            ]);

            const revenue = revenueData?.reduce((acc, order) => {
                const amount = order.total_amount || (order.quantity * (order.unit_price || 0));
                return acc + amount;
            }, 0) || 0;
            const quantity = revenueData?.reduce((acc, order) => acc + (order.quantity || 0), 0) || 0;

            setStats({
                totalUsers: usersCount || 0,
                totalProducts: productsCount || 0,
                totalOrders: ordersCount || 0,
                totalRevenue: revenue,
                totalQuantity: quantity,
                pendingOrders: revenueData?.filter(o => o.status === 'pending').length || 0,
                completedOrders: revenueData?.filter(o => o.status === 'completed').length || 0,
                shippedOrders: revenueData?.filter(o => o.status === 'shipped').length || 0,
                pendingProducts: pendingProductsCount || 0
            });

            setRecentOrders(recentOrdersData || []);
        } catch (error) {
            console.error('Error fetching admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Tổng người dùng', value: stats.totalUsers, icon: Users, color: 'blue', trend: 'Toàn sàn' },
        { label: 'Tổng sản phẩm', value: stats.totalProducts, icon: Package, color: 'emerald', trend: `${stats.pendingProducts} chờ duyệt` },
        { label: 'Tổng đơn hàng', value: stats.totalOrders, icon: ShoppingBag, color: 'amber', trend: `${stats.completedOrders} hoàn tất` },
        { label: 'Tổng doanh thu', value: `${stats.totalRevenue.toLocaleString()}₫`, icon: DollarSign, color: 'rose', trend: `${stats.totalQuantity} sản phẩm` },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Thống kê hệ thống</h1>
                    <p className="text-gray-500 font-medium">Chào mừng trở lại! Đây là tình hình kinh doanh hôm nay.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 shadow-sm transition-all">
                        Xuất báo cáo
                    </button>
                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 shadow-md shadow-emerald-200 transition-all">
                        Cập nhật dữ liệu
                    </button>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/20 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-50 rounded-bl-[4rem] -mr-6 -mt-6 transition-all group-hover:scale-110 duration-500 opacity-50`}></div>
                        <div className="relative z-10">
                            <div className={`w-12 h-12 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner border border-${stat.color}-100`}>
                                <stat.icon size={24} />
                            </div>
                            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</h3>
                            <div className="mt-4 flex items-center gap-2">
                                <span className="flex items-center text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                                    <ArrowUpRight size={12} /> {stat.trend}
                                </span>
                                <span className="text-gray-400 text-[10px] font-bold uppercase">vs tháng trước</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Secondary Stats & Pending Work */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pending Actions */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/20 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100">
                                <Clock size={20} />
                            </div>
                            <h3 className="font-black text-xl text-gray-900 italic tracking-tight uppercase underline decoration-amber-300 decoration-4 underline-offset-4">Công việc cần xử lý</h3>
                        </div>
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 animate-pulse">
                            Yêu cầu mới
                        </span>
                    </div>

                    <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Link to="/admin/products" className="flex items-center gap-4 p-6 bg-gray-50 rounded-3xl border-2 border-transparent hover:border-emerald-500 hover:bg-white transition-all cursor-pointer group">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Package className="text-emerald-500" size={28} />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900">{stats.pendingProducts}</p>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Sản phẩm chờ duyệt</p>
                            </div>
                            <ArrowRightIcon />
                        </Link>

                        <Link to="/admin/orders" className="flex items-center gap-4 p-6 bg-gray-50 rounded-3xl border-2 border-transparent hover:border-amber-500 hover:bg-white transition-all cursor-pointer group">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <ShoppingBag className="text-amber-500" size={28} />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900">{stats.pendingOrders}</p>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Đơn hàng mới</p>
                            </div>
                            <ArrowRightIcon />
                        </Link>

                        <Link to="/admin/users" className="flex items-center gap-4 p-6 bg-gray-50 rounded-3xl border-2 border-transparent hover:border-blue-500 hover:bg-white transition-all cursor-pointer group">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <UserCheck className="text-blue-500" size={28} />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900">0</p>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Sellers chờ duyệt</p>
                            </div>
                            <ArrowRightIcon />
                        </Link>

                        <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-3xl border-2 border-transparent hover:border-rose-500 hover:bg-white transition-all cursor-pointer group">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <AlertCircle className="text-rose-500" size={28} />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-gray-900">0</p>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Khiếu nại khách hàng</p>
                            </div>
                            <ArrowRightIcon />
                        </div>
                    </div>
                </div>

                {/* Growth Chart / Recent Orders */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/20 overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <TrendingUp size={20} />
                            </div>
                            <h3 className="font-black text-xl text-gray-900 tracking-tight">Giao dịch mới</h3>
                        </div>
                        <Link to="/admin/orders" className="text-xs font-bold text-emerald-600 hover:underline">Xem tất cả</Link>
                    </div>
                    <div className="p-4 flex-1">
                        <div className="space-y-2">
                            {recentOrders.length > 0 ? recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] font-black">
                                            {order.profiles?.full_name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 leading-none mb-1">{order.profiles?.full_name || 'Khách vãng lai'}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">#{order.id.slice(0, 8)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-emerald-600">+{order.total_amount.toLocaleString()}₫</p>
                                        <p className="text-[10px] text-gray-400 font-medium">{new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-12 text-center text-gray-400 font-bold italic text-sm">Chưa có giao dịch nào</div>
                            )}
                        </div>

                        <div className="mt-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <p className="text-[10px] text-emerald-700 font-black uppercase mb-1 tracking-widest">Hiệu suất sàn</p>
                            <p className="text-xs text-emerald-600 font-medium leading-relaxed">
                                Tổng cộng <b>{stats.totalQuantity}</b> sản phẩm đã được giao dịch với tỷ lệ hoàn thành đơn hàng đạt <b>{stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%</b>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ArrowRightIcon = () => (
    <div className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
        <ArrowUpRight size={20} className="text-gray-400" />
    </div>
);

export default AdminDashboard;
