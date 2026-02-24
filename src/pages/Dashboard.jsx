import { useNavigate } from "react-router";
import {
  Bell,
  ShoppingBag,
  BarChartHorizontalBigIcon as ChartColumnBigIcon,
  Hammer as Hamburger,
  Settings,
  User,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/db/supabase";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/store/authStore";
const navLinks = [
  { to: "/live-orders", icon: Bell, label: "Orders", color: "rose" },
  {
    to: "/place-order",
    icon: ShoppingBag,
    label: "Place Order",
    color: "amber",
  },
  {
    to: "/inventory",
    icon: Hamburger,
    label: "Manage Inventory",
    color: "violet",
  },
  { to: "/settings", icon: Settings, label: "Settings", color: "slate" },
  { to: "/account", icon: User, label: "Account", color: "cyan" },
];

const colorMap = {
  rose: { bg: "bg-rose-600", hover: "hover:bg-rose-700" },
  amber: { bg: "bg-amber-500", hover: "hover:bg-amber-600" },
  blue: { bg: "bg-blue-600", hover: "hover:bg-blue-700" },
  emerald: { bg: "bg-emerald-600", hover: "hover:bg-emerald-700" },
  violet: { bg: "bg-violet-600", hover: "hover:bg-violet-700" },
  indigo: { bg: "bg-indigo-600", hover: "hover:bg-indigo-700" },
  yellow: { bg: "bg-yellow-500", hover: "hover:bg-yellow-600" },
  slate: { bg: "bg-slate-600", hover: "hover:bg-slate-700" },
  cyan: { bg: "bg-cyan-600", hover: "hover:bg-cyan-700" },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const merchant_id = session?.user?.id;

  const fetchVerifStatus = async () => {
    if (!merchant_id) return "unverified";
    const { data, error } = await supabase
      .from("merchant_accounts")
      .select("merchant_verify")
      .eq("merchant_id", merchant_id)
      .maybeSingle();
    if (error) throw error;
    return data;
  };
  // ✅ Fetch merchant verification status
  const { data: merchantStatus } = useQuery({
    queryKey: ["merchantStatus", merchant_id],
    queryFn: fetchVerifStatus,
    enabled: !!merchant_id,
    refetchInterval: false,
    staleTime: 1000 * 60 * 10,
  });

  return (
    <div className="min-h-screen ">
      <main className="container mx-auto ">
        {/* Welcome Section */}
        <div
  className="
    mb-12
    rounded-2xl
    bg-gradient-to-r from-rose-400 to-red-500
    px-6 py-8
    sm:px-10 sm:py-12
    flex flex-col
    md:flex-row
    md:items-center
    md:justify-between
    gap-8
  "
>
  {/* Text Section */}
  <div className="flex items-center md:items-start">
    <div className="space-y-4 text-center md:text-left">
      <h1 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-white max-md:mt-5">
        Welcome Back <span className="text-primary">{}</span>
      </h1>

      <p className="text-base sm:text-lg text-white/90">
        Manage your restaurant and grow your business
      </p>
    </div>
  </div>

  {/* Image Section */}
  <div className="flex justify-center md:justify-end">
    <img
      src="/coffee.svg"
      alt="coffee"
      className="
        w-[220px]
        sm:w-[260px]
        md:w-[320px]
        lg:w-[350px]
        max-w-full
      "
    />
  </div>
</div>


        {/* Navigation Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {navLinks.map((link) => {
            const IconComponent = link.icon;
            const colors = colorMap[link.color];

            const isAccount = link.to === "/account";
            const isDisabled =
              merchantStatus?.merchant_verify !== "verified" && !isAccount;

            return (
              <Card
                key={link.to}
                className={`border-0 text-white transition-all duration-300 shadow-md 
        ${
          isDisabled
            ? "bg-gray-400 cursor-not-allowed opacity-60"
            : `${colors.bg} ${colors.hover} cursor-pointer hover:shadow-lg`
        }
      `}
                onClick={() => {
                  if (!isDisabled) {
                    navigate(link.to);
                  }
                }}
              >
                <CardContent className="p-3 sm:p-5 flex flex-col items-center text-center space-y-2 sm:space-y-3">
                  <IconComponent
                    size={26}
                    className="sm:w-8 sm:h-8 md:w-9 md:h-9 text-white transition-all"
                  />
                  <h3 className="font-heading font-medium text-xs sm:text-sm md:text-base">
                    {link.label}
                  </h3>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
