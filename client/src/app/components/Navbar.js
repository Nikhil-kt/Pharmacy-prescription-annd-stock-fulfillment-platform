"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  User,
  ShoppingCart,
  ChevronDown,
  MapPin,
  Package,
  HelpCircle,
  Plus,
  Menu,
  X,
} from "lucide-react";

const categoryLinks = [
  "Medicines",
  "Health Care",
  "Personal Care",
  "Baby Care",
  "Wellness",
  "Devices",
  "Health Conditions",
];

const allCategories = [
  "All Categories",
  "Medicines",
  "Health Care",
  "Personal Care",
  "Baby Care",
  "Wellness",
  "Devices",
];

export default function Navbar() {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = 0;

  return (
    <header className="w-full border-b border-gray-100 bg-white">
      {/* Utility bar */}
      <div className="bg-[#0E7C50] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-9 text-xs">
          <p className="truncate">
            Free delivery on all orders above{" "}
            <span className="font-semibold">$25</span>
          </p>
          <div className="hidden sm:flex items-center gap-5">
            <a
              href="#"
              className="flex items-center gap-1 hover:text-white/80 transition-colors"
            >
              <MapPin size={13} />
              Store Locator
            </a>
            <a
              href="#"
              className="flex items-center gap-1 hover:text-white/80 transition-colors"
            >
              <Package size={13} />
              Track Order
            </a>
            <a
              href="#"
              className="flex items-center gap-1 hover:text-white/80 transition-colors"
            >
              <HelpCircle size={13} />
              Help Center
            </a>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="w-9 h-9 rounded-full bg-[#0E7C50]/10 flex items-center justify-center">
              <Plus size={20} className="text-[#0E7C50]" strokeWidth={2.5} />
            </span>
            <span className="leading-tight">
              <span className="block text-lg font-bold text-gray-900 tracking-tight">
                HealthFirst
              </span>
              <span className="block text-[10px] tracking-[0.2em] text-gray-500 font-medium">
                PHARMACY
              </span>
            </span>
          </Link>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-2xl">
            <div className="flex w-full rounded-md border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#0E7C50]/30">
              <input
                type="text"
                placeholder="Search medicines, healthcare products..."
                className="flex-1 px-4 py-2.5 text-sm outline-none text-gray-700 placeholder:text-gray-400"
              />
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCategoryOpen((v) => !v)}
                  className="h-full flex items-center gap-1 px-3 text-sm text-gray-600 border-l border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  {selectedCategory}
                  <ChevronDown size={14} />
                </button>
                {categoryOpen && (
                  <ul className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1">
                    {allCategories.map((cat) => (
                      <li key={cat}>
                        <button
                          onClick={() => {
                            setSelectedCategory(cat);
                            setCategoryOpen(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          {cat}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                type="button"
                aria-label="Search"
                className="px-4 bg-[#0E7C50] hover:bg-[#0B6A44] transition-colors flex items-center justify-center"
              >
                <Search size={18} className="text-white" />
              </button>
            </div>
          </div>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-6">
            <a
              href="#"
              className="hidden sm:flex items-center gap-2 text-sm text-gray-700 hover:text-[#0E7C50] transition-colors"
            >
              <User size={19} />
              <span className="leading-tight text-left">
                <span className="block text-[11px] text-gray-400">Sign In</span>
                <span className="block font-medium">My Account</span>
              </span>
            </a>

            <a
              href="#"
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#0E7C50] transition-colors relative"
            >
              <span className="relative">
                <ShoppingCart size={19} />
                <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#0E7C50] text-white text-[10px] flex items-center justify-center font-medium">
                  {cartCount}
                </span>
              </span>
              <span className="hidden sm:block font-medium">My Cart</span>
            </a>

            <button
              type="button"
              className="md:hidden text-gray-700"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Category nav row */}
        <nav className="hidden md:flex items-center gap-8 h-12 border-t border-gray-100 text-sm">
          {categoryLinks.map((link) => (
            <a
              key={link}
              href="#"
              className="text-gray-600 hover:text-[#0E7C50] font-medium transition-colors"
            >
              {link}
            </a>
          ))}
          <a
            href="#"
            className="flex items-center gap-1.5 text-gray-600 hover:text-[#0E7C50] font-medium transition-colors"
          >
            Offers
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-orange-100 text-orange-600">
              Hot
            </span>
          </a>
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 px-4 py-4 flex flex-col gap-4">
          <div className="flex rounded-md border border-gray-200 overflow-hidden">
            <input
              type="text"
              placeholder="Search medicines..."
              className="flex-1 px-3 py-2 text-sm outline-none"
            />
            <button className="px-3 bg-[#0E7C50] flex items-center justify-center">
              <Search size={16} className="text-white" />
            </button>
          </div>
          <nav className="flex flex-col gap-3 text-sm">
            {categoryLinks.map((link) => (
              <a key={link} href="#" className="text-gray-700 font-medium">
                {link}
              </a>
            ))}
            <a href="#" className="text-gray-700 font-medium">
              Offers
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
