import { useLocation } from "react-router";
import { useState } from "react";
import { useEffect } from "react";
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  // 🔥 Recalculate mobile state whenever route changes
  useEffect(() => {
    setIsMobile(window.innerWidth < breakpoint);
  }, [location.pathname]);

  return isMobile;
}
