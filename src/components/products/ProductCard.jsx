import { Link } from 'react-router-dom'
import { Package, MapPin, User, Star, Eye, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import React from 'react'
const ProductCard = ({ product, showFarmerInfo = true, viewMode = 'grid' }) => {
  const [imageLoaded, setImageLoaded] = useState(false)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount)
  }

  const getImageUrl = () => {
    // Try product_images first
    if (product.product_images && product.product_images.length > 0) {
      const primaryImage = product.product_images.find(img => img.is_primary)
      return primaryImage?.image_url || product.product_images[0]?.image_url
    }
    // Fallback to images array
    if (product.images && product.images.length > 0) {
      return product.images[0]
    }
    return 'https://via.placeholder.com/300x200?text=Agri-Flow'
  }

  const getFarmerRating = () => {
    return product.profiles?.rating || 0
  }

  const getVerificationBadge = () => {
    if (product.profiles?.verification_status === 'verified') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
          ✓ Đã xác minh
        </span>
      )
    }
    return null
  }

  // Grid View
  if (viewMode === 'grid') {
    return (
      <Link to={`/products/${product.id}`}>
        <div className="bg-white rounded-xl shadow hover:shadow-xl transition-all duration-300 overflow-hidden group">
          {/* Image Container */}
          <div className="relative h-48 overflow-hidden">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            <img
              src={getImageUrl()}
              alt={product.title}
              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
            
            {/* Status Badge */}
            <div className="absolute top-2 right-2">
              {product.status === 'available' ? (
                <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                  Đang bán
                </span>
              ) : (
                <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs font-medium">
                  Hết hàng
                </span>
              )}
            </div>
            
            {/* Quick Actions */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button className="bg-white p-2 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <Eye size={20} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Title & Category */}
            <div className="mb-2">
              <h3 className="font-semibold text-gray-900 truncate group-hover:text-green-600 transition-colors">
                {product.title}
              </h3>
              {product.categories?.name && (
                <p className="text-sm text-gray-500">{product.categories.name}</p>
              )}
            </div>

            {/* Price & Quantity */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(product.price_per_unit)}/{product.unit}
                </span>
              </div>
              <div className="flex items-center text-gray-600">
                <Package size={16} className="mr-1" />
                <span>{product.quantity} {product.unit}</span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center text-gray-600 mb-3">
              <MapPin size={16} className="mr-2 shrink-0" />
              <span className="truncate">{product.province}</span>
            </div>

            {/* Farmer Info */}
            {showFarmerInfo && product.profiles && (
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User size={14} className="mr-2 text-gray-400" />
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        {product.profiles.full_name}
                      </span>
                      {getVerificationBadge()}
                    </div>
                  </div>
                  {getFarmerRating() > 0 && (
                    <div className="flex items-center">
                      <Star size={14} className="text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">
                        {getFarmerRating().toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quality Badge */}
            {product.quality_standard && (
              <div className="mt-3">
                <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                  {product.quality_standard}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    )
  }

  // List View
  return (
    <Link to={`/products/${product.id}`}>
      <div className="p-4 hover:bg-gray-50 transition-colors">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Image */}
          <div className="md:w-48 shrink-0">
            <div className="relative h-40 md:h-full rounded-lg overflow-hidden">
              <img
                src={getImageUrl()}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              {product.status === 'available' && (
                <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs">
                  Đang bán
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {product.title}
                </h3>
                {product.categories?.name && (
                  <p className="text-sm text-gray-500 mb-2">{product.categories.name}</p>
                )}
                
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin size={16} className="mr-2" />
                  <span>{product.province}</span>
                </div>
                
                <p className="text-gray-700 line-clamp-2 mb-3">
                  {product.description}
                </p>
              </div>

              <div className="md:text-right">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {formatCurrency(product.price_per_unit)}/{product.unit}
                </div>
                <div className="flex items-center justify-end text-gray-600 mb-2">
                  <Package size={16} className="mr-1" />
                  <span>Còn: {product.quantity} {product.unit}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col md:flex-row md:items-center justify-between pt-3 border-t">
              <div className="flex items-center mb-2 md:mb-0">
                <User size={16} className="mr-2 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">
                  {product.profiles?.full_name}
                </span>
                {getVerificationBadge()}
                {getFarmerRating() > 0 && (
                  <div className="flex items-center ml-3">
                    <Star size={14} className="text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">
                      {getFarmerRating().toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {product.quality_standard && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                    {product.quality_standard}
                  </span>
                )}
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
                  <ShoppingCart size={16} className="mr-2" />
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