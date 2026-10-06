import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Loader2,
  RefreshCw,
} from "lucide-react";

import {
  getAgentNotifications,
  markAgentNotificationRead,
  markAllAgentNotificationsRead,
} from "../api/agentNotificationsApi";

function AgentNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAgentNotifications();

      setNotifications(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "LOAD AGENT NOTIFICATIONS ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const fetchNotifications = async () => {
      try {
        setError("");

        const data = await getAgentNotifications();

        if (mounted) {
          setNotifications(
            Array.isArray(data) ? data : []
          );
        }
      } catch (err) {
        console.error(
          "LOAD AGENT NOTIFICATIONS ERROR:",
          err
        );

        if (mounted) {
          setError(
            err.response?.data?.message ||
              "Unable to load notifications."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchNotifications();

    return () => {
      mounted = false;
    };
  }, []);

  const handleMarkRead = async (notificationId) => {
    try {
      setError("");
      setSuccess("");

      await markAgentNotificationRead(
        notificationId
      );

      setNotifications((current) =>
        current.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                read: true,
              }
            : notification
        )
      );

      setSuccess(
        "Notification marked as read."
      );
    } catch (err) {
      console.error(
        "MARK AGENT NOTIFICATION READ ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to mark notification as read."
      );
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await markAllAgentNotificationsRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      setSuccess(
        "All notifications marked as read."
      );
    } catch (err) {
      console.error(
        "MARK ALL AGENT NOTIFICATIONS READ ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to mark notifications as read."
      );
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (value) => {
    if (!value) {
      return "Not available";
    }

    return new Date(value).toLocaleString();
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  if (loading) {
    return (
      <section className="page-placeholder">
        <div className="container">
          <Loader2 size={32} />

          <p>Loading notifications...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-placeholder">
      <div className="container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1>Notifications</h1>

            <p>
              Stay updated with your assigned
              applications, customers, and policies.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={loadNotifications}
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <RefreshCw size={18} />

              Refresh
            </button>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={saving}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                {saving ? (
                  <Loader2 size={18} />
                ) : (
                  <CheckCheck size={18} />
                )}

                {saving
                  ? "Updating..."
                  : "Mark All Read"}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: "1rem",
              marginBottom: "1rem",
              borderRadius: "8px",
              background: "#fee2e2",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: "1rem",
              marginBottom: "1rem",
              borderRadius: "8px",
              background: "#dcfce7",
            }}
          >
            {success}
          </div>
        )}

        <div
          style={{
            marginBottom: "1rem",
          }}
        >
          <strong>
            {unreadCount} unread notification
            {unreadCount === 1 ? "" : "s"}
          </strong>
        </div>

        {notifications.length === 0 ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
            }}
          >
            <Bell size={48} />

            <h2>No Notifications</h2>

            <p>
              You currently have no notifications.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "1rem",
            }}
          >
            {notifications.map((notification) => (
              <div
                key={notification._id}
                style={{
                  padding: "1.25rem",
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  background: notification.read
                    ? "#ffffff"
                    : "#f8fafc",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                    }}
                  >
                    <Bell size={22} />

                    <div>
                      <h3
                        style={{
                          marginTop: 0,
                        }}
                      >
                        {notification.title ||
                          "Notification"}
                      </h3>

                      <p>
                        {notification.message ||
                          notification.body ||
                          "No message available."}
                      </p>

                      <small>
                        {formatDate(
                          notification.createdAt
                        )}
                      </small>
                    </div>
                  </div>

                  {!notification.read && (
                    <button
                      type="button"
                      onClick={() =>
                        handleMarkRead(
                          notification._id
                        )
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                      }}
                    >
                      <Check size={16} />

                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default AgentNotificationsPage;