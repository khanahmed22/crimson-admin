import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export const useNotificationStore = create(
  persist(
    (set) => ({
      notifications: [],

      addNotification: (notification) => {
  const id = uuidv4();
  // if description is JSX, skip persistence
  if (typeof notification.description === "object" && notification.description !== null) {
    localStorage.removeItem("notification-storage");
  }
  set((state) => ({
    notifications: [...state.notifications, { ...notification, id }],
  }));
},


      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearAll: () => set({ notifications: [] }),
    }),
    {
      name: "notification-storage",
    }
  )
);

// ✅ Helper for easy use like notif("text", { type, description })
export function notif(message, options = {}) {
  const { addNotification } = useNotificationStore.getState();
  let description = options.description;

  // convert JSX to string safely if needed
  if (typeof description === "object" && description !== null) {
    description = "View details"; // fallback text
  }

  addNotification({
    message,
    type: options.type || "info",
    description: description || null,
    duration: options.duration || 5000,
  });
}

