import { useState } from "react";
import { ArrowBigRight, Bell, X } from "lucide-react";
import { useNotificationStore } from "@/store/notificationStore";
import { useNavigate } from "react-router";
export default function NotificationPanel() {
  const { notifications, removeNotification, clearAll } =
    useNotificationStore();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate()

  return (
    <div className="fixed top-13 max-md:top-4 bottom-10 right-4 z-[9999]">
      {/* 🛎️ Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full bg-white border shadow-md hover:bg-gray-100 transition"
      >
        <Bell className="text-gray-700" size={17} />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      {/* 📋 Notification Panel */}
      {open && (
        <div className="absolute right-0 mt-3 w-[200px]  bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-700">Notifications</h3>
            <div className="flex gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-red-500 hover:underline"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-[70vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-6">
                No notifications
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start justify-between gap-3 p-3 border-b last:border-0 ${
                    n.type === "success"
                      ? "bg-green-50"
                      : n.type === "error"
                      ? "bg-red-50"
                      : n.type === "warning"
                      ? "bg-yellow-50"
                      : "bg-blue-50"
                  }`}
                >
                  <div className="flex-1">
                    <p
                      className={`font-medium text-sm ${
                        n.type === "success"
                          ? "text-green-700"
                          : n.type === "error"
                          ? "text-red-700"
                          : n.type === "warning"
                          ? "text-yellow-700"
                          : "text-blue-700"
                      }`}
                    >
                     {typeof n.message === "string" ? n.message : JSON.stringify(n.message)}

                    </p>
                   {typeof n.description === "string" ? (
  <div
    className="text-sm text-gray-600 mt-1"
    onClick={() => navigate("/live-orders")}
  >
    <span className="flex items-center gap-x-1 cursor-pointer hover:text-blue-500">
      {n.description} <ArrowBigRight />
    </span>
  </div>
) : null}

                  </div>
                  <button
                    onClick={() => removeNotification(n.id)}
                    className="text-gray-400 hover:text-gray-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
