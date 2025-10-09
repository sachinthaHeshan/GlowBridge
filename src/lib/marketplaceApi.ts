import { fetchProducts, Product as BackendProduct } from "./productApi";
export interface MarketplaceProduct {
  id: number;
  originalId: string;
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
const transformToMarketplaceProduct = (
  backendProduct: BackendProduct
): MarketplaceProduct => {
  return {
    id: parseInt(backendProduct.id) || Math.floor(Math.random() * 10000),
    originalId: backendProduct.id,
    name: backendProduct.name,
    description: backendProduct.description || "Premium beauty product",
    price: backendProduct.price,
    category: getCategoryDisplayName(backendProduct.category),
    rating: 4.5 + Math.random() * 0.5,
    reviews: Math.floor(Math.random() * 200) + 50,
    image: backendProduct.imageUrl || "/api/placeholder/300/300",
    inStock: backendProduct.status !== "out-of-stock",
    salon: `Salon ${backendProduct.salonId.slice(0, 8)}`,
  };
};
const getCategoryDisplayName = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    "hair-care": "Hair Care",
    "skin-care": "Skincare",
    tools: "Tools",
    accessories: "Accessories",
  };
  return categoryMap[category] || "Beauty";
};
export interface MarketplacePaginatedResult {
  products: MarketplaceProduct[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
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
      undefined,
      true,
      minPrice,
      maxPrice
    );

    let products = result.products.map(transformToMarketplaceProduct);

    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower)
      );
    }

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
  } catch {
    return {
      products: [],
      total: 0,
      page: 1,
      limit: limit,
      totalPages: 0,
    };
  }
};
