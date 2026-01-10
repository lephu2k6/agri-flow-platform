import { Filter, X, RotateCcw } from 'lucide-react'
import React from 'react'

const ProductFilterSidebar = ({
  filters,
  onFilterChange,
  provinces = [],
  categories = [], // Mảng các object {id, name}
  onApply,
  onClear,
}) => {
  // Kiểm tra xem có bộ lọc nào đang hoạt động không để hiện nút Xóa nhanh
  const isFilterActive = filters.category_id || filters.province || filters.minPrice || filters.maxPrice

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Filter className="mr-2 text-green-600" size={20} />
          Bộ lọc
        </h3>
        {isFilterActive && (
          <button
            onClick={onClear}
            className="p-1.5 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
            title="Xóa tất cả"
          >
            <RotateCcw size={16} />
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Category Filter - ĐÃ FIX LỖI KEY & RENDER OBJECT */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3 text-sm">Danh mục sản phẩm</h4>
          <select
            value={filters.category_id || ''}
            onChange={(e) => onFilterChange('category_id', e.target.value)}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} {/* Fix: Render name thay vì render cả object */}
              </option>
            ))}
          </select>
        </div>

        {/* Province Filter */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3 text-sm">Khu vực</h4>
          <select
            value={filters.province || ''}
            onChange={(e) => onFilterChange('province', e.target.value)}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"
          >
            <option value="">Tất cả tỉnh thành</option>
            {provinces.map((prov, idx) => (
              <option key={idx} value={prov}>
                {prov}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3 text-sm">Khoảng giá (VND)</h4>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Từ"
                value={filters.minPrice || ''}
                onChange={(e) => onFilterChange('minPrice', e.target.value)}
                className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                placeholder="Đến"
                value={filters.maxPrice || ''}
                onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                className="w-full p-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t space-y-3">
          <button
            onClick={onApply}
            className="w-full py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-sm transition-all"
          >
            Áp dụng
          </button>
          {isFilterActive && (
            <button
              onClick={onClear}
              className="w-full py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
            >
              Thiết lập lại
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductFilterSidebar