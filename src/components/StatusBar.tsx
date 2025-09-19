interface StatusBarProps {
  totalCategories: number
  totalServices: number
}

export default function StatusBar({ totalCategories, totalServices }: StatusBarProps) {
  return (
    <div className="bg-white rounded-xl shadow-md flex items-center gap-6 px-8 py-4 w-fit">
      <div className="text-center">
        <p className="text-2xl font-bold text-purple-700">{totalCategories}</p>
        <p className="text-gray-600 text-sm">Categories</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-bold text-purple-700">{totalServices}</p>
        <p className="text-gray-600 text-sm">Services</p>
      </div>
    </div>
  )
}
