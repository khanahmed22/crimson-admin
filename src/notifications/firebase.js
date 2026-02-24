// src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";
import { supabase } from "@/db/supabase";

const firebaseConfig = {
  apiKey: "AIzaSyDYC4eTX1p8Lk-dvR61tnWZk0aYyI6hgv8",
  authDomain: "crimson-castle.firebaseapp.com",
  projectId: "crimson-castle",
  storageBucket: "crimson-castle.firebasestorage.app",
  messagingSenderId: "558981554645",
  appId: "1:558981554645:web:fe9d36bb829c21a9795d5c",
  measurementId: "G-J6KPP4TT43",
};

// 🔹 Init Firebase ONCE
const app = initializeApp(firebaseConfig);

let messaging = null;

/* 🔑 Lazy init messaging ONLY when supported */
async function getMessagingSafe() {
  if (!(await isSupported())) {
    throw new Error("Firebase messaging not supported in this browser");
  }

  if (!messaging) {
    messaging = getMessaging(app);
  }

  return messaging;
}

// 🔹 Enable notifications
export const enableNotifications = async (user_id) => {
  try {
    if (!("serviceWorker" in navigator)) {
      throw new Error("Service workers not supported");
    }

    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }
    if (permission !== "granted") return;

    // ✅ Wait until YOUR SW is active
    const registration = await navigator.serviceWorker.ready;

    const messaging = await getMessagingSafe();

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

   

    if (!token) return;

    const { data: restData } = await supabase
      .from("rest_list")
      .select("id")
      .eq("user_id", user_id)
      .maybeSingle();

    if (!restData) return;

   await supabase.from("push_subscriptions").insert({
  restID: restData.id,
  fcm_token: token,
});

return token;

  } catch (err) {
    console.error("❌ Failed to enable notifications:", err);
    throw err;
  }
};

// 🔹 Foreground listener (call once AFTER app load)
export const listenForMessages = async () => {
  try {
    const messaging = await getMessagingSafe();
    onMessage(messaging, (payload) => {
      // handle foreground message
    });
  } catch {
    // silently ignore unsupported browsers
  }
};
