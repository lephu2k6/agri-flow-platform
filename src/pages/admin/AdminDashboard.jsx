import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    Users, Package, ShoppingBag, DollarSign,
    ArrowUpRight, Clock, TrendingUp,
    UserCheck, AlertCircle, RefreshCw, Download
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

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
    })
    const [recentOrders, setRecentOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            setLoading(true)
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
            ])

            const revenue = revenueData?.reduce((acc, order) => {
                const amount = order.total_amount || (order.quantity * (order.unit_price || 0))
                return acc + amount
            }, 0) || 0
            const quantity = revenueData?.reduce((acc, order) => acc + (order.quantity || 0), 0) || 0

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
            })

            setRecentOrders(recentOrdersData || [])
        } catch (error) {
            console.error('Error fetching admin stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const statCards = [
        { label: 'Người dùng', value: stats.totalUsers, icon: Users, note: 'Toàn sàn' },
        { label: 'Sản phẩm', value: stats.totalProducts, icon: Package, note: `${stats.pendingProducts} chờ duyệt` },
        { label: 'Đơn hàng', value: stats.totalOrders, icon: ShoppingBag, note: `${stats.completedOrders} hoàn tất` },
        { label: 'Doanh thu', value: `${stats.totalRevenue.toLocaleString()}đ`, icon: DollarSign, note: `${stats.totalQuantity} sản phẩm` },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="market-heading text-2xl">Thống kê hệ thống</h1>
                    <p className="mt-1 text-sm text-gray-500">Theo dõi người dùng, sản phẩm, đơn hàng và doanh thu trên sàn.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="inline-flex h-10 items-center gap-2 rounded-md border border-gray-200 bg-white px-4 text-sm font-bold text-gray-600 hover:bg-gray-50">
                        <Download size={16} /> Xuất báo cáo
                    </button>
                    <button onClick={fetchStats} className="market-button h-10 px-4 text-sm">
                        <RefreshCw size={16} /> Cập nhật
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {statCards.map((stat) => (
                    <div key={stat.label} className="market-panel p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{stat.label}</p>
                                <p className="mt-2 text-2xl font-black text-gray-900">{loading ? '...' : stat.value}</p>
                            </div>
                            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                                <stat.icon size={22} />
                            </div>
                        </div>
                        <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                            <ArrowUpRight size={13} /> {stat.note}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="market-panel xl:col-span-2">
                    <PanelTitle icon={Clock} title="Công việc cần xử lý" action="Ưu tiên hôm nay" />
                    <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
                        <ActionCard to="/admin/products" icon={Package} title="Sản phẩm chờ duyệt" value={stats.pendingProducts} />
                        <ActionCard to="/admin/orders" icon={ShoppingBag} title="Đơn hàng mới" value={stats.pendingOrders} />
                        <ActionCard to="/admin/users" icon={UserCheck} title="Người bán chờ duyệt" value={0} />
                        <ActionCard icon={AlertCircle} title="Khiếu nại khách hàng" value={0} />
                    </div>
                </div>

                <div className="market-panel">
                    <PanelTitle icon={TrendingUp} title="Giao dịch mới" action={<Link to="/admin/orders" className="text-emerald-600">Xem tất cả</Link>} />
                    <div className="divide-y divide-gray-100 p-2">
                        {recentOrders.length > 0 ? recentOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between rounded-md px-3 py-3 hover:bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-100 text-xs font-black text-gray-600">
                                        {order.profiles?.full_name?.charAt(0) || 'U'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{order.profiles?.full_name || 'Khách vãng lai'}</p>
                                        <p className="text-[11px] font-semibold uppercase text-gray-400">#{order.id.slice(0, 8)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-emerald-600">+{(order.total_amount || 0).toLocaleString()}đ</p>
                                    <p className="text-[11px] text-gray-400">{new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                                </div>
                            </div>
                        )) : (
                            <div className="py-12 text-center text-sm font-semibold text-gray-400">Chưa có giao dịch nào</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

const PanelTitle = ({ icon: Icon, title, action }) => (
    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                <Icon size={19} />
            </div>
            <h2 className="text-base font-black text-gray-900">{title}</h2>
        </div>
        <div className="text-xs font-bold text-gray-400">{action}</div>
    </div>
)

const ActionCard = ({ to, icon: Icon, title, value }) => {
    const content = (
        <div className="flex items-center gap-4 rounded-md border border-gray-100 bg-gray-50 p-4 hover:border-emerald-200 hover:bg-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white text-emerald-600 shadow-sm">
                <Icon size={24} />
            </div>
            <div>
                <p className="text-2xl font-black text-gray-900">{value}</p>
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{title}</p>
            </div>
        </div>
    )

    return to ? <Link to={to}>{content}</Link> : content
}

export default AdminDashboard
