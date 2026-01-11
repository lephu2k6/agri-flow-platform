import { Link } from 'react-router-dom'
import { Package, MapPin, User, Star, Eye, ShoppingCart, Leaf, Truck, Clock, Shield } from 'lucide-react'
import { useState } from 'react'
import React from 'react'

const ProductCard = ({ product, showFarmerInfo = true, viewMode = 'grid' }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount)
  }

  const getImageUrl = () => {
    if (product.product_images && product.product_images.length > 0) {
      const primaryImage = product.product_images.find(img => img.is_primary)
      return primaryImage?.image_url || product.product_images[0]?.image_url
    }
    if (product.images && product.images.length > 0) {
      return product.images[0]
    }
    return 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2070&auto=format&fit=crop'
  }

  const getFarmerRating = () => {
    return product.profiles?.rating || 0
  }

  const getVerificationBadge = () => {
    if (product.profiles?.verification_status === 'verified') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700 font-semibold">
          <Shield size={10} />
          Đã xác minh
        </span>
      )
    }
    return null
  }

  const getQualityBadge = () => {
    if (product.quality_standard === 'organic') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700 font-semibold">
          <Leaf size={10} />
          Hữu cơ
        </span>
      )
    }
    if (product.quality_standard === 'grade_a') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700 font-semibold">
          <Star size={10} />
          Loại A
        </span>
      )
    }
    return null
  }

  // Grid View
  if (viewMode === 'grid') {
    return (
      <Link to={`/products/${product.id}`}>
        <div 
          className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-emerald-100 hover:border-emerald-300 relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Premium Badge */}
          {product.is_featured && (
            <div className="absolute top-3 left-3 z-10">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                Nổi bật
              </div>
            </div>
          )}

          {/* Image Container */}
          <div className="relative h-52 overflow-hidden">
            {/* Loading Skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-sky-50 animate-pulse" />
            )}
            
            {/* Product Image */}
            <img
              src={getImageUrl()}
              alt={product.title}
              className={`w-full h-full object-cover transition-all duration-700 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              } ${isHovered ? 'scale-110' : 'scale-100'}`}
              onLoad={() => setImageLoaded(true)}
            />
            
            {/* Status Badge */}
            <div className="absolute top-3 right-3 z-10">
              {product.status === 'available' ? (
                <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  Đang bán
                </span>
              ) : (
                <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  Hết hàng
                </span>
              )}
            </div>
            
            {/* Quick Actions Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-transparent flex items-end justify-center transition-opacity duration-500 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              <div className="w-full p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <button className="w-full py-3 bg-white/90 backdrop-blur-sm rounded-xl font-bold text-emerald-700 flex items-center justify-center gap-2 shadow-lg hover:bg-white transition-all hover:scale-105">
                  <Eye size={18} />
                  Xem chi tiết
                </button>
              </div>
            </div>

            {/* Harvest Time Badge */}
            {product.harvest_date && (
              <div className="absolute bottom-3 left-3">
                <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-medium text-gray-700">
                  <Clock size={10} />
                  {new Date(product.harvest_date).toLocaleDateString('vi-VN')}
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Title & Category */}
            <div className="mb-3">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-emerald-600 transition-colors">
                  {product.title}
                </h3>
                {getQualityBadge()}
              </div>
              {product.categories?.name && (
                <p className="text-sm text-emerald-500 font-medium mt-1 flex items-center gap-1">
                  <Leaf size={12} />
                  {product.categories.name}
                </p>
              )}
            </div>

            {/* Price & Quantity */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-2xl font-black text-emerald-600">
                  {formatCurrency(product.price_per_unit)}
                  <span className="text-sm font-normal text-gray-500">/{product.unit}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full">
                <Package size={16} className="text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">
                  {product.quantity} {product.unit}
                </span>
              </div>
            </div>

            {/* Location & Shipping */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={16} className="text-emerald-500" />
                <span className="text-sm font-medium">{product.province}</span>
              </div>
              <div className="flex items-center gap-1 text-xs bg-sky-50 text-sky-600 px-2 py-1 rounded-full">
                <Truck size={12} />
                <span>Miễn phí vận chuyển</span>
              </div>
            </div>

            {/* Farmer Info */}
            {showFarmerInfo && product.profiles && (
              <div className="pt-4 border-t border-emerald-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center text-emerald-600 font-bold text-sm">
                        {product.profiles.full_name?.charAt(0).toUpperCase() || 'N'}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">
                        {product.profiles.full_name}
                      </div>
                      {getVerificationBadge()}
                    </div>
                  </div>
                  
                  {getFarmerRating() > 0 && (
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-amber-500 fill-current" />
                      <span className="text-sm font-bold text-gray-800">
                        {getFarmerRating().toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500">({product.profiles.review_count || 0})</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Hover Effect Border */}
          <div className={`absolute inset-0 rounded-2xl border-2 border-emerald-300 pointer-events-none transition-opacity duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}></div>
        </div>
      </Link>
    )
  }

  // List View
  return (
    <Link to={`/products/${product.id}`}>
      <div 
        className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-emerald-100 hover:border-emerald-300 p-5"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col md:flex-row gap-5">
          {/* Image */}
          <div className="md:w-56 shrink-0">
            <div className="relative h-48 md:h-full rounded-xl overflow-hidden">
              <img
                src={getImageUrl()}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Status Badge */}
              {product.status === 'available' && (
                <div className="absolute top-3 right-3">
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    Đang bán
                  </div>
                </div>
              )}

              {/* Premium Badge */}
              {product.is_featured && (
                <div className="absolute top-3 left-3">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    Nổi bật
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                      {product.title}
                    </h3>
                    {product.categories?.name && (
                      <p className="text-sm text-emerald-500 font-medium mt-1 flex items-center gap-1">
                        <Leaf size={12} />
                        {product.categories.name}
                      </p>
                    )}
                  </div>
                  {getQualityBadge()}
                </div>
                
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={16} className="text-emerald-500" />
                    <span className="text-sm font-medium">{product.province}</span>
                  </div>
                  {product.harvest_date && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock size={14} />
                      {new Date(product.harvest_date).toLocaleDateString('vi-VN')}
                    </div>
                  )}
                </div>
                
                <p className="text-gray-700 line-clamp-2 mb-4">
                  {product.description}
                </p>
              </div>

              <div className="md:text-right">
                <div className="text-2xl font-black text-emerald-600 mb-1">
                  {formatCurrency(product.price_per_unit)}
                  <span className="text-sm font-normal text-gray-500">/{product.unit}</span>
                </div>
                <div className="flex items-center justify-end gap-2 text-emerald-700 mb-3">
                  <Package size={16} />
                  <span className="text-sm font-medium">Còn: {product.quantity} {product.unit}</span>
                </div>
                <div className="flex items-center justify-end gap-1 text-sm text-sky-600 mb-4">
                  <Truck size={14} />
                  <span>Miễn phí vận chuyển</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pt-4 border-t border-emerald-50">
              <div className="flex items-center gap-3 mb-3 md:mb-0">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center text-emerald-600 font-bold">
                    {product.profiles?.full_name?.charAt(0).toUpperCase() || 'N'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <div className="font-bold text-gray-800">
                    {product.profiles?.full_name}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {getVerificationBadge()}
                    {getFarmerRating() > 0 && (
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-amber-500 fill-current" />
                        <span className="text-xs font-bold text-gray-800">
                          {getFarmerRating().toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">({product.profiles.review_count || 0})</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl group-hover:scale-105">
                  <ShoppingCart size={18} />
                  Xem chi tiết
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard