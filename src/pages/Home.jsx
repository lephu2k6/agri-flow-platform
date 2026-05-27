import React, { useEffect, useState } from 'react';
import { 
  ArrowRight, Truck, ShieldCheck, Leaf, 
  TrendingUp, TrendingDown, ChevronDown, 
  Star, ShoppingCart, MapPin, Search, ChevronRight,
  Zap, Users, BarChart3, Phone, Mail, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Banner slides data
const bannerSlides = [
  {
    title: "ĐỒNG HÀNH CHUYỂN ĐỔI SỐ",
    subtitle: "cùng nông dân Việt!",
    desc: "Kết nối trực tiếp nông dân với doanh nghiệp thu mua, giảm 30% chi phí trung gian",
    bg: "from-emerald-600 to-green-700",
    image: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=2071&auto=format&fit=crop"
  },
  {
    title: "NÔNG SẢN TƯƠI NGON",
    subtitle: "từ vườn đến bàn ăn",
    desc: "Cam kết chất lượng VietGAP, giao hàng trong 24 giờ",
    bg: "from-green-600 to-emerald-700",
    image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=2070&auto=format&fit=crop"
  }
];

// Market prices data
const marketPrices = [
  { id: 1, name: "Lúa gạo Jasmine", price: 15500, unit: "kg", region: "Đồng Tháp", change: 2.4, isUp: true },
  { id: 2, name: "Cà phê Robusta", price: 112000, unit: "kg", region: "Đắk Lắk", change: -1.2, isUp: false },
  { id: 3, name: "Sầu riêng Ri6", price: 85000, unit: "kg", region: "Bến Tre", change: 5.6, isUp: true },
  { id: 4, name: "Thanh long ruột đỏ", price: 32000, unit: "kg", region: "Bình Thuận", change: 0.8, isUp: true },
];

// Category data
const categories = [
  { name: "Trái cây", icon: "🍎", count: 120 },
  { name: "Rau củ", icon: "🥬", count: 85 },
  { name: "Ngũ cốc", icon: "🌾", count: 45 },
  { name: "Thủy sản", icon: "🐟", count: 32 },
  { name: "Gia vị", icon: "🌶️", count: 28 },
  { name: "Đặc sản", icon: "🍯", count: 56 },
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeFaq, setActiveFaq] = useState(null);

  // Auto slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Fetch products
  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        setLoadingProducts(true);
        const { data, error } = await supabase
          .from('products')
          .select(`*, profiles:farmer_id ( id, full_name, avatar_url, province ), product_images ( id, image_url, is_primary )`)
          .eq('status', 'available')
          .order('created_at', { ascending: false })
          .limit(8);
        if (error) throw error;
        const normalized = (data || []).map(p => ({
          ...p,
          image: p.product_images?.find(img => img.is_primary)?.image_url || 
                 p.product_images?.[0]?.image_url || 
                 "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=600"
        }));
        setFeaturedProducts(normalized);
      } catch (err) {
        console.error("Error fetching featured products:", err);
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchFeaturedProducts();
  }, []);

  const faqs = [
    { q: "Agri-Flow giúp giảm chi phí trung gian bằng cách nào?", a: "Chúng tôi kết nối trực tiếp Nông dân/HTX với Doanh nghiệp thu mua, kết hợp logistics ghép xe trống chiều về giúp giảm tới 20% cước phí vận chuyển." },
    { q: "Làm thế nào đảm bảo chất lượng hàng hóa?", a: "AgriFlow cung cấp quy trình bảo chứng giao dịch. Người mua kiểm tra hàng theo tiêu chuẩn chất lượng đã cam kết trước khi tiền được giải ngân." },
    { q: "Nông dân chưa quen công nghệ có dùng được không?", a: "Hoàn toàn dễ dàng! Hệ thống tích hợp Trợ Lý AI thông minh, nông dân chỉ cần chat tiếng Việt tự nhiên để đăng bán và quản lý đơn hàng." },
    { q: "Phí dịch vụ trên nền tảng là bao nhiêu?", a: "Đăng ký, đăng tin sản phẩm hoàn toàn miễn phí. Chỉ thu phí bảo chứng giao dịch rất nhỏ (1-2%) từ người mua để duy trì hệ thống." }
  ];

  const fallbackProducts = [
    { id: '1', title: "Sầu riêng Ri6 Hữu Cơ", price_per_unit: 85000, unit: "kg", province: "Bến Tre", image: "https://images.unsplash.com/photo-1527324688151-0e627063f291?q=80&w=600" },
    { id: '2', title: "Bưởi Da Xanh Loại 1", price_per_unit: 45000, unit: "kg", province: "Bến Tre", image: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=600" },
    { id: '3', title: "Cà Phê Robusta Đậm Vị", price_per_unit: 110000, unit: "kg", province: "Đắk Lắk", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600" },
    { id: '4', title: "Thanh Long Bình Thuận", price_per_unit: 30000, unit: "kg", province: "Bình Thuận", image: "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=600" },
  ];

  const displayProducts = featuredProducts.length > 0 ? featuredProducts : fallbackProducts;

  return (
    <div className="min-h-screen bg-white font-sans">
      
      {/* === HERO BANNER SLIDER === */}
      <section className="relative bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative rounded-2xl overflow-hidden my-4 shadow-lg" style={{ minHeight: '380px' }}>
            {bannerSlides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-700 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                <div className="absolute inset-0">
                  <img src={slide.image} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
                </div>
                <div className="relative z-10 flex items-center h-full px-8 sm:px-16 py-12">
                  <div className="max-w-lg text-white">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-2">
                      {slide.title}
                    </h2>
                    <p className="text-2xl sm:text-3xl font-light italic text-emerald-300 mb-4">{slide.subtitle}</p>
                    <p className="text-white/80 text-sm sm:text-base mb-6 leading-relaxed">{slide.desc}</p>
                    <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors shadow-lg">
                      Khám phá ngay <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {bannerSlides.map((_, i) => (
                <button key={i} onClick={() => setCurrentSlide(i)}
                  className={`w-3 h-3 rounded-full transition-all ${i === currentSlide ? 'bg-white w-8' : 'bg-white/50'}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* === SEARCH BAR === */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm sản phẩm cần mua..."
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
              />
            </div>
            <Link to="/products" className="px-8 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors flex items-center gap-2">
              <Search size={18} />
              <span className="hidden sm:inline">Tìm kiếm</span>
            </Link>
          </div>
        </div>
      </section>

      {/* === CATEGORY GRID === */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
              Danh Mục Sản Phẩm
            </h2>
            <Link to="/products" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              Xem tất cả <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <Link to="/products" key={i} className="group flex flex-col items-center p-4 bg-gray-50 hover:bg-emerald-50 rounded-xl border border-gray-100 hover:border-emerald-200 transition-all">
                <span className="text-3xl mb-2">{cat.icon}</span>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-emerald-700">{cat.name}</span>
                <span className="text-xs text-gray-400">{cat.count} sản phẩm</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* === GIÁ THỊ TRƯỜNG === */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
              Giá Nông Sản Hôm Nay
            </h2>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={12} />
              Cập nhật: {new Date().toLocaleDateString('vi-VN')}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketPrices.map(item => (
              <div key={item.id} className="bg-white p-5 rounded-xl border border-gray-100 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">{item.region}</span>
                  <span className={`text-xs font-bold flex items-center gap-0.5 ${item.isUp ? 'text-emerald-600' : 'text-red-500'}`}>
                    {item.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {item.isUp ? '+' : ''}{item.change}%
                  </span>
                </div>
                <h3 className="font-bold text-gray-800 text-sm mb-2 group-hover:text-emerald-600 transition-colors">{item.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-red-500">{item.price.toLocaleString()}</span>
                  <span className="text-sm text-gray-400">đ/{item.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === SẢN PHẨM NỔI BẬT === */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1 h-6 bg-red-500 rounded-full"></span>
              Sản Phẩm Nổi Bật
            </h2>
            <Link to="/products" className="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-semibold rounded-lg text-sm transition-colors">
              Xem thêm
            </Link>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-100"></div>
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayProducts.slice(0, 8).map(p => (
                <Link to={p.id ? `/products/${p.id}` : '/products'} key={p.id} className="group bg-white rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-lg overflow-hidden transition-all">
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {p.province && (
                      <span className="absolute top-2 left-2 text-xs bg-white/90 backdrop-blur-sm text-gray-600 px-2 py-1 rounded font-medium flex items-center gap-1">
                        <MapPin size={10} className="text-emerald-500" />
                        {p.province || p.profiles?.province}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-gray-800 group-hover:text-emerald-600 transition-colors line-clamp-2 mb-1 leading-snug">
                      {p.title}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={10} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-lg font-black text-red-500">{p.price_per_unit?.toLocaleString()}</span>
                        <span className="text-xs text-gray-400 ml-0.5">đ/{p.unit}</span>
                      </div>
                      <button className="w-8 h-8 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white rounded-lg flex items-center justify-center transition-colors">
                        <ShoppingCart size={14} />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* === TẠI SAO CHỌN AGRIFLOW === */}
      <section className="py-12 bg-emerald-50/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tại Sao Chọn AgriFlow?</h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">Giải pháp số hóa chuỗi cung ứng nông sản hàng đầu Việt Nam</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: "Logistics Tối Ưu", desc: "Ghép xe trống chiều về, giảm 20% cước phí vận chuyển", color: "text-blue-600 bg-blue-50" },
              { icon: ShieldCheck, title: "Bảo Chứng Giao Dịch", desc: "Tiền ký quỹ an toàn, giải ngân khi nghiệm thu đạt yêu cầu", color: "text-emerald-600 bg-emerald-50" },
              { icon: Zap, title: "AI Trợ Lý Thông Minh", desc: "Hỗ trợ đăng bán, kiểm tra giá, xử lý đơn hàng 24/7", color: "text-amber-600 bg-amber-50" },
              { icon: Users, title: "Cộng Đồng 5,000+", desc: "Mạng lưới nông dân, HTX và doanh nghiệp thu mua uy tín", color: "text-purple-600 bg-purple-50" },
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md transition-all text-center group">
                <div className={`w-14 h-14 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon size={24} />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === QUY TRÌNH HOẠT ĐỘNG === */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Quy Trình Đặt Hàng</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Tìm Sản Phẩm", desc: "Duyệt chợ nông sản hoặc tìm kiếm theo danh mục, vùng miền" },
              { step: "02", title: "Đặt Hàng", desc: "Chọn số lượng, nhập địa chỉ giao hàng và xác nhận đơn" },
              { step: "03", title: "Thanh Toán An Toàn", desc: "Bảo chứng giao dịch — tiền được giữ an toàn đến khi nhận hàng" },
              { step: "04", title: "Nhận Hàng Tận Nơi", desc: "Nông sản tươi sạch giao đến tận nhà trong 24 giờ" },
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="bg-gray-50 group-hover:bg-emerald-50 p-6 rounded-xl border border-gray-100 group-hover:border-emerald-200 transition-all">
                  <span className="text-3xl font-black text-emerald-500/20 group-hover:text-emerald-500/40 transition-colors">{item.step}</span>
                  <h3 className="font-bold text-gray-800 mt-2 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 z-10">
                    <ChevronRight className="text-gray-300" size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === ĐÁNH GIÁ KHÁCH HÀNG === */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Khách Hàng Nói Gì?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { name: "Anh Phan Văn Nam", role: "HTX Trái Cây Cái Bè - Tiền Giang", text: "Nhờ AgriFlow, tôi bán thẳng cho chuỗi siêu thị lớn ở Hà Nội, giá ổn định hơn hẳn. Trợ lý AI hỗ trợ đăng bán rất dễ xài.", initial: "P" },
              { name: "Chị Nguyễn Thị Hồng", role: "Giám đốc Thu Mua — Thực Phẩm Sạch Mart", text: "Đặt hàng nông sản số lượng lớn trên AgriFlow giúp công ty tôi tiết kiệm 15% ngân sách logistics. Tiêu chuẩn VietGAP minh bạch rõ ràng.", initial: "H" },
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md transition-all">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} className="fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">"{item.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">{item.initial}</div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === CÂU HỎI THƯỜNG GẶP === */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Câu Hỏi Thường Gặp</h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div key={index} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                  <button 
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-4 text-left font-semibold text-gray-700 hover:text-emerald-600 transition-colors text-sm gap-4"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                  </button>
                  <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="px-4 pb-4 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* === BANNER CTA === */}
      <section className="bg-emerald-600">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">Bắt đầu giao dịch nông sản ngay hôm nay</h3>
              <p className="text-emerald-100 text-sm">Đăng ký miễn phí và nhận ngay ưu đãi cho đơn hàng đầu tiên</p>
            </div>
            <div className="flex gap-3">
              <Link to="/register" className="px-6 py-3 bg-white text-emerald-600 font-bold rounded-lg hover:bg-gray-50 transition-colors shadow-lg">
                Đăng ký ngay
              </Link>
              <Link to="/products" className="px-6 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-colors">
                Vào chợ nông sản
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <Leaf className="text-white" size={16} />
                </div>
                <div>
                  <h3 className="text-white font-bold">AGRI-FLOW</h3>
                  <p className="text-[10px] text-emerald-400 font-medium">Dòng chảy nông sản</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed">Hệ sinh thái số hóa chuỗi cung ứng nông sản Việt Nam.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Về AgriFlow</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white transition-colors">Giới thiệu</Link></li>
                <li><Link to="/products" className="hover:text-white transition-colors">Chợ nông sản</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Đăng ký bán hàng</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Hỗ trợ</h4>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-white transition-colors cursor-pointer">Hướng dẫn mua hàng</li>
                <li className="hover:text-white transition-colors cursor-pointer">Chính sách đổi trả</li>
                <li className="hover:text-white transition-colors cursor-pointer">Bảo mật thông tin</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm">Liên hệ</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><Phone size={14} /> 1900 6868</div>
                <div className="flex items-center gap-2"><Mail size={14} /> lienhe@agriflow.vn</div>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-gray-800 text-xs text-center text-gray-500">
            © 2026 AGRI-FLOW. Dự án công nghệ nông sản Việt Nam.
          </div>
        </div>
      </footer>
    </div>
  );
}
