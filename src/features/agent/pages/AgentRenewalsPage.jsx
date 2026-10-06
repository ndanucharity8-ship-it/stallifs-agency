import { useEffect, useState } from "react";
import {
  CalendarClock,
  Loader2,
  RefreshCw,
  User,
  Phone,
  Mail,
  Shield,
} from "lucide-react";

import { getAgentRenewals } from "../api/agentRenewalsApi";

function AgentRenewalsPage() {
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRenewals = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAgentRenewals();

      setRenewals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(
        "LOAD AGENT RENEWALS ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load renewals."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRenewals();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const formatDate = (value) => {
    if (!value) {
      return "Not available";
    }

    return new Date(value).toLocaleDateString();
  };

  const getRenewalClass = (days) => {
    if (days <= 7) {
      return "status rejected";
    }

    if (days <= 14) {
      return "status information";
    }

    return "status approved";
  };

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

            <p>Loading renewals...</p>
          </div>
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
            <h1>Policy Renewals</h1>

            <p>
              Policies assigned to you that are
              renewing within the next 30 days.
            </p>
          </div>

          <button
            type="button"
            onClick={loadRenewals}
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

        {renewals.length === 0 ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
            }}
          >
            <CalendarClock size={48} />

            <h2>No Upcoming Renewals</h2>

            <p>
              You currently have no policies
              renewing within the next 30 days.
            </p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  padding: "1rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                }}
              >
                <CalendarClock size={24} />

                <h3>{renewals.length}</h3>

                <p>Upcoming Renewals</p>
              </div>

              <div
                style={{
                  padding: "1rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                }}
              >
                <Shield size={24} />

                <h3>
                  {
                    renewals.filter(
                      (renewal) =>
                        renewal.daysRemaining <= 7
                    ).length
                  }
                </h3>

                <p>Due Within 7 Days</p>
              </div>

              <div
                style={{
                  padding: "1rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                }}
              >
                <Shield size={24} />

                <h3>
                  {
                    renewals.filter(
                      (renewal) =>
                        renewal.daysRemaining > 7 &&
                        renewal.daysRemaining <= 14
                    ).length
                  }
                </h3>

                <p>Due Within 14 Days</p>
              </div>
            </div>

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
                    <th>Contact</th>
                    <th>Product</th>
                    <th>Premium</th>
                    <th>Expiry Date</th>
                    <th>Remaining</th>
                  </tr>
                </thead>

                <tbody>
                  {renewals.map((renewal) => (
                    <tr key={renewal._id}>
                      <td>
                        <strong>
                          {renewal.policyNumber ||
                            renewal._id}
                        </strong>
                      </td>

                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                          }}
                        >
                          <User size={16} />

                          {renewal.customerName ||
                            "Unknown"}
                        </div>
                      </td>

                      <td>
                        <div>
                          {renewal.customerEmail && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.4rem",
                              }}
                            >
                              <Mail size={15} />

                              {
                                renewal.customerEmail
                              }
                            </div>
                          )}

                          {renewal.customerPhone && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.4rem",
                                marginTop: "0.25rem",
                              }}
                            >
                              <Phone size={15} />

                              {
                                renewal.customerPhone
                              }
                            </div>
                          )}
                        </div>
                      </td>

                      <td>
                        {renewal.product ||
                          "Not available"}
                      </td>

                      <td>
                        KES{" "}
                        {Number(
                          renewal.premiumAmount || 0
                        ).toLocaleString()}
                      </td>

                      <td>
                        {formatDate(
                          renewal.endDate
                        )}
                      </td>

                      <td>
                        <span
                          className={getRenewalClass(
                            renewal.daysRemaining
                          )}
                        >
                          {renewal.daysRemaining}{" "}
                          {renewal.daysRemaining === 1
                            ? "day"
                            : "days"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default AgentRenewalsPage;