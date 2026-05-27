import { Filter, RotateCcw, SlidersHorizontal } from 'lucide-react'
import React from 'react'

const ProductFilterSidebar = ({
  filters,
  onFilterChange,
  provinces = [],
  categories = [],
  onApply,
  onClear,
}) => {
  const isFilterActive = filters.category_id || filters.province || filters.minPrice || filters.maxPrice

  return (
    <div className="market-panel sticky top-28 overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-50 text-emerald-600">
            <SlidersHorizontal size={18} />
          </div>
          <div>
            <h3 className="font-black text-gray-900">Bộ lọc</h3>
            <p className="text-xs font-semibold text-gray-500">Thu hẹp kết quả</p>
          </div>
        </div>
        {isFilterActive && (
          <button
            onClick={onClear}
            className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-emerald-600"
            title="Xóa tất cả"
          >
            <RotateCcw size={16} />
          </button>
        )}
      </div>

      <div className="space-y-5 p-4">
        <FilterGroup title="Danh mục sản phẩm">
          <select
            value={filters.category_id || ''}
            onChange={(e) => onFilterChange('category_id', e.target.value)}
            className="market-input h-10 w-full px-3 text-sm"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </FilterGroup>

        <FilterGroup title="Khu vực">
          <select
            value={filters.province || ''}
            onChange={(e) => onFilterChange('province', e.target.value)}
            className="market-input h-10 w-full px-3 text-sm"
          >
            <option value="">Tất cả tỉnh thành</option>
            {provinces.map((prov, idx) => (
              <option key={idx} value={prov}>{prov}</option>
            ))}
          </select>
        </FilterGroup>

        <FilterGroup title="Khoảng giá (VND)">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <input
              type="number"
              placeholder="Từ"
              value={filters.minPrice || ''}
              onChange={(e) => onFilterChange('minPrice', e.target.value)}
              className="market-input h-10 min-w-0 px-3 text-sm"
            />
            <span className="text-gray-300">-</span>
            <input
              type="number"
              placeholder="Đến"
              value={filters.maxPrice || ''}
              onChange={(e) => onFilterChange('maxPrice', e.target.value)}
              className="market-input h-10 min-w-0 px-3 text-sm"
            />
          </div>
        </FilterGroup>

        <div className="border-t border-gray-100 pt-4">
          <button onClick={onApply} className="market-button h-10 w-full text-sm">
            <Filter size={16} /> Áp dụng
          </button>
          {isFilterActive && (
            <button
              onClick={onClear}
              className="mt-2 h-9 w-full rounded-md text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-emerald-700"
            >
              Thiết lập lại
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const FilterGroup = ({ title, children }) => (
  <div>
    <h4 className="mb-2 text-xs font-black uppercase tracking-wide text-gray-500">{title}</h4>
    {children}
  </div>
)

export default ProductFilterSidebar
