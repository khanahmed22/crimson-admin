import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import { QueryClient } from "@tanstack/react-query";
import {
  PersistQueryClientProvider,
} from "@tanstack/react-query-persist-client";
import { HeadProvider } from "react-head";
import localforage from "localforage";
import "maplibre-gl/dist/maplibre-gl.css";


// ✅ Register Service Worker for PWA + Firebase Messaging
if (import.meta.env.PROD) {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        // Register Firebase Messaging SW
       await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
        scope:'/'
      
  
});


      } catch (err) {
        //console.error("❌ Service Worker registration failed", err);
      }
    });
  }
} else {
  //console.log("🧩 Service workers are disabled in development mode");
}


// ✅ Configure localforage (IndexedDB for async offline cache)
localforage.config({
  name: "CrimsonCastleCache",
  storeName: "react-query-cache",
});

// ✅ React Query client setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 60 * 24, // 1 day
    },
  },
});

// ✅ Use async persister with localforage (better than sync storage)
const persister = {
  persistClient: async (client) => {
    await localforage.setItem("rqCache", client);
  },
  restoreClient: async () => {
    return await localforage.getItem("rqCache");
  },
  removeClient: async () => {
    await localforage.removeItem("rqCache");
  },
};

function Root() {
  const [Devtools, setDevtools] = useState(null);

  useEffect(() => {
    if (import.meta.env.DEV) {
      import("@tanstack/react-query-devtools").then((mod) => {
        setDevtools(() => mod.ReactQueryDevtools);
      });
    }
  }, []);

  return (
    <StrictMode>
      <HeadProvider>
        {/* ✅ PersistQueryClientProvider instead of plain QueryClientProvider */}
        <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
          {Devtools && <Devtools initialIsOpen={false} />}
        </PersistQueryClientProvider>
      </HeadProvider>
    </StrictMode>
  );
}

createRoot(document.getElementById("root")).render(<Root />);
