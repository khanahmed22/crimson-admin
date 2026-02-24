// src/components/OfflineBanner.jsx
import { useEffect, useState } from "react";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOffline = () => {
      console.log("💥 You went offline!");
      setIsOffline(true);
    };
    const handleOnline = () => {
      console.log("✅ You are back online!");
      setIsOffline(false);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: "#dc2626",
      color: "white",
      padding: "10px 20px",
      borderRadius: "9999px",
      zIndex: 9999,
      fontWeight: "500",
      boxShadow: "0 4px 8px rgba(0,0,0,0.3)"
    }}>
      ⚠️ Offline Mode 
    </div>
  );
}
