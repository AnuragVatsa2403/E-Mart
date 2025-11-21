// client/src/pages/Notifications.jsx
import React, { useEffect } from "react";
import { useAppContext } from "../Context/AppContext";

export default function NotificationsPage() {
  const { notifications, fetchNotifications, markNotificationRead } = useAppContext();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="container mx-auto mt-6">
      <h2 className="text-xl font-semibold mb-4">Notifications</h2>

      {notifications.length === 0 && <div>No notifications</div>}

      <div className="space-y-2">
        {notifications.map(n => (
          <div key={n._id || n.id} className={`p-3 border rounded ${!n.isRead ? "bg-gray-50" : ""}`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{n.title}</div>
                <div className="text-sm text-gray-600">{n.message}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              <div>
                {!n.isRead && (
                  <button
                    onClick={() => markNotificationRead(n._id || n.id)}
                    className="text-sm text-blue-600"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
