

import { useAuth } from "@/store/authStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/db/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Clock,
  User,
  Phone,
  MapPin,
  FileText,
  Search,
  Bell,
  Printer,
  Download,
  Sparkles,
  CircleCheckBig,
  CircleX,
  ReceiptText,
  RotateCcw,
  Eye,
  Bike,
  ShoppingBag,
  Power,
} from "lucide-react";
import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Title } from "react-head";
import { useIsMobile } from "@/components/useIsMobile";

export default function LiveOrders() {
  const { session, mobileMode, setMobileMode } = useAuth();
  const queryClient = useQueryClient();
  const user_id = session?.user?.id;
  const [activeTab, setActiveTab] = useState("new");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  // add this new state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const isMobile = useIsMobile();
  const [mobileModel, setMobileModel] = useState(false);
  const [orderMode, setOrderMode] = useState(0);

  useEffect(() => {
    setMobileMode(isMobile);
  }, [isMobile, setMobileMode]);

  const fetchRestID = async () => {
    const { data, error } = await supabase
      .from("rest_list")
      .select("*")
      .eq("user_id", user_id)
      .single();
    if (error) throw error;
    return data;
  };

  const { data: RestIDQuery } = useQuery({
    queryKey: ["restID"],
    queryFn: fetchRestID,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  const Currency = RestIDQuery?.restCurrency || 'N/A'

  const fetchOrders = async () => {
    const { data: orderData, error } = await supabase
      .from("orders")
      .select("*")
      .eq("restID", RestIDQuery?.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return orderData;
  };

  const {
    data: orderQuery,
    isPending,
    error,
    refetch,
  } = useQuery({
    queryKey: ["orderData", RestIDQuery?.id],
    queryFn: fetchOrders,
    enabled: !!RestIDQuery?.id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  const updateOrderStatus = async ({ orderId, newStatus }) => {
    // First, get the order data including orderDetails
    const { data: orderData, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("restID", RestIDQuery?.id)
      .single();

    if (fetchError) throw fetchError;

    // Update order status
    const { data, error } = await supabase
      .from("orders")
      .update({ orderStatus: newStatus })
      .eq("id", orderId)
      .eq("restID", RestIDQuery?.id);

    if (error) throw error;

    if (newStatus === "pickup" || newStatus === "delivered/pickedUp" && orderData) {
      try {
        // Parse orderDetails
        const orderDetails =
          typeof orderData.orderDetails === "string"
            ? JSON.parse(orderData.orderDetails)
            : orderData.orderDetails;

        // Deduct stock for each item
        for (const item of orderDetails) {
          if (!item.itemID || !item.quantity) continue;

          // Fetch current stock amount
          const { data: menuItem, error: fetchError } = await supabase
            .from("restaurant_menu")
            .select("stockAmount, stockStatus, foodName")
            .eq("itemID", item.itemID)
            .single();

          if (fetchError) {
            console.error(
              `Error fetching stock for item ${item.itemID}:`,
              fetchError
            );
            continue;
          }

          if (menuItem) {
            const currentStock = menuItem.stockAmount || 0;
            const newStockAmount = Math.max(0, currentStock - item.quantity);

            // Update stock amount and status
            const { error: updateError } = await supabase
              .from("restaurant_menu")
              .update({
                stockAmount: newStockAmount,
                stockStatus: newStockAmount > 0, // Auto-update availability when stock reaches 0
              })
              .eq("itemID", item.itemID);

            if (updateError) {
              console.error(
                `Error updating stock for ${menuItem.foodName}:`,
                updateError
              );
            } else {
              console.log(
                `[v0] Stock updated for ${menuItem.foodName}: ${currentStock} → ${newStockAmount}`
              );
            }
          }
        }
      } catch (stockError) {
        console.error("Error processing stock deduction:", stockError);
        // Don't throw error here - order status was already updated successfully
        toast.error(
          "Order confirmed but stock update failed. Please check inventory."
        );
      }
    }

    return data;
  };

  const { mutate: updateStatusM } = useMutation({
    mutationKey: ["updateStatusM"],
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      toast.success("Order status updated successfully");
      queryClient.invalidateQueries(["orderData"]);
    },
    onError: () => {
      toast.error("Failed to update order status");
    },
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="destructive" className="bg-yellow-600">
            Pending
          </Badge>
        );
      case "dispatched":
        return (
          <Badge variant="default" className="bg-green-600 text-white">
            Dispatched
          </Badge>
        );
      case "delivered/pickedUp":
        return (
          <Badge variant="default" className="bg-green-600 text-white">
            Delivered/Picked Up
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="secondary" className="bg-red-500 text-white">
            Cancelled
          </Badge>
        );
      case "pickup":
        return (
          <Badge variant="secondary" className="bg-purple-500 text-white">
            Pick Up
          </Badge>
        );
      case "confirmed":
        return (
          <Badge variant="secondary" className="bg-green-500 text-white">
            Confirmed
          </Badge>
        );
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const handleItemsClick = (order) => {
    try {
      const details =
        typeof order.orderDetails === "string"
          ? JSON.parse(order.orderDetails)
          : order.orderDetails;
      setSelectedOrder(order); // ✅ save whole order (includes deliveryCharges)
      setSelectedOrderDetails(details);
      setIsModalOpen(true);
    } catch (error) {
      toast.error("Unable to load order details");
      console.log(error);
    }
  };

  const filteredOrders =
    orderQuery?.filter((order) => {
      if (!searchTerm) return true;
      const fullOrderNumber = `ORD-${searchTerm}`;
      return order.orderNo
        ?.toString()
        .toLowerCase()
        .includes(fullOrderNumber.toLowerCase());
    }) || [];

  const tabFilteredOrders = filteredOrders.filter((order) => {
    if (activeTab === "all") return true;
    if (activeTab === "new") return order.orderStatus === "pending";
    if (activeTab === "processing") return order.orderStatus === "confirmed";
    if (activeTab === "dispatched") return order.orderStatus === "dispatched";
    if (activeTab === "completed") return order.orderStatus === "delivered/pickedUp";
    if (activeTab === "cancelled") return order.orderStatus === "cancelled";
    if (activeTab === "pickup") return order.orderStatus === "pickup";
    return true;
  });

  //download invoice

  const handleDownload = async (orderNo) => {
    const { data: downData, error } = await supabase
      .from("orders")
      .select("*")
      .eq("orderNo", orderNo)
      .maybeSingle();

    if (error) {
      console.error("Error fetching invoice:", error);
      return;
    }

    const doc = new jsPDF();

    // --- Header ---
    doc.setFontSize(20);
    doc.text("INVOICE", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Restaurant: ${RestIDQuery?.name || "N/A"}`, 105, 35, {
      align: "center",
    });
    doc.text(`Invoice No: ${downData.orderNo}`, 105, 45, { align: "center" });
    doc.text(`Customer: ${downData.custName}`, 105, 55, { align: "center" });
    doc.text(
      `Address: ${downData.custAddress} - ${downData.areaName} - ${downData.cityName}`,
      105,
      65,
      { align: "center" }
    );
    doc.text(
      `Date: ${new Date(downData.created_at).toLocaleDateString()}`,
      105,
      75,
      {
        align: "center",
      }
    );

    let y = 90;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Your Order", 20, y);
    doc.setFont("helvetica", "normal");
    y += 8;

    let items = [];
    try {
      items =
        typeof downData.orderDetails === "string"
          ? JSON.parse(downData.orderDetails)
          : downData.orderDetails;
    } catch (err) {
      console.error("Error parsing orderDetails:", err);
    }

    let subtotal = 0;

    items.forEach((item) => {
      let base = item.basePrice || 0;
      let variant = item.variantPrice || 0;
      let optionsTotal =
        item.options?.reduce((sum, opt) => sum + (opt.extra_price || 0), 0) ||
        0;

      const finalBase = base > 0 ? base : variant > 0 ? variant : 0;
      const itemTotal = (finalBase + optionsTotal) * item.quantity;
      subtotal += itemTotal;

      // Item name
      doc.setFont("helvetica", "bold");
      doc.text(`${item.foodName}`, 20, y);
      y += 6;

      // Options
      doc.setFont("helvetica", "normal");
      item.options?.forEach((opt) => {
        doc.text(`${opt.option_name} (${RestIDQuery?.restCurrency} ${opt.extra_price})`, 25, y);
        y += 6;
      });

      // Qty and total
      doc.text(`Qty: ${item.quantity}`, 25, y);
      y += 6;
      doc.text(`${RestIDQuery?.restCurrency} ${itemTotal}`, 25, y);
      y += 8;

      doc.line(20, y, 190, y);
      y += 8;
    });

    const delivery = downData.deliveryCharges || 0;
    const grandTotal = downData.final_total;
    const discount = downData.discount_amount;

    doc.setFont("helvetica", "bold");
    doc.text("Delivery Fee", 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(`${RestIDQuery?.restCurrency} ${delivery}`, 160, y);
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.text("Discount", 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(` - %. ${discount}`, 160, y);
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.text("Total", 20, y);
    doc.setFont("helvetica", "normal");
    doc.text(`${RestIDQuery?.restCurrency} ${grandTotal}`, 160, y);
    y += 15;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for your order!", 105, y, { align: "center" });

    doc.save(`invoice_${downData.orderNo}.pdf`);
  };
  const handlePrint = async (orderNo) => {
    const { data: downData, error } = await supabase
      .from("orders")
      .select("*")
      .eq("orderNo", orderNo)
      .maybeSingle();

    if (error) {
      console.error("Error fetching invoice:", error);
      return;
    }

    const doc = new jsPDF({
      unit: "mm",
      format: [58, 200],
    });

    let y = 10;
    doc.setFont("courier", "normal");
    doc.setFontSize(10);

    // --- Header ---
    doc.setFont("courier", "bold");
    doc.text(`${RestIDQuery?.name || "Restaurant"}`, 29, y, {
      align: "center",
    });
    y += 6;
    doc.setFont("courier", "normal");
    doc.text(`Invoice: ${downData.orderNo}`, 29, y, { align: "center" });
    y += 4;
    doc.text(
      `Date: ${new Date(downData.created_at).toLocaleDateString()}`,
      29,
      y,
      { align: "center" }
    );
    y += 6;
    doc.text("----------------------------", 29, y, { align: "center" });
    y += 5;

    doc.setFont("courier", "bold");
    doc.text("Your Order", 29, y, { align: "center" });
    doc.setFont("courier", "normal");
    y += 6;
    doc.text("----------------------------", 29, y, { align: "center" });
    y += 4;

    // --- Items ---
    let items = [];
    try {
      items =
        typeof downData.orderDetails === "string"
          ? JSON.parse(downData.orderDetails)
          : downData.orderDetails;
    } catch (err) {
      console.error("Error parsing orderDetails:", err);
    }

    let subtotal = 0;

    items.forEach((item) => {
      let base = item.basePrice || 0;
      let variant = item.variantPrice || 0;
      let optionsTotal =
        item.options?.reduce((sum, opt) => sum + (opt.extra_price || 0), 0) ||
        0;

      const finalBase = base > 0 ? base : variant > 0 ? variant : 0;
      const itemTotal = (finalBase + optionsTotal) * item.quantity;
      subtotal += itemTotal;

      // Item Name
      doc.setFont("courier", "bold");
      doc.text(`${item.foodName}`, 5, y);
      y += 4;

      // Options
      doc.setFont("courier", "normal");
      item.options?.forEach((opt) => {
        doc.text(`${opt.option_name} (${RestIDQuery?.restCurrency} ${opt.extra_price})`, 5, y);
        y += 4;
      });

      // Qty and total
      doc.text(`Qty: ${item.quantity}`, 5, y);
      y += 4;
      doc.text(`${RestIDQuery?.restCurrency} ${itemTotal}`, 5, y);
      y += 4;

      doc.text("----------------------------", 29, y, { align: "center" });
      y += 5;
    });

    // --- Totals ---
    const delivery = downData.deliveryCharges || 0;
    const grandTotal = downData?.final_total 
    const discount = downData?.discount_amount || 0

    doc.setFont("courier", "bold");
    doc.text("Delivery Fee", 5, y);
    y += 4;

    
    doc.setFont("courier", "normal");
    doc.text(`${RestIDQuery?.restCurrency} ${delivery}`, 5, y);
    y += 5;

    doc.setFont("courier", "bold");
    doc.text("Discount", 5, y);
    y += 4;

    
    doc.setFont("courier", "normal");
    doc.text(` - % ${discount}`, 5, y);
    y += 5;

    doc.setFont("courier", "bold");
    doc.text("Total", 5, y);
    y += 4;
    doc.setFont("courier", "normal");
    doc.text(`${RestIDQuery?.restCurrency} ${grandTotal}`, 5, y);
    y += 8;

    doc.text("----------------------------", 29, y, { align: "center" });
    y += 5;
    doc.text("Thank you for your order!", 29, y, { align: "center" });

    // --- Print ---
    const pdfBlob = doc.output("blob");
    const pdfURL = URL.createObjectURL(pdfBlob);
    const win = window.open(pdfURL);
    if (win) {
      win.onload = () => {
        win.focus();
        win.print();
      };
    }
  };

  function groupOrdersByDate(orders) {
    const groups = {};
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    orders.forEach((o) => {
      const d = new Date(o.created_at);
      let key;

      if (d.toDateString() === today.toDateString()) {
        key = `Today (${d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })})`;
      } else if (d.toDateString() === yesterday.toDateString()) {
        key = `Yesterday (${d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })})`;
      } else {
        key = d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(o);
    });

    return groups;
  }
  const groupedOrders = groupOrdersByDate(tabFilteredOrders);

  //disable orders

  const disableOrder = async () => {
    const { data, error } = await supabase
      .from("rest_list")
      .select("*")
      .eq("id", RestIDQuery?.id)
      .maybeSingle();
    if (error) throw error;
    return data;
  };

  const { data: disableOrderQuery } = useQuery({
    queryKey: ["disableOrder", RestIDQuery?.id],
    queryFn: disableOrder,
    enabled: !!RestIDQuery?.id,

    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  const setOrderDisable = async () => {
    const { data, error } = await supabase
      .from("rest_list")
      .update({ orderDisable: !disableOrderQuery?.orderDisable }) // toggle ON/OFF
      .eq("id", RestIDQuery?.id)
      .eq("user_id", user_id)
      .select("*")
      .maybeSingle();

    if (error) throw error;
    return data;
  };

  const { mutate: setOrderDisM } = useMutation({
    mutationKey: ["setOrderDisM"],
    mutationFn: setOrderDisable,
    onSuccess: () => {
      if (disableOrderQuery?.orderDisable) {
        toast.success("Ordering Enabled");
      } else {
        toast.success("Ordering DIsabled");
      }

      queryClient.invalidateQueries(["disableOrder", RestIDQuery?.id]);
      setOrderMode(0);
    },
  });


  const updateRider = async ({ rider,orderId }) => {
  if (!orderId) throw new Error("Missing orderId");
  if (!RestIDQuery?.id) throw new Error("Missing restID");

  const { data, error } = await supabase
    .from("orders")
    .update({ assignedRider: rider })
    .eq("id", orderId)
    .eq("restID", RestIDQuery.id)
    .select()
    .single();

  if (error) throw error;

  return data;
};

   const { mutate: updateRiderM } = useMutation({
  mutationKey: ["updateRiderM", selectedOrder?.orderId],
  mutationFn: updateRider,
  onSuccess: () => {
    toast.success("Order assigned to Rider");
    queryClient.invalidateQueries(["orderData"]);
  },
  onError: (err) => {
    console.error(err);
    toast.error(err.message || "Failed to assign Rider");
  },
});

  const fetchRiders =async ()=>{
      const {data:riderData,error} = await supabase
        .from('riders')
        .select('*')
        .eq('restID',RestIDQuery?.id)
        if(error) throw error
        return riderData
    }
  
    const {data:RiderQuery} = useQuery({
      queryKey: ['riderQuery', RestIDQuery?.id],
      queryFn: fetchRiders,
     enabled: !!RestIDQuery?.id

    })

  if (isPending) {
    return (
      <div>
        <Title>Live Orders</Title>
        <div className="max-md:mt-10 min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-pink-50 p-6 flex items-center justify-center">
          <div className="max-w-4xl mx-auto ">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                <h2 className="text-xl max-md:text-sm font-semibold text-gray-700">
                  Loading Orders...
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  
  if (error) {
    return (
      <div className="min-h-screen bg-background p-6 max-md:mt-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl text-center font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
            Live Orders
          </h1>
          <Card className="border-destructive">
            <CardContent className="p-6 text-center">
              <p className="text-destructive">
                Failed to load orders. Please try again.
              </p>
              <Button
                onClick={() => queryClient.invalidateQueries(["orderData"])}
                className="mt-4"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (mobileMode) {
    return (
      <div className="min-h-screen mt-13">
        <div className="flex  items-center justify-center gap-x-3 mt-4">
          <div className="flex items-center justify-center mt-3 w-16 h-16 max-md:w-12 max-md:h-12 bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl shadow-lg mb-4">
            <Bell className="w-8 h-8 max-md:w-6 max-md:h-6 text-white" />
          </div>
          <h2 className="text-2xl max-md:text-xl text-center font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
            Live Orders
          </h2>
        </div>

        <div className="h-[150px]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-muted rounded-lg p-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 w-full">
              <TabsTrigger
                value="new"
                className="border-slate-600  data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md px-4 py-2"
              >
                <Sparkles /> New
              </TabsTrigger>

              <TabsTrigger
                value="processing"
                className="border-slate-600  data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-md px-4 py-2"
              >
                <Clock /> Processing
              </TabsTrigger>

              <TabsTrigger
                value="dispatched"
                className="border-slate-600  data-[state=active]:bg-pink-500 data-[state=active]:text-white rounded-md px-4 py-2"
              >
                <Bike /> Dispatched
              </TabsTrigger>

              <TabsTrigger
                value="completed"
                className="border-slate-600  data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-md px-4 py-2"
              >
                <CircleCheckBig /> Completed
              </TabsTrigger>

              <TabsTrigger
                value="cancelled"
                className="border-slate-600  data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-md px-4 py-2"
              >
                <CircleX /> Cancelled
              </TabsTrigger>

              <TabsTrigger
                value="pickup"
                className="border-slate-600  data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-md px-4 py-2"
              >
                <ShoppingBag /> Pick Up
              </TabsTrigger>

              <TabsTrigger
                value="all"
                className="border-slate-600  data-[state=active]:bg-gray-800 data-[state=active]:text-white rounded-md px-4 py-2"
              >
                <ReceiptText /> All Orders
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center justify-end mr-1 mb-4 gap-x-4">
          <Button className="btn-accent px-4 py-2" onClick={() => refetch()}>
            <RotateCcw />
          </Button>

          {disableOrderQuery?.orderDisable ? (
            <Button
              className="bg-green-500 text-white"
              onClick={() => setOrderDisM()}
            >
              <Power />
            </Button>
          ) : (
            <Button
              className="bg-red-500 text-white"
              onClick={() => setOrderDisM()}
            >
              <Power />
            </Button>
          )}
        </div>

        <div className="mb-6 px-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <div className="absolute left-9 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none">
              ORD-
            </div>
            <Input
              placeholder="Enter order number (e.g., 17581XXXXXXXX)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-20 w-full"
              type="number"
            />
          </div>
        </div>

        <div>
          {!isPending && Object.keys(groupedOrders).length > 0 ? (
            Object.entries(groupedOrders).map(([dateLabel, orders]) => (
              <div key={dateLabel} className="mb-6">
                <h3 className="text-lg font-bold mb-3">{dateLabel}</h3>
                <div className="grid grid-cols-1 gap-4">
                  {orders.map((o) => (
                    <Card
                      key={o.orderNo}
                      className="flex flex-col items-center mb-3 shadow-xl border-slate-300"
                    >
                      <span className="font-bold">{o.orderNo}</span>
                      <div className="flex items-center gap-x-2">
                        <div className="text-sm font-bold">
                          {new Date(o.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </div>
                      </div>
                      <Button
                        className="btn-accent w-fit"
                        onClick={() => setSelectedOrder(o)}
                      >
                        <Eye /> View
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center gap-x-2 font-semibold border-slate-700">
              <FileText /> No Orders
            </div>
          )}

          {/* ================= ORDER DETAILS DIALOG ================= */}
          <Dialog
            open={!!selectedOrder}
            onOpenChange={() => setSelectedOrder(null)}
          >
            <DialogContent
              className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white text-black "
              aria-describedby={undefined}
            >
              <DialogHeader>
                <DialogTitle>Customer Details</DialogTitle>
              </DialogHeader>

              {selectedOrder && (
                <div className="flex flex-col gap-y-1">
                  <div className="px-6 py-4 max-h-24 overflow-y-auto flex items-center">
                    {getStatusBadge(selectedOrder?.orderStatus)}
                  </div>
                  <p>
                    <span className="font-bold">Order #:</span>{" "}
                    {selectedOrder.orderNo}
                  </p>
                  <p>
                    <span className="font-bold">Receive Method: </span>{" "}
                    {selectedOrder.custGetMethod}
                  </p>
                  <p>
                    <span className="font-bold">Scheduled: </span>{" "}
                    {selectedOrder?.scheduled_date || 'Today'} | {selectedOrder?.scheduled_window || 'ASAP'}
                  </p>
                  <p>
                    <span className="font-bold">Name: </span>{" "}
                    {selectedOrder.custName}
                  </p>
                  <p>
                    <span className="font-bold">Email: </span>{" "}
                    {selectedOrder.custEmail}
                  </p>
                  <p>
                    <span className="font-bold">Phone No:</span>{" "}
                    <a
                      href={`tel:${selectedOrder.custPhone}`}
                      className="text-blue-700"
                    >
                      {selectedOrder.custPhone}
                    </a>
                  </p>
                  <div className="">
                    <span className="font-bold">Address:</span>{" "}
                    <span className="mr-1">{selectedOrder.custAddress}</span>
                    <span className="mr-1">{selectedOrder.areaName}</span>
                    <span>{selectedOrder.cityName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-x-2">
                      <span className="font-bold">Placed at:</span>
                      <span className="text-sm font-medium">
                        {new Date(selectedOrder?.created_at).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {new Date(selectedOrder?.created_at).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                  </div>
                  {selectedOrder?.orderStatus === "dispatched" && (
                    <span>
                      <span className="font-bold">Rider:</span>{" "}
                      {selectedOrder?.assignedRider}
                    </span>
                  )}

                  {/* Parse orderDetails */}
                  {(() => {
                    let parsedDetails = [];
                    try {
                      parsedDetails = Array.isArray(selectedOrder.orderDetails)
                        ? selectedOrder.orderDetails
                        : JSON.parse(selectedOrder.orderDetails || "[]");
                    } catch {
                      parsedDetails = [];
                    }

                    return (
                      <div className="mt-4 space-y-4">
                        {parsedDetails.length > 0 ? (
                          <>
                            {parsedDetails.map((item, index) => {
  const unitPrice = Number(item.price || 0); // FINAL price (variant + addons)
  const quantity = Number(item.quantity || 1);
  const itemTotal = unitPrice * quantity;

  return (
    <div
      key={index}
      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
    >
      <div className="grid grid-cols-2 gap-4">
        {/* Left */}
        <div>
          <h3 className="font-semibold text-lg max-md:text-sm text-black">
            {item.foodName}
          </h3>

          <p className="text-gray-600 max-md:text-sm">
            Category: {item.category}
          </p>

          <p className="text-gray-600 max-md:text-sm">
            Quantity: {quantity}
          </p>

          {/* Price breakdown */}
          <div className="mt-2 text-sm text-gray-700 space-y-1">
            {item.basePrice === 0 ? <p></p>: <p>Base Price:  <span>{Currency || 'N/A'}</span>{item.basePrice ?? 0}</p>}
           

            {item.variant && (
              <p>
                Variant ({item.variant}):  <span>{Currency || 'N/A'}</span> {item.variantPrice ?? 0}
              </p>
            )}

            {item.optionsPrice > 0 && (
              <p>Add-ons / Variant:  <span>{Currency || 'N/A'}</span> {item.optionsPrice}</p>
            )}
          </div>

          {/* Options list */}
          {item.options?.length > 0 && (
            <div className="mt-2">
              <p className="font-medium text-black">Selected Options:</p>
              {item.options.map((option, optIndex) => (
                <p
                  key={optIndex}
                  className="text-gray-600 ml-2"
                >
                  • {option.option_name}
                  {option.extra_price > 0 &&
                    ` (${Currency || 'N/A'} ${option.extra_price})`}
                </p>
              ))}
            </div>
          )}

          <p className="font-semibold text-black mt-3">
            Item Total:  <span>{Currency || 'N/A'}</span> {itemTotal}
          </p>
        </div>

        {/* Right */}
        <div>
          {item.foodImg && (
            <img
              src={item.foodImg}
              alt={item.foodName}
              className="w-full h-32 max-md:h-[70px] object-cover rounded-lg"
            />
          )}

          <div className="mt-2 text-xs text-gray-600">
            <p>
              <span className="font-semibold">Item ID:</span>{" "}
              {item.itemID}
            </p>
            <p>
              <span className="font-semibold">Stock Status:</span>{" "}
              {item.stockStatus ? "In Stock" : "Out of Stock"}
            </p>
            <p>
              <span className="font-semibold">Added:</span>{" "}
              {new Date(item.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
})}

                            {/* Payment Method */}
                            <div className="flex justify-between items-center border-t pt-2">
                              <span className="font-bold text-lg max-md:text-sm text-black">
                                Payment Method
                              </span>
                              <span className="font-bold text-lg text-red-600 max-md:text-sm">
                                {selectedOrder.custPayMethod ?? ""}
                              </span>
                            </div>

                            {/* Delivery Fee */}
                            <div className="flex justify-between items-center border-t pt-2">
                              <span className="font-bold text-lg max-md:text-sm text-black">
                                Delivery Fee:
                              </span>
                              <span className="font-bold text-lg text-blue-600 max-md:text-sm">
                                 <span>{Currency || 'N/A'}</span> {selectedOrder.deliveryCharges ?? 0}
                              </span>
                            </div>

                            {/* Discount*/}
                            <div className="flex justify-between items-center border-t pt-2">
                              <span className="font-bold text-lg max-md:text-sm text-black">
                                Discount:
                              </span>
                              <span className="font-bold text-lg text-blue-600 max-md:text-sm">
                                -  <span>{Currency || 'N/A'}</span> {selectedOrder.discount_amount ?? 0}
                              </span>
                            </div>

                            {/* ✅ Grand Total Section */}
                            <div className="border-t pt-4 mt-4 flex justify-between items-center">
                              <span className="font-bold text-lg max-md:text-sm text-black">
                                Grand Total:
                              </span>
                              <span className="font-extrabold text-xl text-green-600 max-md:text-sm flex gap-x-1">
                                <span>{Currency || 'N/A'}</span>
                                
                                <span>{Number((selectedOrder?.final_total || 0))}</span>
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <pre className="text-black text-sm overflow-x-auto whitespace-pre-wrap">
                              {JSON.stringify(selectedOrder, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
              <div className="flex items-center">
                {/* Status */}

                {/* Actions */}
                <div className="px-6 py-4 max-h-24 overflow-y-auto">
                  <Select
                    value={selectedOrder?.orderStatus ?? ""}
                    onValueChange={(newStatus) => {
                      updateStatusM({ orderId: selectedOrder.id, newStatus });
                      setSelectedOrder(null);
                    }}
                  >
                    <SelectTrigger className="w-fit">
                      <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem
                        value="pending"
                        onClick={() => setSelectedOrder(null)}
                      >
                        Pending
                      </SelectItem>
                      <SelectItem
                        value="delivered/pickedUp"
                        onClick={() => setMobileModel(!selectedOrder)}
                      >
                        Delivered / Picked Up
                      </SelectItem>
                      <SelectItem
                        value="cancelled"
                        onClick={() => setMobileModel(!selectedOrder)}
                      >
                        Cancelled
                      </SelectItem>
                      <SelectItem
                        value="confirmed"
                        onClick={() => setMobileModel(!selectedOrder)}
                      >
                        Confirmed
                      </SelectItem>
                      <SelectItem
                        value="dispatched"
                        onClick={() => setSelectedOrder(!selectedOrder)}
                      >
                        Dispatched
                      </SelectItem>
                      <SelectItem
                        value="pickup"
                        onClick={() => setSelectedOrder(!selectedOrder)}
                      >
                        Pick Up
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/*Rider*/}

                
                <div className="flex">
                  <Button
                    className="mr-5 hover:bg-red-400 bg-transparent"
                    variant="outline"
                    onClick={() => handleDownload(selectedOrder?.orderNo)}
                  >
                    <Download />
                  </Button>
                  <Button
                    className=" hover:bg-green-400 bg-transparent"
                    variant="outline"
                    onClick={() => handlePrint(selectedOrder?.orderNo)}
                  >
                    <Printer />
                  </Button>
                </div>
                
              </div>
              <div className="px-4 py-2 max-h-24 overflow-y-auto">
                <span className="mb-2 font-semibold">Assign Rider</span>
                  <Select
                    value={selectedOrder?.assignedRider ?? ""}
                    onValueChange={(newRider) => {
                      updateRiderM({
                        rider: newRider,
                        orderId: selectedOrder.id,
                      });
                      setSelectedOrder(null);
                    }}
                  >
                    <SelectTrigger className="w-fit">
                      <SelectValue placeholder="Assign Rider" />
                    </SelectTrigger>

                    <SelectContent className="bg-white max-h-40 overflow-y-auto">
                      {RiderQuery?.map((r) => (
                        <SelectItem key={r.id} value={r.name}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Title>Orders</Title>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-center mb-8 gap-x-3">
            <div className="flex mt-3 items-center justify-center w-16 h-16 bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl shadow-lg mb-4">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl text-center font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
              Live Orders
            </h1>
          </div>
          <div className="flex items-end justify-end mb-4">
            {disableOrderQuery?.orderDisable ? (
              <Button
                className="bg-green-500 text-white"
                onClick={() => setOrderDisM()}
              >
                <Power />
                Enable Ordering
              </Button>
            ) : (
              <Button
                className="bg-red-500 text-white"
                onClick={() => setOrderDisM()}
              >
                <Power />
                Disable Ordering
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <div className="absolute left-9 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm font-medium pointer-events-none">
                ORD-
              </div>
              <Input
                placeholder="Enter order number (e.g., 17581XXXXXXXX)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-20 w-full"
                type="number"
              />
            </div>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => refetch()}
            >
              {" "}
              <RotateCcw /> Reload Orders
            </Button>
          </div>
          <div className="flex">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="mb-6"
            >
              <TabsList className="bg-muted rounded-lg p-1">
                <TabsTrigger
                  value="new"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md px-6 py-4 border-slate-600 mr-2"
                >
                  <Sparkles /> New
                </TabsTrigger>
                <TabsTrigger
                  value="processing"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white rounded-md px-6 py-4 border-slate-600 mr-2"
                >
                  <Clock />
                  Processing
                </TabsTrigger>
                <TabsTrigger
                  value="dispatched"
                  className="data-[state=active]:bg-pink-600 data-[state=active]:text-white rounded-md px-6 py-4 border-slate-600 mr-2"
                >
                  <Bike /> Dispatched
                </TabsTrigger>
                <TabsTrigger
                  value="completed"
                  className="data-[state=active]:bg-green-600 data-[state=active]:text-white rounded-md px-6 py-4 border-slate-600 mr-2"
                >
                  <CircleCheckBig /> Completed
                </TabsTrigger>
                <TabsTrigger
                  value="cancelled"
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-md px-6 py-4 border-slate-600 mr-2"
                >
                  <CircleX /> Cancelled
                </TabsTrigger>

                <TabsTrigger
                  value="pickup"
                  className="data-[state=active]:bg-gray-800 data-[state=active]:text-white rounded-md px-6 py-4 border-slate-600 mr-2"
                >
                  <ShoppingBag />
                  Pick Up
                </TabsTrigger>

                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-gray-800 data-[state=active]:text-white rounded-md px-6 py-4 border-slate-600 mr-2"
                >
                  <ReceiptText /> All Orders
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Orders Table */}
          {!isPending && tabFilteredOrders.length > 0 ? (
            <div className="bg-white rounded-lg border shadow-sm overflow-x-auto overflow-y-auto h-[500px]">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="">
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Order #
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Placed At
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Customer Details
                    </th>
                    {/*<th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Contact
                  </th>*/}
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Items
                    </th>
                    {/* <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                    Payment
                  </th>*/}
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Change Status
                    </th>
                   
                    
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Receipt
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                      Rider 
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tabFilteredOrders.map((order, i) => (
                    <tr key={i} className="hover:bg-muted/25 transition-colors">
                      {/* Order # */}
                      <td className="px-6 py-4 max-h-24 overflow-y-auto">
                        <div className="font-semibold text-foreground text-sm">
                          #{order?.orderNo}
                        </div>
                      </td>

                      {/* Placed At */}
                      <td className="px-4 py-4 max-h-24 overflow-y-auto">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs font-medium">
                              {order?.created_at
                                ? new Date(order.created_at).toLocaleDateString(
                                    "en-GB",
                                    {
                                      day: "2-digit",
                                      month: "long",
                                      year: "numeric",
                                    }
                                  )
                                : "N/A"}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {order?.created_at
                              ? new Date(order.created_at).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  }
                                )
                              : "N/A"}
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4 max-h-24 overflow-y-auto">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-sm">
                              {order?.custName}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs flex items-center gap-x-1 mb-2 ">
                              <MapPin size={13} />
                              {order?.custAddress || "Pick Up"}
                            </span>
                            <span className="text-xs flex items-center gap-x-1">
                              <Phone size={13} />
                              {order?.custPhone}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      {/*<td className="px-6 py-4 max-h-24 overflow-y-auto">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{order?.custPhone}</span>
                      </div>
                    </td>*/}

                      {/* Items */}
                      <td className="px-6 py-4 max-h-24 overflow-y-auto">
                        <div
                          className="max-w-xs cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
                          onClick={() => handleItemsClick(order)}
                        >
                          {/*<div className="max-h-20 overflow-y-auto">{formatOrderDetails(order?.orderDetails)}</div>
                        {order?.custInst && order?.custInst !== "none" && (
                          <div className="mt-2 p-2 bg-muted rounded text-xs">
                            <span className="font-medium">Instructions: </span>
                            <span className="text-muted-foreground">{order?.custInst}</span>
                          </div>
                        )}*/}
                          <div className="text-sm text-blue-600 mt-1">
                            View Details
                          </div>
                        </div>
                      </td>

                      {/* Payment */}
                      {/*<td className="px-6 py-4 max-h-24 overflow-y-auto">
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                        <span className="capitalize">
                          {order?.custPayMethod}
                        </span>
                      </div>
                    </td>*/}

                      {/* Status */}
                      <td className="px-6 py-4 max-h-24 overflow-y-auto">
                        {getStatusBadge(order?.orderStatus)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 max-h-24 overflow-y-auto">
                        <Select
                          value={order?.orderStatus}
                          onValueChange={(newStatus) =>
                            updateStatusM({ orderId: order.id, newStatus })
                          }
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue placeholder="Update Status" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="dispatched">
                              Dispatched
                            </SelectItem>
                            <SelectItem value="delivered/pickedUp">Delivered/Picked Up</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="pickup">Pick Up</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td>
                        <Button
                          className="mr-2 hover:bg-red-400 bg-transparent"
                          variant="outline"
                          onClick={() => handleDownload(order?.orderNo)}
                        >
                          <Download />
                        </Button>
                        <Button
                          className=" hover:bg-green-400 bg-transparent"
                          variant="outline"
                          onClick={() => handlePrint(order?.orderNo)}
                        >
                          <Printer />
                        </Button>
                      </td>
                      <td>
                        
                          
                    {order.orderStatus === "dispatched" && (
  <Select
    value={order.assignedRider ?? ""}
    onValueChange={(newRider) =>
      updateRiderM(
        { rider: newRider, orderId: order.id },
        { onSettled: () => setSelectedOrder(null) }
      )
    }
  >
    <SelectTrigger className="w-[80px]">
      <SelectValue placeholder="Assign Rider" />
    </SelectTrigger>

    <SelectContent className="bg-white max-h-40 overflow-y-auto">
      {RiderQuery?.map((r) => (
        <SelectItem key={r.id} value={r.name}>
          {r.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)}

                      </td>
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {searchTerm
                        ? "No matching orders found"
                        : "No orders yet"}
                    </h3>
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? `No orders found matching "${searchTerm}". Try a different search term.`
                        : "Orders will appear here when customers place them."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Modal */}

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent
              className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white text-black"
              aria-describedby={undefined}
            >
              <DialogHeader>
                <DialogTitle className="text-black">
                  Order Details -{" "}
                  <span className="font-bold text-lg">
                    {selectedOrder?.custGetMethod} | {selectedOrder?.scheduled_date || 'Today'} | {selectedOrder?.scheduled_window || 'ASAP'}
                  </span>
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                {selectedOrderDetails && (
                  <div className="space-y-4">
                    {Array.isArray(selectedOrderDetails) ? (
                      <>
                        {selectedOrderDetails && (
  <div className="space-y-4">
    {Array.isArray(selectedOrderDetails) &&
      selectedOrderDetails.map((item, index) => {
        const unitPrice = Number(item.price || 0); // FINAL unit price
        const quantity = Number(item.quantity || 1);
        const itemTotal = unitPrice * quantity;

        return (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Left */}
              <div>
                <h3 className="font-semibold text-lg text-black">
                  {item.foodName}
                </h3>

                <p className="text-gray-600">
                  Category: {item.category}
                </p>

                <p className="text-gray-600">
                  Quantity: {quantity}
                </p>

                {/* Price breakdown */}
                <div className="mt-2 text-sm text-gray-700 space-y-1">
                  {item.basePrice === 0 ? <p></p>:                   <p>Base Price:  <span>{Currency || 'N/A'}</span> {item.basePrice ?? 0}</p>
}

                  {item.variant && (
                    <p>
                      Variant ({item.variant}):  <span>{Currency || 'N/A'}</span> {item.variantPrice ?? 0}
                    </p>
                  )}

                  {item.optionsPrice > 0 && (
                    <p>Add-ons / Variant:  <span>{Currency || 'N/A'}</span> {item.optionsPrice}</p>
                  )}
                </div>

                {/* Selected options */}
                {item.options?.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-black">
                      Selected Options:
                    </p>
                    {item.options.map((option, optIndex) => (
                      <p
                        key={optIndex}
                        className="text-gray-600 ml-2"
                      >
                        • {option.option_name}
                        {option.extra_price > 0 &&
                          ` (${Currency || 'N/A'} ${option.extra_price})`}
                      </p>
                    ))}
                  </div>
                )}

                <p className="font-semibold text-black mt-3">
                  Item Total: <span>{Currency || 'N/A'}</span> {itemTotal}
                </p>
              </div>

              {/* Right */}
              <div>
                {item.foodImg && (
                  <img
                    src={item.foodImg || "/cc.jpg"}
                    alt={item.foodName}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}

                <div className="mt-2 text-sm text-gray-600">
                  <p>
                    <span className="font-semibold">Item ID:</span>{" "}
                    {item.itemID}
                  </p>
                  <p>
                    <span className="font-semibold">Stock Status:</span>{" "}
                    {item.stockStatus ? "In Stock" : "Out of Stock"}
                  </p>
                  <p>
                    <span className="font-semibold">Added:</span>{" "}
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
  </div>
)}


                        <div className="flex justify-between items-center border-t pt-2">
                          <span className="font-bold text-lg text-black">
                            Payment Method 
                          </span>
                          <span className="font-bold text-lg text-red-600">
                            {selectedOrder?.custPayMethod ?? ""}
                          </span>
                        </div>
                        
                        {
                          selectedOrder?.orderStatus === 'dispatched' && (<div className="flex justify-between items-center border-t pt-2">
                          <span className="font-bold text-lg text-black">
                            Rider
                          </span>
                          <span className="font-bold text-lg text-black">
                            {selectedOrder?.assignedRider ?? "Not Assigned"}
                          </span>
                        </div>)
                        }
                        

                        

                        <div className="flex justify-between items-center border-t pt-2">
                          <span className="font-bold text-lg text-black">
                            Delivery Fee:
                          </span>
                          <span className="font-bold text-lg text-blue-600">
                             <span>{Currency || 'N/A'}</span> {selectedOrder?.deliveryCharges ?? 0}
                          </span>
                        </div>

                        <div className="flex justify-between items-center border-t pt-2">
                          <span className="font-bold text-lg text-black">
                            Discount
                          </span>
                          <span className="font-bold text-lg text-blue-600">
                            - <span>{Currency || 'N/A'}</span> {selectedOrder?.discount_amount ?? 0}
                          </span>
                        </div>

                        {/* ✅ Grand Total Section */}
                        <div className="border-t pt-4 mt-4 flex justify-between items-center">
                          <span className="font-bold text-lg text-black">
                            Grand Total:
                          </span>
                          <span className="font-extrabold text-xl text-green-600">
                             <span>{Currency || 'N/A'}</span>{" "}
                            
                                                            {Number((selectedOrder.final_total || 0))}

                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="text-black text-sm overflow-x-auto whitespace-pre-wrap">
                          {JSON.stringify(selectedOrderDetails, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
