"use client";

export default function Navbar() {
  return (
    <header className="w-full shadow-sm bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-bold text-purple-800">Glow Bridge</h1>

        <nav className="hidden md:flex gap-6 text-gray-700 font-medium">
          <a href="#" className="hover:text-gray-900">Home</a>
          <a href="#" className="hover:text-gray-900">Pages</a>
          <a href="#" className="hover:text-gray-900">Schedule</a>
          <a href="#" className="hover:text-gray-900">Shop</a>
          <a href="#" className="hover:text-gray-900">Services</a>
        </nav>

        {/* empty spacer to keep center alignment on small screens */}
        <div className="w-10" />
      </div>
    </header>
  );
}
