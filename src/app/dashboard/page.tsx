"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Navbar from "@/components/Navbar"
import CategoryCard from "@/components/CategoryCard"
import StatusBar from "@/components/StatusBar"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import CategoryFormModal from "@/components/CategoryFormModal"


export default function DashboardPage() {
  const [search, setSearch] = useState("")
  const [categories, setCategories] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any | null>(null)
  const router = useRouter()

  // ✅ Redirect to Add Service page
const goToAddService = () => {
  router.push("/service/add") // <-- your add service page route
}


  // ✅ Fetch categories from API (service_category table)
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/service-category") // <-- create this API
        if (res.ok) {
          const data = await res.json()
          setCategories(data)
        }
      } catch (err) {
        console.error("Error fetching categories:", err)
      }
    }
    fetchCategories()
  }, [])

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <Navbar />

      <div className="mt-4"></div>

      {/* Hero Section */}
      <section className="relative h-[60vh] w-full">
        <img
          src="/images/hero3.jpg"
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-10 h-full flex flex-col justify-center items-end pr-10 md:pr-20 text-right max-w-2xl ml-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-purple-700">
            Spa & Beauty Center
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-800 leading-relaxed max-w-lg">
            GlowBridge is your one-stop platform to explore the best salon services,
            wellness treatments, and beauty care near you. Discover premium packages,
            schedule appointments with ease, and unlock a world of style & relaxation.
          </p>

          <div className="mt-6 flex justify-end">
            <StatusBar totalCategories={categories.length} totalServices={25} />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="flex-1 py-12 px-6 md:px-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
          Our Main Categories
        </h2>

        {/* Search */}
        <div className="flex justify-start mb-8">
          <input
            type="text"
            placeholder="Search categories..."
            className="w-full md:w-1/3 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
          {filteredCategories.map((cat, i) => (
            <CategoryCard
              key={cat.id}
              name={cat.name}
              image={cat.image || "/images/default.jpg"} // ✅ fallback image
              onShow={() => router.push(`/category/${encodeURIComponent(cat.name)}`)} // ✅ name instead of id
              onEdit={() => {
                setEditingCategory(cat)
                setShowModal(true)
              }}
              onDelete={() => alert(`Delete ${cat.name}`)}
            />
          ))}
        </div>
      </section>

      {/* Buttons near footer */}
      <div className="flex justify-center gap-6 mt-16 mb-12">
        <Button
          className="bg-gray-300 text-gray-800 hover:bg-gray-400"
          onClick={goToAddService} // ✅ redirect to Add Service page
        >
          Add New Service
        </Button>

        <Button
          className="bg-gray-300 text-gray-800 hover:bg-gray-400"
          onClick={() => {
            setEditingCategory(null)
            setShowModal(true)
          }}
        >
          Add New Category
        </Button>

        <Button className="bg-gray-300 text-gray-800 hover:bg-gray-400">
          Packages
        </Button>
      </div>

      <Footer />

       {/* Category Modal */}
      <CategoryFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        category={editingCategory}
        onSaved={newCat => {
          setCategories(prev =>
            editingCategory
              ? prev.map(c => (c.id === newCat.id ? newCat : c))
              : [...prev, newCat]
          )
        }}
      />

    </div>
  )
}
