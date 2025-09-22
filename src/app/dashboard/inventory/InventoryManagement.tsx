"use client";

import { useState } from "react";
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

export function InventoryManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
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
  });

  // Mock data
  // Mock data for items

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
      available_quantity: 0,
      is_public: true,
      discount: 0,
      image: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      available_quantity: item.available_quantity,
      is_public: item.is_public,
      discount: item.discount,
      image: item.image || "",
    });
    setIsDialogOpen(true);
  };

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
    }
    setIsDialogOpen(false);
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

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
          <CardDescription>
            Manage your products and supplies
          </CardDescription>
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
              <Label htmlFor="description">Description</Label>
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
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="discount">Discount (%)</Label>
              <Input
                id="discount"
                type="number"
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
              <Label htmlFor="is_public">Visibility</Label>
              <Select
                value={formData.is_public ? "public" : "private"}
                onValueChange={(value: "public" | "private") =>
                  setFormData({ ...formData, is_public: value === "public" })
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveItem}>
              {editingItem ? "Update" : "Create"} Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}