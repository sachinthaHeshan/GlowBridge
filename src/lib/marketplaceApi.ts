import { fetchProducts, Product as ProductApiBackendProduct } from "./productApi";

interface BackendProduct extends ProductApiBackendProduct {
  salon_name?: string;
  salon_type?: string;
  salon_location?: string;
  image_url?: string; // Add the actual database field
}

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
  // Enhanced image handling with database images first, then fallbacks
  const getProductImage = (imageUrl: string | undefined, productName: string) => {
    console.log(`🔍 Image check for "${productName}":`, { 
      image_url: backendProduct.image_url, 
      imageUrl, 
      category: backendProduct.category 
    });
    
    // First priority: Use actual database image_url
    if (backendProduct.image_url && 
        backendProduct.image_url !== "/api/placeholder/300/300" && 
        backendProduct.image_url !== "" &&
        backendProduct.image_url !== null) {
      console.log(`✅ Using database image for "${productName}":`, backendProduct.image_url);
      return backendProduct.image_url;
    }
    
    // Second priority: Use passed imageUrl parameter
    if (imageUrl && imageUrl !== "/api/placeholder/300/300" && imageUrl !== "") {
      console.log(`✅ Using parameter image for "${productName}":`, imageUrl);
      return imageUrl;
    }
    
    // Last resort: Category-based fallback images
    console.log(`⚠️ Using fallback image for "${productName}"`);
    const category = backendProduct.category;
    const fallbackImages: { [key: string]: string } = {
      'hair-care': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      'skin-care': 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400',
      'tools': 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
      'accessories': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400'
    };
    
    return fallbackImages[category] || fallbackImages['accessories'];
  };

  return {
    id: parseInt(backendProduct.id) || Math.floor(Math.random() * 10000),
    originalId: backendProduct.id,
    name: backendProduct.name,
    description: backendProduct.description || "Premium beauty product",
    price: backendProduct.price,
    category: getCategoryDisplayName(backendProduct.category),
    rating: 4.5 + Math.random() * 0.5,
    reviews: Math.floor(Math.random() * 200) + 50,
    image: getProductImage(backendProduct.image_url, backendProduct.name), // Use actual DB field
    inStock: backendProduct.status !== "out-of-stock",
    salon: backendProduct.salon_name || `Salon ${backendProduct.salonId.slice(0, 8)}`,
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
    // Fetch from the new public products endpoint that includes salon information
    console.log('🚀 Fetching products from backend...');
    const response = await fetch('/api_g/products/public');
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch products');
    }

    console.log('🔍 Raw backend response:', result);
    console.log('🔍 First product data:', result.data?.[0]);

    let products: MarketplaceProduct[] = result.data.map(transformToMarketplaceProduct);

    console.log('🖼️ Transformed products with images:', products.map(p => ({ name: p.name, image: p.image })));

    // Apply client-side filtering
    if (search) {
      const searchLower = search.toLowerCase();
      products = products.filter(
        (product: MarketplaceProduct) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower)
      );
    }

    if (category && category !== "All") {
      products = products.filter((product: MarketplaceProduct) => product.category === category);
    }

    // Apply price filtering
    if (minPrice !== undefined) {
      products = products.filter((product: MarketplaceProduct) => product.price >= minPrice);
    }
    if (maxPrice !== undefined) {
      products = products.filter((product: MarketplaceProduct) => product.price <= maxPrice);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = products.slice(startIndex, endIndex);
    const totalPages = Math.ceil(products.length / limit);

    return {
      products: paginatedProducts,
      total: products.length,
      page,
      limit,
      totalPages,
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
