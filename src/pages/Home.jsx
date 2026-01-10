import React from 'react';
import { ArrowRight, Truck, BarChart3, ShieldCheck, Globe, MoveRight } from 'lucide-react';

export default function AgriFlowSimple() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-100">
      
      

      {/* 2. Hero Section: Tập trung vào thông điệp */}
      <section className="max-w-7xl mx-auto px-8 pt-20 pb-32 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <span className="text-emerald-600 font-bold tracking-widest text-xs uppercase mb-6 block">
            Dòng chảy nông sản Việt
          </span>
          <h1 className="text-6xl lg:text-7xl font-semibold leading-[1.1] tracking-tight mb-8">
            Kết nối nông sản <br /> 
            <span className="text-slate-400 font-light italic">trực tiếp & minh bạch.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-md mb-10 leading-relaxed">
            Nền tảng số giúp nông dân miền Trung - Nam chủ động tiêu thụ, tối ưu vận tải và giảm thiểu rủi ro ép giá.
          </p>
          <div className="flex items-center gap-8">
            <button className="bg-emerald-600 text-white px-8 py-4 rounded-full font-bold hover:bg-emerald-700 transition-all flex items-center gap-3">
              Bắt đầu ngay <ArrowRight size={18} />
            </button>
            <button className="text-slate-900 font-bold flex items-center gap-2 group">
              Tìm hiểu thêm <MoveRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>

        {/* Ảnh minh họa sạch sẽ */}
        <div className="relative">
          <div className="aspect-[4/5] bg-slate-100 rounded-[2rem] overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=2071&auto=format&fit=crop" 
              className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
              alt="Agriculture" 
            />
          </div>
          {/* Card nổi nhẹ nhàng */}
          <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 max-w-[240px]">
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                <Truck size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Đang vận chuyển</p>
                <p className="text-sm font-bold">12 tấn Bưởi Da Xanh</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features: 3 cột cực kỳ đơn giản */}
      <section className="bg-slate-50 py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-3 gap-16">
            <div>
              <div className="mb-6 text-emerald-600"><BarChart3 size={32} /></div>
              <h3 className="text-xl font-bold mb-4">Điều phối Cung - Cầu</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                Minh bạch thông tin thu hoạch, giúp nông dân không còn bị động và lệ thuộc vào thương lái.
              </p>
            </div>
            <div>
              <div className="mb-6 text-emerald-600"><Globe size={32} /></div>
              <h3 className="text-xl font-bold mb-4">Tối ưu Vận tải</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                Kết nối xe tải trống chiều về, giảm 15-20% chi phí logistics cho cả người mua và người bán.
              </p>
            </div>
            <div>
              <div className="mb-6 text-emerald-600"><ShieldCheck size={32} /></div>
              <h3 className="text-xl font-bold mb-4">Giao dịch An toàn</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                Hệ thống bảo chứng giúp đảm bảo thanh toán và chất lượng hàng hóa đúng cam kết.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Footer đơn giản */}
      <footer className="py-20 px-8 max-w-7xl mx-auto border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="text-slate-400 text-sm">© 2024 AGRI-FLOW. Dự án số hóa nông sản miền Trung - Nam.</p>
        <div className="flex gap-8 text-sm font-bold">
          <a href="#" className="hover:text-emerald-600">Facebook</a>
          <a href="#" className="hover:text-emerald-600">Zalo</a>
          <a href="#" className="hover:text-emerald-600">Email</a>
        </div>
      </footer>
    </div>
  );
}