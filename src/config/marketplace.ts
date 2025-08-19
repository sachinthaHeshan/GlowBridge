export const MARKETPLACE_CONFIG = {
  // Pagination settings
  ITEMS_PER_PAGE: 12,
  MAX_VISIBLE_PAGES: 5,
  
  // Price settings
  CURRENCY: 'USD',
  CURRENCY_SYMBOL: '$',
  
  // API endpoints
  ENDPOINTS: {
    PRODUCTS: '/api/products',
    SALONS: '/api/salons',
  },
  
  // Filter defaults
  DEFAULT_FILTERS: {
    sort: 'newest',
    page: 1,
    limit: 12,
  },
  
  // Sort options
  SORT_OPTIONS: [
    { key: 'newest', label: 'Newest First', value: 'newest' },
    { key: 'price_asc', label: 'Price: Low to High', value: 'price_asc' },
    { key: 'price_desc', label: 'Price: High to Low', value: 'price_desc' },
    { key: 'highest_discount', label: 'Highest Discount', value: 'highest_discount' },
  ],
  
  // UI settings
  UI: {
    LOADING_DELAY_MS: 300,
    DEBOUNCE_SEARCH_MS: 500,
    SCROLL_TOP_ON_PAGE_CHANGE: true,
  },
  
  // Product settings
  PRODUCT: {
    LOW_STOCK_THRESHOLD: 5,
    OUT_OF_STOCK_THRESHOLD: 0,
    DEFAULT_IMAGE_ALT: 'Product Image',
    MAX_DESCRIPTION_LENGTH: 150,
  },
} as const;

export type MarketplaceConfig = typeof MARKETPLACE_CONFIG;
