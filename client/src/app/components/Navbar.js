"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, ShoppingCart, User, MapPin, Truck, HelpCircle } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim() && selectedCategory === "All Categories") return;

    // Build search URL with query parameters
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append("q", searchTerm.trim());
    if (selectedCategory !== "All Categories") params.append("category", selectedCategory);

    // Redirect to medicine search page with parameters
    router.push(`/frontend/user/medicine?${params.toString()}`);
  };

  return (
    <header className="w-full bg-white border-b sticky top-0 z-50">
      {/* Top Announcement Bar */}
      <div className="bg-[#0E7C50] text-white text-xs py-1.5 px-4 flex justify-between items-center">
        <div>Free delivery on all orders above <strong>$25</strong></div>
        <div className="flex items-center gap-4 text-[11px] opacity-90">
          <Link href="/frontend/user/dashboard#branch-section" className="flex items-center gap-1 hover:underline">
            <MapPin size={12} /> Store Locator
          </Link>
          <Link href="/frontend/user/Order_Status" className="flex items-center gap-1 hover:underline">
            <Truck size={12} /> Track Order
          </Link>
          <span className="flex items-center gap-1 cursor-pointer hover:underline">
            <HelpCircle size={12} /> Help Center
          </span>
        </div>
      </div>

      {/* Main Header / Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/frontend/user/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#0E7C50] flex items-center justify-center font-bold text-xl">
            +
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-gray-900 block leading-none">
              HealthFirst
            </span>
            <span className="text-[9px] tracking-widest text-gray-400 font-semibold uppercase block">
              PHARMACY
            </span>
          </div>
        </Link>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#0E7C50]">
          <input
            type="text"
            placeholder="Search medicines, healthcare products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 text-xs text-gray-800 focus:outline-none"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-50 text-xs text-gray-600 border-l px-3 py-2 focus:outline-none cursor-pointer border-r"
          >
            <option value="All Categories">All Categories</option>
            <option value="Medicines">Medicines</option>
            <option value="Health Care">Health Care</option>
            <option value="Personal Care">Personal Care</option>
            <option value="Baby Care">Baby Care</option>
            <option value="Wellness">Wellness</option>
            <option value="Devices">Devices</option>
          </select>

          <button
            type="submit"
            className="bg-[#0E7C50] hover:bg-[#0B6A44] text-white px-4 py-2 transition flex items-center justify-center shrink-0"
          >
            <Search size={16} />
          </button>
        </form>

        {/* User Account / Cart Links */}
        <div className="flex items-center gap-5 shrink-0 text-xs font-semibold text-gray-700">
          <Link href="/frontend/user/profile" className="flex items-center gap-1.5 hover:text-[#0E7C50]">
            <User size={18} />
            <div className="hidden sm:block text-left">
              <span className="text-[10px] text-gray-400 block font-normal leading-tight">Sign In</span>
              <span>My Account</span>
            </div>
          </Link>

          <Link href="/frontend/user/cart" className="flex items-center gap-1.5 hover:text-[#0E7C50] relative">
            <div className="relative">
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-[#0E7C50] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                0
              </span>
            </div>
            <span className="hidden sm:inline">My Cart</span>
          </Link>
        </div>
      </div>

      {/* Navigation Bar Links */}
      <nav className="border-t bg-white px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-6 text-xs font-medium text-gray-600 overflow-x-auto py-2.5">
          <Link href="/frontend/user/medicine?category=Medicines" className="hover:text-[#0E7C50] whitespace-nowrap">Medicines</Link>
          <Link href="/frontend/user/medicine?category=Health Care" className="hover:text-[#0E7C50] whitespace-nowrap">Health Care</Link>
          <Link href="/frontend/user/medicine?category=Personal Care" className="hover:text-[#0E7C50] whitespace-nowrap">Personal Care</Link>
          <Link href="/frontend/user/medicine?category=Baby Care" className="hover:text-[#0E7C50] whitespace-nowrap">Baby Care</Link>
          <Link href="/frontend/user/medicine?category=Wellness" className="hover:text-[#0E7C50] whitespace-nowrap">Wellness</Link>
          <Link href="/frontend/user/medicine?category=Devices" className="hover:text-[#0E7C50] whitespace-nowrap">Devices</Link>
          <Link href="/frontend/user/medicine?category=Health Conditions" className="hover:text-[#0E7C50] whitespace-nowrap">Health Conditions</Link>
          <span className="text-amber-600 font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap">
            Offers <span className="bg-amber-100 text-amber-700 text-[9px] px-1.5 py-0.2 rounded uppercase font-extrabold">Hot</span>
          </span>
        </div>
      </nav>
    </header>
  );
}