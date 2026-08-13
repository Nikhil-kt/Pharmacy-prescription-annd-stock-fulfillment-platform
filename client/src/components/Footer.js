'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/auth')) return null;

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Trusted by brands */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-400 mb-4">Trusted by thousands. Powered by quality.</p>
          <div className="flex items-center justify-center gap-8 md:gap-14 flex-wrap opacity-60">
            {['Cipla', 'Sun Pharma', 'Dr.Reddy\'s', 'Abbott', 'Zydus', 'Mankind'].map((brand) => (
              <span key={brand} className="text-lg font-bold text-gray-400 tracking-wide">{brand}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 10h-4v4h-4v-4H6v-4h4V5h4v4h4v4z"/></svg>
              </div>
              <span className="text-lg font-bold text-white">RxConnect</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              RxConnect Pharmacy is your trusted online pharmacy for genuine medicines and healthcare products.
            </p>
            <div className="flex gap-3 mt-4">
              {['f', 'in', '𝕏', '▶'].map((icon, i) => (
                <a key={i} href="#" className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-xs font-bold text-gray-400 hover:bg-primary hover:text-white transition-colors">
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {['Medicines', 'Health Care', 'Personal Care', 'Baby Care', 'Devices', 'Wellness'].map((item) => (
                <li key={item}>
                  <Link href="/customer/medicines" className="text-sm text-gray-400 hover:text-primary transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'My Account', href: '/customer/profile' },
                { label: 'Track Order', href: '/customer/orders' },
                { label: 'Shipping Policy', href: '#' },
                { label: 'Payment Methods', href: '#' },
                { label: 'Help Center', href: '#' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-gray-400 hover:text-primary transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Us */}
          <div>
            <h4 className="text-white font-semibold mb-4">About Us</h4>
            <ul className="space-y-2.5">
              {['About RxConnect', 'Our Stores', 'Careers', 'Blog', 'Contact Us'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-gray-400 hover:text-primary transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-4">Stay in the loop</h4>
            <p className="text-sm text-gray-400 mb-3">Subscribe to get updates on offers and health tips.</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-sm text-white placeholder-gray-500 outline-none focus:border-primary"
              />
              <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-r-lg text-sm font-semibold transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">© 2025 RxConnect Pharmacy. All Rights Reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-xs text-gray-500 hover:text-gray-300">Privacy Policy</Link>
            <Link href="#" className="text-xs text-gray-500 hover:text-gray-300">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
