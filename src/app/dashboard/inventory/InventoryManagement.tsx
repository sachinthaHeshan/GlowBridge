"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
<<<<<<< HEAD
import { Plus, Edit, Trash2, Package, Search } from "lucide-react";

interface InventoryItem {
  id: string;
  salon_id: string;
  name: string;
  description: string;
  price: number;
  available_quantity: number;
  is_public: boolean;
  discount: number;
  image?: string;
}
=======
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Product,
  fetchSalonProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  ApiError,
} from "@/lib/productApi";
import { showApiErrorToast } from "@/lib/errorToast";

// Use Product interface from productApi
type InventoryItem = Product;
>>>>>>> fa1d4ae0387666239463e8b259eb8f6142629d24

export function InventoryManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
<<<<<<< HEAD
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [availability, setAvailability] = useState<"all" | "in-stock" | "out-of-stock">("all");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    available_quantity: 0,
    is_public: true,
    discount: 0,
    image: "",
=======
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default salon ID - in a real app, this would come from user context or route params
  const salonId = "1df3195c-05b9-43c9-bebd-79d8684cbf55"; // You may want to get this from props or context

  const [formData, setFormData] = useState({
    name: "",
    category: "hair-care" as
      | "hair-care"
      | "skin-care"
      | "tools"
      | "accessories",
    quantity: 0,
    price: 0,
    status: "in-stock" as "in-stock" | "low-stock" | "out-of-stock",
    description: "",
    isPublic: true,
    discount: 0,
>>>>>>> fa1d4ae0387666239463e8b259eb8f6142629d24
  });

  // Fetch products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const products = await fetchSalonProducts(salonId);
        setItems(products);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        if (error instanceof ApiError) {
          setError(error.message);
          showApiErrorToast(error, "Failed to load products");
        } else {
          setError("Failed to load products");
          showApiErrorToast(
            new Error("Failed to load products"),
            "Failed to load products"
          );
        }
      } finally {
        setLoading(false);
      }
    };

<<<<<<< HEAD
  const [items, setItems] = useState<InventoryItem[]>([
    {
      id: "1",
      salon_id: "1",
      name: "Professional Hair Shampoo",
      description: "Premium quality hair shampoo for professional use",
      price: 24.99,
      available_quantity: 50,
      is_public: true,
      discount: 0,
    },
    {
      id: "2",
      salon_id: "1",
      name: "Hair Treatment Mask",
      description: "Deep conditioning hair treatment mask",
      price: 34.99,
      available_quantity: 35,
      is_public: true,
      discount: 10,
    },
    {
      id: "3",
      salon_id: "1",
      name: "Professional Hair Dryer",
      description: "High-performance professional hair dryer",
      price: 199.99,
      available_quantity: 5,
      is_public: false,
      discount: 0,
    },
    {
      id: "4",
      salon_id: "1",
      name: "Facial Cleanser",
      description: "Gentle facial cleanser for all skin types",
      price: 29.99,
      available_quantity: 0,
      is_public: true,
      discount: 15,
    },
    {
      id: "5",
      salon_id: "1",
      name: "Hair Clips Set",
      description: "Professional salon-grade hair clips set",
      price: 12.99,
      available_quantity: 100,
      is_public: true,
      discount: 0,
    },
  ]);
=======
    loadProducts();
  }, [salonId]);
>>>>>>> fa1d4ae0387666239463e8b259eb8f6142629d24

  // Filter items based on search and filters
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = item.price >= priceRange.min && item.price <= priceRange.max;
    const matchesAvailability = 
      availability === "all" ? true :
      availability === "in-stock" ? item.available_quantity > 0 :
      item.available_quantity === 0;
    
    return matchesSearch && matchesPrice && matchesAvailability;
  });

  const handleAddItem = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      description: "",
      price: 0,
<<<<<<< HEAD
      available_quantity: 0,
      is_public: true,
      discount: 0,
      image: "",
=======
      status: "in-stock",
      description: "",
      isPublic: true,
      discount: 0,
>>>>>>> fa1d4ae0387666239463e8b259eb8f6142629d24
    });
    setIsDialogOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
<<<<<<< HEAD
      available_quantity: item.available_quantity,
      is_public: item.is_public,
      discount: item.discount,
      image: item.image || "",
=======
      status: item.status,
      description: item.description || "",
      isPublic: item.isPublic,
      discount: item.discount,
>>>>>>> fa1d4ae0387666239463e8b259eb8f6142629d24
    });
    setIsDialogOpen(true);
  };

<<<<<<< HEAD
  const handleSaveItem = () => {
    if (editingItem) {
      setItems(
        items.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                ...formData,
                salon_id: item.salon_id,
              }
            : item
        )
      );
    } else {
      const newItem: InventoryItem = {
        id: Date.now().toString(),
        salon_id: "1", // Current salon ID
        ...formData,
      };
      setItems([...items, newItem]);
=======
  const handleSaveItem = async () => {
    try {
      setSaving(true);
      setError(null);

      if (editingItem) {
        // Update existing item
        const updatedItem = await updateProduct(editingItem.id, {
          name: formData.name,
          category: formData.category,
          quantity: formData.quantity,
          price: formData.price,
          description: formData.description,
          isPublic: formData.isPublic,
          discount: formData.discount,
        });

        setItems(
          items.map((item) => (item.id === editingItem.id ? updatedItem : item))
        );
      } else {
        // Create new item
        const newItem = await createProduct({
          name: formData.name,
          category: formData.category,
          quantity: formData.quantity,
          price: formData.price,
          status: formData.status,
          salonId: salonId,
          description: formData.description,
          isPublic: formData.isPublic,
          discount: formData.discount,
        });

        setItems([...items, newItem]);
      }

      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to save product:", error);
      if (error instanceof ApiError) {
        setError(error.message);
        showApiErrorToast(
          error,
          editingItem ? "Failed to update product" : "Failed to create product"
        );
      } else {
        setError("Failed to save product");
        showApiErrorToast(
          new Error("Failed to save product"),
          "Failed to save product"
        );
      }
    } finally {
      setSaving(false);
>>>>>>> fa1d4ae0387666239463e8b259eb8f6142629d24
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      setError(null);
      await deleteProduct(id);
      setItems(items.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to delete product:", error);
      if (error instanceof ApiError) {
        setError(error.message);
        showApiErrorToast(error, "Failed to delete product");
      } else {
        setError("Failed to delete product");
        showApiErrorToast(
          new Error("Failed to delete product"),
          "Failed to delete product"
        );
      }
    }
  };

<<<<<<< HEAD
=======
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "in-stock":
        return "default";
      case "low-stock":
        return "secondary";
      case "out-of-stock":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Inventory Management
              </h1>
              <p className="text-muted-foreground">
                Manage inventory for this salon location
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading products...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error && items.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Inventory Management
              </h1>
              <p className="text-muted-foreground">
                Manage inventory for this salon location
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Failed to load products
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

>>>>>>> fa1d4ae0387666239463e8b259eb8f6142629d24
  // Inventory management view
  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Inventory Management
            </h1>
            <p className="text-muted-foreground">
              Manage inventory for this salon location
            </p>
          </div>
          <Button onClick={handleAddItem} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
<<<<<<< HEAD

        {/* Search and Filters Card */}
        <Card>
          <CardHeader>
            <CardTitle>Search & Filters</CardTitle>
            <CardDescription>
              Find and filter inventory items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {/* Search Bar */}
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>
              
              {/* Filters */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <Select
                    value={availability}
                    onValueChange={(value: "all" | "in-stock" | "out-of-stock") =>
                      setAvailability(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Items</SelectItem>
                      <SelectItem value="in-stock">In Stock</SelectItem>
                      <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Price Range</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, min: Number(e.target.value) || 0 })
                      }
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, max: Number(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
=======
        <Button
          onClick={handleAddItem}
          className="bg-primary hover:bg-primary/90"
          disabled={saving}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
>>>>>>> fa1d4ae0387666239463e8b259eb8f6142629d24
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {items.filter((i) => i.available_quantity > 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Out of Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {items.filter((i) => i.available_quantity === 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              On Discount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {items.filter((i) => i.discount > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>Manage your products and supplies</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="font-medium">{item.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate">
                      {item.description}
                    </div>
                  </TableCell>
                  <TableCell>${item.price.toFixed(2)}</TableCell>
                  <TableCell>{item.available_quantity}</TableCell>
                  <TableCell>
                    {item.discount > 0 ? (
                      <Badge variant="secondary">{item.discount}% OFF</Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={item.is_public ? "default" : "secondary"}
                    >
                      {item.is_public ? "Public" : "Private"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditItem(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Item Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Item" : "Add New Item"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Update the inventory item information below."
                : "Add a new item to your inventory."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter item name"
              />
            </div>
            <div className="grid gap-2">
<<<<<<< HEAD
              <Label htmlFor="description">Description</Label>
=======
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(
                  value: "hair-care" | "skin-care" | "tools" | "accessories"
                ) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hair-care">Hair Care</SelectItem>
                  <SelectItem value="skin-care">Skin Care</SelectItem>
                  <SelectItem value="tools">Tools</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
>>>>>>> fa1d4ae0387666239463e8b259eb8f6142629d24
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter item description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="Enter price"
              />
            </div>
            <div className="grid gap-2">
<<<<<<< HEAD
              <Label htmlFor="available_quantity">Available Quantity</Label>
              <Input
                id="available_quantity"
                type="number"
                value={formData.available_quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    available_quantity: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Enter available quantity"
=======
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter product description"
>>>>>>> fa1d4ae0387666239463e8b259eb8f6142629d24
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="discount">Discount (%)</Label>
              <Input
                id="discount"
                type="number"
<<<<<<< HEAD
=======
                min="0"
                max="100"
>>>>>>> fa1d4ae0387666239463e8b259eb8f6142629d24
                value={formData.discount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discount: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Enter discount percentage"
              />
            </div>
            <div className="grid gap-2">
<<<<<<< HEAD
              <Label htmlFor="is_public">Visibility</Label>
              <Select
                value={formData.is_public ? "public" : "private"}
                onValueChange={(value: "public" | "private") =>
                  setFormData({ ...formData, is_public: value === "public" })
                }
=======
              <Label htmlFor="isPublic">Visibility</Label>
              <Select
                value={formData.isPublic ? "public" : "private"}
                onValueChange={(value: "public" | "private") =>
                  setFormData({ ...formData, isPublic: value === "public" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(
                  value: "in-stock" | "low-stock" | "out-of-stock"
                ) => setFormData({ ...formData, status: value })}
>>>>>>> fa1d4ae0387666239463e8b259eb8f6142629d24
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">Product Image</Label>
              <div className="flex items-center gap-4">
                {formData.image && (
                  <div className="h-16 w-16 rounded-lg border overflow-hidden">
                    <img
                      src={formData.image}
                      alt="Product preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setFormData({
                          ...formData,
                          image: reader.result as string,
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveItem} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editingItem ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{editingItem ? "Update" : "Create"} Item</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
