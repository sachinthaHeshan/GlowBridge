// src/components/ServiceCard.tsx
"use client";

import React from "react";

type Props = {
  service: {
    id: string;
    name: string;
    description?: string | null;
    duration?: string | null;
    price?: number | null;
    is_public: boolean;
    discount?: number | null;
    service_categories?: string[];
    package_services?: string[];
  };
  onEdit?: () => void;
  onDelete?: () => void;
  onToggle?: () => void;
};

export default function ServiceCard({ service, onEdit, onDelete, onToggle }: Props) {
  const {
    name,
    description,
    duration,
    price,
    is_public,
    discount,
  } = service;

  return (
    <article className="relative bg-white border rounded-xl shadow-sm p-6 flex flex-col h-full">
      {/* discount badge */}
      {discount && Number(discount) > 0 && (
        <div className="absolute left-4 top-4 bg-pink-200 text-black text-xs font-semibold px-2 py-1 rounded">
          {discount}% OFF
        </div>
      )}

      <div className="flex-1">
        <h3 className="text-xl font-bold text-black mb-2">{name}</h3>
        <p className="text-sm text-black/80 mb-3">{description}</p>

        <div className="flex items-center gap-4 mb-3 text-sm text-black/80">
          <div><span className="font-semibold">Price:</span> {price != null ? `LKR ${price}` : "—"}</div>
          <div><span className="font-semibold">Duration:</span> {duration || "—"}</div>
          <div>
            <span className="font-semibold">Status:</span>{" "}
            <span className={`${is_public ? "text-green-600" : "text-gray-500"}`}>{is_public ? "Public" : "Private"}</span>
          </div>
        </div>
      </div>

      {/* buttons */}
      <div className="mt-4 pt-3 border-t flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 rounded-md border px-3 py-2 text-sm text-black hover:bg-gray-50"
        >
          Edit
        </button>

        <button
          onClick={onDelete}
          className="flex-1 rounded-md border px-3 py-2 text-sm text-black/90 hover:bg-red-50"
        >
          Delete
        </button>

        <button
          onClick={onToggle}
          className="flex-1 rounded-md border px-3 py-2 text-sm text-black/90 hover:bg-gray-50"
        >
          {is_public ? "Make Private" : "Make Public"}
        </button>
      </div>
    </article>
  );
}
