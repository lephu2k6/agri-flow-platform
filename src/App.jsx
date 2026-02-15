import React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "./contexts/AuthContext"
import { CartProvider } from "./contexts/CartContext"
import { NotificationProvider } from "./contexts/NotificationContext"
import { ChatProvider } from "./contexts/ChatContext"
import { useAuth } from "./hooks/useAuth"
import ProtectedRoute from "./components/common/ProtectedRoute"
import Header from "./components/common/Header"

// Core Pages
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Profile from "./pages/Profile"
import NotFound from "./pages/NotFound"
import Cart from "./pages/Cart"

// Farmer Pages
import Dashboard from "./pages/farmer/Dashboard"
import FarmerProducts from "./pages/farmer/Products"
import CreateProduct from "./pages/farmer/CreateProduct"
import EditProduct from "./pages/farmer/EditProduct"
import FarmerProductDetail from "./pages/farmer/ProductDetail"
import FarmerOrders from "./pages/farmer/Orders"
import Inventory from "./pages/farmer/Inventory"

// Buyer Pages (Thêm mới)
import MyOrders from "./pages/buyer/MyOrders"
import BuyerOrderDetail from "./pages/buyer/OrderDetail"

// Public Pages
import PublicProducts from "./pages/products/Product"
import PublicProductDetail from "./pages/products/ProductDetail"
import Wishlist from "./pages/Wishlist"
import Chat from "./pages/Chat"

// Admin Pages (Thêm mới)
import AdminLayout from "./layouts/AdminLayout"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminUsers from "./pages/admin/AdminUsers"
import AdminProducts from "./pages/admin/AdminProducts"
import AdminOrders from "./pages/admin/AdminOrders"
import AdminCMS from "./pages/admin/AdminCMS"

import AIChatBot from "./components/ai/AIChatBot"

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <ChatProvider>
              <AppContent />
              <Toaster position="top-right" />
            </ChatProvider>
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  )
}

function AppContent() {
  const { pathname } = useLocation();
  const { profile, loading, user } = useAuth();
  const isAdminPage = pathname.startsWith('/admin');

  // Tự động điều hướng nếu đã login và vào trang chủ
  if (!loading && user && profile && pathname === '/') {
    if (profile.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (profile.role === 'farmer') return <Navigate to="/farmer/dashboard" replace />;
    // Buyer có thể giữ ở trang chủ hoặc vào /products tùy ý, ở đây giữ nguyên hoặc redirect
    return <Navigate to="/products" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {!isAdminPage && <Header />}
      {!isAdminPage && <AIChatBot />}

      <main className={isAdminPage ? "" : "flex-1"}>
        <Routes>
          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/" replace /> : <Register />}
          />

          {/* Chợ nông sản công khai */}
          <Route path="/products" element={<PublicProducts />} />
          <Route path="/products/:id" element={<PublicProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />

          {/* ================= BUYER PROTECTED ROUTES ================= */}
          <Route
            path="/buyer/orders"
            element={
              <ProtectedRoute allowedRoles={["buyer", "farmer"]}>
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer/orders/:id"
            element={
              <ProtectedRoute allowedRoles={["buyer", "farmer"]}>
                <BuyerOrderDetail />
              </ProtectedRoute>
            }
          />

          {/* ================= COMMON PROTECTED ROUTES ================= */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* ================= FARMER ROUTES ================= */}
          <Route
            path="/farmer"
            element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <Navigate to="/farmer/dashboard" replace />
              </ProtectedRoute>
            }
          />

          <Route
            path="/farmer/dashboard"
            element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/farmer/products"
            element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <FarmerProducts />
              </ProtectedRoute>
            }
          />

          <Route
            path="/farmer/products/create"
            element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <CreateProduct />
              </ProtectedRoute>
            }
          />

          <Route
            path="/farmer/products/:id"
            element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <FarmerProductDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/farmer/products/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <EditProduct />
              </ProtectedRoute>
            }
          />

          <Route
            path="/farmer/orders"
            element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <FarmerOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/farmer/inventory"
            element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <Inventory />
              </ProtectedRoute>
            }
          />

          {/* ================= ADMIN ROUTES ================= */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <Routes>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="cms" element={<AdminCMS />} />
                    <Route path="reports" element={<div className="p-8 text-center font-bold text-gray-400">Tính năng Báo cáo đang phát triển...</div>} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Redirects */}
          <Route path="/dashboard" element={<Navigate to="/farmer/dashboard" replace />} />
          <Route path="/sell" element={<Navigate to="/farmer/products/create" replace />} />

          {/* 404 NOT FOUND */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}

export default App