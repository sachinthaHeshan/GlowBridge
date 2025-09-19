"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

interface CategoryCardProps {
  name: string
  image: string
  onShow: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function CategoryCard({ name, image, onShow, onEdit, onDelete }: CategoryCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col"
    >
      <img src={image} alt={name} className="w-full h-44 object-cover" />
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-lg text-gray-800 mb-4">{name}</h3>
        <div className="mt-auto flex gap-2">
          <Button
            size="sm"
            className="bg-black text-white hover:bg-gray-800 flex-1"
            onClick={onShow}
          >
            Show Services 
          </Button>
          <Button
            size="sm"
            className="bg-gray-300 text-gray-800 hover:bg-gray-400 flex-1"
            onClick={onEdit}
          >
            Edit
          </Button>
          <Button
            size="sm"
            className="bg-red-600 text-white hover:bg-red-700 flex-1"
            onClick={onDelete}
          >
            Delete
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
