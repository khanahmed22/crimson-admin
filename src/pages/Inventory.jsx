import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

import {
  Trash2,
  Edit3,
  X,
  Plus,
  Hammer as Hamburger,
  RotateCcw,
  Save,
  Image,
} from "lucide-react";
import { supabase } from "@/db/supabase";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/store/authStore";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@radix-ui/react-label";
import { Textarea } from "@/components/ui/textarea";
import { Title } from "react-head";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import Papa from "papaparse";
import { Sheet } from "lucide-react";
import { extractTextFromImage, extractTextFromPDF } from "@/lib/ocr";
import { parseMenuWithGemini } from "@/lib/gemini";

export default function Inventory() {
  const [foodName, setFoodName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState(0);  // selling price
  const [description, setDescription] = useState("");
  const [costPrice,setCostPrice]= useState("")
  const [discount, setDiscount] = useState("");
  const [file, setFile] = useState(null);
  const [stockAmount, setStockAmount] = useState(0)
  const [BaseCostPrice,setBaseCostPrice] = useState(0)
  const [options, setOptions] = useState([
    {
      optionName: "",
      extraPrice: "",
      groupName: "",
      isRequired: false,
      optionType: "addon",
      costPrice: ""
    },
  ]);
  const { session } = useAuth();
  const user_id = session?.user?.id;
 
  const [editMode, setEditMode] = useState(false);
  const [editID, setEditID] = useState(null);
  const [updateName, setUpdateName] = useState("");
  const [updatePrice, setUpdatePrice] = useState("");
  const [updateCategory, setUpdateCategory] = useState("");
  const [newItemMode, setNewItemMode] = useState(false);
  const [updateCostPrice,setUpdateCostPrice] = useState("")
  const [updateBaseCostPrice,setUpdateBaseCostPrice] = useState("")
  const [updateOptions, setUpdateOptions] = useState([
    {
      optionName: "",
      extraPrice: "",
      groupName: "",
      isRequired: false,
      optionType: "addon",
    },
  ]);
  const [updateDescription, setUpdateDescription] = useState("");
  const [updateDiscount, setUpdateDiscount] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [updateStockAmount, setUpdateStockAmount] = useState(0);
  const queryClient = useQueryClient();

  const [scanneditems, setScannedItems] = useState([]);
  const [scanpreviewopen, setScanPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isUnderstandingMenu, setIsUnderstandingMenu] = useState(false);
  const [csvPreviewOpen, setCSVPreviewOpen] = useState(false);
  const [csvPreviewItems, setCSVPreviewItems] = useState([]);
  const [isImportingCSV, setIsImportingCSV] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  

  // 🟢 Fetch menu
  const fetchRestMenu = async () => {
    const { data, error } = await supabase
      .from("restaurant_menu")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  };

  const { data: restMenuQ, refetch } = useQuery({
    queryKey: ["restMenu", user_id],
    queryFn: fetchRestMenu,
    enabled: !!user_id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  // 🟢 Delete item
  const { mutate: deleteMenuItem } = useMutation({
    mutationKey: ["deleteMenuItem"],
    mutationFn: async (id) => {
      const { error } = await supabase
        .from("restaurant_menu")
        .delete()
        .eq("id", id)
        .eq("user_id", user_id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Item deleted successfully");
      queryClient.invalidateQueries(["restMenu", user_id]); // 🔥 instantly refreshes the list
    },
    onError: (err) => {
      toast.error(err.message || "Error deleting item");
    },
  });

  // 🟢 Upload image
  const uploadImage = async (file, folder = "foods") => {
    if (!file) return null;
    const fileExt = file.name.split(".").pop();
    const fileName = `${user_id}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${user_id}/${fileName}`;
    const { error } = await supabase.storage
      .from("images")
      .upload(filePath, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from("images").getPublicUrl(filePath);
    return data.publicUrl;
  };

 
  // 🟢 Update item
  // 🟢 Update item
const updateMenuItem = async ({
  id,
  foodName,
  price,
  newFile,
  category,
  description,
  discount,
  options,
  stockAmount,
  BaseCostPrice
}) => {
  if (!id) throw new Error("No ID provided for update");

  const updateFields = {
    foodName,
    price: Number(price) || 0,
    category,
    description,
    discount: Number(discount) || 0,
    stockAmount: Number(stockAmount) || 0,
    stockStatus: Number(stockAmount) > 0,
    BaseCostPrice: Number(BaseCostPrice) || 0,
  };

  // 🔥 DO NOT update user_id

  if (newFile) {
    const foodImg = await uploadImage(newFile, "foods");
    updateFields.foodImg = foodImg;
  }

 if (!user_id) return;
 
  const { data, error } = await supabase
    .from("restaurant_menu")
    .update(updateFields)
     .eq("user_id", user_id)
    .eq("id", id)
    .select('*')
   
   

  if (error) {
    console.error("Update error:", error);
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error("Update blocked by RLS or no matching row found");
  }

  // 🔸 Update options safely
  const { error: deleteError } = await supabase
    .from("item_options")
    .delete()
    .eq("item_id", id)
    .eq("user_id", user_id);

  if (deleteError) throw deleteError;

  const formatted = options
    .filter((o) => o.optionName?.trim() !== "")
    .map((o) => ({
      item_id: id,
      user_id,
      option_name: o.optionName.trim(),
      extra_price: Number(o.extraPrice) || 0,
      group_name: o.groupName || null,
      is_required: o.isRequired || false,
      option_type: o.optionType || "addon",
      costPrice: Number(o.costPrice) || 0,
    }));

  if (formatted.length > 0) {
    const { error: optError } = await supabase
      .from("item_options")
      .insert(formatted);

    if (optError) throw optError;
  }

  return data[0];
};

  const { mutate: updateItemM } = useMutation({
    mutationKey: ["updateitemM"],
    mutationFn: updateMenuItem,
    onSuccess: () => {
      toast.success("Item updated successfully");
      queryClient.invalidateQueries(["restMenu", user_id]);
    },
  });

  const fetchItemOptions = async (itemId) => {
    const { data, error } = await supabase
      .from("item_options")
      .select("*")
      .eq("item_id", itemId);
    if (error) throw error;
    return data || [];
  };

  const handleAddOption = () => {
    setUpdateOptions([
      ...updateOptions,
      {
        optionName: "",
        extraPrice: "",
        groupName: "",
        isRequired: false,
        optionType: "addon",
        costPrice: ""
      },
    ]);
  };

  const handleChangeOption = (index, field, value) => {
    const newOptions = [...updateOptions];
    newOptions[index][field] = value;
    setUpdateOptions(newOptions);
  };

  const handleRemoveOption = (index) => {
    setUpdateOptions(updateOptions.filter((_, i) => i !== index));
  };

  //fetch category

  const loadCategory = async () => {
    try {
      const { data: catData, error } = await supabase
        .from("category")
        .select("*")
        .eq("user_id", user_id);
      if (error) throw error;
      return catData;
    } catch (err) {
      console.log(err);
    }
  };

  const { data: CatQuery, isPending } = useQuery({
    queryKey: ["catQuery", user_id],
    queryFn: loadCategory,
    enabled: !!user_id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  // 🟢 Search and filter
  const [search, setSearch] = useState("");
  const filteredItems = restMenuQ?.filter((item) =>
    item.foodName?.toLowerCase().includes(search.toLowerCase()),
  );

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

  const Currency = restIDQuery?.restCurrency;

  // ✅ Fetch merchant verification status
  const { data: merchantStatus } = useQuery({
    queryKey: ["merchantStatus", user_id],
    queryFn: async () => {
      if (!user_id) return "unverified";
      const { data, error } = await supabase
        .from("merchant_accounts")
        .select("merchant_verify,plan")
        .eq("merchant_id", user_id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user_id,
    refetchInterval: false,
    staleTime: 1000 * 60 * 10,
  });

  const restID = restIDQuery?.id;
  // 🟢 CSV Import Logic
  // 🟢 CSV Import Logic (debug version)

  const headerMap = {
    foodName: ["foodname", "item name", "product name", "name", "menu item"],
    price: ["price", "cost", "amount", "rate"],
    category: ["category", "type", "group"],
    description: ["description", "details", "desc"],
    stockAmount: [
      "stock",
      "stockamount",
      "quantity",
      "qty",
      "available",
      "stockAmount",
    ],
    stockStatus: ["stockstatus", "availability", "in stock"],
    discount: ["Discount"],
    costPrice : ["costPrice"],
    BaseCostPrice: ["BaseCostPrice"]
  };

  function mapHeaders(row) {
    const mapped = {};

    for (const [targetKey, aliases] of Object.entries(headerMap)) {
      for (const alias of aliases) {
        const match = Object.keys(row).find(
          (key) => key.trim().toLowerCase() === alias,
        );
        if (match) {
          mapped[targetKey] = row[match];
          break;
        }
      }
    }

    return mapped;
  }

  const handleCSVUpload = (file) => {
    if (!file) return;

    if (!restID) {
      toast.error("Restaurant ID not loaded yet.");
      return;
    }

    if (hasReachedLimit) {
      toast.error(
        `You have reached your ${currentPlan} plan limit (${maxItems} items).`,
      );
      return;
    }

    toast.info("Reading CSV...");
    setIsImportingCSV(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data.map(mapHeaders);

        if (rows.length > remainingSlots) {
          toast.warning(
            `Your plan allows only ${remainingSlots} more item(s). Extra rows will be ignored.`,
          );
        }

        setCSVPreviewItems(
          rows.slice(0, remainingSlots).map((row) => ({
            foodName: row.foodName || "",
            price: row.price || "",
            category: row.category || "",
            description: row.description || "",
            discount: row.discount || 0,
            stockAmount: row.stockAmount || 0,
            costPrice: row.costPrice || 0,
            BaseCostPrice:row.BaseCostPrice || 0
          })),
        );

        setIsImportingCSV(false);
        setCSVPreviewOpen(true);
      },
      error: () => {
        setIsImportingCSV(false);
        toast.error("Failed to read CSV");
      },
    });
  };

  // 🍕 Add new food with variants/addons
  const addFood = async ({
    foodName,
    category,
    price,
    file,
    options,
    description,
    discount,
    stockAmount,
    costPrice,
    BaseCostPrice
  }) => {
    if (!restIDQuery?.id) throw new Error("No restaurant found for this user");

    let foodImg = null;
    if (file) {
      foodImg = await uploadImage(file);
    }

    const { data: food, error } = await supabase
      .from("restaurant_menu")
      .insert({
        foodName,
        price: Number(price),
        restID: restIDQuery.id,
        user_id,
        category,
        description,
        discount: Number(discount),
        foodImg,
        stockAmount: Number(stockAmount),
        stockStatus: Number(stockAmount) > 0,
     
        BaseCostPrice: Number(BaseCostPrice)
      })
      .select()
      .single();

    if (error) throw error;

    if (options.length > 0) {
      const formatted = options
        .filter((o) => o.optionName.trim() !== "")
        .map((o) => ({
          item_id: food.id,
          user_id,
          option_name: o.optionName,
          extra_price: Number(o.extraPrice) || 0,
          group_name: o.groupName || null,
          is_required: o.isRequired || false,
          option_type: o.optionType || "addon", // ✅ new field
          costPrice: o.costPrice || 0
        }));

      if (formatted.length > 0) {
        const { error: optError } = await supabase
          .from("item_options")
          .insert(formatted);
        if (optError) throw optError;
      }
    }

    return food;
  };

  const { mutate, isLoading } = useMutation({
    mutationKey: ["addFood"],
    mutationFn: addFood,
    onSuccess: () => {
      setFoodName("");
      setPrice("");
      setCategory("");
      setDescription("");
      setStockAmount(0);
      setDiscount("");
      setFile(null);
      setOptions([
        {
          optionName: "",
          extraPrice: "",
          groupName: "",
          isRequired: false,
          optionType: "addon",
        },
      ]);
      queryClient.invalidateQueries({
      queryKey: ["restMenu", user_id],
    });

      toast.success("Item Added");
    },
  });

  const handleAdd = (e) => {
    e.preventDefault();

    if (hasReachedLimit) {
      toast.error(
        `You can only add ${maxItems} items on the ${currentPlan} plan.`,
      );
      return;
    }

    if (!foodName || !price || !file || !stockAmount) {
      toast.error("Please fill all required fields");
      return;
    }

    mutate({
      foodName,
      category,
      price,
      file,
      options,
      description,
      discount,
      stockAmount,
      costPrice,
      BaseCostPrice
    });

    setNewItemMode(false)
    
  };

  const PLAN_LIMITS = {
    free: 5,
    pro: 100,
  };
  const currentPlan = merchantStatus?.plan || "free";
  const maxItems = PLAN_LIMITS[currentPlan] ?? 5;
  const currentCount = restMenuQ?.length || 0;

  const hasReachedLimit = currentCount >= maxItems;

  const remainingSlots = Math.max(0, maxItems - currentCount);

  const handleScanUpload = async (e) => {
    if (hasReachedLimit) {
      toast.error(
        `You have reached your ${currentPlan} plan limit (${maxItems} items).`,
      );
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    setIsUnderstandingMenu(true);

    try {
      let rawText = "";

      // 1️⃣ OCR
      if (file.type === "application/pdf") {
        rawText = await extractTextFromPDF(file);
      } else {
        rawText = await extractTextFromImage(file);
      }

      if (!rawText?.trim()) {
        throw new Error("No text detected in file");
      }

      // 2️⃣ Gemini parse
      const structured = await parseMenuWithGemini(rawText);

      if (!structured?.items?.length) {
        toast.warning("No menu items could be detected.");
      }

      // 3️⃣ Update UI
      const items = structured.items || [];

      if (items.length > remainingSlots) {
        toast.warning(
          `Your plan allows only ${remainingSlots} more item(s). Extra detected items were removed.`,
        );
      }

      setScannedItems(items.slice(0, remainingSlots));
      setScanPreviewOpen(true);
    } catch (err) {
      console.error("Scan failed:", err);

      toast.error(
        err?.message || "Failed to understand menu. Please try another image.",
      );
    } finally {
      // 🔒 ALWAYS clear loading UI
      setIsUnderstandingMenu(false);
    }
  };

  const handleChangeNewOption = (index, field, value) => {
    setOptions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddNewOption = () => {
    setOptions((prev) => [
      ...prev,
      {
        optionName: "",
        extraPrice: "",
        groupName: "",
        isRequired: false,
        optionType: "addon",
        costPrice:""
      },
    ]);
  };

  const handleRemoveNewOption = (index) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };



  if (isPending) {
    return (
      <div>
        <Title>Inventory</Title>
        <div className="max-md:mt-10 min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-pink-50 p-6 flex items-center justify-center">
          <div className="max-w-4xl mx-auto ">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                <h2 className="text-xl max-md:text-sm font-semibold text-gray-700">
                  Loading Inventory...
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-md:mt-10">
      <Title>Inventory</Title>
      <div className="min-h-screen bg-background text-text p-3 mt-2">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="flex items-center flex-col gap-y-3 px-4 py-4 border-b border-gray-200">
            <div className="flex items-center justify-center gap-x-3">
              <div className="flex items-center justify-center mt-3 w-16 h-16 max-md:w-13 max-md:h-13 bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl shadow-lg mb-4">
                <Hamburger className="w-8 h-8 max-md:w-5 max-md:h-5 text-white" />
              </div>
              <h1 className="text-2xl max-md:text-xl font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
                Inventory Management
              </h1>
            </div>
            {isUnderstandingMenu && (
              <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
                <div className="bg-white rounded-xl px-6 py-5 w-[280px] text-center space-y-3 shadow-lg">
                  <div className="mx-auto h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-medium">Understanding menu…</p>
                  <p className="text-xs text-gray-500">
                    Extracting items from scanned image. PLease wait 10 seconds
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-x-5 max-md:flex-col gap-y-4">
              <Button
                className="btn-accent"
                onClick={() => {
                  if (hasReachedLimit) {
                    toast.error(
                      `Plan limit reached. ${
                        currentPlan === "free"
                          ? "Upgrade to Pro to add more items."
                          : "You have reached the maximum allowed items."
                      }`,
                    );
                    return;
                  }
                  setNewItemMode(true);
                }}
                disabled={hasReachedLimit}
              >
                <Plus />
                <span className="">New Item</span>
              </Button>
              <Dialog
                open={newItemMode}
                onOpenChange={(o) => !o && setNewItemMode(false)}
              >
                <DialogContent className="bg-white max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Menu Item</DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleAdd} className="space-y-6">
                    {/* Food Name */}
                    <div className="space-y-2">
                      <Label>Food Name</Label>
                      <Input
                        placeholder="Enter delicious food name..."
                        value={foodName}
                        onChange={(e) => setFoodName(e.target.value)}
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select onValueChange={(val) => setCategory(val)}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {CatQuery?.map((c, i) => (
                            <SelectItem key={i} value={`${c.catName}`}>
                              {c.catName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        placeholder="Enter item description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                      <Label>Base Price ({Currency})</Label>
                      <Input
                        type="number"
                        placeholder="Enter base price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                      <Label>Base Cost Price ({Currency}) Leave Blank if variants</Label>
                      <Input
                        type="number"
                        placeholder="Enter base cost"
                        value={BaseCostPrice}
                        onChange={(e) => setBaseCostPrice(e.target.value)}
                      />
                    </div>
                    

                    {/* Options */}
                    <div className="space-y-3">
                      <Label>Options (Variants / Add-ons)</Label>
                      <div className="space-y-3">
                        {options.map((opt, idx) => (
                          <div
                            key={idx}
                            className="border-2 border-gray-200 rounded-xl p-4 space-y-3"
                          >
                            <div className="grid grid-cols-1  gap-3">
                              <Select
                                value={opt.optionType}
                                onValueChange={(val) =>
                                  handleChangeNewOption(idx, "optionType", val)
                                }
                              >
                                <SelectTrigger className="h-10 border-2 border-gray-200 rounded-lg">
                                  <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                  <SelectItem value="variant">
                                    Variant (Base)
                                  </SelectItem>
                                  <SelectItem value="addon">
                                    Add-on (Extra)
                                  </SelectItem>
                                </SelectContent>
                              </Select>

                              <Input
                                value={opt.optionName}
                                placeholder="option name"
                                onChange={(e) =>
                                  handleChangeNewOption(
                                    idx,
                                    "optionName",
                                    e.target.value,
                                  )
                                }
                              />

                              <Input
                                type="number"
                                placeholder="base price"
                                value={opt.extraPrice}
                                onChange={(e) =>
                                  handleChangeNewOption(
                                    idx,
                                    "extraPrice",
                                    e.target.value,
                                  )
                                }
                              />


                              {/*Cost Price*/}
                    <div className="space-y-2">
                      <Label>Base Cost Price ({Currency})</Label>
                      <Input
                        type="number"
                        placeholder="Enter cost price"
                        value={opt.costPrice}
                       onChange={(e) =>
                                  handleChangeNewOption(
                                    idx,
                                    "costPrice",
                                    e.target.value,
                                  )}
                      />
                    </div>

                              <Input
                                value={opt.groupName}
                                placeholder="group name"
                                onChange={(e) =>
                                  handleChangeNewOption(
                                    idx,
                                    "groupName",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={opt.isRequired}
                                  onCheckedChange={(checked) =>
                                    handleChangeNewOption(
                                      idx,
                                      "isRequired",
                                      checked,
                                    )
                                  }
                                />

                                <label
                                  htmlFor={`required-${idx}`}
                                  className="text-sm text-gray-700 cursor-pointer"
                                >
                                  Mark group as Required
                                </label>
                              </div>
                              {options.length > 1 && (
                                <Button
                                  type="button"
                                  onClick={() => handleRemoveNewOption(idx)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button type="button" onClick={handleAddNewOption}>
                        + Add Option
                      </Button>
                    </div>

                    

                    {/*Stock Amount*/}
                    <div className="space-y-2">
                      <Label>Stock Amount</Label>
                      <Input
                        placeholder="Enter Stock Amount"
                        value={stockAmount}
                        onChange={(e) => setStockAmount(e.target.value)}
                      />
                    </div>

                    {/* File Upload */}
                    <div className="space-y-4">
                      <Label>Food Image</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files[0])}
                      />
                      {file && (
                        <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200">
                          <p className="text-sm font-semibold text-gray-700 mb-3">
                            Preview:
                          </p>
                          <img
                            src={
                              URL.createObjectURL(file) || "/cc.jpg"
                            }
                            alt="Food preview"
                            className="w-40 h-40 object-cover rounded-2xl shadow-lg"
                          />
                        </div>
                      )}
                    </div>

                    <div className="pt-4">
                      <Button
                        
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-14 text-lg font-bold bg-red-500 hover:bg-red-400 text-white transition-all"
                      >
                        {isLoading ? "Adding Item..." : "Add to Menu"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <div className="relative inline-block cursor-pointer">
  {/* Beta Badge */}
  <span className="absolute -top-2 -right-2 z-10 text-[10px] font-semibold bg-red-500 text-white px-2 py-0.5 rounded-full shadow">
    BETA
  </span>

  <input
    type="file"
    disabled={hasReachedLimit}
    accept="image/*,.pdf"
    onChange={handleScanUpload}
    className="absolute inset-0 opacity-0 cursor-pointer"
  />

  <Button variant="outline" className="pointer-events-none">
    <Image className="mr-2 h-4 w-4" />
    <span>Import Image/PDF</span>
  </Button>
</div>

              {/* 🟢 Import CSV Button */}
              <div className="relative cursor-pointer">
                <label className="flex items-center gap-2 cursor-pointer w-full">
                  <span className=" text-sm border-1 border-solid border-black p-2 flex items-center gap-x-2 rounded-lg font-semibold">
                    <Sheet className="w-4 h-4" />
                    <span className="">Import CSV</span>
                  </span>
                  <input
                    disabled={hasReachedLimit}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleCSVUpload(file);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              <Button variant="outline" onClick={() => refetch()}>
                <RotateCcw /> <span className="">Reload</span>
              </Button>
            </div>
          </div>

          <div className="flex justify-center px-4 my-4">
            <Input
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-md"
            />
          </div>

          <div className="text-sm text-gray-600 text-center mt-1">
            {currentCount} / {maxItems} items used · Plan:{" "}
            <span className="font-semibold capitalize">{currentPlan}</span>
          </div>

          <div className="p-6">
            {filteredItems?.length > 0 ? (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between mt-6 bg-white border border-gray-200 rounded-xl p-4 shadow-md"
                >
                  <div className="flex max-md:flex-col items-center gap-4">
                    {item.foodImg && (
                      <img
                        src={item.foodImg || "/cc.jpg"}
                        alt="food"
                        className="w-16 h-16 object-cover rounded-xl border"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 max-md:flex-col">
                        <h3 className="font-semibold text-lg max-md:text-sm">
                          {item.foodName}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            item.stockStatus
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.stockStatus ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm max-md:text-xs">
                        Category: <span className="font-semibold">{item.category}</span>
                      </p>
                      <p className="text-gray-600 text-sm max-md:text-xs mt-2">
                        In Stock: <span className="font-semibold">{item.stockAmount}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={async () => {
                        setEditMode(true);
                        setEditID(item.id);
                        setUpdateName(item.foodName);
                        setUpdatePrice(item.price);
                        setUpdateCategory(item.category);
                        setUpdateDescription(item.description);
                        setUpdateStockAmount(item.stockAmount);
                        setUpdateDiscount(item.discount)
                        setUpdateCostPrice(item.costPrice)
                        setUpdateBaseCostPrice(item.BaseCostPrice)
                        
                        const existing = await fetchItemOptions(item.id);
                        setUpdateOptions(
                          existing.length > 0
                            ? existing.map((o) => ({
                                optionName: o.option_name,
                                extraPrice: o.extra_price,
                                groupName: o.group_name,
                                isRequired: o.is_required,
                                optionType: o.option_type || "addon",
                                costPrice: o.costPrice ?? 0

                              }))
                            : [
                                {
                                  optionName: "",
                                  extraPrice: "",
                                  groupName: "",
                                  isRequired: false,
                                  optionType: "addon",
                                },
                              ],
                        );
                      }}
                    >
                      <Edit3 className="w-4 h-4 mr-1" /> Edit
                    </Button>

                    <Button
                      className="bg-red-500 text-white"
                      onClick={() => setDeleteItemId(item.id)}
                    >
                      <Trash2 /> Delete
                    </Button>
                  </div>
                  <Dialog
                    open={!!deleteItemId}
                    onOpenChange={() => setDeleteItemId(null)}
                  >
                    <DialogContent className="bg-white">
                      <DialogHeader>
                        <DialogTitle>This item will be deleted</DialogTitle>
                        <DialogDescription>Are you sure?</DialogDescription>
                      </DialogHeader>

                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setDeleteItemId(null)}
                        >
                          Cancel
                        </Button>

                        <Button
                          className="bg-red-500 text-white"
                          onClick={() => {
                            deleteMenuItem(deleteItemId);
                            setDeleteItemId(null);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                No items found.
              </div>
            )}
          </div>
        </div>
        <Dialog open={csvPreviewOpen} onOpenChange={setCSVPreviewOpen}>
          <DialogContent className="bg-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>CSV Import Preview</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {csvPreviewItems.length === 0 && (
                <p className="text-sm text-gray-500">No items found.</p>
              )}

              {csvPreviewItems.map((item, idx) => (
                <Card key={idx}>
                  <CardContent className="space-y-3 pt-4">
                    <Label>Food Name</Label>
                    <Input
                      value={item.foodName}
                      placeholder="Food name"
                      onChange={(e) => {
                        const copy = [...csvPreviewItems];
                        copy[idx].foodName = e.target.value;
                        setCSVPreviewItems(copy);
                      }}
                    />
                     <Label>Price ({Currency})</Label>
                    <Input
                      type="number"
                      value={item.price}
                      placeholder="Price"
                      onChange={(e) => {
                        const copy = [...csvPreviewItems];
                        copy[idx].price = e.target.value;
                        setCSVPreviewItems(copy);
                      }}
                    />
                    <Label>Base Cost Price ({Currency})</Label>
                    <Input
                      type="number"
                      value={item.BaseCostPrice}
                      placeholder="Base Cost Price"
                      onChange={(e) => {
                        const copy = [...csvPreviewItems];
                        copy[idx].BaseCostPrice = e.target.value;
                        setCSVPreviewItems(copy);
                      }}
                    />

                    
                    <Label>Category</Label>
                    <Input
                      value={item.category}
                      placeholder="Category"
                      onChange={(e) => {
                        const copy = [...csvPreviewItems];
                        copy[idx].category = e.target.value;
                        setCSVPreviewItems(copy);
                      }}
                    />
                     <Label>In Stock</Label>
                    <Input
                      value={item.stockAmount}
                      placeholder="Stock Amount"
                      onChange={(e) => {
                        const copy = [...csvPreviewItems];
                        copy[idx].stockAmount = e.target.value;
                        setCSVPreviewItems(copy);
                      }}
                    />
                  </CardContent>
                </Card>
              ))}

              <Button
                className="w-full btn-accent"
                onClick={async () => {
                  const allowed = Math.min(
                    csvPreviewItems.length,
                    remainingSlots,
                  );

                  if (allowed <= 0) {
                    toast.error("Plan limit reached.");
                    return;
                  }

                  let success = 0;

                  for (let i = 0; i < allowed; i++) {
                    const item = csvPreviewItems[i];

                    await supabase.from("restaurant_menu").insert({
                      user_id,
                      restID,
                      foodName: item.foodName || "Unnamed Item",
                      price: Number(item.price) || 0,
                      discount: Number(item.discount) || 0,
                      category: item.category || "Uncategorized",
                      description: item.description || "",
                      stockAmount: Number(item.stockAmount) || 0,
                      stockStatus: Number(item.stockAmount) > 0,
                
                      BaseCostPrice: Number(item.BaseCostPrice)  
                    });

                    success++;
                  }

                  toast.success(`${success} items added to menu`);
                  setCSVPreviewOpen(false);
                  refetch();
                }}
              >
                Save All Items
              </Button>
              <p className="text-xs text-gray-500 text-center">
                {remainingSlots} item slot(s) remaining on your {currentPlan}{" "}
                plan
              </p>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={scanpreviewopen} onOpenChange={setScanPreviewOpen}>
          <DialogContent className="bg-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Scanned Menu Preview</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {scanneditems.length === 0 && (
                <p className="text-sm text-gray-500">No items detected.</p>
              )}

              {scanneditems.map((item, i) => (
                <Card key={i} className="relative">
                  <CardContent className="space-y-3 pt-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-red-500 hover:bg-red-50"
                      onClick={() => {
                        setScannedItems((prev) =>
                          prev.filter((_, index) => index !== i),
                        );
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                     <Label>Food Name</Label>
                    <Input
                      value={item.foodName}
                      onChange={(e) => {
                        const copy = [...scanneditems];
                        copy[i].foodName = e.target.value;
                        setScannedItems(copy);
                      }}
                      placeholder="Food name"
                    />
                     <Label>Price ({Currency})</Label>
                    <Input
                      type="number"
                      value={item.price}
                      onChange={(e) => {
                        const copy = [...scanneditems];
                        copy[i].price = e.target.value;
                        setScannedItems(copy);
                      }}
                      placeholder="Price"
                    />
                     <Label>Base Cost Price ({Currency})</Label>
                    <Input
                      type="number"
                      value={item.BaseCostPrice}
                      onChange={(e) => {
                        const copy = [...scanneditems];
                        copy[i].BaseCostPrice = e.target.value;
                        setScannedItems(copy);
                      }}
                      placeholder="Base Cost Price"
                    />
                     <Label>Category</Label>
                    <Input
                      value={item.category}
                      onChange={(e) => {
                        const copy = [...scanneditems];
                        copy[i].category = e.target.value;
                        setScannedItems(copy);
                      }}
                      placeholder="Category"
                    />
                     <Label>In Stock</Label>
                    <Input
                      value={item.stockAmount}
                      onChange={(e) => {
                        const copy = [...scanneditems];
                        copy[i].stockAmount = e.target.value;
                        setScannedItems(copy);
                      }}
                      placeholder="Stock Amount"
                    />
                  </CardContent>
                </Card>
              ))}
              {isSaving && (
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    Saving items… {progress}%
                  </p>
                  <div className="w-full h-2 bg-gray-200 rounded">
                    <div
                      className="h-2 bg-primary rounded transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <Button
                disabled={isSaving}
                className="w-full btn-accent"
                onClick={async () => {
                  const allowed = Math.min(scanneditems.length, remainingSlots);

                  if (allowed <= 0) {
                    toast.error("Plan limit reached.");
                    return;
                  }

                  if (scanneditems.length > allowed) {
                    toast.warning(
                      `Only ${allowed} item(s) will be saved due to plan limits.`,
                    );
                  }

                  if (hasReachedLimit) {
                    toast.error("Plan limit reached");
                    return;
                  }

                  setIsSaving(true);
                  setProgress(0);

                  const total = scanneditems.length;

                  for (let i = 0; i < allowed; i++) {
                    const item = scanneditems[i];

                    await supabase.from("restaurant_menu").insert({
                      user_id,
                      restID,
                      foodName: item.foodName,
                      price: Number(item.price) || 0,
                      category: item.category || "Uncategorized",
                      description: item.description || "",
                      discount: item.discount || 0,
                      stockAmount: item.stockAmount || 0,
                      stockStatus: Number(item.stockAmount) > 0,
                   
                      BaseCostPrice: Number(item.BaseCostPrice)
                    });

                    setProgress(Math.round(((i + 1) / total) * 100));
                  }

                  toast.success("Scanned items added to menu");
                  setIsSaving(false);
                  setScanPreviewOpen(false);
                  refetch();
                }}
              >
                {isSaving ? "Saving…" : "Save All Items"}
              </Button>
              <p className="text-xs text-gray-500 text-center">
                {remainingSlots} item slot(s) remaining on your {currentPlan}{" "}
                plan
              </p>
            </div>
          </DialogContent>
        </Dialog>

        {/* 🟢 Edit Dialog */}
        <Dialog open={editMode} onOpenChange={(o) => !o && setEditMode(false)}>
          <DialogContent className="bg-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Menu Item</DialogTitle>
            </DialogHeader>

            <div className="space-y-3 mt-3 ">
              <Label className="max-md:text-sm">Item Name</Label>
              <Input
                value={updateName}
                onChange={(e) => setUpdateName(e.target.value)}
                placeholder="Name"
              />
              <Label className="max-md:text-sm">Description</Label>
              <Textarea
                className="max-md:text-sm"
                value={updateDescription}
                onChange={(e) => setUpdateDescription(e.target.value)}
                placeholder="Description"
              />
              <Label className="max-md:text-sm">
                Price - Leave Blank if item has variants
              </Label>
              <Input
                type="number"
                value={updatePrice}
                onChange={(e) => setUpdatePrice(e.target.value)}
                placeholder="Price"
              />

              <Label className="max-md:text-sm">
                Base Cost Price - Leave Blank if item has variants
              </Label>
              <Input
                type="number"
                value={updateBaseCostPrice}
                onChange={(e) => setUpdateBaseCostPrice(e.target.value)}
                placeholder="Base Cost Price"
              />

              
              <Label className="max-md:text-sm">In Stock</Label>
              <Input
                type="number"
                value={updateStockAmount}
                onChange={(e) => setUpdateStockAmount(e.target.value)}
                placeholder="Stock Amount"
              />
              <Label className="max-md:text-sm">Category</Label>
              <Select
                onValueChange={(val) => setUpdateCategory(val)}
                value={updateCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {CatQuery?.map((c, i) => (
                    <SelectItem key={i} value={`${c.catName}`}>
                      {c.catName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="space-y-4">
                <Label className="max-md:text-sm">Variants or Options</Label>

                {updateOptions.map((opt, idx) => (
                  <div
                    key={idx}
                    className="
        grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1
        gap-2 items-center border border-gray-400 p-3 rounded-xl
        transition-all duration-300 hover:shadow-sm bg-white/50
      "
                  >
                    {/* Option Name */}
                    <Label className="max-md:text-sm">
                      Variant / Option Name
                    </Label>
                    <Input
                      placeholder="Option Name"
                      value={opt.optionName}
                      onChange={(e) =>
                        handleChangeOption(idx, "optionName", e.target.value)
                      }
                      className="w-full"
                    />
                    <Label className="max-md:text-sm">Price</Label>
                    {/* Extra Price */}
                    <Input
                      placeholder="Price"
                      type="number"
                      value={opt.extraPrice}
                      onChange={(e) =>
                        handleChangeOption(idx, "extraPrice", e.target.value)
                      }
                      className="w-full"
                    />

                    <Label className="max-md:text-sm">
               Base Cost Price ({Currency})
              </Label>
              <Input
                type="number"
                value={opt.costPrice}
                onChange={(e) =>
                        handleChangeOption(idx, "costPrice", e.target.value)
                      }
                placeholder="Cost Price"
              />

                    {/* Group Name */}
                    <Label className="max-md:text-sm">Group Name</Label>
                    <Input
                      placeholder="Group i.e. Size or Extra Toppings "
                      value={opt.groupName}
                      onChange={(e) =>
                        handleChangeOption(idx, "groupName", e.target.value)
                      }
                      className="w-full"
                    />

                    {/* Option Type */}

                    <Select
                      value={opt.optionType}
                      onValueChange={(v) =>
                        handleChangeOption(idx, "optionType", v)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="variant">Variant</SelectItem>
                        <SelectItem value="addon">Addon</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Required Checkbox */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
                      <Checkbox
                        checked={opt.isRequired}
                        onCheckedChange={(v) =>
                          handleChangeOption(idx, "isRequired", v)
                        }
                      />
                      <span className="text-sm text-gray-600">Required</span>
                    </div>

                    {/* Remove Button */}
                    <div className="flex justify-center sm:justify-end">
                      <Button
                        onClick={() => handleRemoveOption(idx)}
                        size="sm"
                        className="flex items-center gap-1 bg-red-500"
                      >
                        <X className="w-4 h-4" color="white" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  onClick={handleAddOption}
                  variant="outline"
                  className="w-full mt-3"
                >
                  + Add Option
                </Button>
              </div>

             

              <Label className="max-md:text-sm">Change Food Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setNewFile(e.target.files[0])}
              />

              <div className="flex gap-2 pt-3">
                <Button
                  onClick={() => {
                    updateItemM({
                      id: editID,
                      foodName: updateName,
                      price: updatePrice,
                      costPrice: updateCostPrice,
                      category: updateCategory,
                      description: updateDescription,
                      discount: updateDiscount,
                      stockAmount: updateStockAmount,
                      options: updateOptions,
                      newFile,
                      BaseCostPrice: updateBaseCostPrice,
                      
                      
                    });
                    setEditMode(false);
                  }}
                  className="flex-1 btn-accent"
                >
                  <Save /> Save
                </Button>
                <Button variant="outline" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
