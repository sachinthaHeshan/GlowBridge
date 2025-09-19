// src/app/category/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";

type Service = {
  id: string;
  name: string;
  description: string | null;
  duration: string | null;
  price: number | null;
  is_public: boolean;
  discount: number | null;
};

export default function CategoryServicesPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const categoryName = decodeURIComponent(params.id); // ✅ use category name instead of id
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadServices();
  }, [categoryName]);

  async function loadServices() {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/service-category/${encodeURIComponent(categoryName)}/services`
      );
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error(err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(serviceId: string) {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      const res = await fetch(`/api/service/${serviceId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
      alert("Service deleted.");
    } catch (err) {
      console.error(err);
      alert("Failed to delete service.");
    }
  }

  async function handleTogglePublic(serviceId: string, current: boolean) {
    try {
      const getRes = await fetch(`/api/service/${serviceId}`);
      if (!getRes.ok) throw new Error("Failed to fetch service");
      const existing = await getRes.json();

      const updated = { ...existing, is_public: !current };

      const putRes = await fetch(`/api/service/${serviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!putRes.ok) throw new Error("Failed to update");
      const newService = await putRes.json();

      setServices((prev) => prev.map((s) => (s.id === serviceId ? newService : s)));
    } catch (err) {
      console.error(err);
      alert("Failed to toggle public/private.");
    }
  }

  function handleEdit(serviceId: string) {
    router.push(`/service/${serviceId}/edit`);
  }

  function handleAdd() {
    router.push(`/service/add?category=${encodeURIComponent(categoryName)}`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 px-6 md:px-16 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="px-3 py-2 rounded-md border border-gray-200 text-sm text-black hover:bg-gray-100"
              >
                ← Back
              </button>
              <h1 className="text-3xl font-bold text-pink-300/80 text-black">
                {categoryName}
              </h1>
            </div>

            <div>
              <Button
                onClick={handleAdd}
                className="bg-pink-200 text-black hover:bg-pink-300"
              >
                Add new service
              </Button>
            </div>
          </div>

          {loading ? (
            <div>Loading services...</div>
          ) : services.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              No services found for this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((s) => (
                <ServiceCard
                  key={s.id}
                  service={s}
                  onEdit={() => handleEdit(s.id)}
                  onDelete={() => handleDelete(s.id)}
                  onToggle={() => handleTogglePublic(s.id, s.is_public)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
