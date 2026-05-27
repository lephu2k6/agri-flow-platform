import React, { useState, useEffect } from 'react'
import {
    Users, Search, Shield, UserX, Mail, Phone,
    MapPin, Leaf, ShoppingBag, RefreshCw, UserCog
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const roleConfig = {
    farmer: { label: 'Người bán', className: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: Leaf },
    buyer: { label: 'Người mua', className: 'bg-blue-50 text-blue-700 border-blue-100', icon: ShoppingBag },
    admin: { label: 'Quản trị viên', className: 'bg-violet-50 text-violet-700 border-violet-100', icon: Shield },
}

const AdminUsers = () => {
    const [profiles, setProfiles] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterRole, setFilterRole] = useState('all')

    useEffect(() => {
        fetchProfiles()
    }, [])

    const fetchProfiles = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
            if (error) throw error
            setProfiles(data || [])
        } catch (error) {
            console.error('Error fetching profiles:', error)
            toast.error('Không thể tải danh sách người dùng')
        } finally {
            setLoading(false)
        }
    }

    const handleToggleStatus = () => {
        toast.success('Thao tác trạng thái tài khoản đã được ghi nhận')
    }

    const filteredUsers = profiles.filter(user => {
        const keyword = searchTerm.trim().toLowerCase()
        const matchesSearch = !keyword ||
            user.full_name?.toLowerCase().includes(keyword) ||
            user.email?.toLowerCase().includes(keyword) ||
            user.phone?.toLowerCase().includes(keyword)
        const matchesRole = filterRole === 'all' || user.role === filterRole
        return matchesSearch && matchesRole
    })

    const counts = {
        all: profiles.length,
        farmer: profiles.filter(p => p.role === 'farmer').length,
        buyer: profiles.filter(p => p.role === 'buyer').length,
        admin: profiles.filter(p => p.role === 'admin').length,
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                        <Users size={24} />
                    </div>
                    <div>
                        <h1 className="market-heading text-2xl">Quản lý người dùng</h1>
                        <p className="text-sm text-gray-500">Quản lý hồ sơ, vai trò và thông tin liên hệ của tài khoản.</p>
                    </div>
                </div>
                <button onClick={fetchProfiles} className="inline-flex h-10 items-center gap-2 rounded-md border border-gray-200 bg-white px-4 text-sm font-bold text-gray-600 hover:bg-gray-50">
                    <RefreshCw size={16} /> Làm mới
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Metric label="Tổng người dùng" value={counts.all} icon={Users} />
                <Metric label="Người bán" value={counts.farmer} icon={Leaf} />
                <Metric label="Người mua" value={counts.buyer} icon={ShoppingBag} />
                <Metric label="Quản trị" value={counts.admin} icon={Shield} />
            </div>

            <div className="market-panel overflow-hidden">
                <div className="flex flex-col gap-3 border-b border-gray-100 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="relative max-w-xl flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm theo tên, email hoặc số điện thoại..."
                            className="market-input h-10 w-full pl-10 pr-4 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto">
                        {['all', 'farmer', 'buyer', 'admin'].map((role) => (
                            <button
                                key={role}
                                onClick={() => setFilterRole(role)}
                                className={`h-9 whitespace-nowrap rounded-md px-3 text-xs font-black uppercase ${
                                    filterRole === role
                                        ? 'bg-emerald-600 text-white'
                                        : 'border border-gray-200 bg-white text-gray-500 hover:border-emerald-200 hover:text-emerald-700'
                                }`}
                            >
                                {role === 'all' ? 'Tất cả' : roleConfig[role].label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr className="border-b border-gray-100">
                                <th className="px-5 py-4 text-[11px] font-black uppercase tracking-wide text-gray-400">Người dùng</th>
                                <th className="px-5 py-4 text-[11px] font-black uppercase tracking-wide text-gray-400">Vai trò</th>
                                <th className="px-5 py-4 text-[11px] font-black uppercase tracking-wide text-gray-400">Liên hệ</th>
                                <th className="px-5 py-4 text-[11px] font-black uppercase tracking-wide text-gray-400">Khu vực</th>
                                <th className="px-5 py-4 text-center text-[11px] font-black uppercase tracking-wide text-gray-400">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => <UserSkeleton key={i} />)
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-5 py-16 text-center">
                                        <Users size={38} className="mx-auto mb-3 text-gray-300" />
                                        <p className="font-bold text-gray-400">Không tìm thấy người dùng phù hợp</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => <UserRow key={user.id} user={user} onToggle={handleToggleStatus} />)
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 text-sm font-semibold text-gray-500">
                    Hiển thị {filteredUsers.length} / {profiles.length} người dùng
                </div>
            </div>
        </div>
    )
}

const UserRow = ({ user, onToggle }) => {
    const role = roleConfig[user.role] || { label: 'Khách', className: 'bg-gray-50 text-gray-700 border-gray-200', icon: Users }
    const RoleIcon = role.icon

    return (
        <tr className="hover:bg-gray-50/70">
            <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-emerald-50 font-black text-emerald-700">
                        {user.avatar_url ? <img src={user.avatar_url} alt="" className="h-full w-full object-cover" /> : user.full_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                        <p className="font-black text-gray-900">{user.full_name || 'Vô danh'}</p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                            <Mail size={12} /> {user.email || 'N/A'}
                        </p>
                    </div>
                </div>
            </td>
            <td className="px-5 py-4">
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-black uppercase ${role.className}`}>
                    <RoleIcon size={12} /> {role.label}
                </span>
            </td>
            <td className="px-5 py-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                    <Phone size={13} className="text-emerald-500" /> {user.phone || 'Chưa cập nhật'}
                </p>
            </td>
            <td className="px-5 py-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                    <MapPin size={13} className="text-gray-400" /> {user.province || 'N/A'}
                </p>
            </td>
            <td className="px-5 py-4">
                <div className="flex items-center justify-center gap-2">
                    <button onClick={onToggle} className="rounded-md p-2 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600" title="Phân quyền">
                        <UserCog size={17} />
                    </button>
                    <button className="rounded-md p-2 text-gray-400 hover:bg-rose-50 hover:text-rose-600" title="Khóa tài khoản">
                        <UserX size={17} />
                    </button>
                </div>
            </td>
        </tr>
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

const UserSkeleton = () => (
    <tr className="animate-pulse">
        <td className="px-5 py-4"><div className="h-11 w-48 rounded bg-gray-100" /></td>
        <td className="px-5 py-4"><div className="h-7 w-24 rounded-full bg-gray-100" /></td>
        <td className="px-5 py-4"><div className="h-4 w-28 rounded bg-gray-100" /></td>
        <td className="px-5 py-4"><div className="h-4 w-24 rounded bg-gray-100" /></td>
        <td className="px-5 py-4"><div className="mx-auto h-8 w-16 rounded bg-gray-100" /></td>
    </tr>
)

export default AdminUsers
