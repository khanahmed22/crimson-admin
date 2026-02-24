import { NavLink, useNavigate, useLocation } from "react-router";
import { Button } from "./ui/button";
import { useAuth } from "@/store/authStore";
import LiveOrderListener from "./LiveOrderListener";
import { supabase } from "@/db/supabase";
import NotificationPanel from "./NotificationPanel";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  ArrowDownAZ,
  Hamburger,
  LogOutIcon,
  User,
  Truck,
  Menu,
  X,
  ShoppingBag,
  Settings,
  House,
  Globe,
  PersonStanding,
  Ticket,
  Bike,
  CircleQuestionMark,
  RotateCcw,
  CircleGauge,
  Send,
  Copy,
} from "lucide-react";
import { useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { useIsMobile } from "./useIsMobile";
import LowStockWatcher from "./stockAlert";
import { toast } from "sonner";

export default function SideBar() {
  const { session, signOut } = useAuth();
  const merchant_id = session?.user?.id;
  const mobileMode = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  // ✅ Fetch merchant verification status
  const { data: merchantStatus, refetch } = useQuery({
    queryKey: ["merchantStatus", merchant_id],
    queryFn: async () => {
      if (!merchant_id) return "unverified";
      const { data, error } = await supabase
        .from("merchant_accounts")
        .select("merchant_verify,plan")
        .eq("merchant_id", merchant_id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!merchant_id,
    refetchInterval: false,
    refetchOnMount: true,
refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 10, //10 minutes
  });

  // ✅ Fetch restaurant info
  const { data: restQuery, isPending } = useQuery({
    queryKey: ["restData", merchant_id],
    queryFn: async () => {
      if (!merchant_id) return null;
      const { data, error } = await supabase
        .from("rest_list")
        .select("*")
        .eq("user_id", merchant_id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!merchant_id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });
  const location = useLocation();

  const navLinks = [
    { to: "/dashboard", icon: <House size={20} />, label: "Home" },

    { to: "/analytics", icon: <CircleGauge size={20} />, label: "Analytics" },

    {
      to: "/live-orders",
      icon: <Bell size={20} />,
      label: "Orders",
      isA: true,
    },
    {
      to: "/place-order",
      icon: <ShoppingBag size={20} />,
      label: "Place Order",
    },
    {
      to: "/inventory",
      icon: <Hamburger size={20} />,
      label: "Manage Inventory",
    },
    {
      to: "/category-manager",
      icon: <ArrowDownAZ size={20} />,
      label: "Category Manager",
    },
    {
      to: "/delivery-charges",
      icon: <Truck size={20} />,
      label: "Delivery Charges",
    },
    { to: "/coupon-manager", icon: <Ticket size={20} />, label: "Coupons" },
    { to: "/riders", icon: <Bike size={20} />, label: "Riders" },
    {
      to: "/customers",
      icon: <PersonStanding size={20} />,
      label: "Customers",
    },
    { to: "/settings", icon: <Settings size={20} />, label: "Settings" },
    { to: "/help", icon: <CircleQuestionMark size={20} />, label: "Support" },
    { to: "/account", icon: <User size={20} />, label: "Account" },
  ];

  const handleShare = async () => {
  const storeUrl = restQuery?.restSite;

  if (!storeUrl) return;

  if (navigator.share) {
    try {
      await navigator.share({
        title: restQuery?.name || "My Store",
        text: "Check out my store on CrimsonCastle!",
        url: storeUrl,
      });
    } catch (err) {
      console.log("Share cancelled or failed");
    }
  } else {
    // fallback if share not supported
    await navigator.clipboard.writeText(storeUrl);
    alert("Link copied to clipboard!");
  }
};

  // ✅ Mobile layout
  if (mobileMode) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-200 px-4 py-3 flex items-center justify-between ">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setDrawerOpen(true)}
              variant="ghost"
              size="icon"
            >
              <Menu size={30} />
            </Button>
            <img
              src={restQuery?.restLogo || "/cc.jpg"}
              className="w-10 h-10 rounded-lg object-cover shadow"
              alt="restaurant logo"
            />
            <div>
              <h2 className="font-bold text-gray-800 text-sm">
                {isPending ? (
                  <Skeleton className="h-[16px] w-[80px] bg-red-400" />
                ) : (
                  restQuery?.name
                )}
              </h2>
            </div>
            <NotificationPanel />
          </div>
        </div>

        {drawerOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setDrawerOpen(false)}
          />
        )}
        <aside
          className={`fixed top-0 left-0 h-screen w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4 border-b border-gray-200 relative flex flex-col items-center">
            <Button
              onClick={() => setDrawerOpen(false)}
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
            >
              <X size={20} />
            </Button>
            <h2 className="text-lg font-bold">Merchant Dashboard</h2>
            <img
              src={restQuery?.restLogo || "cc.jpg"}
              className="w-16 h-16 rounded-xl object-cover shadow mt-2"
              alt="restaurant logo"
            />
            <h2 className="mt-3 font-bold text-gray-800 text-lg text-center">
              {isPending ? (
                <Skeleton className="h-[20px] w-[90px]" />
              ) : (
                restQuery?.name
              )}
            </h2>
          </div>

          {isPending ? (
            <div>Loading</div>
          ) : (
            <div className="flex items-center justify-center mt-2">
              {merchantStatus?.merchant_verify === "unverified" && (
                <Button
                  className="btn-accent"
                  onClick={() => navigate("/merchant-reg")}
                >
                  Complete Registration
                </Button>
              )}
              {merchantStatus?.merchant_verify === "submitted" && (
                <Button variant="outline">Wait for Team Approval</Button>
              )}
              {merchantStatus?.merchant_verify === "verified" && (
  <div className="flex flex-col items-center gap-3 w-full px-4">

    {/* Primary CTA */}
    <a
      target="_blank"
      href={restQuery?.restSite}
      className="w-full inline-flex items-center justify-center gap-2 
                 bg-red-500 text-white px-4 py-3 
                 rounded-xl text-sm font-semibold 
                 shadow hover:bg-red-400 transition"
    >
      <Globe className="w-4 h-4" />
      Visit Site
    </a>

    {/* Secondary Actions */}
    <div className="flex gap-3 w-full">
      <Button
        variant="outline"
        className="flex-1 py-2 rounded-xl"
        onClick={handleShare}
      >
        <Send/> Share 
      </Button>

      <Button
        variant="outline"
        className="flex-1 py-2 rounded-xl"
        onClick={async () => {
          await navigator.clipboard.writeText(restQuery?.restSite);
          toast.success("Store Link copied!");
        }}
      >
        <Copy/> Copy
      </Button>
    </div>

  </div>
)}
            </div>
          )}
          <div className="flex items-center justify-center mt-4">
            <Button
              variant="outline"
              onClick={() => {
                refetch();
              }}
            >
              <RotateCcw /> Refresh
            </Button>
          </div>

          <div className="flex justify-center mt-3 ">
            {!isPending ? (
              <div className="flex items-center gap-3 px-4 py-2 rounded-xl border bg-white shadow-sm">
                <span className="text-sm text-gray-600">Current Plan</span>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
          ${
            merchantStatus?.plan === "pro"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700"
          }
        `}
                >
                  {merchantStatus?.plan}
                </span>

                {merchantStatus?.plan !== "pro" && (
                  <button
                    onClick={() => {
                      navigate("/account");
                    }}
                    className="ml-2 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-1.5 rounded-lg hover:opacity-90 transition"
                  >
                    Upgrade
                  </button>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500 animate-pulse">
                Loading plan…
              </div>
            )}
          </div>

          <nav className="flex-1 mt-4 flex flex-col gap-1 px-2 overflow-y-scroll">
            {navLinks.map(({ to, icon, label, isA }) => {
              const isActive = location.pathname === to;
              const isDisabled =
                merchantStatus?.merchant_verify !== "verified" &&
                to !== "/account" &&
                to !== "/dashboard";

              const handleClick = (e) => {
                if (isDisabled) {
                  e.preventDefault();
                  return;
                }
                setDrawerOpen(false);
              };

              const disabledClasses = isDisabled
                ? "opacity-50 cursor-not-allowed pointer-events-none"
                : "";

              // 🔥 Only <a> for live-orders
              if (isA) {
                return (
                  <a
                    key={to}
                    href={isDisabled ? "#" : to}
                    onClick={handleClick}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors
            ${isActive ? "bg-red-500 text-white shadow-md" : "text-gray-700 hover:bg-gray-100"}
            ${disabledClasses}`}
                  >
                    {icon}
                    <span>{label}</span>
                  </a>
                );
              }

              // ⭐ All other links use NavLink
              return (
                <NavLink
                  key={to}
                  to={isDisabled ? "" : to}
                  onClick={handleClick}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors 
           ${isActive ? "bg-red-500 text-white shadow-md" : "text-gray-700 hover:bg-gray-100"} 
           ${disabledClasses}`
                  }
                >
                  {icon}
                  <span>{label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <Button
              onClick={() => signOut()}
              className="w-fit flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-400"
            >
              <LogOutIcon size={18} />
              Sign Out
            </Button>
          </div>
        </aside>

        <LiveOrderListener />
        <LowStockWatcher />
      </>
    );
  }

  // ✅ Desktop layout
  return (
    <aside className="h-screen w-64 bg-white/90 backdrop-blur-xl border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex flex-col items-center">
        <h2 className="text-lg font-bold">Merchant Dashboard</h2>
        <img
          src={restQuery?.restLogo || "cc.jpg"}
          className="w-16 h-16 rounded-xl object-cover shadow"
          alt="restaurant logo"
        />
        <h2 className="mt-3 font-bold text-gray-800 text-lg text-center">
          {isPending ? (
            <Skeleton className="h-[20px] w-[90px] bg-red-400" />
          ) : (
            restQuery?.name
          )}
        </h2>
      </div>

      <div className="">
        {isPending ? (
          <div className=" mt-2 flex items-center justify-center">
            <Button variant="outline">Loading</Button>
          </div>
        ) : (
          <div className="flex items-center justify-center mt-2">
            {merchantStatus?.merchant_verify === "unverified" && (
              <Button
                className="btn-accent"
                onClick={() => navigate("/merchant-reg")}
              >
                Complete Registration
              </Button>
            )}
            {merchantStatus?.merchant_verify === "submitted" && (
              <Button variant="outline">Wait for Team Approval</Button>
            )}
            {merchantStatus?.merchant_verify === "verified" && (
  <div className="flex flex-col items-center gap-2">

    {/* Primary CTA */}
    <a
      target="_blank"
      href={restQuery?.restSite}
      className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow hover:bg-red-400 transition"
    >
      <Globe className="w-4 h-4" />
      Visit Site
    </a>

    {/* Secondary compact actions */}
    <div className="flex items-center gap-2 text-gray-500">
      <button
        onClick={handleShare}
        className="text-xs hover:text-black transition"
      >
        Share
      </button>

      <span className="text-gray-300">|</span>

      <button
        onClick={async () => {
          await navigator.clipboard.writeText(restQuery?.restSite);
          toast.success("Store Link copied!");
        }}
        className="text-xs hover:text-black transition"
      >
        Copy
      </button>
    </div>

  </div>
)}
          </div>
        )}
        <NotificationPanel />
      </div>
      <div className="flex items-center justify-center mt-4">
        <Button
          variant='outline'
          onClick={() => {
            refetch();
          }}
        >
          <RotateCcw /> Refresh
        </Button>
      </div>

      <div className="flex justify-center mt-3">
        {!isPending ? (
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl border bg-white mr-2 ml-2 shadow-xl">
            <span className="text-sm text-gray-600">Current Plan</span>

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
          ${
            merchantStatus?.plan === "pro"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700"
          }
        `}
            >
              {merchantStatus?.plan}
            </span>

            {merchantStatus?.plan !== "pro" && (
              <button
                onClick={() => {
                  navigate("/account");
                }}
                className="ml-2 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-orange-500 px-4 py-1.5 rounded-lg hover:opacity-90 transition"
              >
                Upgrade
              </button>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500 animate-pulse">
            Loading plan…
          </div>
        )}
      </div>

      <nav className="flex-1 mt-4 flex flex-col gap-1 px-2">
        {navLinks.map(({ to, icon, label, isA }) => {
          const isActive = location.pathname === to;
          const isDisabled =
            merchantStatus?.merchant_verify !== "verified" &&
            to !== "/account" &&
            to !== "/dashboard";

          const handleClick = (e) => {
            if (isDisabled) {
              e.preventDefault();
              return;
            }
            setDrawerOpen(false);
          };

          const disabledClasses = isDisabled
            ? "opacity-50 cursor-not-allowed pointer-events-none"
            : "";

          // 🔥 Only <a> for live-orders
          if (isA) {
            return (
              <a
                key={to}
                href={isDisabled ? "#" : to}
                onClick={handleClick}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors
            ${isActive ? "bg-red-500 text-white shadow-md" : "text-gray-700 hover:bg-gray-100"}
            ${disabledClasses}`}
              >
                {icon}
                <span>{label}</span>
              </a>
            );
          }

          // ⭐ All other links use NavLink
          return (
            <NavLink
              key={to}
              to={isDisabled ? "" : to}
              onClick={handleClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors 
           ${isActive ? "bg-red-500 text-white shadow-md" : "text-gray-700 hover:bg-gray-100"} 
           ${disabledClasses}`
              }
            >
              {icon}
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={() => signOut()}
          className="w-fit flex items-center justify-center gap-2 bg-red-600 text-white hover:bg-red-400"
        >
          <LogOutIcon size={18} />
          Sign Out
        </Button>
      </div>

      <LiveOrderListener />
    </aside>
  );
}
