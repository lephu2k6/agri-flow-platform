import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard, Users, Package, ShoppingCart,
    FileText, Bell, LogOut, Menu, Search, BarChart3, ShieldCheck
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

const AdminLayout = ({ children }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(true)
    const location = useLocation()
    const navigate = useNavigate()
    const { profile } = useAuth()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Users, label: 'Người dùng', path: '/admin/users' },
        { icon: Package, label: 'Sản phẩm', path: '/admin/products' },
        { icon: ShoppingCart, label: 'Đơn hàng', path: '/admin/orders' },
        { icon: FileText, label: 'Nội dung (CMS)', path: '/admin/cms' },
        { icon: BarChart3, label: 'Báo cáo', path: '/admin/reports' },
    ]

    return (
        <div className="market-surface flex min-h-screen font-sans text-gray-900">
            <aside className={`fixed inset-y-0 left-0 z-50 border-r border-gray-200 bg-white shadow-sm transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="flex h-full flex-col">
                    <div className="flex h-[72px] items-center border-b border-gray-100 bg-white px-5">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="rounded-md border border-emerald-100 bg-emerald-50 p-2">
                                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                            </div>
                            {isSidebarOpen && (
                                <div className="leading-none">
                                    <span className="block text-lg font-black tracking-tight text-emerald-700">ADMIN</span>
                                    <span className="mt-1 block text-[10px] font-bold uppercase text-gray-400">Agri-Flow Market</span>
                                </div>
                            )}
                        </Link>
                    </div>

                    <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    title={item.label}
                                    className={`group flex items-center gap-4 rounded-md px-4 py-3 transition-all ${
                                        isActive
                                            ? 'border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
                                    }`}
                                >
                                    <item.icon size={21} className={isActive ? 'text-emerald-600' : 'transition-transform group-hover:scale-110'} />
                                    {isSidebarOpen && <span className="text-sm font-bold">{item.label}</span>}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="border-t border-gray-100 p-4">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-4 rounded-md px-4 py-3 text-sm font-bold text-emerald-600 transition-all hover:bg-emerald-50"
                        >
                            <LogOut size={21} />
                            {isSidebarOpen && <span>Đăng xuất</span>}
                        </button>
                    </div>
                </div>
            </aside>

            <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-gray-200 bg-white px-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="rounded-md p-2 text-gray-500 hover:bg-gray-100">
                            <Menu size={20} />
                        </button>
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input type="text" placeholder="Tìm kiếm nhanh..." className="market-input w-72 py-2 pl-10 pr-4 text-sm font-medium" />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="relative cursor-pointer rounded-md bg-gray-50 p-2 text-gray-400 transition-colors hover:text-emerald-600">
                            <Bell size={20} />
                            <span className="absolute right-1 top-1 h-2 w-2 rounded-full border-2 border-white bg-emerald-500"></span>
                        </div>
                        <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                            <div className="hidden text-right sm:block">
                                <p className="text-sm font-bold leading-none text-gray-800">{profile?.full_name || 'Admin'}</p>
                                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600">Quản trị viên</p>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-emerald-500 bg-emerald-100 font-bold text-emerald-700 shadow-inner">
                                {profile?.full_name?.charAt(0) || 'A'}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-8">{children}</main>
            </div>
        </div>
    )
}

export default AdminLayout
