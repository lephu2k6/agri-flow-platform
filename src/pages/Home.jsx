import { Link } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import {
  Truck,
  Users,
  Shield,
  TrendingUp,
  Phone,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Leaf,
  ShoppingBag,
  BarChart3,
  Globe,
  Award,
  Clock,
  ShieldCheck,
  Zap,
  Star,
  Target,
  TrendingDown,
  MapPin,
  Package,
  DollarSign,
  Headphones,
  FileText,
  ThumbsUp,
  Calendar,
  Download,
  Mail,
  ChevronRight,
  Heart
} from 'lucide-react'

export default function Home() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/20 overflow-x-hidden">

      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-300/10 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-green-300/10 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-200/5 rounded-full blur-[120px]"></div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${15 + Math.random() * 10}s`
              }}
            >
              <div className={`w-3 h-3 ${i % 3 === 0 ? 'bg-emerald-400/30' : i % 3 === 1 ? 'bg-green-400/30' : 'bg-lime-400/30'} rounded-full`}></div>
            </div>
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-200 shadow-lg">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Nền tảng số 1 Việt Nam</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>

              <h1 className="text-5xl lg:text-7xl font-black tracking-tight">
                <span className="block text-slate-900">Kết nối</span>
                <span className="block">
                  <span className="bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-400 bg-clip-text text-transparent">
                    Nông sản Việt
                  </span>
                </span>
                <span className="block text-slate-900">với cả thế giới</span>
              </h1>

              <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
                Nền tảng thương mại điện tử kết nối trực tiếp người sản xuất nông sản với thương lái, 
                nhà phân phối và xuất khẩu trên toàn cầu. 
                <span className="font-semibold text-emerald-700"> Giảm 30% chi phí trung gian.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  to="/register"
                  className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-green-600 transition-all duration-300 shadow-2xl hover:shadow-emerald-500/30 hover:scale-[1.02] flex items-center justify-center gap-3"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="relative">Bắt đầu miễn phí</span>
                  <ArrowRight className="w-5 h-5 relative group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/demo"
                  className="group relative bg-white/90 backdrop-blur-sm text-slate-800 px-8 py-4 rounded-xl font-bold text-lg border-2 border-emerald-200 hover:border-emerald-300 hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                >
                  <Play className="w-5 h-5 text-emerald-600" />
                  <span>Xem video demo</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-6 pt-8">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm text-slate-600">Xác minh bảo mật</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm text-slate-600">Hỗ trợ 24/7</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm text-slate-600">100+ tỉnh thành</span>
                </div>
              </div>
            </div>

            {/* Stats Dashboard */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-white to-emerald-50/50 rounded-3xl p-8 shadow-2xl border border-emerald-100/50 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { icon: <Users className="w-8 h-8 text-emerald-600" />, value: "5,000+", label: "Người bán", color: "emerald" },
                    { icon: <Truck className="w-8 h-8 text-blue-600" />, value: "12,000+", label: "Thương lái", color: "blue" },
                    { icon: <ShoppingBag className="w-8 h-8 text-purple-600" />, value: "50,000+", label: "Giao dịch", color: "purple" },
                    { icon: <Globe className="w-8 h-8 text-orange-600" />, value: "63/63", label: "Tỉnh thành", color: "orange" }
                  ].map((stat, index) => (
                    <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-4">
                        {stat.icon}
                        <TrendingUp className="w-6 h-6 text-green-500" />
                      </div>
                      <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                      <div className="text-sm text-slate-600 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Live Feed */}
                <div className="mt-8 pt-8 border-t border-emerald-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />
                      <span className="font-semibold text-slate-900">Giao dịch đang diễn ra</span>
                    </div>
                    <div className="text-sm text-emerald-600 font-medium">LIVE</div>
                  </div>
                  <div className="space-y-3">
                    {['Lúa giống Đồng Tháp', 'Cà phê Buôn Ma Thuột', 'Thanh long Bình Thuận', 'Vải thiều Lục Ngạn'].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl hover:bg-emerald-50 transition-colors">
                        <span className="text-slate-700">{item}</span>
                        <span className="text-emerald-600 font-semibold">{['12.5', '8.3', '15.2', '7.8'][i]} tấn</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Badges */}
              <div className="absolute -top-6 -right-6">
                <div className="bg-gradient-to-br from-emerald-500 to-green-400 text-white p-4 rounded-2xl shadow-2xl rotate-12 animate-float">
                  <Award className="w-8 h-8" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-50/20 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold">GIÁ TRỊ KHÁC BIỆT</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">
              Tại sao chọn{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
                Nông Sản Connect
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Shield className="w-10 h-10" />,
                title: "Bảo mật tối đa",
                desc: "Xác minh 3 bước, mã hóa dữ liệu giao dịch",
                color: "from-blue-500 to-cyan-400",
                features: ["Xác minh danh tính", "Mã hóa SSL", "Bảo hiểm giao dịch"]
              },
              {
                icon: <TrendingDown className="w-10 h-10" />,
                title: "Giá minh bạch",
                desc: "Công khai biến động giá, không phí ẩn",
                color: "from-emerald-500 to-green-400",
                features: ["So sánh giá real-time", "Không phí ẩn", "Thị trường mở"]
              },
              {
                icon: <Zap className="w-10 h-10" />,
                title: "Tốc độ siêu nhanh",
                desc: "Kết nối trong 5 phút, xử lý tức thì",
                color: "from-purple-500 to-pink-400",
                features: ["Kết nối 5 phút", "Thông báo real-time", "Hỗ trợ 24/7"]
              },
              {
                icon: <Globe className="w-10 h-10" />,
                title: "Toàn cầu hóa",
                desc: "Kết nối thị trường quốc tế",
                color: "from-orange-500 to-amber-400",
                features: ["20+ quốc gia", "Đa ngôn ngữ", "Chuyển đổi tiền tệ"]
              }
            ].map((item, index) => (
              <div key={index} className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border">
                <div className={`bg-gradient-to-br ${item.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-white`}>
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 mb-6">{item.desc}</p>
                <div className="space-y-2">
                  {item.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">
              <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
                4 Bước
              </span>{' '}
              Đơn Giản Để Bắt Đầu
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Quy trình đơn giản, dễ dàng cho mọi đối tượng tham gia
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                icon: "📝",
                title: "Đăng ký tài khoản",
                desc: "Tạo tài khoản miễn phí trong 2 phút"
              },
              {
                step: "02",
                icon: "📦",
                title: "Đăng tin mua/bán",
                desc: "Mô tả chi tiết nông sản của bạn"
              },
              {
                step: "03",
                icon: "🔍",
                title: "Kết nối đối tác",
                desc: "Tìm kiếm và liên hệ trực tiếp"
              },
              {
                step: "04",
                title: "Giao dịch thành công",
                desc: "Thương lượng và hoàn tất giao dịch",
                icon: "🤝"
              }
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white p-8 rounded-2xl shadow-lg border text-center relative">
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-800 font-bold w-8 h-8 rounded-full flex items-center justify-center">
                    {step.step}
                  </div>
                  <h3 className="font-bold text-xl mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">
              Được tin dùng bởi{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
                10,000+
              </span>{' '}
              đối tác
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Anh Nguyễn Văn A",
                role: "Nông dân trồng lúa - Đồng Tháp",
                content: "Từ khi sử dụng nền tảng, tôi không còn phải lo lắng về đầu ra. Giá cả minh bạch, giao dịch nhanh chóng.",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenVanA"
              },
              {
                name: "Chị Trần Thị B",
                role: "Chủ hợp tác xã cà phê - Đắk Lắk",
                content: "Kết nối được với nhiều thương lái lớn, xuất khẩu được ra nước ngoài. Doanh thu tăng 300% chỉ sau 3 tháng.",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=TranThiB"
              },
              {
                name: "Ông Lê Văn C",
                role: "Thương lái - Hà Nội",
                content: "Tiết kiệm được rất nhiều thời gian tìm nguồn hàng. Thông tin minh bạch, chất lượng đảm bảo.",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=LeVanC"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-3xl shadow-xl border group hover:shadow-2xl transition-shadow">
                <div className="flex items-center gap-4 mb-6">
                  <img src={testimonial.avatar} alt={testimonial.name} className="w-16 h-16 rounded-full" />
                  <div>
                    <h4 className="font-bold text-lg">{testimonial.name}</h4>
                    <p className="text-emerald-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-slate-600 italic">"{testimonial.content}"</p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRICING ================= */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">
              Gói dịch vụ{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
                Phù Hợp
              </span>{' '}
              Với Bạn
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Lựa chọn gói dịch vụ phù hợp với quy mô và nhu cầu của bạn
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Cơ Bản",
                price: "0",
                desc: "Dành cho cá nhân bắt đầu",
                features: ["Đăng 5 tin/tháng", "Kết nối cơ bản", "Hỗ trợ qua email", "Xem thông tin liên hệ giới hạn"],
                cta: "Bắt đầu miễn phí",
                popular: false
              },
              {
                name: "Chuyên Nghiệp",
                price: "299.000",
                period: "/tháng",
                desc: "Dành cho hợp tác xã, trang trại",
                features: ["Đăng không giới hạn", "Ưu tiên hiển thị", "Hỗ trợ 24/7", "Quảng cáo cơ bản", "Xuất báo cáo"],
                cta: "Dùng thử 7 ngày",
                popular: true
              },
              {
                name: "Doanh Nghiệp",
                price: "Liên hệ",
                desc: "Dành cho công ty lớn",
                features: ["Tất cả tính năng Pro", "API tích hợp", "Quản trị viên riêng", "Hỗ trợ VIP", "Tùy chỉnh nền tảng"],
                cta: "Liên hệ tư vấn",
                popular: false
              }
            ].map((plan, index) => (
              <div key={index} className={`relative bg-white rounded-3xl p-8 shadow-xl border ${plan.popular ? 'border-emerald-500 ring-2 ring-emerald-500/20' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-1 rounded-full text-sm font-bold">
                    PHỔ BIẾN NHẤT
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-5xl font-black text-slate-900">{plan.price}</span>
                    {plan.period && <span className="text-slate-600 ml-2">{plan.period}</span>}
                  </div>
                  <p className="text-slate-600">{plan.desc}</p>
                </div>
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
                <Link
                  to={plan.name === "Doanh Nghiệp" ? "/contact" : "/register"}
                  className={`block text-center py-4 rounded-xl font-bold ${plan.popular ? 'bg-gradient-to-r from-emerald-600 to-green-500 text-white hover:from-emerald-700 hover:to-green-600' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BLOG/NEWS ================= */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-4">
                Tin tức & Cập nhật
              </h2>
              <p className="text-xl text-slate-600">Cập nhật mới nhất về thị trường nông sản</p>
            </div>
            <Link to="/blog" className="text-emerald-600 font-semibold hover:text-emerald-700 flex items-center gap-2">
              Xem tất cả <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Xu hướng xuất khẩu nông sản 2024",
                excerpt: "Phân tích chi tiết về cơ hội và thách thức trong xuất khẩu nông sản năm 2024...",
                date: "15/12/2023",
                category: "Phân tích",
                readTime: "5 phút"
              },
              {
                title: "Công nghệ AI trong nông nghiệp",
                excerpt: "Ứng dụng trí tuệ nhân tạo trong dự báo giá và quản lý chuỗi cung ứng nông sản...",
                date: "10/12/2023",
                category: "Công nghệ",
                readTime: "4 phút"
              },
              {
                title: "Hướng dẫn đăng bán hiệu quả",
                excerpt: "Bí quyết để bài đăng của bạn thu hút được nhiều thương lái nhất...",
                date: "05/12/2023",
                category: "Hướng dẫn",
                readTime: "3 phút"
              }
            ].map((post, index) => (
              <Link key={index} to={`/blog/${index}`} className="group">
                <div className="bg-white rounded-3xl overflow-hidden shadow-lg border hover:shadow-2xl transition-all duration-300">
                  <div className="h-48 bg-gradient-to-r from-emerald-400 to-green-300"></div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                        {post.category}
                      </span>
                      <span className="text-slate-500 text-sm">{post.date}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-sm">{post.readTime} đọc</span>
                      <ChevronRight className="w-5 h-5 text-emerald-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600"></div>
        
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center text-white px-4">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full mb-8">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold">BẮT ĐẦU HÔM NAY</span>
          </div>
          
          <h2 className="text-5xl lg:text-6xl font-black text-white mb-8">
            Sẵn sàng
            <span className="block">
              <span className="relative inline-block">
                <span className="relative z-10">cách mạng hóa</span>
                <span className="absolute bottom-2 left-0 w-full h-4 bg-white/20 -rotate-1"></span>
              </span>
            </span>
            kinh doanh nông sản?
          </h2>

          <p className="text-xl text-emerald-100 mb-12 max-w-2xl mx-auto">
            Tham gia cùng 10,000+ đối tác đã tăng doanh thu 300% chỉ sau 3 tháng
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              to="/register"
              className="group relative overflow-hidden bg-white text-emerald-700 px-12 py-5 rounded-xl font-black text-xl hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-[1.02] flex items-center justify-center gap-3 min-w-[240px]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-100/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="relative">Đăng ký ngay</span>
              <ArrowRight className="w-6 h-6 relative group-hover:translate-x-2 transition-transform" />
            </Link>

            <Link
              to="/contact-sales"
              className="group bg-transparent border-2 border-white text-white px-12 py-5 rounded-xl font-bold text-xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-3 min-w-[240px]"
            >
              <Phone className="w-5 h-5" />
              <span>Gọi tư vấn VIP</span>
            </Link>
          </div>

          <div className="mt-12 text-emerald-100/80 text-sm">
            <p>✨ Miễn phí đăng ký • Không ràng buộc • Hỗ trợ 24/7</p>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 mb-12">
            <div className="lg:col-span-2">
              <div className="text-3xl font-black mb-4">
                <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                  Nông Sản
                </span>
                <span className="text-white">Connect</span>
              </div>
              <p className="text-slate-400 mb-6 max-w-md">
                Nền tảng kết nối nông sản số 1 Việt Nam, giúp người sản xuất và thương lái gặp nhau trực tiếp, minh bạch và hiệu quả.
              </p>
              <div className="flex gap-4">
                {['Facebook', 'YouTube', 'LinkedIn', 'Zalo'].map((social, i) => (
                  <div key={i} className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors cursor-pointer">
                    <span className="font-bold text-sm">{social[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            {[
              {
                title: "Sản phẩm",
                links: ["Tính năng", "Bảng giá", "API", "Tích hợp", "Demo"]
              },
              {
                title: "Công ty",
                links: ["Về chúng tôi", "Tuyển dụng", "Blog", "Báo chí", "Liên hệ"]
              },
              {
                title: "Hỗ trợ",
                links: ["Trung tâm trợ giúp", "Tài liệu", "Video hướng dẫn", "FAQ", "Cộng đồng"]
              }
            ].map((column, i) => (
              <div key={i}>
                <h4 className="font-bold text-lg mb-6">{column.title}</h4>
                <ul className="space-y-3">
                  {column.links.map((link, j) => (
                    <li key={j}>
                      <Link to={`/${link.toLowerCase().replace(/ /g, '-')}`} className="text-slate-400 hover:text-white transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
            <p>© {new Date().getFullYear()} Nông Sản Connect. Bản quyền thuộc về Công ty Cổ phần Công nghệ Nông Sản Việt.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-6">
              <Link to="/terms" className="hover:text-white transition-colors">Điều khoản sử dụng</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Chính sách bảo mật</Link>
              <Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
              <Link to="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

const Play = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
)