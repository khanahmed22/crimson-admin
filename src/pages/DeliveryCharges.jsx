

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/db/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/store/authStore";
import { toast } from "sonner";
import { Title } from "react-head";
import { Label } from "@/components/ui/label";
import { Pencil, Search, Truck } from "lucide-react";

export default function DeliveryCharges() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const user_id = session?.user?.id;

  const [editMode, setEditMode] = useState(null);
  const [selectedCity, setSelectedCity] = useState("All");
  const [searchArea, setSearchArea] = useState("");
  const [fixedRate, setFixedRate] = useState(0);
  const [minOrder, setMinOrder] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("");

  // 🧠 Fetch merged areas
  const { data: mergedAreas = [], isPending: isAreasPending } = useQuery({
    queryKey: ["mergedAreas", user_id],
    enabled: !!user_id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    queryFn: async () => {
      const [
        { data: areas, error: aErr },
        { data: merchantAreas, error: mErr },
      ] = await Promise.all([
        supabase.from("areas_master").select("*"),
        supabase
          .from("merchant_areas")
          .select("area_id, min_order, delivery_fee")
          .eq("user_id", user_id),
      ]);

      if (aErr) throw aErr;
      if (mErr) throw mErr;

      return areas.map((a) => {
        const match = merchantAreas.find((m) => m.area_id === a.id);
        return {
          id: a.id,
          area_name: a.area_name,
          city_name: a.city_name,
          min_order: match?.min_order || "",
          delivery_fee: match?.delivery_fee || "",
        };
      });
    },
  });

  // 💾 Save mutation
  const saveMutation = useMutation({
    mutationFn: async (area) => {
      const { error } = await supabase.from("merchant_areas").upsert(
        {
          restID,
          user_id,
          area_id: area.id,
          min_order: Number(minOrder) || 0,
          delivery_fee: Number(deliveryFee) || 0,
        },
        { onConflict: "user_id,area_id" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Saved successfully");
      queryClient.invalidateQueries(["mergedAreas", user_id]);
      setEditMode(null);
      setMinOrder("");
      setDeliveryFee("");
    },
  });

  // 🧩 Fetch restaurant ID
  const { data: restIDQuery } = useQuery({
    queryKey: ["restID", user_id],
    enabled: !!user_id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rest_list")
        .select("id, user_id")
        .eq("user_id", user_id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const restID = restIDQuery?.id;

  // ⚙️ Fixed Rate Queries
  const { data: fixRateQuery } = useQuery({
    queryKey: ["fixRate", restID],
    enabled: !!restID,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fixed_rates")
        .select("*")
        .eq("restID", restID)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Save fixed rate
  const saveFixedRateM = useMutation({
    mutationFn: async (rate) => {
      const { error } = await supabase
        .from("fixed_rates")
        .upsert({ restID, user_id, rate }, { onConflict: ["restID"] });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Fixed rate updated");
      queryClient.invalidateQueries(["fixRate", restID]);
      setFixedRate(0);
    },
  });

  // Toggle fixed rate mode
  const setFixRateModeM = useMutation({
    mutationFn: async () => {
      const newMode = !fixRateQuery?.fixMode;
      const { error } = await supabase
        .from("fixed_rates")
        .upsert(
          { restID, user_id, fixMode: newMode },
          { onConflict: ["restID"] }
        );
      if (error) throw error;
      return newMode;
    },
    onSuccess: (newMode) => {
      toast.success(`Fixed mode ${newMode ? "enabled" : "disabled"}`);
      queryClient.setQueryData(["fixRate", restID], (prev) => ({
        ...prev,
        fixMode: newMode,
      }));
    },
  });

  // 🏙️ City filter and search
  const cityOptions = ["All", ...new Set(mergedAreas.map((a) => a.city_name))];
  const filteredAreas =
    selectedCity === "All"
      ? mergedAreas
      : mergedAreas.filter((a) => a.city_name === selectedCity);

  const searchedAreas = filteredAreas.filter((a) =>
    a.area_name.toLowerCase().includes(searchArea.toLowerCase())
  );
if (isAreasPending || !user_id) {
      return (
        <div>
          <Title>Delivery Charges</Title> 
          <div className="max-md:mt-10 min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-pink-50 p-6 flex items-center justify-center">
            <div className="max-w-4xl mx-auto ">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                  <h2 className="text-xl max-md:text-sm font-semibold text-gray-700">Loading Delivery Charges...</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
 

  // 🧩 Fixed Mode Screen
  if (fixRateQuery?.fixMode) {
    return (
      <div className="max-md:mt-10 p-6">
        <Title>Delivery Costs</Title>
        <div className="flex flex-col gap-y-4 w-full ">
          <div className="flex items-center justify-center gap-x-3 mt-7">
            <div className="flex items-center justify-center mt-3 w-16 h-16 max-md:w-12 max-md:h-12 bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl shadow-lg mb-4">
              <Truck className="w-8 h-8 max-md:w-6 max-md:h-6 text-white" />
            </div>
            <h2 className="text-2xl max-md:text-xl text-center font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
              Delivery Charges
            </h2>
          </div>
          <Button
            className="btn-accent w-fit"
            onClick={() => setFixRateModeM.mutate()}
          >
            {fixRateQuery?.fixMode ? "Turn OFF" : "Turn ON"}
          </Button>

          <div className="p-3 bg-background border border-border rounded-lg">
            Current rate:{" "}
            {fixRateQuery?.rate ? (
              <span className="font-bold text-primary">
                {fixRateQuery.rate}
              </span>
            ) : (
              "No rate set"
            )}
          </div>

          <div className="flex gap-2 max-md:flex-col">
            <Input
              type="number"
              placeholder="Enter Fixed Rate for all Deliveries"
              value={fixedRate}
              onChange={(e) => setFixedRate(e.target.value)}
              className="max-md:w-full"
            />
            <Button
              className="btn-accent max-md:w-full"
              onClick={() => saveFixedRateM.mutate(fixedRate)}
            >
              Set
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 🧾 Normal Area Mode
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-center gap-x-3 mt-7">
        <div className="flex items-center justify-center mt-3 w-16 h-16 max-md:w-12 max-md:h-12 bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl shadow-lg mb-4">
          <Truck className="w-8 h-8 max-md:w-6 max-md:h-6 text-white" />
        </div>
        <h2 className="text-2xl max-md:text-xl text-center font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
          Delivery Charges
        </h2>
      </div>

      {/* Fixed Rate Toggle */}
      <div className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
        <div>
          <Label className="font-medium text-foreground">
            Use Fixed Delivery Rate?
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            Apply the same rate to all areas
          </p>
        </div>
        <Button className="btn-accent" onClick={() => setFixRateModeM.mutate()}>
          {fixRateQuery?.fixMode ? "Turn OFF" : "Turn ON"}
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* City Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Filter by City
          </label>
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {cityOptions.map((city, i) => (
                <SelectItem key={i} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Search Area
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by area name..."
              value={searchArea}
              onChange={(e) => setSearchArea(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>
      </div>

      {/* Area List */}
      <div className="space-y-3">
        {searchedAreas.length > 0 ? (
          searchedAreas.map((a) => (
            <div
              key={a.id}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-background border border-border rounded-lg hover:border-primary/50 transition-colors"
            >
              <div className="min-w-[150px]">
                <div className="font-semibold text-foreground">
                  {a.area_name}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {a.city_name}
                </div>
              </div>

              {editMode === a.id ? (
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
                  <Input
                    type="number"
                    placeholder="Min Order"
                    value={minOrder}
                    onChange={(e) => setMinOrder(e.target.value)}
                    className="w-full md:w-28"
                  />
                  <Input
                    type="number"
                    placeholder="Delivery Fee"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    className="w-full md:w-28"
                  />
                  <Button
                    onClick={() => saveMutation.mutate(a)}
                    className="w-full md:w-auto bg-green-500 text-white"
                  >
                    {saveMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditMode(null);
                      setMinOrder("");
                      setDeliveryFee("");
                    }}
                    className="w-full md:w-auto bg-gray-400 text-white"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
                  <div className="grid grid-cols-2 md:grid-cols-1 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Min Order: </span>
                      <span className="font-semibold text-foreground">
                        {a.min_order || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fee: </span>
                      <span className="font-semibold text-foreground">
                        {a.delivery_fee || "—"}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setEditMode(a.id);
                      setMinOrder(a.min_order);
                      setDeliveryFee(a.delivery_fee);
                    }}
                    className="w-full md:w-auto btn-accent text-white"
                  >
                    <Pencil/>
                  </Button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No areas found matching your search
          </div>
        )}
      </div>
    </div>
  );
}
