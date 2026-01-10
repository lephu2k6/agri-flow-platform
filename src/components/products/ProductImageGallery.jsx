import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'

const ProductImageGallery = ({ images }) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  // 1. Kiểm tra dữ liệu đầu vào
  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400 border-2 border-dashed">
        <span className="text-sm">Không có hình ảnh cho sản phẩm này</span>
      </div>
    )
  }

  const goToPrevious = () => {
    setSelectedIndex(prev => prev === 0 ? images.length - 1 : prev - 1)
  }

  const goToNext = () => {
    setSelectedIndex(prev => prev === images.length - 1 ? 0 : prev + 1)
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative bg-white rounded-xl overflow-hidden aspect-square border shadow-sm">
        <img
          // Đảm bảo dùng đúng key từ database (image_url)
          src={images[selectedIndex]?.image_url}
          alt={`Product image ${selectedIndex + 1}`}
          className="object-contain w-full h-full transition-all duration-500 ease-in-out"
          // Dự phòng nếu link ảnh chết
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400?text=Image+Error';
          }}
        />
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 hover:opacity-100 transition-opacity">
            <button
              onClick={goToPrevious}
              className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg text-gray-800 transition-transform hover:scale-110"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={goToNext}
              className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg text-gray-800 transition-transform hover:scale-110"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}
        
        {/* Primary Badge */}
        {images[selectedIndex]?.is_primary && (
          <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center shadow-md">
            <Star size={10} className="mr-1 fill-current" />
            Ảnh chính
          </div>
        )}
        
        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded text-[10px]">
          {selectedIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {images.map((image, index) => (
            <button
              key={image.id || index}
              onClick={() => setSelectedIndex(index)}
              className={`relative w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                selectedIndex === index
                  ? 'border-green-500 ring-2 ring-green-100 scale-105'
                  : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={image.image_url}
                alt={`Thumbnail ${index + 1}`}
                className="object-cover w-full h-full"
              />
              {image.is_primary && (
                <div className="absolute top-0.5 right-0.5">
                  <Star className="h-2 w-2 text-yellow-500 fill-current" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductImageGallery