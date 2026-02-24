import { useAuth } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import {
  Frown,
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  Loader2,
  Search,
  Banknote,
  ChevronDown,
  User,
  ShoppingBag,
  Package,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/db/supabase";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check } from "lucide-react";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Title } from "react-head";

export default function PlaceOrder() {
  const cart = useAuth((state) => state.cart);
  const { addToCart, removeFromCart, deleteFromCart, session, clearCart } =
    useAuth();
  const user_id = session?.user?.id;

  const [search, setSearch] = useState("");
  const [mobileView, setMobileView] = useState("menu");

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [options, setOptions] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState([]);

  const subtotal = Array.isArray(cart)
    ? cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    : 0;

  const isEmpty = !Array.isArray(cart) || cart.length === 0;

  async function fetchRestID() {
    const { data: restIDData, error } = await supabase
      .from("rest_list")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    if (error) throw error;
    return restIDData;
  }

  const { data: restIDQuery } = useQuery({
    queryKey: ["restID", user_id],
    queryFn: fetchRestID,
    enabled: !!user_id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  const fetchRestMenu = async () => {
    const { data, error } = await supabase
      .from("restaurant_menu")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  };

  const {
    data: menuQuery,
    isPending,
    isError: isMenuError,
    error: menuError,
  } = useQuery({
    queryKey: ["restMenu", user_id],
    queryFn: fetchRestMenu,
    enabled: !!user_id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  const categories = useMemo(() => {
    if (!menuQuery) return [];
    return ["all", ...new Set(menuQuery.map((item) => item.category))];
  }, [menuQuery]);

  const getQuantity = (id) => cart?.find((c) => c.itemID === id)?.quantity || 0;

  const filterMenu = (cat) => {
    if (!menuQuery) return [];
    return menuQuery.filter((item) => {
      const matchesCategory = cat === "all" || item.category === cat;
      const matchesSearch = item.foodName
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  };

  const fetchOptions = async (itemId) => {
    const { data, error } = await supabase
      .from("item_options")
      .select("*")
      .eq("item_id", itemId);
    if (!error) {
      setOptions(data || []);
      const groups = [
        ...new Set(data?.map((o) => o.group_name).filter(Boolean)),
      ];
      setExpandedGroups(groups);
    }
  };

  const groupedOptions = useMemo(() => {
    if (!options || options.length === 0) return {};

    const grouped = {};
    options.forEach((opt) => {
      const groupName = opt.group_name || "Other Options";
      if (!grouped[groupName]) {
        grouped[groupName] = {
          options: [],
          isRequired: opt.is_required || false,
        };
      }
      grouped[groupName].options.push(opt);
    });

    return grouped;
  }, [options]);

  const getTotalQuantityForItem = (itemID) => {
    return (
      cart?.reduce((total, c) => {
        if (c.itemID === itemID) total += c.quantity;
        return total;
      }, 0) || 0
    );
  };

  const handleAddToCart = () => {
    if (!selectedItem) return;

    // --- Check required option groups ---
    const requiredGroups = Object.entries(groupedOptions).filter(
      ([_, group]) => group.isRequired,
    );
    for (const [groupName, group] of requiredGroups) {
      const hasSelection = group.options.some((opt) =>
        selectedOptions.includes(opt.id.toString()),
      );
      if (!hasSelection) {
        toast.error(`Please select at least one option from "${groupName}"`);
        return;
      }
    }

    // --- Get chosen options ---
    const chosenOptions = options.filter((o) =>
      selectedOptions.includes(o.id.toString()),
    );

    // --- Calculate prices properly ---
    const basePrice = Number(selectedItem.basePrice || selectedItem.price || 0);
    const variantExtra =
      selectedItem.selectedVariant?.extra_price ||
      selectedItem.variantPrice ||
      0;
    const variantAbsolute =
      selectedItem.selectedVariant?.price != null
        ? Number(selectedItem.selectedVariant.price)
        : null;

    const optionsPrice = chosenOptions.reduce(
      (sum, opt) => sum + Number(opt.extra_price || 0),
      0,
    );

    // If variant has absolute price, use that as base
    const finalPrice = Math.max(
      0,
      Math.round(
        variantAbsolute != null
          ? variantAbsolute + optionsPrice
          : basePrice + variantExtra + optionsPrice,
      ),
    );

    // --- Create unique cart item ID (variant + addons) ---
    const variantKey =
      selectedItem.selectedVariant?.name ||
      selectedItem.size ||
      selectedItem.variant ||
      "";
    const optionIds = chosenOptions
      .map((o) => o.id)
      .sort()
      .join("-");
    const cartItemID = `${selectedItem.itemID}${
      variantKey ? `-${variantKey}` : ""
    }${optionIds ? `-${optionIds}` : ""}`;

    // --- Check existing cart items ---
    //const existingItem = cart.find((c) => c.cartItemID === cartItemID);
    const addQty = Number(quantity ?? 1);
    const totalInCart = getTotalQuantityForItem(selectedItem.itemID);
    const availableStock = selectedItem.stockAmount - totalInCart;

    if (addQty > availableStock) {
      toast.info(`Only ${availableStock} ${selectedItem.foodName} available.`);
      return;
    }

    const itemBaseCost = Number(selectedItem.BaseCostPrice ?? 0);
    const itemCostPrice = Number(selectedItem.costPrice ?? 0);

    // --- Add to cart ---
    addToCart({
      ...selectedItem,
      price: finalPrice,
      basePrice,
      optionsPrice,
      variantPrice: variantExtra,
      options: chosenOptions,
      quantity: addQty,
      cartItemID,
      variant: variantKey || null,
      costPrice: itemCostPrice,
      BaseCostPrice: itemBaseCost,
    });

    // --- Reset modal ---
    setSelectedItem(null);
    setQuantity(1);
    setSelectedOptions([]);
    setOptions([]);
    setExpandedGroups([]);
  };

  // --------- Coupon related state ---------
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(subtotal);
  const [appliedCouponId, setAppliedCouponId] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // React no longer calculates discount — backend is source of truth

  const applyCoupon = async () => {
    if (!form.discount) {
      toast.error("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_COUPON_FUNCTION}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          code: form.discount,
          cartTotal: subtotal,
          userId: user_id,
          restID: restIDQuery?.id,
        }),
      });

      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
        setDiscountAmount(0);
        setAppliedCouponId(null);
        setFinalTotal(subtotal);
        return;
      }

      // SUCCESS
      toast.success("Coupon applied!");

      // Backend returns concrete numbers
      setDiscountAmount(Number(data.discount || 0));
      setFinalTotal(Number(data.finalTotal || subtotal));
      setAppliedCouponId(data.couponId || null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
    payment: "cash",
    email: "",
    cityName: "",
    areaName: "",
    recieveMethod: "delivery",
    discount: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [areaOpen, setAreaOpen] = useState(false);

  const fetchMerchantAreas = async () => {
    const { data: merchantAreasData, error } = await supabase
      .from("merchant_areas")
      .select(
        "area_id, min_order, delivery_fee, areas_master(area_name, city_name)",
      )
      .eq("user_id", user_id);

    if (error) throw error;
    return merchantAreasData;
  };

  const { data: merchantAreasQuery, isLoading } = useQuery({
    queryKey: ["merchantAreas", user_id],
    queryFn: fetchMerchantAreas,
    enabled: !!user_id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  const fetchDeliveryFee = async () => {
    if (!form.areaName) return null;

    const { data: areaData, error: areaError } = await supabase
      .from("areas_master")
      .select("id")
      .eq("area_name", form.areaName)
      .maybeSingle();

    if (areaError) throw areaError;

    if (!areaData) return null;

    const { data: feeData, error: feeError } = await supabase
      .from("merchant_areas")
      .select("delivery_fee")
      .eq("user_id", user_id)
      .eq("area_id", areaData.id)
      .maybeSingle();

    if (feeError) throw feeError;

    return feeData;
  };

  const fetchFixedRate = async () => {
    const { data, error } = await supabase
      .from("fixed_rates")
      .select("rate, fixMode")
      .eq("user_id", user_id)
      .maybeSingle();

    if (error) throw error;
    return data;
  };

  const { data: deliveryFeeQuery } = useQuery({
    queryKey: ["deliveryFee", form.areaName, user_id],
    queryFn: fetchDeliveryFee,
    enabled: !!form.areaName && !!user_id,
  });

  const { data: fixedRateQuery } = useQuery({
    queryKey: ["fixedRate", user_id],
    queryFn: fetchFixedRate,
    enabled: !!user_id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  const deliveryFee = fixedRateQuery?.fixMode
    ? fixedRateQuery?.rate || 0
    : deliveryFeeQuery?.delivery_fee || 0;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (value) => {
    setForm({ ...form, payment: value });
  };

  const handleRecieveChange = (value) => {
    setForm({ ...form, recieveMethod: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cart || cart.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderNo = "ORD-" + Date.now();
      const orderDetails = JSON.stringify(cart);

      const finalOrderTotal =
        finalTotal + (form.recieveMethod === "pickup" ? 0 : deliveryFee);

      const totalCost = cart.reduce((sum, item) => {
        const base = Number(item.BaseCostPrice ?? 0);
        const variant = Number(item.costPrice ?? 0);
        const qty = Number(item.quantity ?? 1);

        return sum + (base + variant) * qty;
      }, 0);

      const { error } = await supabase.from("orders").insert([
        {
          orderNo,
          restID: restIDQuery?.id,
          custName: form.name,
          custPhone: form.phone,
          custAddress: form.address,
          custInst: form.notes,
          custPayMethod: form.payment,
          custEmail: form.email,
          orderDetails,
          deliveryCharges: deliveryFee,
          areaName: form.areaName,
          cityName: form.cityName,
          custGetMethod: form.recieveMethod,

          // COUPON FIELDS
          coupon_id: appliedCouponId,
          discount_amount: discountAmount,
          final_total: finalOrderTotal,
          Total_Cost_Making: totalCost,
          customer_id: 'placed by restaurant'
        },
      ]);

      if (error) throw error;

      toast.success("Order placed successfully!");

      setForm({
        name: "",
        phone: "",
        address: "",
        notes: "",
        payment: "cash",
        email: "",
        cityName: "",
        areaName: "",
        recieveMethod: "delivery",
        discount: "",
      });

      // Reset coupon UI state
      setDiscountAmount(0);
      setAppliedCouponId(null);
      setFinalTotal(subtotal);
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
      clearCart();
    }

    for (const item of cart) {
      const { data: stockData, error: fetchError } = await supabase
        .from("restaurant_menu")
        .select("stockAmount")
        .eq("user_id", user_id)
        .eq("itemID", item.itemID)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const newStock = (stockData?.stockAmount || 0) - item.quantity;

      const { error: stockError } = await supabase
        .from("restaurant_menu")
        .update({ stockAmount: newStock })
        .eq("user_id", user_id)
        .eq("itemID", item.itemID);

      if (stockError) {
        console.error("Stock update failed for:", item.itemID, stockError);
      }
    }
  };
  useEffect(() => {
    setFinalTotal(subtotal);
  }, [subtotal]);

  const Currency = restIDQuery?.restCurrency || "N/A";

  if (isPending) {
    return (
      <div>
        <Title>Place Order</Title>
        <div className="max-md:mt-10 min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-pink-50 p-6 flex items-center justify-center">
          <div className="max-w-4xl mx-auto ">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                <h2 className="text-xl max-md:text-sm font-semibold text-gray-700">
                  Loading Place Order...
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Title>Place Order</Title>

      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-x-3 mt-7">
            <div className="flex items-center justify-center mt-3 w-16 h-16 max-md:w-12 max-md:h-12 bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl shadow-lg mb-4">
              <ShoppingBag className="w-8 h-8 max-md:w-6 max-md:h-6 text-white" />
            </div>
            <h2 className="text-2xl max-md:text-xl text-center font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
              Place Order
            </h2>
          </div>
        </div>
      </div>

      <div className="lg:hidden bg-white border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setMobileView("menu")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              mobileView === "menu"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Menu
          </button>
          <button
            onClick={() => setMobileView("order")}
            className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${
              mobileView === "order"
                ? "text-gray-900 border-b-2 border-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Order Details
            {cart && cart.length > 0 && (
              <span className="absolute top-2 right-1/4 btn-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto flex flex-col lg:flex-row h-[1000px]">
        <div
          className={`flex-1 overflow-y-auto bg-white ${
            mobileView === "order" ? "hidden lg:block" : ""
          }`}
        >
          <div className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search menu items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-12 text-base border-gray-300 focus:border-gray-900"
              />
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full bg-gray-100 p-1 h-auto flex-wrap justify-start gap-1">
                {categories.map((c) => (
                  <TabsTrigger
                    key={c}
                    value={c}
                    className="px-6 py-2.5 text-sm font-medium data-[state=active]:bg-[#f43f5e] data-[state=active]:text-white rounded-md"
                  >
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((c) => (
                <TabsContent key={c} value={c} className="mt-4">
                  {isPending && (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="animate-spin w-8 h-8 text-gray-600" />
                    </div>
                  )}
                  {isMenuError && (
                    <p className="text-red-600 text-center py-8">
                      Error: {menuError.message}
                    </p>
                  )}

                  {filterMenu(c).length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                      {filterMenu(c).map((m) => {
                        const isOutOfStock = m.stockStatus === false;
                        const ZeroStock = m.stockAmount === 0;
                        const inCart = getQuantity(m.itemID);

                        return (
                          <button
                            key={m.itemID}
                            disabled={isOutOfStock || ZeroStock}
                            className={`relative text-left bg-white border-2 rounded-lg overflow-hidden transition-all ${
                              isOutOfStock || ZeroStock
                                ? "opacity-50 cursor-not-allowed border-gray-200"
                                : "border-gray-200 hover:border-gray-900 hover:shadow-md cursor-pointer"
                            } ${
                              inCart > 0
                                ? " ring-2 ring-pink-600 ring-offset-2"
                                : ""
                            }`}
                            onClick={() => {
                              if (!isOutOfStock && !ZeroStock) {
                                setSelectedItem(m);
                                setQuantity(1);
                                setSelectedOptions([]);
                                fetchOptions(m.id);
                              }
                            }}
                          >
                            <div className="aspect-square relative bg-gray-100">
                              <img
                                src={m.foodImg || "/cc.jpg"}
                                className="w-full h-full object-cover"
                                alt={m.foodName}
                              />
                              {(isOutOfStock || ZeroStock) && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                  <span className="bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold">
                                    Out of Stock
                                  </span>
                                </div>
                              )}
                              {inCart > 0 && (
                                <div className="absolute top-2 right-2 bg-[#f43f5e] text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
                                  {inCart}
                                </div>
                              )}
                            </div>

                            <div className="p-3">
                              <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1 min-h-[2.5rem]">
                                {m.foodName}
                              </h3>
                              <div className="flex items-center justify-between">
                                <p
                                  className="text-sm font-bold"
                                  style={{
                                    color:
                                      isOutOfStock || ZeroStock
                                        ? "#6B7280"
                                        : `var(--accent-color)`,
                                  }}
                                >
                                  {m?.price > 0
                                    ? `${Currency} ${m.price}`
                                    : "Select Variant"}
                                </p>{" "}
                                <span className="text-xs text-gray-500">
                                  {m.stockAmount} left
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Frown className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600">No items found</p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>

        <div
          className={`w-full lg:w-[480px] bg-gray-50 border-l border-gray-200 flex flex-col h-full ${
            mobileView === "menu" ? "hidden lg:flex" : ""
          }`}
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-gray-200">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Current Order
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {cart && cart.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {cart.map((item) => {
                      const groupedCartOptions = {};
                      item.options?.forEach((opt) => {
                        const groupName = opt.group_name || "Add-ons";
                        if (!groupedCartOptions[groupName]) {
                          groupedCartOptions[groupName] = [];
                        }
                        groupedCartOptions[groupName].push(opt);
                      });

                      return (
                        <div key={item.cartItemID} className="p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <span className="font-semibold text-sm text-gray-900">
                                {item.foodName}
                              </span>
                              {Object.keys(groupedCartOptions).length > 0 && (
                                <div className="mt-1 space-y-0.5">
                                  {Object.entries(groupedCartOptions).map(
                                    ([groupName, opts]) => (
                                      <div
                                        key={groupName}
                                        className="text-xs text-gray-600"
                                      >
                                        {opts.map((opt) => (
                                          <div key={opt.id}>
                                            • {opt.option_name}{" "}
                                            {opt.extra_price > 0 &&
                                              `(${Currency} ${opt.extra_price})`}
                                          </div>
                                        ))}
                                      </div>
                                    ),
                                  )}
                                </div>
                              )}
                            </div>
                            <span className="font-bold text-sm text-gray-900 ml-2">
                              <span>{Currency}</span>{" "}
                              {item.quantity * item.price}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center border border-gray-300 rounded">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeFromCart(item.cartItemID)}
                                className="h-8 w-8 p-0 hover:bg-[#f43f5e]"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="px-3 text-sm font-semibold min-w-[2rem] text-center">
                                {item.quantity}
                              </span>
                              {/*} <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => addToCart(item)}
                                className="h-8 w-8 p-0 hover:bg-[#f43f5e]"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>*/}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteFromCart(item.cartItemID)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4">
                    <Frown className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">No items in order</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-gray-200">
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Select Delivery OR Pick Up
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <RadioGroup
                    value={form.recieveMethod}
                    onValueChange={handleRecieveChange}
                  >
                    <div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-gray-300 hover:border-gray-900 cursor-pointer">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label
                        htmlFor="pickup"
                        className="flex-1 cursor-pointer text-sm"
                      >
                        Pick Up
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-gray-300 hover:border-gray-900 cursor-pointer">
                      <RadioGroupItem value="delivery" id="delivery" />
                      <Label
                        htmlFor="delivery"
                        className="flex-1 cursor-pointer text-sm"
                      >
                        Delivery
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-gray-200">
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Customer Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="name"
                      className="text-xs font-medium text-gray-700"
                    >
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                      className="h-10 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="phone"
                      className="text-xs font-medium text-gray-700"
                    >
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      placeholder="0300-1234567"
                      className="h-10 text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="email"
                      className="text-xs font-medium text-gray-700"
                    >
                      Email{" "}
                      {form.recieveMethod === "pickup"
                        ? "- Optional"
                        : "- Optional"}
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="john.doe@gmail.com"
                      className="h-10 text-sm"
                    />
                  </div>

                  <Label
                    htmlFor="discount"
                    className="text-xs font-medium text-gray-700"
                  >
                    Discount - if applicable
                  </Label>

                  <div className="flex gap-2">
                    <Input
                      id="discount"
                      name="discount"
                      value={form.discount}
                      onChange={handleChange}
                      placeholder="discount code"
                      className="h-10 text-sm flex-1"
                    />

                    <Button
                      type="button"
                      onClick={applyCoupon}
                      disabled={couponLoading || !form.discount}
                      className="h-10 px-4 btn-accent text-white"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </Button>
                  </div>

                  {discountAmount > 0 && (
                    <p className="text-green-600 text-xs mt-1">
                      Discount applied: <span>{Currency}</span> {discountAmount}
                    </p>
                  )}

                  {form.recieveMethod === "delivery" && (
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="address"
                        className="text-xs font-medium text-gray-700"
                      >
                        Delivery Address *
                      </Label>
                      <Input
                        id="address"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        required={form.recieveMethod === "delivery"}
                        placeholder="Full address with block number"
                        className="h-10 text-sm"
                      />
                    </div>
                  )}

                  {form.recieveMethod === "delivery" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-gray-700">
                          City *
                        </Label>
                        <Popover open={cityOpen} onOpenChange={setCityOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between h-10 text-sm font-normal bg-transparent"
                            >
                              {form.cityName || "Select city"}
                              <ChevronDown className="w-4 h-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0 bg-white">
                            <Command>
                              <CommandInput placeholder="Search city..." />
                              <CommandList>
                                <CommandEmpty>No cities found</CommandEmpty>
                                <CommandGroup>
                                  {isLoading ? (
                                    <CommandItem disabled>
                                      Loading...
                                    </CommandItem>
                                  ) : merchantAreasQuery &&
                                    merchantAreasQuery.length > 0 ? (
                                    [
                                      ...new Set(
                                        merchantAreasQuery.map(
                                          (m) => m.areas_master?.city_name,
                                        ),
                                      ),
                                    ].map((city, i) => (
                                      <CommandItem
                                        key={i}
                                        value={city}
                                        onSelect={(val) => {
                                          setForm({
                                            ...form,
                                            cityName: val,
                                            areaName: "",
                                          });
                                          setCityOpen(false);
                                        }}
                                      >
                                        {city}
                                        {form.cityName === city && (
                                          <Check className="ml-auto h-4 w-4" />
                                        )}
                                      </CommandItem>
                                    ))
                                  ) : (
                                    <CommandItem disabled>
                                      No cities found
                                    </CommandItem>
                                  )}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-gray-700">
                          Area *
                        </Label>
                        <Popover open={areaOpen} onOpenChange={setAreaOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between h-10 text-sm font-normal bg-transparent"
                            >
                              {form.areaName || "Select area"}
                              <ChevronDown className="w-4 h-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0 bg-white">
                            <Command>
                              <CommandInput placeholder="Search area..." />
                              <CommandList>
                                <CommandEmpty>No areas found</CommandEmpty>
                                <CommandGroup>
                                  {isLoading ? (
                                    <CommandItem disabled>
                                      Loading...
                                    </CommandItem>
                                  ) : merchantAreasQuery &&
                                    merchantAreasQuery.length > 0 ? (
                                    merchantAreasQuery
                                      .filter(
                                        (m) =>
                                          m.areas_master?.city_name ===
                                          form.cityName,
                                      )
                                      .map((m, i) => (
                                        <CommandItem
                                          key={i}
                                          value={m.areas_master?.area_name}
                                          onSelect={(val) => {
                                            setForm({ ...form, areaName: val });
                                            setAreaOpen(false);
                                          }}
                                        >
                                          {m.areas_master?.area_name}
                                          {form.areaName ===
                                            m.areas_master?.area_name && (
                                            <Check className="ml-auto h-4 w-4" />
                                          )}
                                        </CommandItem>
                                      ))
                                  ) : (
                                    <CommandItem disabled>
                                      No areas found
                                    </CommandItem>
                                  )}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="notes"
                      className="text-xs font-medium text-gray-700"
                    >
                      Special Instructions
                    </Label>
                    <Input
                      id="notes"
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      placeholder="Optional notes..."
                      className="h-10 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-gray-200">
                  <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Banknote className="w-5 h-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <RadioGroup
                    value={form.payment}
                    onValueChange={handlePaymentChange}
                  >
                    <div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-gray-300 hover:border-gray-900 cursor-pointer">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label
                        htmlFor="cash"
                        className="flex-1 cursor-pointer text-sm"
                      >
                        Cash
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </form>
          </div>

          <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4 space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">
                  <span>{Currency}</span> {subtotal}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-semibold text-gray-900">
                  <span>{Currency}</span>{" "}
                  {form.recieveMethod === "pickup" ? 0 : deliveryFee}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount</span>
                <span className="font-semibold text-green-600">
                  - <span>{Currency}</span> {discountAmount}
                </span>
              </div>

              <div className="flex justify-between text-lg pt-2 border-t border-gray-200 font-bold">
                <span className="font-bold text-gray-900">Total</span>
                <div className="flex gap-x-2">
                  <span>{Currency}</span>
                  <span>
                    {finalTotal +
                      (form.recieveMethod === "pickup" ? 0 : deliveryFee)}
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                isEmpty ||
                !form.name ||
                !form.phone ||
                !form.recieveMethod ||
                (form.recieveMethod === "delivery" &&
                  (!form.address || !form.cityName || !form.areaName))
              }
              className="w-full h-12 text-base font-semibold btn-accent hover:bg-gray-800 text-white disabled:opacity-50"
            >
              {isSubmitting ? "Processing..." : "Place Order"}
            </Button>
          </div>
        </div>
      </div>

      <Dialog
        open={!!selectedItem}
        onOpenChange={() => {
          setSelectedItem(null);
          setExpandedGroups([]);
        }}
      >
        <DialogContent className="max-w-lg bg-white max-h-[90vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  {selectedItem.foodName}
                </DialogTitle>
              </DialogHeader>
              <img
                src={selectedItem.foodImg || "/cc.jpg"}
                alt={selectedItem.foodName}
                className="w-full h-64 object-cover rounded-lg"
              />
              {selectedItem.description && (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {selectedItem.description}
                </p>
              )}
              <p className="text-2xl font-bold text-gray-900">
                {" "}
                {selectedItem.price > 0
                  ? `${Currency} ${selectedItem.price}`
                  : "Select Variant"}{" "}
              </p>

              {Object.keys(groupedOptions).length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-base text-gray-900">
                    Customize:
                  </h4>
                  {Object.entries(groupedOptions).map(([groupName, group]) => (
                    <Collapsible
                      key={groupName}
                      open={expandedGroups.includes(groupName)}
                      onOpenChange={(isOpen) => {
                        setExpandedGroups((prev) =>
                          isOpen
                            ? [...prev, groupName]
                            : prev.filter((g) => g !== groupName),
                        );
                      }}
                      className="border border-gray-300 rounded-lg overflow-hidden"
                    >
                      <CollapsibleTrigger className="w-full bg-gray-100 hover:bg-gray-200 px-4 py-3 flex items-center justify-between text-sm font-medium">
                        <span>
                          {groupName}
                          <span className="ml-2 text-xs text-gray-600">
                            ({group.isRequired ? "Required" : "Optional"})
                          </span>
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            expandedGroups.includes(groupName)
                              ? "rotate-180"
                              : ""
                          }`}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="bg-white p-3">
                        <div className="space-y-2">
                          {group.options.map((opt) => (
                            <div
                              key={opt.id}
                              className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
                            >
                              {opt.option_type === "variant" ? (
                                <input
                                  type="radio"
                                  name={groupName}
                                  value={opt.id}
                                  checked={selectedOptions.includes(
                                    opt.id.toString(),
                                  )}
                                  onChange={() => {
                                    // allow only one variant selected in this group
                                    setSelectedOptions((prev) => {
                                      const filtered = prev.filter(
                                        (id) =>
                                          !group.options.some(
                                            (gOpt) => gOpt.id.toString() === id,
                                          ),
                                      );
                                      return [...filtered, opt.id.toString()];
                                    });
                                  }}
                                  className="w-5 h-5 accent-[var(--accent-color)]"
                                />
                              ) : (
                                <Checkbox
                                  checked={selectedOptions.includes(
                                    opt.id.toString(),
                                  )}
                                  onCheckedChange={(checked) => {
                                    setSelectedOptions((prev) =>
                                      checked
                                        ? [...prev, opt.id.toString()]
                                        : prev.filter(
                                            (id) => id !== opt.id.toString(),
                                          ),
                                    );
                                  }}
                                />
                              )}

                              <span className="flex-1 text-sm">
                                {opt.option_name}
                                {opt.extra_price > 0 && (
                                  <span className="text-gray-500 ml-1">
                                    (<span>{Currency}</span> {opt.extra_price})
                                  </span>
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-2xl font-bold min-w-[3rem] text-center">
                  {quantity}
                </span>
                <Button
                  size="lg"
                  onClick={() => {
                    if (quantity + 1 > selectedItem.stockAmount) {
                      alert(
                        `Only ${selectedItem.stockAmount} ${selectedItem.foodName} available in stock.`,
                      );
                      return;
                    }
                    setQuantity((q) => q + 1);
                  }}
                  className="w-10 h-10 p-0 btn-accent hover:bg-[#f43f5e]"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <DialogFooter>
                <Button
                  disabled={quantity > selectedItem.stockAmount}
                  className="w-full h-11 btn-accent hover:bg-[#f43f5e] text-white font-semibold"
                  onClick={handleAddToCart}
                >
                  Add {quantity} to Order
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
