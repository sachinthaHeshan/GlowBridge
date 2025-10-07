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
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Loader2,
  AlertCircle,
  FileText,
  Download,
  Filter,
  Calendar,
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
import { InventoryReportGenerator } from "@/lib/reportGeneratorNew";
type InventoryItem = Product;

export function InventoryManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);


  const salonId = "1df3195c-05b9-43c9-bebd-79d8684cbf55";

  const [formData, setFormData] = useState({
    name: "",
    quantity: 0,
    price: 0,
    status: "in-stock" as "in-stock" | "low-stock" | "out-of-stock",
    description: "",
    isPublic: true,
    discount: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  // Report generation state
  const [reportFilters, setReportFilters] = useState({
    reportType: "current-stock" as "current-stock" | "stock-usage",
    category: "" as string,
    stockLevel: "all" as "all" | "in-stock" | "low-stock" | "out-of-stock",
    timePeriod: "30" as "7" | "14" | "21" | "30" | "60" | "90"
  });


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

  const handleDeleteItem = async (id: string) => {
    try {
      setError(null);
      await deleteProduct(id);
      setItems(items.filter((item) => item.id !== id));
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

  // Report generation functions
  const getFilteredReportData = () => {
    let filteredItems = [...items];

    // Filter by stock level
    if (reportFilters.stockLevel && reportFilters.stockLevel !== "all") {
      filteredItems = filteredItems.filter(item => item.status === reportFilters.stockLevel);
    }

    // Filter by category (if you have categories in your data structure)
    // Note: Adding category filter - you might need to add category field to your Product type
    if (reportFilters.category) {
      // Assuming category might be in description or you'll add it later
      filteredItems = filteredItems.filter(item => 
        item.description?.toLowerCase().includes(reportFilters.category.toLowerCase())
      );
    }

    return filteredItems;
  };

  const generateCurrentStockReport = (data: InventoryItem[]) => {
    const reportContent = `
INVENTORY CURRENT STOCK LEVEL REPORT
Generated on: ${new Date().toLocaleString()}
Salon ID: ${salonId}

====================================================

SUMMARY:
- Total Items: ${data.length}
- In Stock: ${data.filter(i => i.status === 'in-stock').length}
- Low Stock: ${data.filter(i => i.status === 'low-stock').length}
- Out of Stock: ${data.filter(i => i.status === 'out-of-stock').length}
- Total Value: Rs.${data.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}

====================================================

DETAILED INVENTORY:

${data.map(item => `
Product: ${item.name}
Price: Rs.${item.price.toFixed(2)}
Quantity: ${item.quantity}
Status: ${item.status.toUpperCase()}
Discount: ${item.discount}%
Description: ${item.description || 'N/A'}
Total Value: Rs.${(item.price * item.quantity).toFixed(2)}
---
`).join('')}

====================================================
Report End
`;
    return reportContent;
  };

  const generateStockUsageReport = (data: InventoryItem[]) => {
    // This is a simulated stock usage report
    // In a real application, you would track actual usage data
    const reportContent = `
INVENTORY STOCK USAGE REPORT
Generated on: ${new Date().toLocaleString()}
Salon ID: ${salonId}
Period: Last 30 days (simulated data)

====================================================

USAGE SUMMARY:
- Total Products Monitored: ${data.length}
- High Usage Items: ${data.filter(i => i.quantity < 10).length}
- Medium Usage Items: ${data.filter(i => i.quantity >= 10 && i.quantity < 50).length}
- Low Usage Items: ${data.filter(i => i.quantity >= 50).length}

====================================================

USAGE DETAILS:

${data.map(item => {
  // Simulate usage data based on current stock levels
  const estimatedUsage = item.status === 'low-stock' ? 'High' : 
                        item.status === 'out-of-stock' ? 'Critical' : 'Normal';
  const simulatedDailyUsage = item.status === 'low-stock' ? Math.floor(item.quantity * 0.1) + 1 :
                             item.status === 'out-of-stock' ? 'N/A' :
                             Math.floor(item.quantity * 0.05) + 1;
  
  return `
Product: ${item.name}
Current Stock: ${item.quantity}
Usage Level: ${estimatedUsage}
Estimated Daily Usage: ${simulatedDailyUsage}
Reorder Recommendation: ${item.quantity < 20 ? 'URGENT - Reorder required' : 'Normal monitoring'}
---
`;
}).join('')}

====================================================
Report End
`;
    return reportContent;
  };

  const downloadReport = async () => {
    setGeneratingReport(true);
    try {
      const filteredData = getFilteredReportData();
      
      if (filteredData.length === 0) {
        alert('No data available for the selected filters. Please adjust your filters and try again.');
        return;
      }
      
      // Create report generator instance
      const reportGenerator = new InventoryReportGenerator();
      
      // Generate and download the PDF report
      reportGenerator.generateReport(filteredData, salonId, reportFilters);
      
      // Show success message
      setTimeout(() => {
        alert('📄 Report generated successfully! Check your downloads folder.');
      }, 500);
      
      setIsReportDialogOpen(false);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('❌ Error generating report. Please try again.');
    } finally {
      setGeneratingReport(false);
    }
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
              onClick={() => setIsReportDialogOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
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
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Discount (%)</TableHead>
                <TableHead className="text-center">Actions</TableHead>
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
                    <Badge variant={getStatusBadgeVariant(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{item.discount}%</TableCell>
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

      {}
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

      {/* Report Generation Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Generate Inventory Report
            </DialogTitle>
            <DialogDescription>
              Configure your inventory report parameters and download as a professional PDF document.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Report Type Selection */}
            <div className="grid gap-3">
              <Label htmlFor="reportType" className="text-sm font-medium">Report Type</Label>
              <Select
                value={reportFilters.reportType}
                onValueChange={(value: "current-stock" | "stock-usage") =>
                  setReportFilters({ ...reportFilters, reportType: value })
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-stock">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Current Stock Level Report</div>
                        <div className="text-xs text-muted-foreground">Detailed inventory status and quantities</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="stock-usage">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Sales & Usage Analysis Report</div>
                        <div className="text-xs text-muted-foreground">Sales performance, usage patterns and reorder recommendations</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Stock Level Filter */}
              <div className="grid gap-3">
                <Label htmlFor="stockLevel" className="text-sm font-medium">Filter by Stock Level</Label>
                <Select
                  value={reportFilters.stockLevel}
                  onValueChange={(value: "all" | "in-stock" | "low-stock" | "out-of-stock") =>
                    setReportFilters({ ...reportFilters, stockLevel: value })
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="All stock levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stock Levels</SelectItem>
                    <SelectItem value="in-stock">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        In Stock Only
                      </div>
                    </SelectItem>
                    <SelectItem value="low-stock">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        Low Stock Only
                      </div>
                    </SelectItem>
                    <SelectItem value="out-of-stock">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        Out of Stock Only
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="grid gap-3">
                <Label htmlFor="category" className="text-sm font-medium">Filter by Category</Label>
                <Input
                  id="category"
                  placeholder="Enter category keyword..."
                  value={reportFilters.category}
                  onChange={(e) =>
                    setReportFilters({ ...reportFilters, category: e.target.value })
                  }
                  className="h-11"
                />
              </div>
            </div>

            {/* Time Period Selection for Usage Report */}
            {reportFilters.reportType === "stock-usage" && (
              <div className="grid gap-3">
                <Label className="text-sm font-medium">Sales Analysis Period</Label>
                <Select
                  value={reportFilters.timePeriod}
                  onValueChange={(value: "7" | "14" | "21" | "30" | "60" | "90") =>
                    setReportFilters({ ...reportFilters, timePeriod: value })
                  }
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Last Week (7 days)
                      </div>
                    </SelectItem>
                    <SelectItem value="14">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Last 2 Weeks (14 days)
                      </div>
                    </SelectItem>
                    <SelectItem value="21">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Last 3 Weeks (21 days)
                      </div>
                    </SelectItem>
                    <SelectItem value="30">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Last Month (30 days)
                      </div>
                    </SelectItem>
                    <SelectItem value="60">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Last 2 Months (60 days)
                      </div>
                    </SelectItem>
                    <SelectItem value="90">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Last 3 Months (90 days)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select the time period for sales analysis and performance metrics
                </p>
              </div>
            )}

            {/* Preview Information */}
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2 text-primary">
                  <Filter className="h-4 w-4" />
                  Report Preview
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Report Type:</span>
                    <span className="font-medium">
                      {reportFilters.reportType === 'current-stock' ? 'Current Stock Levels' : 'Sales & Usage Analysis'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items to include:</span>
                    <span className="font-medium text-primary">{getFilteredReportData().length} products</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Stock Level Filter:</span>
                    <span className="font-medium">{reportFilters.stockLevel === 'all' ? 'All levels' : reportFilters.stockLevel}</span>
                  </div>
                  {reportFilters.category && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Category Filter:</span>
                      <span className="font-medium">"{reportFilters.category}"</span>
                    </div>
                  )}
                  {reportFilters.reportType === 'stock-usage' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Analysis Period:</span>
                      <span className="font-medium">
                        {reportFilters.timePeriod === '7' ? 'Last Week' :
                         reportFilters.timePeriod === '14' ? 'Last 2 Weeks' :
                         reportFilters.timePeriod === '21' ? 'Last 3 Weeks' :
                         reportFilters.timePeriod === '30' ? 'Last Month' :
                         reportFilters.timePeriod === '60' ? 'Last 2 Months' :
                         'Last 3 Months'}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Format:</span>
                    <span className="font-medium">Professional PDF Document</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsReportDialogOpen(false)}
              disabled={generatingReport}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={downloadReport}
              disabled={generatingReport || getFilteredReportData().length === 0}
              className="bg-primary hover:bg-primary/90 px-6"
            >
              {generatingReport ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF Report
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
