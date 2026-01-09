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
import Orders from "./pages/farmer/Orders"


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

              <Route
                path="/farmer/orders"
                element={
                  <ProtectedRoute allowedRoles={["farmer"]}>
                    <Orders />
                  </ProtectedRoute>
                }
              />

              
            </Routes>
          </main>

          <Toaster position="top-right" />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
