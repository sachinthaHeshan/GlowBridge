"use client";

import React, { useState, useMemo } from "react";
import { Search, Filter, ShoppingCart, Star, Heart, ArrowLeft, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useShoppingCart } from "./ShoppingProvider";
import Link from "next/link";

// Mock product data
const mockProducts = [
  {
    id: 1,
    name: "Luxury Hair Treatment",
    description: "Professional hair treatment for damaged hair",
    price: 45.99,
    category: "Hair Care",
    rating: 4.8,
    reviews: 124,
    image: "/api/placeholder/300/300",
    inStock: true,
    salon: "Glow Beauty Salon"
  },
  {
    id: 2,
    name: "Organic Face Mask",
    description: "Natural face mask for all skin types",
    price: 29.99,
    category: "Skincare",
    rating: 4.6,
    reviews: 89,
    image: "/api/placeholder/300/300",
    inStock: true,
    salon: "Natural Beauty Hub"
  },
  {
    id: 3,
    name: "Anti-Aging Serum",
    description: "Advanced anti-aging formula with vitamin C",
    price: 79.99,
    category: "Skincare",
    rating: 4.9,
    reviews: 203,
    image: "/api/placeholder/300/300",
    inStock: true,
    salon: "Premium Spa"
  },
  {
    id: 4,
    name: "Professional Nail Kit",
    description: "Complete nail care kit for salon-quality results",
    price: 34.99,
    category: "Nail Care",
    rating: 4.5,
    reviews: 76,
    image: "/api/placeholder/300/300",
    inStock: false,
    salon: "Nail Art Studio"
  },
  {
    id: 5,
    name: "Hair Styling Cream",
    description: "Long-lasting hold styling cream",
    price: 19.99,
    category: "Hair Care",
    rating: 4.3,
    reviews: 145,
    image: "/api/placeholder/300/300",
    inStock: true,
    salon: "Style Masters"
  },
  {
    id: 6,
    name: "Moisturizing Body Lotion",
    description: "Deep moisturizing lotion with shea butter",
    price: 24.99,
    category: "Body Care",
    rating: 4.7,
    reviews: 98,
    image: "/api/placeholder/300/300",
    inStock: true,
    salon: "Wellness Spa"
  }
];

const categories = ["All", "Hair Care", "Skincare", "Nail Care", "Body Care"];
const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest" }
];

interface Product {
  id: number;
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

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);

  const { addToCart, cartCount, setIsCartOpen } = useShoppingCart();

  const filteredProducts = useMemo(() => {
    const filtered = mockProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort products
    const sortedFiltered = [...filtered];
    switch (sortBy) {
      case "price-low":
        sortedFiltered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sortedFiltered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sortedFiltered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return sortedFiltered;
  }, [searchQuery, selectedCategory, sortBy, priceRange]);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  };

  const toggleWishlist = (productId: number) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Brand Logo */}
              <div className="flex items-center space-x-2">
                <Scissors className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold font-heading text-foreground">
                  Glow<span className="text-primary">Bridge</span>
                </span>
              </div>
              {/* Back Link */}
              <Link href="/" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Main Site</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setIsCartOpen(true)}
                className="relative"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart
                {cartCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs"
                  >
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Beauty & Wellness Marketplace
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover premium beauty products and services from top-rated salons and spas
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">Products</h2>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`md:block ${showFilters ? 'block' : 'hidden'} w-full md:w-64 space-y-6`}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Filter */}
                <div>
                  <h3 className="font-medium text-foreground mb-3">Category</h3>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <label key={category} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value={category}
                          checked={selectedCategory === category}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-foreground">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <h3 className="font-medium text-foreground mb-3">Price Range</h3>
                  <div className="px-2">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Stock Filter */}
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-foreground">In Stock Only</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-muted-foreground">
                Showing {filteredProducts.length} products
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-0">
                    {/* Product Image */}
                    <div className="relative overflow-hidden rounded-t-lg">
                      <div className="aspect-square bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">Product Image</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                        onClick={() => toggleWishlist(product.id)}
                      >
                        <Heart 
                          className={`h-4 w-4 ${wishlist.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
                        />
                      </Button>
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                          <Badge variant="secondary">Out of Stock</Badge>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {product.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          by {product.salon}
                        </p>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center space-x-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(product.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {product.rating} ({product.reviews})
                        </span>
                      </div>

                      {/* Price and Add to Cart */}
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">
                          ${product.price}
                        </span>
                        <Button
                          onClick={() => handleAddToCart(product)}
                          disabled={!product.inStock}
                          size="sm"
                          className="min-w-[100px]"
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Add to Cart
                        </Button>
                      </div>

                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
