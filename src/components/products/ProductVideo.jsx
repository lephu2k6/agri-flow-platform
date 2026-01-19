import React from 'react'
import { Video, Play } from 'lucide-react'

const ProductVideo = ({ videoUrl, title = 'Video sản phẩm' }) => {
  if (!videoUrl) return null

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
      <div className="p-6 border-b border-emerald-50">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Video className="text-emerald-600" size={20} />
          {title}
        </h3>
      </div>
      
      <div className="relative bg-black">
        <video
          src={videoUrl}
          controls
          className="w-full h-auto max-h-[600px]"
          poster={null}
          preload="metadata"
        >
          Trình duyệt của bạn không hỗ trợ video.
        </video>
      </div>
    </div>
  )
}

export default ProductVideo
