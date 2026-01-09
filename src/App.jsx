import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "./contexts/AuthContext"
import ProtectedRoute from "./components/common/ProtectedRoute"
import Header from "./components/common/Header"

// Pages
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"

// Farmer pages
import Dashboard from "./pages/farmer/Dashboard"
import Products from "./pages/farmer/Products"
import CreateProduct from "./pages/farmer/CreateProduct"
import EditProduct from "./pages/farmer/EditProduct"  // NEW
import ProductDetail from "./pages/farmer/ProductDetail"  // NEW
import Orders from "./pages/farmer/Orders"

// Public product pages
// import PublicProducts from "./pages/products/Products"  // NEW
// import PublicProductDetail from "./pages/products/ProductDetail"  // NEW

// Common
import NotFound from "./pages/NotFound"  // NEW
import Profile from "./pages/Profile"  // NEW

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Header />

          <main className="flex-1">
            <Routes>
              {/* PUBLIC ROUTES */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* PUBLIC PRODUCT ROUTES */}
              {/* <Route path="/products" element={<PublicProducts />} />
              <Route path="/products/:id" element={<PublicProductDetail />} /> */}
              
              {/* USER PROFILE */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* FARMER ROUTES */}
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
                    <Products />
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

              {/* NEW FARMER PRODUCT ROUTES */}
              <Route
                path="/farmer/products/:id"
                element={
                  <ProtectedRoute allowedRoles={["farmer"]}>
                    <ProductDetail />
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
                    <Orders />
                  </ProtectedRoute>
                }
              />

              {/* BUYER ROUTES (Add if needed) */}
              {/* <Route
                path="/buyer/orders"
                element={
                  <ProtectedRoute allowedRoles={["buyer"]}>
                    <BuyerOrders />
                  </ProtectedRoute>
                }
              /> */}

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