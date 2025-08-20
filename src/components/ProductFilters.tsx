'use client';

import { useState } from 'react';
import { Salon, ProductFilters as IProductFilters, SortOption } from '@/types/product';

interface ProductFiltersProps {
  salons: Salon[];
  filters: IProductFilters;
  onFiltersChange: (filters: IProductFilters) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const sortOptions: SortOption[] = [
  { key: 'newest', label: 'Newest First', value: 'newest' },
  { key: 'price_asc', label: 'Price: Low to High', value: 'price_asc' },
  { key: 'price_desc', label: 'Price: High to Low', value: 'price_desc' },
  { key: 'highest_discount', label: 'Highest Discount', value: 'highest_discount' },
];

export const ProductFilters = ({ 
  salons, 
  filters, 
  onFiltersChange, 
  sortBy, 
  onSortChange 
}: ProductFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof IProductFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' ? undefined : value,
    });
  };

  const handleReset = () => {
    onFiltersChange({});
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search products..."
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Sort Dropdown */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sort By
        </label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {sortOptions.map((option) => (
            <option key={option.key} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Expandable Filters */}
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 mb-2"
        >
          Advanced Filters
          <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Salon Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salon
              </label>
              <select
                value={filters.salon_id || ''}
                onChange={(e) => handleFilterChange('salon_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Salons</option>
                {salons.map((salon) => (
                  <option key={salon.id} value={salon.id}>
                    {salon.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Price ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.min_price || ''}
                onChange={(e) => handleFilterChange('min_price', parseFloat(e.target.value) || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.max_price || ''}
                onChange={(e) => handleFilterChange('max_price', parseFloat(e.target.value) || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="999.99"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="in-stock"
                  checked={filters.in_stock_only || false}
                  onChange={(e) => handleFilterChange('in_stock_only', e.target.checked || undefined)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="in-stock" className="ml-2 text-sm text-gray-700">
                  In Stock Only
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="has-discount"
                  checked={filters.has_discount || false}
                  onChange={(e) => handleFilterChange('has_discount', e.target.checked || undefined)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="has-discount" className="ml-2 text-sm text-gray-700">
                  On Sale
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reset Button */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={handleReset}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Reset All Filters
        </button>
      </div>
    </div>
  );
};
