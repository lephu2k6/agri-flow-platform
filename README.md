# 🌾 AGRI-FLOW - Dòng Chảy Nông Sản
**AGRI-FLOW** là nền tảng số kết nối giao dịch & logistics nông sản tại Việt Nam, giúp nông dân, hợp tác xã, doanh nghiệp thu mua và đơn vị vận chuyển tương tác trực tiếp, minh bạch và hiệu quả.

---

## 🖼️ Demo giao diện dự án

### Trang chủ
<img width="1616" height="931" alt="image" src="https://github.com/user-attachments/assets/16786f83-a2d0-47c6-8436-73cc74a32483" />
### Login
<img width="1562" height="861" alt="image" src="https://github.com/user-attachments/assets/4438020a-d3a1-41d2-90bd-5771c327e076" />
### Register
<img width="1580" height="867" alt="image" src="https://github.com/user-attachments/assets/ffd50e25-f8f9-4994-89c4-c79fc63b8080" />
### Dashboard nông dân
<img width="1573" height="928" alt="image" src="https://github.com/user-attachments/assets/9c1c9927-8282-4e5f-80f6-286b137dfe8e" />
### Danh sách sản phẩm
<img width="1107" height="772" alt="image" src="https://github.com/user-attachments/assets/38fc0b9a-92ed-49b5-9c73-b2c9d7ebee6b" />


## 🚀 Tính năng MVP
- **Người dùng & Auth:** Đăng ký / Đăng nhập / Quản lý tài khoản (roles: farmer, buyer, admin)
- **Sản phẩm & Danh mục:** CRUD sản phẩm, upload ảnh, phân loại
- **Đơn hàng:** Tạo đơn, theo dõi trạng thái
- **Tin nhắn:** Trao đổi trực tiếp theo đơn hàng
- **Dashboard:** Quản lý sản phẩm, đơn hàng, hồ sơ cá nhân

---

## ⚙️ Công nghệ sử dụng

- Frontend: ReactJS + TailwindCSS
- Backend & DB: Supabase (PostgreSQL + Auth + Storage)
- Routing: react-router-dom
- Icons: lucide-react
- Notifications: react-hot-toast

---

## 📦 Cài đặt & Chạy

```bash
git clone https://github.com/<username>/agri-flow.git
cd agri-flow
npm install
Tạo .env:

env
Sao chép mã
VITE_SUPABASE_URL=<your_supabase_url>
VITE_SUPABASE_ANON_KEY=<your_anon_key>
Chạy dự án:

bash
npm run dev
Truy cập: http://localhost:5173

