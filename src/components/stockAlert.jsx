

import { useEffect } from "react";

import { supabase } from "@/db/supabase";
import { useAuth } from "@/store/authStore";
import { notif } from "@/store/notificationStore";
export default function LowStockWatcher() {
  const { session } = useAuth();
  const user_id = session?.user?.id;

  useEffect(() => {
    if (!user_id) return;

    const checkLowStock = async () => {
     const { data, error } = await supabase
  .from("restaurant_menu")
  .select("foodName, stockAmount, user_id")
  .eq("user_id", user_id);




      if (error) {
        console.error("Error fetching stock:", error);
        return;
      }

      data?.forEach((item) => {
        if (item.stockAmount !== null && item.stockAmount <= 4) {
          notif(`⚠️ Low stock: ${item.foodName} (only ${item.stockAmount} left)`);
        }
      });
    };

    checkLowStock();

    const subscription = supabase
      .channel("low-stock-channel")
      .on(
        "postgres_changes",
        {
          event: "UPDATE", // ✅ only react to updates
          schema: "public",
          table: "restaurant_menu",
          filter: `user_id=eq.${user_id}`,
        },
        (payload) => {
          const item = payload.new;
          if (item?.stockAmount !== null && item.stockAmount <= 4) {
            notif(`⚠️ Low stock: ${item.foodName} (only ${item.stockAmount} left)`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user_id]);

  return null;
}
