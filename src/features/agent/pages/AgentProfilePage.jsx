import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Loader2,
  RefreshCw,
} from "lucide-react";

import { getAgentProfile } from "../api/agentProfileApi";

function AgentProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // LOAD PROFILE
  // ======================================================

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAgentProfile();

      setProfile(data);
    } catch (err) {
      console.error(
        "LOAD AGENT PROFILE ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load agent profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      try {
        setError("");

        const data = await getAgentProfile();

        if (!cancelled) {
          setProfile(data);
          setLoading(false);
        }
      } catch (err) {
        console.error(
          "LOAD AGENT PROFILE ERROR:",
          err
        );

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load agent profile."
          );
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <section className="page-placeholder">
        <div className="container">
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
            }}
          >
            <Loader2 size={32} />

            <p>
              Loading agent profile...
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
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
              <h1>Agent Profile</h1>

              <p>
                View your agent account information.
              </p>
            </div>

            <button
              type="button"
              onClick={loadProfile}
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <RefreshCw size={18} />

              Retry
            </button>
          </div>

          <div
            style={{
              padding: "1rem",
              borderRadius: "8px",
              background: "#fee2e2",
            }}
          >
            {error}
          </div>
        </div>
      </section>
    );
  }

  // ======================================================
  // PROFILE
  // ======================================================

  return (
    <section className="page-placeholder">
      <div className="container">
        {/* ==================================================
            PAGE HEADER
        ================================================== */}

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
            <h1>Agent Profile</h1>

            <p>
              View your agent account information.
            </p>
          </div>

          <button
            type="button"
            onClick={loadProfile}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {loading ? (
              <Loader2 size={18} />
            ) : (
              <RefreshCw size={18} />
            )}

            Refresh
          </button>
        </div>

        {/* ==================================================
            PROFILE HEADER
        ================================================== */}

        <div
          style={{
            padding: "1.5rem",
            marginBottom: "1.5rem",
            border: "1px solid #ddd",
            borderRadius: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f1f5f9",
              }}
            >
              <User size={32} />
            </div>

            <div>
              <h2
                style={{
                  margin: 0,
                }}
              >
                {profile?.name || "Agent"}
              </h2>

              <p
                style={{
                  margin: "0.35rem 0 0",
                }}
              >
                {profile?.email ||
                  "Email not available"}
              </p>
            </div>

            <div
              style={{
                marginLeft: "auto",
              }}
            >
              <span
                className={
                  profile?.active
                    ? "status approved"
                    : "status pending"
                }
              >
                {profile?.active
                  ? "Active"
                  : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* ==================================================
            PERSONAL INFORMATION
        ================================================== */}

        <div
          style={{
            marginBottom: "1.5rem",
          }}
        >
          <h2>
            <User size={20} /> Personal Information
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1rem",
            }}
          >
            <div
              style={{
                padding: "1rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
            >
              <strong>Name</strong>

              <p>
                {profile?.name ||
                  "Not available"}
              </p>
            </div>

            <div
              style={{
                padding: "1rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
            >
              <strong>Email</strong>

              <p>
                {profile?.email ||
                  "Not available"}
              </p>
            </div>

            <div
              style={{
                padding: "1rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
            >
              <strong>Phone</strong>

              <p>
                {profile?.phone ||
                  "Not available"}
              </p>
            </div>

            <div
              style={{
                padding: "1rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
            >
              <strong>County</strong>

              <p>
                {profile?.county ||
                  "Not available"}
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================
            AGENT INFORMATION
        ================================================== */}

        <div
          style={{
            marginBottom: "1.5rem",
          }}
        >
          <h2>
            <ShieldCheck size={20} /> Agent Information
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1rem",
            }}
          >
            <div
              style={{
                padding: "1rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
            >
              <strong>Role</strong>

              <p>
                {profile?.role || "Agent"}
              </p>
            </div>

            <div
              style={{
                padding: "1rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
            >
              <strong>Agent Code</strong>

              <p>
                {profile?.agentCode ||
                  "Not available"}
              </p>
            </div>

            <div
              style={{
                padding: "1rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
            >
              <strong>Account Status</strong>

              <p>
                {profile?.active
                  ? "Active"
                  : "Inactive"}
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================
            CONTACT INFORMATION
        ================================================== */}

        <div>
          <h2>Contact Information</h2>

          <div
            style={{
              display: "grid",
              gap: "0.75rem",
              maxWidth: "600px",
            }}
          >
            <p>
              <Mail size={18} />{" "}
              <strong>Email:</strong>{" "}
              {profile?.email ||
                "Not available"}
            </p>

            <p>
              <Phone size={18} />{" "}
              <strong>Phone:</strong>{" "}
              {profile?.phone ||
                "Not available"}
            </p>

            <p>
              <MapPin size={18} />{" "}
              <strong>County:</strong>{" "}
              {profile?.county ||
                "Not available"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AgentProfilePage;