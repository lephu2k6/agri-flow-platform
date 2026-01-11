# 🌾 AGRI-FLOW - Dòng Chảy Nông Sản

**AGRI-FLOW** là nền tảng số kết nối giao dịch & logistics nông sản tại Việt Nam, giúp nông dân, hợp tác xã, doanh nghiệp thu mua và đơn vị vận chuyển tương tác trực tiếp, minh bạch và hiệu quả.

---

## 🖼️ Demo giao diện dự án

### Trang chủ
![Trang chủ]
<img width="1616" height="931" alt="image" src="https://github.com/user-attachments/assets/16786f83-a2d0-47c6-8436-73cc74a32483" />
### Dashboard nông dân
![Dashboard Farmer](./assets/screenshots/dashboard_farmer.png)

### Danh sách sản phẩm
![Products List](./assets/screenshots/products_list.png)

### Tạo đơn hàng
![Create Order](./assets/screenshots/create_order.png)

### Tin nhắn trao đổi
![Chat Messages](./assets/screenshots/messages.png)

> Bạn có thể dùng GIF nếu muốn trình bày animation tương tác:
> 
> ![Demo GIF](./assets/screenshots/demo.gif)

---

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

