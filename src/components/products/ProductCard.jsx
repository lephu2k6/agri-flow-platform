import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, MapPin, Star, ShoppingCart, Leaf, Truck, Clock, Shield } from 'lucide-react'

const ProductCard = ({ product, showFarmerInfo = true, viewMode = 'grid' }) => {
  const [imageLoaded, setImageLoaded] = useState(false)

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN').format(amount || 0)

  const getImageUrl = () => {
    if (product.product_images && product.product_images.length > 0) {
      const primaryImage = product.product_images.find(img => img.is_primary)
      return primaryImage?.image_url || product.product_images[0]?.image_url
    }
    if (product.images && product.images.length > 0) {
      const primaryImage = product.images.find(img => img.isPrimary)
      return primaryImage?.url || product.images[0]?.url || product.images[0]
    }
    return 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&auto=format&fit=crop'
  }

  const getVerificationBadge = () => {
    if (product.profiles?.verification_status === 'verified') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
          <Shield size={11} /> Đã xác minh
        </span>
      )
    }
    return null
  }

  const getQualityBadge = () => {
    if (product.quality_standard === 'organic') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
          <Leaf size={11} /> Hữu cơ
        </span>
      )
    }
    if (product.quality_standard === 'grade_a') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
          <Star size={11} /> Loại A
        </span>
      )
    }
    return null
  }

  if (viewMode === 'list') {
    return (
      <Link to={`/products/${product.id}`} className="market-panel block overflow-hidden transition hover:border-emerald-200 hover:shadow-md">
        <div className="flex flex-col md:flex-row">
          <ProductImage src={getImageUrl()} title={product.title} imageLoaded={imageLoaded} setImageLoaded={setImageLoaded} className="h-52 md:h-auto md:w-64" />

          <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {product.categories?.name && <CategoryLabel name={product.categories.name} />}
                {getQualityBadge()}
              </div>
              <h3 className="line-clamp-2 text-lg font-black text-gray-900 group-hover:text-emerald-700">{product.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-gray-500">{product.description}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-gray-600">
                <Meta icon={MapPin}>{product.province || 'Chưa cập nhật'}</Meta>
                {product.harvest_date && <Meta icon={Clock}>{new Date(product.harvest_date).toLocaleDateString('vi-VN')}</Meta>}
                <Meta icon={Truck}>Hệ thống gợi ý</Meta>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-4 border-t border-gray-100 pt-4 sm:flex-row sm:items-end sm:justify-between">
              <FarmerInfo product={product} showFarmerInfo={showFarmerInfo} badge={getVerificationBadge()} />
              <div className="sm:text-right">
                <Price product={product} formatCurrency={formatCurrency} />
                <button className="market-button mt-3 h-9 px-4 text-sm">
                  <ShoppingCart size={16} /> Xem chi tiết
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link to={`/products/${product.id}`} className="market-panel group block overflow-hidden transition hover:border-emerald-200 hover:shadow-md">
      <ProductImage src={getImageUrl()} title={product.title} imageLoaded={imageLoaded} setImageLoaded={setImageLoaded} className="h-48" />

      <div className="p-4">
        <div className="mb-2 flex min-h-6 flex-wrap items-center gap-2">
          {product.categories?.name && <CategoryLabel name={product.categories.name} />}
          {getQualityBadge()}
        </div>

        <h3 className="line-clamp-2 min-h-11 text-base font-black leading-snug text-gray-900 group-hover:text-emerald-700">
          {product.title}
        </h3>

        <div className="mt-3">
          <Price product={product} formatCurrency={formatCurrency} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold text-gray-500">
          <Meta icon={MapPin}>{product.province || 'N/A'}</Meta>
          <Meta icon={Package}>{product.quantity || 0} {product.unit}</Meta>
        </div>

        <div className="mt-4 border-t border-gray-100 pt-3">
          <FarmerInfo product={product} showFarmerInfo={showFarmerInfo} badge={getVerificationBadge()} compact />
        </div>
      </div>
    </Link>
  )
}

const ProductImage = ({ src, title, imageLoaded, setImageLoaded, className }) => (
  <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
    {!imageLoaded && <div className="absolute inset-0 animate-pulse bg-gray-100" />}
    <img
      src={src}
      alt={title}
      className={`h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
      onLoad={() => setImageLoaded(true)}
    />
    <div className="absolute right-3 top-3">
      <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-black uppercase text-white shadow-sm">
        Đang bán
      </span>
    </div>
  </div>
)

const CategoryLabel = ({ name }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-bold text-gray-600">
    <Leaf size={11} /> {name}
  </span>
)

const Price = ({ product, formatCurrency }) => (
  <div>
    <span className="text-xl font-black text-emerald-600">{formatCurrency(product.price_per_unit)}</span>
    <span className="ml-1 text-xs font-semibold text-gray-400">đ/{product.unit}</span>
  </div>
)

const Meta = ({ icon: Icon, children }) => (
  <span className="flex min-w-0 items-center gap-1.5">
    <Icon size={13} className="shrink-0 text-emerald-500" />
    <span className="truncate">{children}</span>
  </span>
)

const FarmerInfo = ({ product, showFarmerInfo, badge, compact = false }) => {
  if (!showFarmerInfo || !product.profiles) return null

  return (
    <div className="flex min-w-0 items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-black text-emerald-700">
          {product.profiles.full_name?.charAt(0).toUpperCase() || 'N'}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-gray-800">{product.profiles.full_name}</p>
          {!compact && badge}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-black text-gray-700">
        <Star size={12} className="fill-amber-400 text-amber-400" />
        {product.average_rating > 0 ? Number(product.average_rating).toFixed(1) : '5.0'}
      </div>
    </div>
  )
}

export default ProductCard
