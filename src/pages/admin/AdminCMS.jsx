import React from 'react';
import { FileText, Image as ImageIcon, MessageCircle, BarChart, Settings, Plus, Layout, Globe, Bell } from 'lucide-react';

const AdminCMS = () => {
    return (
        <div className="space-y-8 animate-in zoom-in-95 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg text-indigo-600 border border-indigo-50">
                            <FileText size={24} />
                        </div>
                        Quản lý nội dung (CMS)
                    </h1>
                    <p className="text-gray-500 font-medium ml-16 -mt-3">Quản trị Banner, Tin tức, FAQ và các thông báo hệ thống.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Banner Management Card */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/20 hover:border-indigo-500 transition-all group">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100 group-hover:scale-110 transition-transform">
                        <ImageIcon size={28} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">Banners Trang chủ</h3>
                    <p className="text-sm text-gray-400 font-medium mb-8">Thay đổi hình ảnh, khuyến mãi hiển tại màn hình trang chủ.</p>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">3 Banners đang chạy</span>
                        <button className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100"><Plus size={20} /></button>
                    </div>
                </div>

                {/* News & Blog Card */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/20 hover:border-emerald-500 transition-all group">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100 group-hover:scale-110 transition-transform">
                        <Globe size={28} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">Tin tức nông nghiệp</h3>
                    <p className="text-sm text-gray-400 font-medium mb-8">Bài viết hướng dẫn, dự báo thời vụ và tin tức thị trường.</p>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">12 Bài viết</span>
                        <button className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-100"><Plus size={20} /></button>
                    </div>
                </div>

                {/* FAQ & Support Card */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/20 hover:border-amber-500 transition-all group">
                    <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 border border-amber-100 group-hover:scale-110 transition-transform">
                        <MessageCircle size={28} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">Quản lý FAQ</h3>
                    <p className="text-sm text-gray-400 font-medium mb-8">Danh sách câu hỏi thường gặp và hướng dẫn sử dụng sàn.</p>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-600 uppercase tracking-widest">8 Câu hỏi</span>
                        <button className="p-3 bg-amber-600 text-white rounded-xl shadow-lg shadow-amber-100"><Plus size={20} /></button>
                    </div>
                </div>

                {/* System Notifications Card */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/20 hover:border-rose-500 transition-all group">
                    <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 border border-rose-100 group-hover:scale-110 transition-transform">
                        <Bell size={28} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">Thông báo hệ thống</h3>
                    <p className="text-sm text-gray-400 font-medium mb-8">Gửi thông báo đẩy (push) đến toàn bộ người dùng hệ thống.</p>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-rose-600 uppercase tracking-widest">Broadcast</span>
                        <button className="p-3 bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-100"><Plus size={20} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCMS;
