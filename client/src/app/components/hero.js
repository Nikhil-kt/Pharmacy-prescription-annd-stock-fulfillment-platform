import { ShoppingBag, Upload, ShieldCheck, Lock, RotateCcw, Headphones, Star } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "100% Genuine",
    subtitle: "Products",
  },
  {
    icon: Lock,
    title: "Secure",
    subtitle: "Payments",
  },
  {
    icon: RotateCcw,
    title: "Easy",
    subtitle: "Returns",
  },
  {
    icon: Headphones,
    title: "24/7",
    subtitle: "Support",
  },
];

const strip = [
  {
    icon: ShoppingBag,
    title: "Super Fast Delivery",
    subtitle: "On time, every time",
    bg: "bg-green-50",
    fg: "text-[#0E7C50]",
  },
  {
    icon: ShieldCheck,
    title: "Best Prices",
    subtitle: "Save more on every order",
    bg: "bg-blue-50",
    fg: "text-blue-500",
  },
  {
    icon: Lock,
    title: "Secure Payments",
    subtitle: "100% safe & secure",
    bg: "bg-purple-50",
    fg: "text-purple-500",
  },
  {
    icon: Headphones,
    title: "Expert Support",
    subtitle: "We're here to help you",
    bg: "bg-orange-50",
    fg: "text-orange-500",
  },
];

export default function Hero() {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Text column */}
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
              Your Health,
              <br />
              <span className="text-[#0E7C50]">Our Commitment.</span>
            </h1>
            <p className="mt-5 text-gray-500 text-base max-w-md">
              Genuine medicines, trusted brands and healthcare delivered to
              your doorstep.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button className="inline-flex items-center gap-2 bg-[#0E7C50] hover:bg-[#0B6A44] transition-colors text-white text-sm font-medium px-5 py-3 rounded-md">
                <ShoppingBag size={16} />
                Shop Medicines
              </button>
              <button className="inline-flex items-center gap-2 border border-gray-300 hover:border-gray-400 transition-colors text-gray-700 text-sm font-medium px-5 py-3 rounded-md">
                <Upload size={16} />
                Upload Prescription
              </button>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-8 gap-y-4">
              {features.map(({ icon: Icon, title, subtitle }) => (
                <div key={title} className="flex items-center gap-2">
                  <Icon size={18} className="text-[#0E7C50]" />
                  <span className="text-sm text-gray-600 leading-tight">
                    <span className="block font-medium text-gray-800">
                      {title}
                    </span>
                    {subtitle}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Image column */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-gray-100">
              {/* Swap src for your own pharmacist / storefront photo */}
              <img
                src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80"
                alt="Pharmacist in front of a fully stocked pharmacy shelf"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="absolute -bottom-6 right-4 sm:right-8 bg-white rounded-xl shadow-lg border border-gray-100 px-5 py-4 flex items-center gap-3 max-w-[240px]">
              <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <ShieldCheck size={16} className="text-[#0E7C50]" />
              </span>
              <div className="text-sm">
                <p className="text-gray-500 text-xs">Trusted by</p>
                <p className="font-semibold text-gray-900">2M+ Customers</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                  <span className="text-[11px] text-gray-400 ml-1">
                    4.8/5 Rating
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature strip */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {strip.map(({ icon: Icon, title, subtitle, bg, fg }) => (
            <div
              key={title}
              className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-4 shadow-sm"
            >
              <span
                className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center shrink-0`}
              >
                <Icon size={18} className={fg} />
              </span>
              <div className="text-sm">
                <p className="font-semibold text-gray-800 leading-tight">
                  {title}
                </p>
                <p className="text-gray-500 text-xs leading-tight">
                  {subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
