"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  Gift,
  Package,
  DollarSign,
  Users,
} from "lucide-react";
import AdvancedSearch from "@/components/advanced-search";
import PackageForm from "@/components/package-form";
import ConfirmationModal from "@/components/confirmation-modal";

// Mock data for packages
const mockPackages = [
  {
    id: 1,
    name: "Bridal Beauty Package",
    description: "Complete bridal package with hair, makeup, and nail services",
    image: "/bridal-package.jpg",
    services: [
      "Premium Haircut",
      "Hair Styling",
      "Bridal Makeup",
      "Luxury Manicure",
    ],
    serviceCount: 4,
    totalPrice: 400,
    discount: 20,
    finalPrice: 320,
    isPrivate: true,
    status: "active",
  },
  {
    id: 2,
    name: "Spa Relaxation Package",
    description: "Ultimate relaxation with massage, facial, and aromatherapy",
    image: "/spa-package.jpg",
    services: [
      "Deep Tissue Massage",
      "Facial Treatment",
      "Aromatherapy",
      "Body Treatment",
    ],
    serviceCount: 4,
    totalPrice: 350,
    discount: 15,
    finalPrice: 297.5,
    isPrivate: false,
    status: "active",
  },
  {
    id: 3,
    name: "Hair Transformation Package",
    description: "Complete hair makeover with cut, color, and styling",
    image: "/hair-package.jpg",
    services: [
      "Premium Haircut",
      "Hair Coloring",
      "Hair Styling",
      "Hair Treatment",
    ],
    serviceCount: 4,
    totalPrice: 320,
    discount: 25,
    finalPrice: 240,
    isPrivate: false,
    status: "active",
  },
];

export default function PackagesPage() {
  const [packages, setPackages] = useState(mockPackages);
  const [filteredPackages, setFilteredPackages] = useState(mockPackages);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<
    (typeof mockPackages)[0] | null
  >(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    packageId: number | null;
  }>({ isOpen: false, packageId: null });

  const handleSearch = (filters: {
    searchTerm: string;
    category: string;
    status: string;
    priceRange: [number, number];
    duration: string;
    isPrivate: boolean | null;
    sortBy: string;
    sortOrder: string;
  }) => {
    let filtered = [...packages];

    if (filters.searchTerm) {
      filtered = filtered.filter(
        (pkg) =>
          pkg.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          pkg.description
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase()) ||
          pkg.services.some((service) =>
            service.toLowerCase().includes(filters.searchTerm.toLowerCase())
          )
      );
    }

    if (filters.status) {
      filtered = filtered.filter((pkg) => pkg.status === filters.status);
    }

    if (
      filters.priceRange &&
      (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000)
    ) {
      filtered = filtered.filter(
        (pkg) =>
          pkg.finalPrice >= filters.priceRange[0] &&
          pkg.finalPrice <= filters.priceRange[1]
      );
    }

    if (filters.isPrivate !== null) {
      filtered = filtered.filter((pkg) => pkg.isPrivate === filters.isPrivate);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (filters.sortBy === "price") {
        aValue = a.finalPrice;
        bValue = b.finalPrice;
      } else if (filters.sortBy === "serviceCount") {
        aValue = a.serviceCount;
        bValue = b.serviceCount;
      } else if (filters.sortBy === "name") {
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      } else {
        // Default to name sorting for unknown sortBy values
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
      }

      if (filters.sortOrder === "desc") {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    setFilteredPackages(filtered);
  };

  const handleResetSearch = () => {
    setFilteredPackages(packages);
  };

  const handleAddPackage = (formData: {
    name: string;
    description: string;
    selectedServices: string[];
    image: string;
    discount: string;
    isPrivate: boolean;
    totalPrice?: number;
    finalPrice?: number;
  }) => {
    const newPackage = {
      id: Date.now(),
      name: formData.name,
      description: formData.description,
      image: formData.image || "/default-package.jpg",
      services: formData.selectedServices,
      serviceCount: formData.selectedServices.length,
      totalPrice: formData.totalPrice || 0,
      discount: Number.parseFloat(formData.discount) || 0,
      finalPrice: formData.finalPrice || 0,
      isPrivate: formData.isPrivate,
      status: "active",
    };

    const updatedPackages = [...packages, newPackage];
    setPackages(updatedPackages);
    setFilteredPackages(updatedPackages);
    setIsAddDialogOpen(false);
  };

  const handleEditPackage = (pkg: (typeof mockPackages)[0]) => {
    setEditingPackage(pkg);
    setIsEditDialogOpen(true);
  };

  const handleUpdatePackage = (formData: {
    name: string;
    description: string;
    selectedServices: string[];
    image: string;
    discount: string;
    isPrivate: boolean;
    totalPrice?: number;
    finalPrice?: number;
  }) => {
    if (!editingPackage) return;

    const updatedPackage = {
      ...editingPackage,
      name: formData.name,
      description: formData.description,
      image: formData.image || editingPackage.image,
      services: formData.selectedServices,
      serviceCount: formData.selectedServices.length,
      totalPrice: formData.totalPrice || 0,
      discount: Number.parseFloat(formData.discount) || 0,
      finalPrice: formData.finalPrice || 0,
      isPrivate: formData.isPrivate,
    };

    const updatedPackages = packages.map((pkg) =>
      pkg.id === editingPackage.id ? updatedPackage : pkg
    );
    setPackages(updatedPackages);
    setFilteredPackages(updatedPackages);
    setIsEditDialogOpen(false);
    setEditingPackage(null);
  };

  const handleDeletePackage = (id: number) => {
    setDeleteConfirmation({ isOpen: true, packageId: id });
  };

  const confirmDeletePackage = () => {
    if (deleteConfirmation.packageId) {
      const updatedPackages = packages.filter(
        (pkg) => pkg.id !== deleteConfirmation.packageId
      );
      setPackages(updatedPackages);
      setFilteredPackages(updatedPackages);
    }
    setDeleteConfirmation({ isOpen: false, packageId: null });
  };

  const totalRevenue = packages.reduce((sum, pkg) => sum + pkg.finalPrice, 0);
  const averageDiscount =
    packages.reduce((sum, pkg) => sum + pkg.discount, 0) / packages.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Package Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Create and manage service packages with special pricing
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Add New Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Package</DialogTitle>
            </DialogHeader>
            <PackageForm
              onSubmit={handleAddPackage}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Advanced Search */}
      <AdvancedSearch
        onSearch={handleSearch}
        onReset={handleResetSearch}
        type="packages"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">
                  Total Packages
                </p>
                <p className="text-2xl font-bold text-blue-800">
                  {packages.length}
                </p>
                <p className="text-xs text-blue-600">
                  Showing {filteredPackages.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">
                  Total Value
                </p>
                <p className="text-2xl font-bold text-green-800">
                  ${totalRevenue.toFixed(0)}
                </p>
                <p className="text-xs text-green-600">Package revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">
                  Avg. Services
                </p>
                <p className="text-2xl font-bold text-blue-800">
                  {Math.round(
                    filteredPackages.reduce(
                      (sum, p) => sum + p.serviceCount,
                      0
                    ) / filteredPackages.length || 0
                  )}
                </p>
                <p className="text-xs text-blue-600">Per package</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700">
                  Avg. Discount
                </p>
                <p className="text-2xl font-bold text-purple-800">
                  {averageDiscount.toFixed(0)}%
                </p>
                <p className="text-xs text-purple-600">Package savings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map((pkg) => (
          <Card
            key={pkg.id}
            className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-border/50"
          >
            <div className="relative overflow-hidden rounded-t-lg">
              <Image
                src={pkg.image || "/default-package.jpg"}
                alt={pkg.name}
                width={400}
                height={192}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3 flex gap-2">
                {pkg.isPrivate && (
                  <Badge className="bg-purple-500 text-white text-xs">
                    Private
                  </Badge>
                )}
                <Badge className="bg-green-500 text-white text-xs">
                  {pkg.status}
                </Badge>
              </div>
              <div className="absolute bottom-3 left-3">
                <Badge className="bg-blue-500 text-white font-semibold">
                  {pkg.discount}% OFF
                </Badge>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {pkg.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {pkg.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-600">
                      {pkg.serviceCount} Services
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-green-600">
                        ${pkg.finalPrice.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground line-through">
                        ${pkg.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-green-700">
                      Package Savings
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      ${(pkg.totalPrice - pkg.finalPrice).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-700">
                    Included Services:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {pkg.services.slice(0, 2).map((service, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {service}
                      </Badge>
                    ))}
                    {pkg.services.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{pkg.services.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditPackage(pkg)}
                    className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeletePackage(pkg.id)}
                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredPackages.length === 0 && (
        <Card className="p-12 text-center">
          <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No packages found
          </h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search filters or create a new package.
          </p>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Package</DialogTitle>
          </DialogHeader>
          {editingPackage && (
            <PackageForm
              initialData={{
                name: editingPackage.name,
                description: editingPackage.description,
                services: editingPackage.services,
                image: editingPackage.image,
                discount: editingPackage.discount.toString(),
                isPrivate: editingPackage.isPrivate,
              }}
              onSubmit={handleUpdatePackage}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingPackage(null);
              }}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() =>
          setDeleteConfirmation({ isOpen: false, packageId: null })
        }
        onConfirm={confirmDeletePackage}
        title="Delete Package"
        description="Are you sure you want to delete this package? This action cannot be undone."
        type="danger"
        confirmText="Delete Package"
      />
    </div>
  );
}
