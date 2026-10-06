import { useEffect, useState } from "react";
import {
  FileText,
  Loader2,
  RefreshCw,
  ShieldCheck,
  User,
} from "lucide-react";

import { getAgentPolicies } from "../api/agentPolicyApi";

function AgentPoliciesPage() {
  const [policies, setPolicies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // LOAD POLICIES
  // ======================================================

  const loadPolicies = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAgentPolicies();

      setPolicies(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "LOAD AGENT POLICIES ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load policies."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    let mounted = true;

    const fetchPolicies = async () => {
      try {
        setError("");

        const data = await getAgentPolicies();

        if (mounted) {
          setPolicies(
            Array.isArray(data) ? data : []
          );
        }
      } catch (err) {
        console.error(
          "LOAD AGENT POLICIES ERROR:",
          err
        );

        if (mounted) {
          setError(
            err.response?.data?.message ||
              "Unable to load policies."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchPolicies();

    return () => {
      mounted = false;
    };
  }, []);

  // ======================================================
  // FORMAT STATUS
  // ======================================================

  const formatStatus = (value) => {
    if (!value) {
      return "Unknown";
    }

    return value
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  // ======================================================
  // STATUS CLASS
  // ======================================================

  const getStatusClass = (value) => {
    switch (value) {
      case "active":
        return "status approved";

      case "cancelled":
      case "expired":
        return "status rejected";

      case "pending_payment":
      case "pending":
        return "status pending";

      default:
        return "status review";
    }
  };

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
              Loading agent policies...
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <section className="page-placeholder">
      <div className="container">
        {/* ==================================================
            HEADER
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
            <h1>Agent Policies</h1>

            <p>
              Policies managed by you.
            </p>
          </div>

          <button
            type="button"
            onClick={loadPolicies}
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
            ERROR
        ================================================== */}

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

        {/* ==================================================
            EMPTY STATE
        ================================================== */}

        {policies.length === 0 ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
            }}
          >
            <ShieldCheck size={48} />

            <h2>No Policies</h2>

            <p>
              You currently have no policies
              assigned to you.
            </p>
          </div>
        ) : (
          /* ==================================================
             POLICY TABLE
          ================================================== */

          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th>Policy</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Premium</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Application</th>
                </tr>
              </thead>

              <tbody>
                {policies.map(
                  (policy) => (
                    <tr
                      key={
                        policy._id
                      }
                    >
                      {/* POLICY */}

                      <td>
                        <span
                          style={{
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            gap: "0.35rem",
                          }}
                        >
                          <ShieldCheck
                            size={16}
                          />

                          {policy.policyNumber ||
                            policy._id}
                        </span>
                      </td>

                      {/* CUSTOMER */}

                      <td>
                        <div>
                          <strong>
                            {policy.user
                              ?.name ||
                              "Unknown"}
                          </strong>

                          {policy.user
                            ?.email && (
                            <small
                              style={{
                                display:
                                  "block",
                                marginTop:
                                  "0.25rem",
                              }}
                            >
                              {
                                policy
                                  .user
                                  .email
                              }
                            </small>
                          )}
                        </div>
                      </td>

                      {/* PRODUCT */}

                      <td>
                        <div>
                          <strong>
                            {policy
                              .product
                              ?.name ||
                              "Unknown"}
                          </strong>

                          {policy
                            .product
                            ?.description && (
                            <small
                              style={{
                                display:
                                  "block",
                                marginTop:
                                  "0.25rem",
                              }}
                            >
                              {
                                policy
                                  .product
                                  .description
                              }
                            </small>
                          )}
                        </div>
                      </td>

                      {/* PREMIUM */}

                      <td>
                        KES{" "}
                        {Number(
                          policy.premiumAmount ||
                            0
                        ).toLocaleString()}
                      </td>

                      {/* STATUS */}

                      <td>
                        <span
                          className={getStatusClass(
                            policy.status
                          )}
                        >
                          {formatStatus(
                            policy.status
                          )}
                        </span>
                      </td>

                      {/* START DATE */}

                      <td>
                        {policy.startDate
                          ? new Date(
                              policy.startDate
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      {/* END DATE */}

                      <td>
                        {policy.endDate
                          ? new Date(
                              policy.endDate
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      {/* APPLICATION */}

                      <td>
                        {policy
                          .application
                          ?.applicationNumber ||
                          "—"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ==================================================
            POLICY SUMMARY
        ================================================== */}

        {policies.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "1rem",
              marginTop: "1.5rem",
            }}
          >
            <div
              style={{
                padding: "1rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
            >
              <FileText size={20} />

              <strong
                style={{
                  display: "block",
                  marginTop: "0.5rem",
                }}
              >
                Total Policies
              </strong>

              <p>
                {policies.length}
              </p>
            </div>

            <div
              style={{
                padding: "1rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
            >
              <ShieldCheck size={20} />

              <strong
                style={{
                  display: "block",
                  marginTop: "0.5rem",
                }}
              >
                Active Policies
              </strong>

              <p>
                {
                  policies.filter(
                    (policy) =>
                      policy.status ===
                      "active"
                  ).length
                }
              </p>
            </div>

            <div
              style={{
                padding: "1rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
            >
              <User size={20} />

              <strong
                style={{
                  display: "block",
                  marginTop: "0.5rem",
                }}
              >
                Customers
              </strong>

              <p>
                {
                  new Set(
                    policies
                      .map(
                        (policy) =>
                          policy.user?._id
                      )
                      .filter(Boolean)
                  ).size
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default AgentPoliciesPage;