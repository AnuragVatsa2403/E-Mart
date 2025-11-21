// client/src/components/NotificationBell.jsx
import React, { useState, useEffect } from "react";
import { useAppContext } from "../Context/AppContext";

export default function NotificationBell() {
  const { notifications, fetchNotifications, markNotificationRead } = useAppContext();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // fetch latest on mount
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleClickNotification = async (n) => {
    if (!n.isRead) await markNotificationRead(n._id || n.id);
    // You can navigate to order page if meta.orderId exists
    if (n.meta?.orderId) {
      window.location.href = `/orders/${n.meta.orderId}`;
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)} className="relative p-2">
        <i className="fa-solid fa-bell text-xl"></i>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1">{unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded z-50">
          <div className="p-3 border-b font-semibold">Notifications</div>
          <div style={{ maxHeight: 300, overflow: "auto" }}>
            {notifications.length === 0 && <div className="p-3">No notifications</div>}
            {notifications.map(n => (
              <div
                key={n._id || n.id}
                onClick={() => handleClickNotification(n)}
                className={`p-3 cursor-pointer border-b ${!n.isRead ? "bg-gray-100" : ""}`}
              >
                <div className="text-sm font-medium">{n.title}</div>
                <div className="text-xs text-gray-600">{n.message}</div>
                <div className="text-[10px] text-gray-400">{new Date(n.createdAt || n.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div className="p-2 text-center text-sm text-gray-600">Powered by Socket.io</div>
        </div>
      )}
    </div>
  );
}
