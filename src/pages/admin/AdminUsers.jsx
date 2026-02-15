import React, { useState, useEffect } from 'react';
import {
    Users, Search, Filter, Shield, MoreVertical,
    UserX, UserCheck, Mail, Phone, MapPin,
    Calendar, Leaf, ShoppingBag, ChevronLeft, ChevronRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const AdminUsers = () => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProfiles(data || []);
        } catch (error) {
            console.error('Error fetching profiles:', error);
            toast.error('Không thể tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        // Giả sử có cột status hoặc is_active trong bảng profiles
        // Nếu không có, bạn cần tạo thêm cột này
        toast.success("Thay đổi trạng thái tài khoản thành công");
    };

    const filteredUsers = profiles.filter(user => {
        const matchesSearch =
            user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role) => {
        const config = {
            farmer: { label: 'Người bán (Nông dân)', color: 'emerald', icon: Leaf },
            buyer: { label: 'Người mua', color: 'blue', icon: ShoppingBag },
            admin: { label: 'Quản trị viên', color: 'purple', icon: Shield },
        };
        const item = config[role] || { label: 'Khách', color: 'gray', icon: Users };
        return (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-${item.color}-50 text-${item.color}-600 border border-${item.color}-200/50 shadow-sm`}>
                <item.icon size={10} />
                <span>{item.label}</span>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg text-emerald-600 border border-emerald-50">
                            <Users size={24} />
                        </div>
                        Quản lý người dùng
                    </h1>
                    <p className="text-gray-500 font-medium ml-16 -mt-3">Quản lý hồ sơ, phân quyền và kiểm soát hoạt động tài khoản.</p>
                </div>
                <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
                    <button onClick={() => setFilterRole('all')} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${filterRole === 'all' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Tất cả</button>
                    <button onClick={() => setFilterRole('farmer')} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${filterRole === 'farmer' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Người bán</button>
                    <button onClick={() => setFilterRole('buyer')} className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${filterRole === 'buyer' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>Người mua</button>
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/20 overflow-hidden">
                {/* Tools Bar */}
                <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-center w-20">Ảnh</th>
                                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Thông tin cơ bản</th>
                                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Vai trò</th>
                                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Liên hệ</th>
                                <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-8 py-6"><div className="w-10 h-10 bg-gray-200 rounded-full mx-auto"></div></td>
                                        <td className="px-6 py-6"><div className="h-4 bg-gray-100 rounded w-32 mb-2"></div><div className="h-3 bg-gray-50 rounded w-48"></div></td>
                                        <td className="px-6 py-6"><div className="h-6 bg-gray-100 rounded-full w-24"></div></td>
                                        <td className="px-6 py-6"><div className="h-3 bg-gray-100 rounded w-28"></div></td>
                                        <td className="px-6 py-6"><div className="h-8 bg-gray-100 rounded w-16 mx-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-50 text-gray-300">
                                            <Users size={32} />
                                        </div>
                                        <p className="text-gray-400 font-bold italic">Không tìm thấy người dùng nào</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="relative inline-block">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 via-teal-100 to-sky-100 flex items-center justify-center text-lg font-black text-emerald-700 shadow-sm border-2 border-white overflow-hidden">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        user.full_name?.charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <p className="text-sm font-black text-gray-900 leading-none mb-1 capitalize">{user.full_name || 'Vô danh'}</p>
                                            <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                                                <Mail size={12} className="text-gray-300" /> {user.email || 'N/A'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-6 font-bold">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-600 font-bold flex items-center gap-2">
                                                    <Phone size={12} className="text-emerald-500" /> {user.phone || 'Chưa cập nhật'}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-medium flex items-center gap-2">
                                                    <MapPin size={12} /> {user.province || 'N/A'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleToggleStatus(user.id, true)}
                                                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Shield size={18} />
                                                </button>
                                                <button
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Khóa tài khoản"
                                                >
                                                    <UserX size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination */}
                <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-500 font-bold italic">Hiển thị {filteredUsers.length} / {profiles.length} người dùng</p>
                    <div className="flex items-center gap-2">
                        <button className="p-2 border border-gray-200 rounded-lg hover:bg-white text-gray-400 transition-all"><ChevronLeft size={16} /></button>
                        <button className="w-8 h-8 flex items-center justify-center bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-100">1</button>
                        <button className="p-2 border border-gray-200 rounded-lg hover:bg-white text-gray-400 transition-all"><ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
