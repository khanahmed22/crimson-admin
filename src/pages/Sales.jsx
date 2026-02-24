

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/store/authStore";
import { supabase } from "@/db/supabase";
import { Title } from "react-head";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

import { TrendingUp, Package, DollarSign, ShoppingCart, RefreshCcw, CircleGauge } from "lucide-react";

/* ---------------------- Helpers ---------------------- */
function isoDayKey(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function toNumber(v) {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const cleaned = String(v).trim();
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(amount, currency) {
  return `${currency} ${Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}


/* ---------------------- KPI Card ---------------------- */
function KPICard({ title, value, icon, trend, bgColor }) {
  return (
    <Card className="bg-analytics-card border-analytics-border hover:border-analytics-accent/50 transition-all">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between flex-col space-y-2">
          <div className="p-3 rounded-lg opacity-90" style={{ backgroundColor: bgColor }}>
            <div className="text-white">{icon}</div>
          </div>
          <div className="flex-1">
            <p className="text-analytics-muted text-sm font-medium mb-2">{title}</p>
            <h3 className="text-lg sm:text-xl font-bold text-analytics-text mb-2">{value}</h3>
            {trend && <p className="text-green-400 text-xs sm:text-sm font-medium">{trend}</p>}
          </div>
          
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------------------- Component ---------------------- */
export default function Sales() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  /* ---------------------- Date range state ---------------------- */
  const [rangePreset, setRangePreset] = useState("7d");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return isoDayKey(d);
  });
  const [endDate, setEndDate] = useState(() => isoDayKey(new Date()));

  /* ---------------------- Data state ---------------------- */
  const [loading, setLoading] = useState(false);
  const [restID, setRestID] = useState(null);
  const [restCurrency,setRestCurrency] = useState("")
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [error, setError] = useState("");

  /* ---------------------- Fetch restaurant ID ---------------------- */
  useEffect(() => {
    const fetchRestID = async () => {
      if (!userId) return;
      const { data, error: err } = await supabase
        .from("rest_list")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (err) {
        console.error("[Analytics] Error fetching restID:", err.message);
        return;
      }
      setRestID(data?.id || null);
      setRestCurrency(data?.restCurrency || 'N/A')
    };
    fetchRestID();
  }, [userId]);

  /* ---------------------- Fetch orders + menu ---------------------- */
  const fetchOrdersAndMenu = async () => {
    if (!restID) {
      setError("Missing restID");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const from = startOfDay(new Date(startDate));
      const to = endOfDay(new Date(endDate));
      const [ordersRes, menuRes] = await Promise.all([
        supabase
          .from("orders")
          .select("*")
          .eq("restID", restID)
          .gte("created_at", from.toISOString())
          .lte("created_at", to.toISOString())
          .order("created_at", { ascending: false }),
        supabase
          .from("restaurant_menu")
          .select("*")
          .eq("restID", restID)
          .order("created_at", { ascending: false }),
      ]);
      if (ordersRes.error) throw ordersRes.error;
      if (menuRes.error) throw menuRes.error;

      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      setMenuItems(Array.isArray(menuRes.data) ? menuRes.data : []);
    } catch (e) {
      setError(e?.message || "Failed to load analytics data");
      console.error("[Analytics] Fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Auto fetch
  useEffect(() => {
    if (restID) fetchOrdersAndMenu();
  }, [restID, startDate, endDate]);

  /* ---------------------- Presets ---------------------- */
  const applyPreset = (preset) => {
    setRangePreset(preset);
    const now = new Date();
    if (preset === "today") {
      setStartDate(isoDayKey(now));
      setEndDate(isoDayKey(now));
      return;
    }
    if (preset === "7d") {
      const s = new Date();
      s.setDate(now.getDate() - 6);
      setStartDate(isoDayKey(s));
      setEndDate(isoDayKey(now));
      return;
    }
    if (preset === "30d") {
      const s = new Date();
      s.setDate(now.getDate() - 29);
      setStartDate(isoDayKey(s));
      setEndDate(isoDayKey(now));
      return;
    }
    if (preset === "month") {
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      const e = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setStartDate(isoDayKey(s));
      setEndDate(isoDayKey(e));
      return;
    }
  };

  /* ---------------------- Analytics (Corrected Profit) ---------------------- */
  const analyticsData = useMemo(() => {
    let totalRevenue = 0;
    let totalCostMaking = 0;
    let totalDeliveryFees = 0;
    const dailyRevenueMap = {};
    const itemSales = {};

    orders.forEach(order => {
      const dayKey = isoDayKey(new Date(order.created_at));

      const orderRevenue = toNumber(order.final_total);
      const deliveryFee = toNumber(order.deliveryCharges);
      const costMaking = toNumber(order.Total_Cost_Making);

      totalRevenue += orderRevenue;
      totalCostMaking += costMaking;
      totalDeliveryFees += deliveryFee;

      if (!dailyRevenueMap[dayKey]) dailyRevenueMap[dayKey] = 0;
      dailyRevenueMap[dayKey] += orderRevenue;

      // Item analytics
      let details = [];
      if (typeof order.orderDetails === "string") {
        try { details = JSON.parse(order.orderDetails); } catch { details = []; }
      } else if (Array.isArray(order.orderDetails)) {
        details = order.orderDetails;
      } else if (Array.isArray(order.cart)) {
        details = order.cart;
      }

      details.forEach(item => {
        const name = item.foodName || item.name || "Unknown Item";
        const qty = Math.max(1, toNumber(item.quantity));
        const basePrice = toNumber(item.price);
        const extra = toNumber(item?.options?.[0]?.extra_price) || toNumber(item?.extra_price) || 0;
        const itemRevenue = (basePrice + extra) * qty;

        if (!itemSales[name]) itemSales[name] = { name, quantity: 0, revenue: 0 };
        itemSales[name].quantity += qty;
        itemSales[name].revenue += itemRevenue;
      });
    });

    // Profit calculation (exclude delivery fees)
    const profit = totalRevenue - totalCostMaking - totalDeliveryFees;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    // Average Order
    const totalOrders = orders?.length || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Top items
    const topItems = Object.values(itemSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map(x => ({ ...x, revenue: parseFloat(x.revenue.toFixed(2)) }));

    // Revenue by day
    const revenueByDay = Object.entries(dailyRevenueMap)
      .map(([date, revenue]) => ({ date, revenue: parseFloat(revenue.toFixed(2)) }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Inventory
    const inventoryStatus = menuItems?.map(item => ({
      foodName: item.foodName || "Unnamed",
      category: item.category || "",
      stockAmount: toNumber(item.stockAmount || 0),
      status: item.stockStatus ? "In Stock" : "Out of Stock",
      cost_price: toNumber(item.cost_price || 0),
    })) || [];

    return {
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalOrders,
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      profit: parseFloat(profit.toFixed(2)),
      profitMargin: parseFloat(profitMargin.toFixed(2)),
      topItems,
      revenueByDay,
      inventoryStatus
    };
  }, [orders, menuItems]);

  const { totalRevenue = 0, totalOrders = 0, averageOrderValue = 0, profit = 0, profitMargin = 0, topItems = [], revenueByDay = [], inventoryStatus = [] } = analyticsData || [];
  const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"];

  /* ---------------------- UI ---------------------- */
  return (
    <div className="min-h-screen bg-analytics-bg text-analytics-text">
      {/* Header */}
      <Title>Sales</Title>
      <div className="border-b border-analytics-border bg-analytics-card/50 backdrop-blur">
      <div className="flex  items-center justify-center gap-x-3">
          <div className="flex items-center justify-center mt-3 w-16 h-16 max-md:w-12 max-md:h-12 bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl shadow-lg mb-4">
            <CircleGauge className="w-8 h-8 max-md:w-6 max-md:h-6 text-white" />
          </div>
          <h2 className="text-2xl max-md:text-xl text-center font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
            Analytics
          </h2>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          
          <Button variant="outline" onClick={fetchOrdersAndMenu} disabled={loading} className="gap-2 w-fit bg-transparent">
            <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Filters */}
        <Card className="bg-analytics-card border-analytics-border rounded-2xl mb-8">
          <CardContent className="p-4 sm:p-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              <div className="lg:col-span-3">
                <div className="text-xs text-analytics-muted mb-1">Range</div>
                <Select value={rangePreset} onValueChange={applyPreset}>
                  <SelectTrigger className="rounded-xl bg-analytics-bg border-analytics-border text-analytics-text">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="month">This month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="lg:col-span-3">
                <div className="text-xs text-analytics-muted mb-1">Start Date</div>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-xl bg-analytics-bg border-analytics-border text-analytics-text" />
              </div>

              <div className="lg:col-span-3">
                <div className="text-xs text-analytics-muted mb-1">End Date</div>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-xl bg-analytics-bg border-analytics-border text-analytics-text" />
              </div>

              <div className="lg:col-span-3 flex items-end">
                <Button onClick={fetchOrdersAndMenu} disabled={loading} className="w-fit btn-accent">{loading ? "Loading..." : "Apply"}</Button>
              </div>
            </div>
            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
  <KPICard
    title="Total Revenue"
    value={formatMoney(totalRevenue, restCurrency)}
    icon={<DollarSign className="w-5 h-5 md:w-6 md:h-6" />}
    trend=""
    bgColor="#FF6B6B"
  />

  <KPICard
    title="Total Orders"
    value={totalOrders.toString()}
    icon={<ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />}
    trend="Orders in selected range"
    bgColor="#4ECDC4"
  />

  <KPICard
    title="Average Order Value"
    value={formatMoney(averageOrderValue, restCurrency)}
    icon={<TrendingUp className="w-5 h-5 md:w-6 md:h-6" />}
    trend="Revenue / Orders"
    bgColor="#45B7D1"
  />

  <KPICard
    title="Profit Margin"
    value={`${profitMargin.toFixed(1)}%`}
    icon={<Package className="w-5 h-5 md:w-6 md:h-6" />}
    trend="Based on actual costs"
    bgColor="#FFA07A"
  />

  <KPICard
    title="Actual Profit"
    value={formatMoney(profit, restCurrency)}
    icon={<DollarSign className="w-5 h-5 md:w-6 md:h-6" />}
    trend="Revenue - Cost of Making - Delivery Fees"
    bgColor="#4CAF50"
  />
</div>


        {/* Tabs */}
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full  border border-zinc-800 rounded-lg ">
  <TabsTrigger
    value="revenue"
    className="rounded-md text-zinc-900 data-[state=active]:bg-red-500 data-[state=active]:text-white"
  >
    Revenue
  </TabsTrigger>

  <TabsTrigger
    value="items"
    className="rounded-md text-zinc-900 data-[state=active]:bg-red-500 data-[state=active]:text-white"
  >
    Top Items
  </TabsTrigger>

  <TabsTrigger
    value="inventory"
    className="rounded-md text-zinc-900 data-[state=active]:bg-red-500 data-[state=active]:text-white"
  >
    Inventory
  </TabsTrigger>
</TabsList>


          {/* Revenue Chart */}
          <TabsContent value="revenue">
            <Card className="bg-analytics-card border-analytics-border">
              <CardHeader><CardTitle className="text-analytics-text">Revenue Over Time (final_total)</CardTitle></CardHeader>
              <CardContent>
                <div className="w-full h-80 sm:h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueByDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--analytics-border)" />
                      <XAxis dataKey="date" stroke="var(--analytics-muted)" style={{ fontSize: "12px" }} />
                      <YAxis stroke="var(--analytics-muted)" style={{ fontSize: "12px" }} />
                      <Tooltip contentStyle={{ backgroundColor: "var(--analytics-card)", border: "1px solid var(--analytics-border)", borderRadius: "8px" }} labelStyle={{ color: "var(--analytics-text)" }} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#FF6B6B" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Items Chart */}
          <TabsContent value="items">
            <Card className="bg-analytics-card border-analytics-border">
              <CardHeader><CardTitle className="text-analytics-text">Top Selling Items</CardTitle></CardHeader>
              <CardContent>
                <div className="w-full h-80 sm:h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topItems}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--analytics-border)" />
                      <XAxis dataKey="name" stroke="var(--analytics-muted)" angle={-45} textAnchor="end" height={80} style={{ fontSize: "12px" }} />
                      <YAxis stroke="var(--analytics-muted)" style={{ fontSize: "12px" }} />
                      <Tooltip contentStyle={{ backgroundColor: "var(--analytics-card)", border: "1px solid var(--analytics-border)", borderRadius: "8px" }} labelStyle={{ color: "var(--analytics-text)" }} />
                      <Legend />
                      <Bar dataKey="revenue" fill="#4ECDC4" isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory */}
          <TabsContent value="inventory">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card className="bg-analytics-card border-analytics-border h-full">
                  <CardHeader><CardTitle className="text-analytics-text">Stock Distribution</CardTitle></CardHeader>
                  <CardContent>
                    <div className="w-full h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={inventoryStatus.slice(0, 5)} cx="50%" cy="50%" outerRadius={90} dataKey="stockAmount" nameKey="foodName"
                            label={({ name, value }) => `${String(name).slice(0, 10)}: ${value}`}>
                            {inventoryStatus.slice(0, 5).map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: "var(--analytics-card)", border: "1px solid var(--analytics-border)", borderRadius: "8px" }} labelStyle={{ color: "var(--analytics-text)" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="lg:col-span-2">
                <Card className="bg-analytics-card border-analytics-border">
                  <CardHeader><CardTitle className="text-analytics-text">Stock Levels</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
                      {inventoryStatus.map((item, index) => (
                        <div key={index} className="bg-analytics-bg rounded-lg p-4 border border-analytics-border">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-analytics-text font-semibold text-sm sm:text-base">{item.foodName}</p>
                              <p className="text-analytics-muted text-xs sm:text-sm">{item.category}</p>
                            </div>
                            <span className="text-analytics-accent font-bold text-sm sm:text-base">{item.stockAmount} units</span>
                          </div>
                          <div className="w-full bg-analytics-border rounded-full h-2">
                            <div className="bg-gradient-to-r from-analytics-accent-1 to-analytics-accent-2 h-2 rounded-full"
                              style={{ width: `${Math.min((item.stockAmount / 100) * 100, 100)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
