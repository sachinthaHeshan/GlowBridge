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
import { DropZone } from "@/components/ui/drop-zone";
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
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";
import ConfirmationModal from "@/components/confirmation-modal";
import {
  Product,
  fetchSalonProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  ApiError,
} from "@/lib/productApi";
import { showApiErrorToast } from "@/lib/errorToast";
type InventoryItem = Product;

export function InventoryManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    itemId: string | null;
    itemName: string;
  }>({
    isOpen: false,
    itemId: null,
    itemName: "",
  });


  const salonId = "1df3195c-05b9-43c9-bebd-79d8684cbf55";

  const [formData, setFormData] = useState({
    name: "",
    quantity: 0,
    price: 0,
    status: "in-stock" as "in-stock" | "low-stock" | "out-of-stock",
    description: "",
    isPublic: true,
    discount: 0,
    image: null as File | null,
    imagePreview: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });


  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const products = await fetchSalonProducts(salonId);
        setItems(products);
      } catch (error) {
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

    loadProducts();
  }, [salonId]);

  // Clean up object URLs when form data changes or component unmounts
  useEffect(() => {
    return () => {
      if (formData.imagePreview && !formData.imagePreview.startsWith('http')) {
        URL.revokeObjectURL(formData.imagePreview);
      }
    };
  }, [formData.imagePreview]);

  const handleAddItem = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      quantity: 0,
      price: 0,
      status: "in-stock",
      description: "",
      isPublic: true,
      discount: 0,
      image: null,
      imagePreview: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      status: item.status,
      description: item.description || "",
      isPublic: item.isPublic,
      discount: item.discount,
      image: null,
      imagePreview:   "",
    });
    setIsDialogOpen(true);
  };

  const handleSaveItem = async () => {
    try {
      setSaving(true);
      setError(null);

      if (editingItem) {

        const updatedItem = await updateProduct(editingItem.id, {
          name: formData.name,
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

        const newItem = await createProduct({
          name: formData.name,
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
    }
  };

  const handleDeleteConfirm = (item: InventoryItem) => {
    setDeleteConfirmation({
      isOpen: true,
      itemId: item.id,
      itemName: item.name,
    });
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      isOpen: false,
      itemId: null,
      itemName: "",
    });
  };

  const handleDeleteItem = async () => {
    if (!deleteConfirmation.itemId) return;

    try {
      setError(null);
      await deleteProduct(deleteConfirmation.itemId);
      setItems(items.filter((item) => item.id !== deleteConfirmation.itemId));
      handleDeleteCancel(); // Close the confirmation dialog
    } catch (error) {
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

  const filterItems = (items: InventoryItem[]) => {
    return items.filter((item) => {

      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());


      const matchesPrice =
        (!priceRange.min || item.price >= Number(priceRange.min)) &&
        (!priceRange.max || item.price <= Number(priceRange.max));

      return matchesSearch && matchesPrice;
    });
  };


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


  return (
    <div className="space-y-6">
      {}
      <div className="flex items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Inventory Management
          </h1>
          <p className="text-muted-foreground">
            Manage inventory for this salon location
          </p>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {items.filter((i) => i.status === "in-stock").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {items.filter((i) => i.status === "low-stock").length}
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
              {items.filter((i) => i.status === "out-of-stock").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search and Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {}
            <div>
              <Label htmlFor="search">Search Items</Label>
              <Input
                id="search"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Price Range</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, min: e.target.value })
                  }
                />
                <span>-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, max: e.target.value })
                  }
                />
              </div>
            </div>

            {}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setPriceRange({ min: "", max: "" });
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Inventory Items</CardTitle>
            <CardDescription>Manage your products and supplies</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => {
              }}
              className="bg-primary hover:bg-primary/90"
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate PDF
            </Button>
            <Button
              onClick={handleAddItem}
              className="bg-primary hover:bg-primary/90"
              disabled={saving}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-center">Visibility</TableHead>
                <TableHead className="text-right">Discount (%)</TableHead>
                <TableHead>Update</TableHead>
                <TableHead>Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filterItems(items).map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div className="font-medium">{item.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    Rs.{item.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={item.isPublic ? "default" : "secondary"}>
                      {item.isPublic ? "Public" : "Private"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{item.discount}%</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditItem(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteConfirm(item)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh]">
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
          <div className="grid gap-4 py-4 overflow-y-auto max-h-[calc(90vh-8rem)] pr-2">
            <div className="grid gap-2">
              <Label>Product Image</Label>
              <DropZone
                onDrop={(files) => {
                  const file = files[0];
                  setFormData({
                    ...formData,
                    image: file,
                    imagePreview: URL.createObjectURL(file)
                  });
                }}
                currentImage={formData.imagePreview}
              />
            </div>
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
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Enter quantity"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price (Rs.)</Label> {}
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
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter product description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="discount">Discount (%)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
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
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteItem}
        title="Delete Item"
        description={`Are you sure you want to delete "${deleteConfirmation.itemName}"? This action cannot be undone.`}
      />
    </div>
  );
}
