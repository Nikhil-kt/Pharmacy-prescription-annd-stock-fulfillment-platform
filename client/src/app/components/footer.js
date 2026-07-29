"use client";

import { useState } from "react";
import { Plus, Send } from "lucide-react";

// lucide-react removed brand/logo icons (Facebook, Instagram, Twitter,
// Youtube, etc.) in recent versions since they're trademarked logos, not
// generic icons. Small inline SVGs instead, so this doesn't break on
// upgrade.
function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-7.5h2.5l.5-3H13.5V8.5c0-.87.24-1.46 1.49-1.46H16.5V4.36C16.24 4.32 15.36 4.25 14.33 4.25c-2.15 0-3.63 1.31-3.63 3.72V10.5H8.5v3h2.2V21h2.8Z" />
    </svg>
  );
}

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.7" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TwitterIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20 5.9c-.66.29-1.36.48-2.1.57a3.6 3.6 0 0 0 1.6-2 7.2 7.2 0 0 1-2.3.87 3.6 3.6 0 0 0-6.2 3.28A10.24 10.24 0 0 1 3.6 4.9a3.6 3.6 0 0 0 1.1 4.8 3.6 3.6 0 0 1-1.63-.45v.04a3.6 3.6 0 0 0 2.88 3.53 3.6 3.6 0 0 1-1.62.06 3.6 3.6 0 0 0 3.36 2.5A7.23 7.23 0 0 1 2.5 16.6a10.2 10.2 0 0 0 5.53 1.62c6.63 0 10.26-5.5 10.26-10.26l-.01-.47A7.3 7.3 0 0 0 20 5.9Z" />
    </svg>
  );
}

function YoutubeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21.6 7.9a2.8 2.8 0 0 0-1.98-2C18 5.4 12 5.4 12 5.4s-6 0-7.62.5a2.8 2.8 0 0 0-1.98 2A29 29 0 0 0 2 12a29 29 0 0 0 .4 4.1 2.8 2.8 0 0 0 1.98 2c1.62.5 7.62.5 7.62.5s6 0 7.62-.5a2.8 2.8 0 0 0 1.98-2A29 29 0 0 0 22 12a29 29 0 0 0-.4-4.1ZM10 15V9l5.2 3-5.2 3Z" />
    </svg>
  );
}

const socialIcons = [FacebookIcon, InstagramIcon, TwitterIcon, YoutubeIcon];

const shopLinks = [
  "Medicines",
  "Health Care",
  "Personal Care",
  "Baby Care",
  "Devices",
  "Offers",
];

const customerServiceLinks = [
  "My Account",
  "Track Order",
  "Returns & Refunds",
  "Shipping Policy",
  "Payment Methods",
  "Help Center",
];

const aboutLinks = [
  "About HealthFirst",
  "Our Stores",
  "Careers",
  "Blog",
  "Contact Us",
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubscribe(e) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail("");
  }

  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand column */}
          <div className="lg:col-span-1 sm:col-span-2">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#0E7C50]/10 flex items-center justify-center">
                <Plus size={16} className="text-[#0E7C50]" strokeWidth={2.5} />
              </span>
              <span className="leading-tight">
                <span className="block text-base font-bold text-gray-900">
                  HealthFirst
                </span>
                <span className="block text-[9px] tracking-[0.2em] text-gray-500 font-medium">
                  PHARMACY
                </span>
              </span>
            </div>
            <p className="mt-4 text-sm text-gray-500 max-w-xs">
              HealthFirst Pharmacy is your trusted online pharmacy for genuine
              medicines and healthcare products.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {socialIcons.map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#0E7C50] hover:border-[#0E7C50] transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Shop</h3>
            <ul className="flex flex-col gap-2.5 text-sm text-gray-500">
              {shopLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-[#0E7C50] transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Customer Service
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm text-gray-500">
              {customerServiceLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-[#0E7C50] transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* About Us */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              About Us
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm text-gray-500">
              {aboutLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-[#0E7C50] transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Stay in the loop
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Subscribe to get updates on offers and health tips.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2.5 text-sm rounded-md border border-gray-200 outline-none focus:ring-2 focus:ring-[#0E7C50]/30"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-[#0E7C50] hover:bg-[#0B6A44] transition-colors text-white text-sm font-medium px-4 py-2.5 rounded-md"
              >
                <Send size={14} />
                Subscribe
              </button>
            </form>
            {submitted && (
              <p className="mt-2 text-xs text-[#0E7C50]">
                Subscribed — thanks for joining.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} HealthFirst Pharmacy. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-gray-600 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-gray-600 transition-colors">
              Terms & Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
