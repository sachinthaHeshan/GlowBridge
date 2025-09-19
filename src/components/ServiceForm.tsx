"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ServiceCard from "./ServiceCard";

type Props = {
  mode: "add" | "edit";
  categoryName?: string;
  serviceId?: string;
  onCancel: () => void;
};

type Service = {
  id: string;
  name: string;
  description: string | null;
  duration: string | null;
  price: number | null;
  is_public: boolean;
  discount: number | null;
};

type ServiceFormState = {
  id?: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  discount: number;
  is_public: boolean;
  categoryName?: string;
};

const FIXED_CATEGORIES = [
  "Hair Care & Styling",
  "Nail Care",
  "Skin & Beauty",
  "Spa & Wellness",
  "Hair Removal",
  "Advanced / Cosmetic Treatments",
  "Hair & Scalp Treatments",
];

export default function ServiceForm({ mode, categoryName, serviceId, onCancel }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<ServiceFormState>({
    name: "",
    description: "",
    duration: "",
    price: 0,
    discount: 0,
    is_public: true,
    categoryName,
  });

  const [basePrice, setBasePrice] = useState(0); // store original price
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<Service | null>(null);

  // fetch existing data in edit mode
  useEffect(() => {
    if (mode === "edit" && serviceId) {
      (async () => {
        const res = await fetch(`/api/service/${serviceId}`);
        if (res.ok) {
          const data = await res.json();
          setForm({
            id: data.id,
            name: data.name || "",
            description: data.description || "",
            duration: data.duration || "",
            price: data.price || 0,
            discount: data.discount || 0,
            is_public: data.is_public ?? true,
            categoryName: data.categoryName || "",
          });
          setBasePrice(data.price || 0);
        }
      })();
    }
  }, [mode, serviceId]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    if (name === "price") {
      const newBasePrice = Number(value) || 0;
      setBasePrice(newBasePrice);
      setForm((prev) => ({ ...prev, price: newBasePrice }));
    } else if (name === "discount") {
      const discountVal = Number(value) || 0;
      const finalPrice = basePrice - (basePrice * discountVal) / 100;
      setForm((prev) => ({
        ...prev,
        discount: discountVal,
        price: finalPrice,
      }));
      if (discountVal > 0) {
        alert(`Price updated after discount: ${finalPrice}`);
      }
    } else if ((e.target as HTMLInputElement).type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Service name is required");
      return;
    }
    if (!form.duration) {
      alert("Duration is required");
      return;
    }

    setLoading(true);
    try {
      let saved;
      if (mode === "add") {
        const res = await fetch("/api/service", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            salon_id: "03fbca94-7690-4669-9208-c8a74f61bcbc", // TODO dynamic
            is_completed: false,
            ...form,
          }),
        });
        saved = await res.json();

        // link to category
        await fetch("/api/service-category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_id: saved.id,
            name: form.categoryName,
            description: form.categoryName,
          }),
        });
      } else {
        const res = await fetch(`/api/service/${serviceId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        saved = await res.json();
      }

      setPreview(saved);
    } catch (err) {
      console.error(err);
      alert("Failed to save service");
    } finally {
      setLoading(false);
    }
  }

  const handlePreviewSave = () => {
    router.push(`/category/${encodeURIComponent(form.categoryName || "")}`);
  };

  return (
    <>
      {/* Form */}
      <div className={`bg-white p-8 rounded-2xl shadow-md border ${preview ? "blur-sm pointer-events-none" : ""}`}>
        <h2 className="text-2xl font-bold mb-6">
          {mode === "add" ? "Add Service" : "Edit Service"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Service Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Service name"
              className="w-full border p-2 rounded"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              className="w-full border p-2 rounded"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium mb-1">Duration</label>
            <select
              name="duration"
              value={form.duration}
              onChange={handleChange}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Select duration</option>
              <option value="30 mins">30 mins</option>
              <option value="1 hour">1 hour</option>
              <option value="1.5 hours">1.5 hours</option>
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="Enter price"
              className="w-full border p-2 rounded"
              required
            />
          </div>

          {/* Discount */}
          <div>
            <label className="block text-sm font-medium mb-1">Discount (%)</label>
            <input
              name="discount"
              type="number"
              value={form.discount}
              onChange={handleChange}
              placeholder="Enter discount"
              className="w-full border p-2 rounded"
            />
          </div>

           <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            name="categoryName"
            value={form.categoryName ?? ""}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select category</option>
            {FIXED_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

          {/* Public toggle */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_public"
              checked={form.is_public}
              onChange={handleChange}
            />
            Public
          </label>

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-pink-200 text-black"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-96">
            <h3 className="text-xl font-bold mb-4 text-center">Service Preview</h3>
            <ServiceCard
              service={preview}
              onEdit={undefined}
              onDelete={undefined}
              onToggle={undefined}
            />
            <button
              onClick={handlePreviewSave}
              className="mt-6 w-full bg-pink-200 text-black px-4 py-2 rounded-lg font-semibold hover:bg-pink-300"
            >
              Save & Continue
            </button>
          </div>
        </div>
      )}
    </>
  );
}
