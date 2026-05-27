import React, { useState, useEffect } from 'react'
import {
    ShoppingCart, Search, Clock, CheckCircle2,
    Truck, XCircle, MoreVertical, Eye, Download,
    Calendar, CreditCard
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const statusStyles = {
    pending: { label: 'Chờ xử lý', className: 'bg-amber-50 text-amber-700 border-amber-100', icon: Clock },
    confirmed: { label: 'Đã xác nhận', className: 'bg-blue-50 text-blue-700 border-blue-100', icon: CheckCircle2 },
    shipped: { label: 'Đang giao', className: 'bg-indigo-50 text-indigo-700 border-indigo-100', icon: Truck },
    completed: { label: 'Hoàn thành', className: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: CheckCircle2 },
    cancelled: { label: 'Đã hủy', className: 'bg-rose-50 text-rose-700 border-rose-100', icon: XCircle },
}

const AdminOrders = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('orders')
                .select(`*, profiles:buyer_id (full_name, email)`)
                .order('created_at', { ascending: false })

            if (error) throw error
            setOrders(data || [])
        } catch (error) {
            console.error('Error fetching admin orders:', error)
            toast.error('Không thể tải danh sách đơn hàng')
        } finally {
            setLoading(false)
        }
    }

    const filteredOrders = orders.filter((order) => {
        const keyword = searchTerm.trim().toLowerCase()
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus
        const matchesSearch = !keyword ||
            order.id?.toLowerCase().includes(keyword) ||
            order.profiles?.full_name?.toLowerCase().includes(keyword) ||
            order.profiles?.email?.toLowerCase().includes(keyword)
        return matchesStatus && matchesSearch
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="market-heading flex items-center gap-3 text-2xl">
                        <span className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                            <ShoppingCart size={23} />
                        </span>
                        Quản lý đơn hàng
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">Theo dõi toàn bộ giao dịch và trạng thái xử lý trên sàn.</p>
                </div>
                <button className="inline-flex h-10 items-center gap-2 rounded-md border border-gray-200 bg-white px-4 text-sm font-bold text-gray-600 hover:bg-gray-50">
                    <Download size={16} /> Xuất Excel
                </button>
            </div>

            <div className="market-panel overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative max-w-xl flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm theo mã đơn, tên hoặc email khách hàng..."
                            className="market-input w-full py-2.5 pl-10 pr-4 text-sm"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto">
                        {['all', 'pending', 'confirmed', 'shipped', 'completed', 'cancelled'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`h-9 whitespace-nowrap rounded-md px-3 text-xs font-black uppercase transition-all ${
                                    filterStatus === status
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'border border-gray-200 bg-white text-gray-500 hover:border-emerald-200 hover:text-emerald-700'
                                }`}
                            >
                                {status === 'all' ? 'Tất cả' : statusStyles[status].label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto text-sm">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr className="border-b border-gray-100 uppercase tracking-wide">
                                <th className="px-5 py-4 text-[11px] font-black text-gray-400">Mã đơn</th>
                                <th className="px-5 py-4 text-[11px] font-black text-gray-400">Ngày đặt</th>
                                <th className="px-5 py-4 text-[11px] font-black text-gray-400">Khách hàng</th>
                                <th className="px-5 py-4 text-[11px] font-black text-gray-400">Giá trị</th>
                                <th className="px-5 py-4 text-[11px] font-black text-gray-400">Trạng thái</th>
                                <th className="px-5 py-4 text-center text-[11px] font-black text-gray-400">Tác vụ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                [...Array(5)].map((_, index) => (
                                    <tr key={index} className="animate-pulse">
                                        <td colSpan="6" className="px-5 py-8"><div className="h-4 rounded bg-gray-100" /></td>
                                    </tr>
                                ))
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-5 py-16 text-center">
                                        <ShoppingCart size={36} className="mx-auto mb-3 text-gray-300" />
                                        <p className="font-bold text-gray-400">Không có đơn hàng phù hợp</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => {
                                    const status = statusStyles[order.status] || statusStyles.pending
                                    const StatusIcon = status.icon
                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50/70">
                                            <td className="px-5 py-4">
                                                <span className="font-black uppercase text-emerald-700">#{order.id.slice(0, 8)}</span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 font-semibold text-gray-600">
                                                    <Calendar size={14} className="text-gray-300" />
                                                    {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-100 text-xs font-black text-gray-600">
                                                        {order.profiles?.full_name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{order.profiles?.full_name || 'Khách vãng lai'}</p>
                                                        <p className="text-xs text-gray-400">{order.profiles?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="font-black text-gray-900">{(order.total_amount || 0).toLocaleString()}đ</p>
                                                <div className="mt-1 flex items-center gap-1 text-[11px] font-bold uppercase text-emerald-600">
                                                    <CreditCard size={11} /> Thanh toán
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black uppercase ${status.className}`}>
                                                    <StatusIcon size={12} /> {status.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button className="rounded-md p-2 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600">
                                                        <Eye size={17} />
                                                    </button>
                                                    <button className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                                                        <MoreVertical size={17} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-500">
                    Hiển thị {filteredOrders.length} / {orders.length} đơn hàng
                </div>
            </div>
        </div>
    )
}

export default AdminOrders
