"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import CategoryCard from "./CategoryCard"
import { Button } from "./ui/button"

type Props = {
  isOpen: boolean
  onClose: () => void
  category?: any // for edit
  onSaved: (category: any) => void
}

export default function CategoryFormModal({ isOpen, onClose, category, onSaved }: Props) {
  const [mounted, setMounted] = useState(false)
  const [preview, setPreview] = useState<any | null>(null)
  const [form, setForm] = useState({
    name: "",
    description: "",
    services: "",
    image: ""
  })

  useEffect(() => {
    setMounted(true)
    if (category) {
      setForm({
        name: category.name || "",
        description: category.description || "",
        services: category.services || "",
        image: category.image || ""
      })
    } else {
      setForm({ name: "", description: "", services: "", image: "" })
    }
  }, [category])

  if (!isOpen || !mounted) return null

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()

    if (!form.name.trim()) {
      alert("Name is required")
      return
    }
    if (!form.description.trim()) {
      alert("Description is required")
      return
    }
    if (!form.image.trim()) {
      alert("Image URL is required")
      return
    }

    setPreview(form)
  }

  async function handleConfirm() {
    try {
      const res = await fetch("/api/service-category", {
        method: category ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: category?.id,
          name: form.name,
          description: form.description,
          service_id: "dummy-service-id", // TODO: link to service logic
          image: form.image
        })
      })

      if (!res.ok) throw new Error("Failed to save category")

      const saved = await res.json()
      onSaved(saved)
      onClose()
    } catch (err) {
      console.error(err)
      alert("Error saving category")
    }
  }

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md z-50">

      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg relative">
        <h2 className="text-xl font-bold mb-6">
          {category ? "Edit Service Category" : "Add Service Category"}
        </h2>

        {!preview ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Services</label>
              <input
                name="services"
                value={form.services}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                placeholder="Comma-separated services"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input
                name="image"
                value={form.image}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button type="button" onClick={onClose} className="bg-gray-200">
                Cancel
              </Button>
              <Button type="submit" className="bg-pink-200 text-black">
                Save
              </Button>
            </div>
          </form>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-2">Preview</h3>
            <CategoryCard
              name={preview.name}
              image={preview.image}
              onShow={() => {}}
              onEdit={() => {}}
              onDelete={() => {}}
            />

            <div className="flex justify-end gap-4 mt-6">
              <Button onClick={() => setPreview(null)} className="bg-gray-200">
                Back
              </Button>
              <Button onClick={handleConfirm} className="bg-green-400">
                Save & Continue
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
