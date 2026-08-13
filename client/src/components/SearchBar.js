'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      const searchUrl = category
        ? `/customer/medicines?search=${encodeURIComponent(query.trim())}&category=${encodeURIComponent(category)}`
        : `/customer/medicines?search=${encodeURIComponent(query.trim())}`;
      router.push(searchUrl);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl">
      <div className="flex items-center border border-gray-200 rounded-full overflow-hidden focus-within:border-[#0D9488] focus-within:ring-4 focus-within:ring-[#0D9488]/10 transition-all bg-slate-50/80 hover:bg-white shadow-sm">
        {/* Left Search Icon */}
        <div className="pl-4 text-gray-400 pointer-events-none shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Input Text Field */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search medicines, healthcare products..."
          className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none text-gray-900 placeholder-gray-400 font-normal"
        />

        {/* Category Selector (Optional Quick Filter) */}
        <div className="hidden sm:flex items-center border-l border-gray-200/80 px-2 shrink-0">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-transparent text-xs font-semibold text-gray-600 outline-none cursor-pointer pr-1 py-1"
          >
            <option value="">All Categories</option>
            <option value="Medicines">Medicines</option>
            <option value="Health Care">Health Care</option>
            <option value="Personal Care">Personal Care</option>
            <option value="Baby Care">Baby Care</option>
            <option value="Devices">Devices</option>
            <option value="Wellness">Wellness</option>
          </select>
        </div>

        {/* Right Green Search Button */}
        <button
          type="submit"
          className="bg-[#0D9488] hover:bg-[#0F766E] text-white p-2.5 m-1 rounded-full transition-all duration-200 flex items-center justify-center shrink-0 shadow-md shadow-teal-700/20"
          aria-label="Search"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </form>
  );
}
