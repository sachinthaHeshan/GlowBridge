"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Gift, DollarSign, Calculator, Package, Percent } from "lucide-react"

interface PackageFormProps {
  initialData?: {
    name: string
    description: string
    services: string[]
    image: string
    discount: string
    isPrivate: boolean
  }
  onSubmit: (data: any) => void
  onCancel: () => void
  isEditing?: boolean
}

// Mock available services with prices
const availableServices = [
  { id: 1, name: "Premium Haircut", price: 85, category: "Hair Services" },
  { id: 2, name: "Hair Coloring", price: 150, category: "Hair Services" },
  { id: 3, name: "Hair Styling", price: 65, category: "Hair Services" },
  { id: 4, name: "Hair Treatment", price: 120, category: "Hair Services" },
  { id: 5, name: "Luxury Manicure", price: 65, category: "Nail Services" },
  { id: 6, name: "Pedicure", price: 55, category: "Nail Services" },
  { id: 7, name: "Nail Art", price: 45, category: "Nail Services" },
  { id: 8, name: "Deep Tissue Massage", price: 120, category: "Spa Services" },
  { id: 9, name: "Facial Treatment", price: 90, category: "Spa Services" },
  { id: 10, name: "Aromatherapy", price: 80, category: "Spa Services" },
  { id: 11, name: "Bridal Makeup", price: 200, category: "Beauty Services" },
  { id: 12, name: "Eyebrow Shaping", price: 35, category: "Beauty Services" },
]

// Suggested discount ranges based on service count
const getDiscountSuggestions = (serviceCount: number) => {
  if (serviceCount >= 4) return { min: 20, max: 30, recommended: 25 }
  if (serviceCount >= 3) return { min: 15, max: 25, recommended: 20 }
  if (serviceCount >= 2) return { min: 10, max: 20, recommended: 15 }
  return { min: 5, max: 15, recommended: 10 }
}

export default function PackageForm({ initialData, onSubmit, onCancel, isEditing = false }: PackageFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    selectedServices: initialData?.services || [],
    image: initialData?.image || "",
    discount: initialData?.discount || "",
    isPrivate: initialData?.isPrivate || false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [totalPrice, setTotalPrice] = useState(0)
  const [finalPrice, setFinalPrice] = useState(0)
  const [discountSuggestions, setDiscountSuggestions] = useState({ min: 5, max: 15, recommended: 10 })

  useEffect(() => {
    // Calculate total price based on selected services
    const selectedServiceObjects = availableServices.filter((service) =>
      formData.selectedServices.includes(service.name),
    )
    const total = selectedServiceObjects.reduce((sum, service) => sum + service.price, 0)
    setTotalPrice(total)

    // Update discount suggestions
    const suggestions = getDiscountSuggestions(formData.selectedServices.length)
    setDiscountSuggestions(suggestions)

    // Calculate final price
    const discount = Number.parseFloat(formData.discount) || 0
    const calculated = total - (total * discount) / 100
    setFinalPrice(calculated)
  }, [formData.selectedServices, formData.discount])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Package name is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (formData.selectedServices.length === 0) {
      newErrors.services = "At least one service must be selected"
    }

    if (!formData.discount || Number.parseFloat(formData.discount) < 0 || Number.parseFloat(formData.discount) > 50) {
      newErrors.discount = "Discount must be between 0 and 50%"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit({
        ...formData,
        services: formData.selectedServices,
        totalPrice,
        finalPrice,
      })
    }
  }

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  const handleServiceToggle = (serviceName: string, checked: boolean) => {
    const updatedServices = checked
      ? [...formData.selectedServices, serviceName]
      : formData.selectedServices.filter((s) => s !== serviceName)

    setFormData({ ...formData, selectedServices: updatedServices })
    clearError("services")
  }

  const handleDiscountSuggestion = (suggestedDiscount: number) => {
    setFormData({ ...formData, discount: suggestedDiscount.toString() })
    clearError("discount")
  }

  // Group services by category
  const servicesByCategory = availableServices.reduce(
    (acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = []
      }
      acc[service.category].push(service)
      return acc
    },
    {} as Record<string, typeof availableServices>,
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="package-name" className="text-sm font-medium">
            Package Name *
          </Label>
          <Input
            id="package-name"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value })
              clearError("name")
            }}
            placeholder="Enter package name"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="package-description" className="text-sm font-medium">
            Description *
          </Label>
          <Textarea
            id="package-description"
            value={formData.description}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value })
              clearError("description")
            }}
            placeholder="Enter package description"
            rows={3}
            className={errors.description ? "border-red-500" : ""}
          />
          {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="package-image" className="text-sm font-medium">
            Package Image URL
          </Label>
          <Input
            id="package-image"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            placeholder="Enter image URL (optional)"
          />
        </div>
      </div>

      {/* Service Selection */}
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium">Select Services to Include *</Label>
          {errors.services && <p className="text-sm text-red-500 mt-1">{errors.services}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(servicesByCategory).map(([category, services]) => (
            <Card key={category} className="p-4">
              <h4 className="font-medium text-sm text-gray-700 mb-3">{category}</h4>
              <div className="space-y-3">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`service-${service.id}`}
                      checked={formData.selectedServices.includes(service.name)}
                      onCheckedChange={(checked) => handleServiceToggle(service.name, checked as boolean)}
                    />
                    <div className="flex-1 min-w-0">
                      <Label htmlFor={`service-${service.id}`} className="text-sm font-medium cursor-pointer">
                        {service.name}
                      </Label>
                      <p className="text-xs text-green-600 font-medium">${service.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Discount Section */}
      {formData.selectedServices.length > 0 && (
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-700 flex items-center">
              <Percent className="w-4 h-4 mr-2" />
              Package Discount
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="package-discount" className="text-sm font-medium">
                Discount Percentage (%) *
              </Label>
              <Input
                id="package-discount"
                type="number"
                value={formData.discount}
                onChange={(e) => {
                  setFormData({ ...formData, discount: e.target.value })
                  clearError("discount")
                }}
                placeholder="0"
                min="0"
                max="50"
                className={errors.discount ? "border-red-500" : ""}
              />
              {errors.discount && <p className="text-sm text-red-500 mt-1">{errors.discount}</p>}
            </div>

            <div className="p-3 bg-white rounded-lg border border-orange-200">
              <p className="text-xs font-medium text-orange-700 mb-2">
                Suggested Discount Ranges for {formData.selectedServices.length} Services:
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleDiscountSuggestion(discountSuggestions.min)}
                  className="text-xs hover:bg-orange-50"
                >
                  {discountSuggestions.min}%
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleDiscountSuggestion(discountSuggestions.recommended)}
                  className="text-xs bg-orange-100 hover:bg-orange-200 border-orange-300"
                >
                  {discountSuggestions.recommended}% (Recommended)
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleDiscountSuggestion(discountSuggestions.max)}
                  className="text-xs hover:bg-orange-50"
                >
                  {discountSuggestions.max}%
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Calculator */}
      {formData.selectedServices.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center">
              <Calculator className="w-4 h-4 mr-2" />
              Package Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-600">Total Service Price:</span>
              <span className="font-medium text-green-800">${totalPrice.toFixed(2)}</span>
            </div>
            {formData.discount && Number.parseFloat(formData.discount) > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600">Package Discount ({formData.discount}%):</span>
                  <span className="font-medium text-red-600">
                    -${((totalPrice * Number.parseFloat(formData.discount)) / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600">Customer Saves:</span>
                  <span className="font-bold text-green-600">${(totalPrice - finalPrice).toFixed(2)}</span>
                </div>
                <hr className="border-green-200" />
              </>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-green-700">Final Package Price:</span>
              <span className="text-lg font-bold text-green-800">${finalPrice.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Privacy Toggle */}
      <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <Switch
          id="package-private"
          checked={formData.isPrivate}
          onCheckedChange={(checked) => setFormData({ ...formData, isPrivate: checked })}
        />
        <div className="flex-1">
          <Label htmlFor="package-private" className="text-sm font-medium text-purple-700">
            Private Package
          </Label>
          <p className="text-xs text-purple-600 mt-1">Private packages are only visible to selected customers</p>
        </div>
      </div>

      {/* Live Preview */}
      {formData.name && formData.selectedServices.length > 0 && (
        <div>
          <Label className="text-sm font-medium">Live Preview</Label>
          <Card className="mt-2 overflow-hidden">
            <div className="relative">
              <div className="h-32 bg-gradient-to-r from-orange-100 to-red-100 flex items-center justify-center">
                <Gift className="w-12 h-12 text-orange-600" />
              </div>
              <div className="absolute top-3 right-3 flex gap-2">
                {formData.isPrivate && <Badge className="bg-purple-500 text-white text-xs">Private</Badge>}
                <Badge className="bg-green-500 text-white text-xs">active</Badge>
              </div>
              <div className="absolute bottom-3 left-3">
                <Badge className="bg-orange-500 text-white font-semibold">{formData.discount || 0}% OFF</Badge>
              </div>
            </div>

            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{formData.name}</h3>
                <p className="text-sm text-muted-foreground">{formData.description || "No description provided"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-600">{formData.selectedServices.length} Services</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-green-600">${finalPrice.toFixed(2)}</span>
                    {formData.discount && Number.parseFloat(formData.discount) > 0 && (
                      <span className="text-xs text-muted-foreground line-through">${totalPrice.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700">Included Services:</p>
                <div className="flex flex-wrap gap-1">
                  {formData.selectedServices.slice(0, 3).map((service, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                  {formData.selectedServices.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{formData.selectedServices.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
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
          className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
        >
          {isEditing ? "Update Package" : "Create Package"}
        </Button>
      </div>
    </form>
  )
}
