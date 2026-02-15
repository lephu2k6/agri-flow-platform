import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, Users, Package, ShoppingCart, 
    FileText, Bell, Settings, LogOut, Menu, X,
    ChevronRight, Search, BarChart3, Globe
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

const AdminLayout = ({ children }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { profile } = useAuth();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Users, label: 'Người dùng', path: '/admin/users' },
        { icon: Package, label: 'Sản phẩm', path: '/admin/products' },
        { icon: ShoppingCart, label: 'Đơn hàng', path: '/admin/orders' },
        { icon: FileText, label: 'Nội dung (CMS)', path: '/admin/cms' },
        { icon: BarChart3, label: 'Báo cáo', path: '/admin/reports' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 transform ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-20 translate-x-0 md:translate-x-0 md:w-20'} shadow-sm`}>
                <div className="h-full flex flex-col">
                    {/* Logo Area */}
                    <div className="h-16 flex items-center px-6 border-b border-gray-100 bg-emerald-600 text-white">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="bg-white p-1 rounded-lg">
                                <Globe className="text-emerald-600 w-6 h-6" />
                            </div>
                            {isSidebarOpen && (
                                <span className="font-black text-lg tracking-tight">AD-PANEL</span>
                            )}
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
                                        isActive 
                                            ? 'bg-emerald-50 text-emerald-600 shadow-sm' 
                                            : 'hover:bg-gray-50 text-gray-600 hover:text-emerald-600'
                                    }`}
                                >
                                    <item.icon size={22} className={isActive ? 'text-emerald-600' : 'group-hover:scale-110 transition-transform'} />
                                    {isSidebarOpen && <span className="font-bold text-sm">{item.label}</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Info */}
                    <div className="p-4 border-t border-gray-100">
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-4 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold text-sm"
                        >
                            <LogOut size={22} />
                            {isSidebarOpen && <span>Đăng xuất</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm nhanh..." 
                                className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative p-2 text-gray-400 hover:text-emerald-600 cursor-pointer transition-colors bg-gray-50 rounded-lg">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </div>
                        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-gray-800 leading-none">{profile?.full_name || 'Admin'}</p>
                                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-0.5">Quản trị viên</p>
                            </div>
                            <div className="w-10 h-10 bg-emerald-100 border-2 border-emerald-500 rounded-full flex items-center justify-center text-emerald-700 font-bold shadow-inner">
                                {profile?.full_name?.charAt(0) || 'A'}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
