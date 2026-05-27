import React from 'react'
import {
    FileText, Image as ImageIcon, MessageCircle,
    Plus, Globe, Bell, Layout, Settings
} from 'lucide-react'

const modules = [
    {
        icon: ImageIcon,
        title: 'Banner trang chủ',
        description: 'Quản lý hình ảnh, thông điệp và liên kết nổi bật trên trang chủ.',
        metric: '3 banner đang chạy',
        tone: 'emerald'
    },
    {
        icon: Globe,
        title: 'Tin tức nông nghiệp',
        description: 'Bài viết hướng dẫn, dự báo thời vụ và thông tin thị trường.',
        metric: '12 bài viết',
        tone: 'blue'
    },
    {
        icon: MessageCircle,
        title: 'FAQ hỗ trợ',
        description: 'Câu hỏi thường gặp, hướng dẫn mua hàng và bán hàng.',
        metric: '8 câu hỏi',
        tone: 'amber'
    },
    {
        icon: Bell,
        title: 'Thông báo hệ thống',
        description: 'Gửi thông báo đến người mua, người bán hoặc toàn bộ hệ thống.',
        metric: 'Broadcast',
        tone: 'rose'
    },
    {
        icon: Layout,
        title: 'Khối nội dung',
        description: 'Cấu hình các khối hiển thị trên marketplace và trang vai trò.',
        metric: '6 khối',
        tone: 'violet'
    },
    {
        icon: Settings,
        title: 'Thiết lập CMS',
        description: 'Cài đặt mặc định cho SEO, trạng thái xuất bản và ngôn ngữ.',
        metric: 'Cấu hình',
        tone: 'slate'
    },
]

const toneClasses = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100',
}

const AdminCMS = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h1 className="market-heading text-2xl">Quản lý nội dung</h1>
                        <p className="text-sm text-gray-500">Quản trị banner, bài viết, FAQ và thông báo hệ thống.</p>
                    </div>
                </div>
                <button className="market-button h-10 px-4 text-sm">
                    <Plus size={17} /> Tạo nội dung
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {modules.map((item) => (
                    <CMSCard key={item.title} item={item} />
                ))}
            </div>
        </div>
    )
}

const CMSCard = ({ item }) => {
    const Icon = item.icon
    return (
        <div className="market-panel p-5 transition hover:border-emerald-200 hover:shadow-md">
            <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-md border ${toneClasses[item.tone]}`}>
                <Icon size={22} />
            </div>
            <h3 className="text-lg font-black text-gray-900">{item.title}</h3>
            <p className="mt-2 min-h-12 text-sm leading-relaxed text-gray-500">{item.description}</p>
            <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-xs font-black uppercase tracking-wide text-gray-500">{item.metric}</span>
                <button className="rounded-md bg-emerald-600 p-2 text-white hover:bg-emerald-700">
                    <Plus size={17} />
                </button>
            </div>
        </div>
    )
}

export default AdminCMS
