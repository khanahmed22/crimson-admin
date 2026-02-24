import { useEffect } from "react";

export default function TawkTo() {
  useEffect(() => {
    // Prevent duplicate script injection ONLY
    if (window.__TAWK_LOADED__) return;

    window.__TAWK_LOADED__ = true;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    // Fired when widget is fully initialized
    window.Tawk_API.onLoad = function () {
      window.__TAWK_READY__ = true;

      // Optional: hide initially
      window.Tawk_API.hideWidget();
    };

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://embed.tawk.to/${import.meta.env.VITE_TAWKTO_KEY}/${import.meta.env.VITE_TAWKTO_WIDGET_KEY}`;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");

    document.body.appendChild(script);
  }, []);

  return null;
}
