"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Eye, FolderOpen, Package } from "lucide-react"
import AdvancedSearch from "@/components/advanced-search"
import CategoryForm from "@/components/category-form"
import ConfirmationModal from "@/components/confirmation-modal"

// Mock data for categories
const mockCategories = [
  {
    id: 1,
    name: "Hair Services",
    description: "Professional hair cutting, styling, and treatment services",
    serviceCount: 12,
    image: "/hair-salon-services.jpg",
    status: "active",
    services: ["Haircut", "Hair Coloring", "Hair Styling", "Hair Treatment"],
  },
  {
    id: 2,
    name: "Nail Services",
    description: "Complete nail care including manicures and pedicures",
    serviceCount: 8,
    image: "/nail-salon-services.jpg",
    status: "active",
    services: ["Manicure", "Pedicure", "Nail Art", "Gel Polish"],
  },
  {
    id: 3,
    name: "Spa Services",
    description: "Relaxing spa treatments and wellness services",
    serviceCount: 15,
    image: "/spa-wellness-services.jpg",
    status: "active",
    services: ["Massage", "Facial", "Body Treatment", "Aromatherapy"],
  },
  {
    id: 4,
    name: "Beauty Services",
    description: "Makeup, skincare, and beauty enhancement services",
    serviceCount: 10,
    image: "/beauty-makeup-services.jpg",
    status: "active",
    services: ["Makeup", "Eyebrow Shaping", "Eyelash Extensions", "Skincare"],
  },
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState(mockCategories)
  const [filteredCategories, setFilteredCategories] = useState(mockCategories)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, categoryId: null })
  const router = useRouter()

  const handleSearch = (filters) => {
    let filtered = [...categories]

    // Search term filter
    if (filters.searchTerm) {
      filtered = filtered.filter(
        (category) =>
          category.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          category.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          category.services.some((service) => service.toLowerCase().includes(filters.searchTerm.toLowerCase())),
      )
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((category) => category.status === filters.status)
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[filters.sortBy]
      let bValue = b[filters.sortBy]

      if (filters.sortBy === "serviceCount") {
        aValue = a.serviceCount
        bValue = b.serviceCount
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (filters.sortOrder === "desc") {
        return aValue < bValue ? 1 : -1
      }
      return aValue > bValue ? 1 : -1
    })

    setFilteredCategories(filtered)
  }

  const handleResetSearch = () => {
    setFilteredCategories(categories)
  }

  const handleAddCategory = (formData) => {
    const newCategory = {
      id: Date.now(),
      name: formData.name,
      description: formData.description,
      serviceCount: formData.services.split(",").filter((s) => s.trim()).length,
      image: formData.image || "/default-category.jpg",
      status: "active",
      services: formData.services
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
    }

    const updatedCategories = [...categories, newCategory]
    setCategories(updatedCategories)
    setFilteredCategories(updatedCategories)
    setIsAddDialogOpen(false)
  }

  const handleEditCategory = (category) => {
    setEditingCategory(category)
    setIsEditDialogOpen(true)
  }

  const handleUpdateCategory = (formData) => {
    const updatedCategory = {
      ...editingCategory,
      name: formData.name,
      description: formData.description,
      serviceCount: formData.services.split(",").filter((s) => s.trim()).length,
      image: formData.image || editingCategory.image,
      services: formData.services
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
    }

    const updatedCategories = categories.map((cat) => (cat.id === editingCategory.id ? updatedCategory : cat))
    setCategories(updatedCategories)
    setFilteredCategories(updatedCategories)
    setIsEditDialogOpen(false)
    setEditingCategory(null)
  }

  const handleDeleteCategory = (id) => {
    setDeleteConfirmation({ isOpen: true, categoryId: id })
  }

  const confirmDeleteCategory = () => {
    if (deleteConfirmation.categoryId) {
      const updatedCategories = categories.filter((cat) => cat.id !== deleteConfirmation.categoryId)
      setCategories(updatedCategories)
      setFilteredCategories(updatedCategories)
    }
    setDeleteConfirmation({ isOpen: false, categoryId: null })
  }

  const handleViewServices = (category) => {
    router.push(`/dashboard/categories/${category.id}/services`)
  }

  const totalServices = categories.reduce((sum, category) => sum + category.serviceCount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Category Management
          </h1>
          <p className="text-muted-foreground mt-2">Manage your service categories and organize your offerings</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Add New Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <CategoryForm onSubmit={handleAddCategory} onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Advanced Search */}
      <AdvancedSearch onSearch={handleSearch} onReset={handleResetSearch} type="categories" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Total Categories</p>
                <p className="text-2xl font-bold text-blue-800">{categories.length}</p>
                <p className="text-xs text-blue-600">Showing {filteredCategories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Total Services</p>
                <p className="text-2xl font-bold text-green-800">{totalServices}</p>
                <p className="text-xs text-green-600">Across all categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <Card
            key={category.id}
            className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-border/50"
          >
            <div className="relative overflow-hidden rounded-t-lg">
              <img
                src={category.image || "/default-category.jpg"}
                alt={category.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3">
                <Badge className="bg-green-500 text-white">{category.status}</Badge>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-600">{category.serviceCount} Services</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {category.services.slice(0, 3).map((service, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                  {category.services.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{category.services.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewServices(category)}
                    className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 bg-transparent"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Services
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditCategory(category)}
                    className="hover:bg-green-50 hover:text-green-600 hover:border-green-300"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteCategory(category.id)}
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
      {filteredCategories.length === 0 && (
        <Card className="p-12 text-center">
          <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">No categories found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your search filters or create a new category.</p>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <CategoryForm
              initialData={{
                name: editingCategory.name,
                description: editingCategory.description,
                services: editingCategory.services.join(", "),
                image: editingCategory.image,
              }}
              onSubmit={handleUpdateCategory}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setEditingCategory(null)
              }}
              isEditing={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, categoryId: null })}
        onConfirm={confirmDeleteCategory}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone and will affect all associated services."
        type="danger"
        confirmText="Delete Category"
      />
    </div>
  )
}
