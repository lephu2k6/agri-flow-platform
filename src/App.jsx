import React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "./contexts/AuthContext"
import ProtectedRoute from "./components/common/ProtectedRoute"
import Header from "./components/common/Header"

// Core Pages
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Profile from "./pages/Profile"
import NotFound from "./pages/NotFound"

// Farmer Pages
import Dashboard from "./pages/farmer/Dashboard"
import FarmerProducts from "./pages/farmer/Products"
import CreateProduct from "./pages/farmer/CreateProduct"
import EditProduct from "./pages/farmer/EditProduct"
import FarmerProductDetail from "./pages/farmer/ProductDetail"
import FarmerOrders from "./pages/farmer/Orders" // Mở comment này

// Buyer Pages (Thêm mới)
import MyOrders from "./pages/buyer/MyOrders"
import BuyerOrderDetail from "./pages/buyer/OrderDetail"

// Public Pages
import PublicProducts from "./pages/products/Product"
import PublicProductDetail from "./pages/products/ProductDetail"

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Header />
          
          <main className="flex-1">
            <Routes>
              {/* ================= PUBLIC ROUTES ================= */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Chợ nông sản công khai */}
              <Route path="/products" element={<PublicProducts />} />
              <Route path="/products/:id" element={<PublicProductDetail />} />
              
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
              
              {/* Redirects */}
              <Route path="/dashboard" element={<Navigate to="/farmer/dashboard" replace />} />
              <Route path="/sell" element={<Navigate to="/farmer/products/create" replace />} />
              
              {/* 404 NOT FOUND */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          
          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App