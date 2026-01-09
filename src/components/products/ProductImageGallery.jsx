import { useState } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'

const ProductImageGallery = ({ images }) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const goToPrevious = () => {
    setSelectedIndex(prev => prev === 0 ? images.length - 1 : prev - 1)
  }

  const goToNext = () => {
    setSelectedIndex(prev => prev === images.length - 1 ? 0 : prev + 1)
  }

  if (!images || images.length === 0) return null

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative bg-gray-100 rounded-xl overflow-hidden">
        <div className="aspect-w-4 aspect-h-3">
          <img
            src={images[selectedIndex].url}
            alt={`Product image ${selectedIndex + 1}`}
            className="object-cover w-full h-full"
          />
        </div>
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
        
        {/* Primary Badge */}
        {images[selectedIndex].isPrimary && (
          <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center">
            <Star size={14} className="mr-1" />
            Ảnh chính
          </div>
        )}
        
        {/* Image Counter */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
          {selectedIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                selectedIndex === index
                  ? 'border-green-500 ring-2 ring-green-200'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <div className="aspect-w-1 aspect-h-1">
                <img
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              </div>
              {image.isPrimary && (
                <div className="absolute top-1 right-1">
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
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