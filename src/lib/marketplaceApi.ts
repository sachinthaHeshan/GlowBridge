// Marketplace API functions optimized for the shopping interface

import { fetchProducts, Product as BackendProduct } from "./productApi";

// Marketplace-specific product interface that matches the current Marketplace component
export interface MarketplaceProduct {
  id: number;
  originalId: string; // Keep the original UUID for backend operations
  name: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  reviews: number;
  image: string;
  inStock: boolean;
  salon: string;
}

// Transform backend product to marketplace product
const transformToMarketplaceProduct = (
  backendProduct: BackendProduct
): MarketplaceProduct => {
  return {
    id: parseInt(backendProduct.id) || Math.floor(Math.random() * 10000), // Convert string ID to number for compatibility
    originalId: backendProduct.id, // Keep the original UUID
    name: backendProduct.name,
    description: backendProduct.description || "Premium beauty product",
    price: backendProduct.price,
    category: getCategoryDisplayName(backendProduct.category),
    rating: 4.5 + Math.random() * 0.5, // Generate rating between 4.5-5.0
    reviews: Math.floor(Math.random() * 200) + 50, // Generate review count 50-250
    image: "/api/placeholder/300/300", // Placeholder image
    inStock: backendProduct.status !== "out-of-stock",
    salon: `Salon ${backendProduct.salonId.slice(0, 8)}`, // Generate salon name from ID
  };
};

// Convert backend category to display name
const getCategoryDisplayName = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    "hair-care": "Hair Care",
    "skin-care": "Skincare",
    tools: "Tools",
    accessories: "Accessories",
  };
  return categoryMap[category] || "Beauty";
};

// Marketplace-specific paginated result
export interface MarketplacePaginatedResult {
  products: MarketplaceProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Fetch products for marketplace with marketplace-specific transformations
export const fetchMarketplaceProducts = async (
  page: number = 1,
  limit: number = 10,
  category?: string,
  minPrice?: number,
  maxPrice?: number,
  search?: string
): Promise<MarketplacePaginatedResult> => {
  try {
    const result = await fetchProducts(
      page,
      limit,
      undefined, // salonId
      true, // isPublic - only fetch public products for marketplace
      minPrice,
      maxPrice
    );

    let products = result.products.map(transformToMarketplaceProduct);

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter if provided and not "All"
    if (category && category !== "All") {
      products = products.filter((product) => product.category === category);
    }

    return {
      products,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  } catch (error) {
    console.error("Error fetching marketplace products:", error);
    // Return empty result on error to allow graceful fallback
    return {
      products: [],
      total: 0,
      page: 1,
      limit: limit,
      totalPages: 0,
    };
  }
};
