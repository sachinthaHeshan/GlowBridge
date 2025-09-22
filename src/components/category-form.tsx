"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, X, Package } from "lucide-react"

interface CategoryFormProps {
  initialData?: {
    name: string
    description: string
    services: string
    image?: string | File | null
  }
  onSubmit: (data: any) => void
  onCancel: () => void
  isEditing?: boolean
}

export default function CategoryForm({ initialData, onSubmit, onCancel, isEditing = false }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    services: initialData?.services || "",
    image: initialData?.image || null,
  })

  const [imagePreview, setImagePreview] = useState<string | null>(
    typeof initialData?.image === "string" ? initialData.image : null,
  )
  const [dragActive, setDragActive] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!formData.services.trim()) {
      newErrors.services = "At least one service is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageChange = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setFormData({ ...formData, image: file })
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0])
    }
  }

  const removeImage = () => {
    setFormData({ ...formData, image: null })
    setImagePreview(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const servicesList = formData.services
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="category-name" className="text-sm font-medium">
            Category Name *
          </Label>
          <Input
            id="category-name"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value })
              if (errors.name) setErrors({ ...errors, name: "" })
            }}
            placeholder="Enter category name"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div>
          <Label htmlFor="category-description" className="text-sm font-medium">
            Description *
          </Label>
          <Textarea
            id="category-description"
            value={formData.description}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value })
              if (errors.description) setErrors({ ...errors, description: "" })
            }}
            placeholder="Enter category description"
            rows={3}
            className={errors.description ? "border-red-500" : ""}
          />
          {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
        </div>

        <div>
          <Label htmlFor="category-services" className="text-sm font-medium">
            Services (comma-separated) *
          </Label>
          <Textarea
            id="category-services"
            value={formData.services}
            onChange={(e) => {
              setFormData({ ...formData, services: e.target.value })
              if (errors.services) setErrors({ ...errors, services: "" })
            }}
            placeholder="Service 1, Service 2, Service 3"
            rows={2}
            className={errors.services ? "border-red-500" : ""}
          />
          {errors.services && <p className="text-sm text-red-500 mt-1">{errors.services}</p>}

          {servicesList.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {servicesList.map((service, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {service}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label className="text-sm font-medium">Category Image</Label>
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : imagePreview
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <span className="text-sm font-medium text-blue-600 hover:text-blue-500">Upload an image</span>
                    <span className="text-sm text-gray-500"> or drag and drop</span>
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleImageChange(e.target.files[0])}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF up to 10MB</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Live Preview */}
      {formData.name && (
        <div>
          <Label className="text-sm font-medium">Live Preview</Label>
          <Card className="mt-2 overflow-hidden">
            <div className="relative">
              <img
                src={imagePreview || "/placeholder.svg?height=120&width=300&text=Category+Image"}
                alt={formData.name}
                className="w-full h-32 object-cover"
              />
              <Badge className="absolute top-2 right-2 bg-green-500 text-white">active</Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg">{formData.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{formData.description || "No description provided"}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Package className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-600">
                  {servicesList.length} Service{servicesList.length !== 1 ? "s" : ""}
                </span>
              </div>
              {servicesList.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {servicesList.slice(0, 3).map((service, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                  {servicesList.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{servicesList.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
        >
          {isEditing ? "Update Category" : "Create Category"}
        </Button>
      </div>
    </form>
  )
}
