import React from 'react';
import { ArrowRight, Truck, BarChart3, ShieldCheck, Globe, MoveRight, Leaf, Users, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const marqueeItems = [,
  "HỖ TRỢ NÔNG DÂN VIỆT NAM",
  "GIẢM LÃNG PHÍ THỰC PHẨM",
  "TƯƠI NGON TỪ NÔNG TRẠI",
  "GIAO HÀNG TẬN NHÀ",
];

export default function AgriFlowSimple() {
  return (
    <div className="min-h-screen bg-linear-to-r from-emerald-50/30 to-white text-gray-800 font-sans selection:bg-emerald-200">


      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 pb-32 grid lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Users size={14} />
            Dành cho nông dân miền Trung - Nam
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-8">
            Kết nối trực tiếp
            <span className="block text-emerald-600 mt-3">Nông sản Việt</span>
          </h1>

          <p className="text-lg text-gray-600 max-w-xl mb-10 leading-relaxed">
            Nền tảng số giúp nông dân chủ động tiêu thụ, tối ưu vận tải và
            <span className="font-semibold text-emerald-700"> giảm 30% chi phí trung gian</span>.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Link to="/register">
              <button className="bg-linear-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Tham gia ngay
                <ArrowRight size={18} />
              </button>
            </Link>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center">
                <Clock className="text-sky-600" size={18} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Đăng ký chỉ mất</p>
                <p className="font-bold text-gray-800">3 phút</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="order-1 lg:order-2 relative">
          <div className="aspect-4/5 bg-linear-to-r from-emerald-100/50 to-sky-100/50 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
            <img
              src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=2071&auto=format&fit=crop"
              className="w-full h-full object-cover mix-blend-multiply opacity-90"
              alt="Nông dân và nông sản"
            />
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="bg-emerald-600 py-4 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <span key={index} className="text-white font-bold text-sm sm:text-base mx-8 flex items-center gap-3">
              <Leaf className="w-4 h-4" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-linear-to-r from-white to-emerald-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Agri-Flow giúp bạn
            </h2>
            <p className="text-gray-600">
              Giải pháp toàn diện cho chuỗi cung ứng nông sản
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-emerald-50 group hover:border-emerald-100">
              <div className="w-16 h-16 rounded-xl bg-linear-to-r from-emerald-100 to-emerald-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 size={28} className="text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Điều phối Cung - Cầu</h3>
              <p className="text-gray-600 leading-relaxed">
                Minh bạch thông tin thu hoạch, giúp nông dân không còn bị động và lệ thuộc vào thương lái.
              </p>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <span className="text-sm font-semibold text-emerald-600">Dự báo AI tích hợp</span>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-sky-50 group hover:border-sky-100">
              <div className="w-16 h-16 rounded-xl bg-linear-to-r from-sky-100 to-sky-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe size={28} className="text-sky-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Tối ưu Vận tải</h3>
              <p className="text-gray-600 leading-relaxed">
                Kết nối xe tải trống chiều về, giảm 15-20% chi phí logistics cho cả người mua và người bán.
              </p>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <span className="text-sm font-semibold text-sky-600">Tự động ghép lộ trình</span>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-emerald-50 group hover:border-emerald-100">
              <div className="w-16 h-16 rounded-xl bg-linear-to-r from-amber-100 to-amber-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck size={28} className="text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Giao dịch An toàn</h3>
              <p className="text-gray-600 leading-relaxed">
                Hệ thống bảo chứng giúp đảm bảo thanh toán và chất lượng hàng hóa đúng cam kết.
              </p>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <span className="text-sm font-semibold text-amber-600">Bảo hiểm rủi ro</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-8 bg-linear-to-r from-emerald-900 to-emerald-800 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Leaf size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">AGRI-FLOW</h3>
                  <p className="text-emerald-200 text-sm">Dòng chảy nông sản</p>
                </div>
              </div>
              <p className="text-emerald-100 text-sm leading-relaxed">
                Nền tảng số kết nối giao dịch & logistics nông sản Việt
              </p>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">Đối tượng</h4>
              <ul className="space-y-3 text-emerald-100">
                <li className="hover:text-white transition-colors">Nông dân & HTX</li>
                <li className="hover:text-white transition-colors">Doanh nghiệp thu mua</li>
                <li className="hover:text-white transition-colors">Đơn vị vận chuyển</li>
                <li className="hover:text-white transition-colors">Nhà phân phối</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">Khu vực</h4>
              <ul className="space-y-3 text-emerald-100">
                <li className="hover:text-white transition-colors">Miền Trung</li>
                <li className="hover:text-white transition-colors">Tây Nguyên</li>
                <li className="hover:text-white transition-colors">Đông Nam Bộ</li>
                <li className="hover:text-white transition-colors">Đồng bằng Sông Cửu Long</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-6">Kết nối</h4>
              <div className="flex gap-4 mb-6">
                <a href="#" className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <span className="font-bold">F</span>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <span className="font-bold">Z</span>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <span className="font-bold">E</span>
                </a>
              </div>
              <p className="text-sm text-emerald-200">
                Liên hệ: <span className="font-semibold">info@agriflow.vn</span>
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-emerald-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-emerald-200 text-sm text-center md:text-left">
              © 2026 AGRI-FLOW. Dự án số hóa nông sản miền Trung - Nam.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-emerald-200 hover:text-white transition-colors">Chính sách</a>
              <a href="#" className="text-emerald-200 hover:text-white transition-colors">Điều khoản</a>
              <a href="#" className="text-emerald-200 hover:text-white transition-colors">Bảo mật</a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 6s ease-in-out infinite 1.5s;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
         100% { transform: translateX(-50%); }
        }
        .animate-marquee {
        animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>

  );
}






