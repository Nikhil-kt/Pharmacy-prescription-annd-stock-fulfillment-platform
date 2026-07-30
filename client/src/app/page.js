"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-white">
      <h1 className="text-5xl font-bold text-green-700">
        HealthFirst Pharmacy
      </h1>

      <p className="mt-4 text-gray-600 text-lg">
        Welcome to our Pharmacy Management Platform
      </p>

      <Link href="/login">
        <button className="mt-8 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl text-lg font-semibold transition">
          Login
        </button>
      </Link>
    </main>
  );
}