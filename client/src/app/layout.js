import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { BranchProvider } from "@/context/BranchContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "RxConnect Pharmacy — Genuine Medicines Delivered to Your Doorstep",
  description:
    "Your trusted online pharmacy for genuine medicines, healthcare products, and wellness essentials. Fast delivery_partner, secure payments, and expert support.",
  keywords: "pharmacy, medicines, healthcare, online pharmacy, prescription, wellness",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <AuthProvider>
          <BranchProvider>
            <CartProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </CartProvider>
          </BranchProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
