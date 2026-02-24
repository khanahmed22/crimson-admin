import { useEffect } from "react";
import { supabase } from "@/db/supabase";
import { toast } from "sonner";
import { Link } from "react-router";
import useSound from "use-sound";
import { notif } from "@/store/notificationStore";

export default function LiveOrderListener() {
  const [play] = useSound("/sound.wav", { interrupt: true });

  // 🔊 Unlock Audio Context (required by browsers before playing sound)
  useEffect(() => {
    const unlock = () => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === "suspended") {
          ctx.resume();
          //console.log("🎧 Audio context resumed");
        }
      } catch (err) {
        //console.warn("⚠️ Audio unlock failed:", err);
      }
      window.removeEventListener("click", unlock);
    };

    window.addEventListener("click", unlock);
    return () => {
      window.removeEventListener("click", unlock);
    };
  }, []);

  // 📡 Supabase realtime order listener
  useEffect(() => {
    //console.log("📡 Subscribing to realtime order updates...");

    const channel = supabase
      .channel("realtime-orders")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          const orderNo = payload.new?.orderNo || "unknown";
          //console.log("🆕 New order received:", payload.new);

          // 🔊 Play notification sound
          play();

          // 🧠 Custom Zustand notification
          notif(`New order placed! #${orderNo}`, {
            description: (
              <Link
                to="/live-orders"
                className="text-blue-500 underline hover:text-blue-700"
              >
                See order
              </Link>
            ),
          });

          // 🍞 Sonner toast notification
          toast.info(`New order placed! #${orderNo}`, {
            description: (
              <Link
                to="/live-orders"
                className="text-blue-500 underline hover:text-blue-700"
              >
                See order
              </Link>
            ),
          });

         // console.log(`✅ Notification + Toast shown for order #${orderNo}`);
        }
      )
      .subscribe((status) => {
        //console.log("🟢 Supabase channel status:", status);
      });

    return () => {
      //console.log("🔴 Unsubscribing from realtime orders...");
      supabase.removeChannel(channel);
    };
  }, [play]);

  return null;
}
