import { useEffect, useState } from "react";
import {
  CheckCircle,
  CircleDollarSign,
  Loader2,
  RefreshCw,
  Wallet,
} from "lucide-react";

import {
  getAgentCommissions,
  getAgentCommissionSummary,
} from "../api/agentCommissionsApi";

function AgentCommissionsPage() {
  const [commissions, setCommissions] = useState([]);
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCommissions = async () => {
    try {
      setLoading(true);
      setError("");

      const [commissionData, summaryData] =
        await Promise.all([
          getAgentCommissions(),
          getAgentCommissionSummary(),
        ]);

      setCommissions(
        Array.isArray(commissionData?.commissions)
          ? commissionData.commissions
          : []
      );

      setSummary(summaryData || null);
    } catch (err) {
      console.error(
        "LOAD AGENT COMMISSIONS ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load commissions."
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

    const initialLoad = async () => {
      try {
        setLoading(true);
        setError("");

        const [commissionData, summaryData] =
          await Promise.all([
            getAgentCommissions(),
            getAgentCommissionSummary(),
          ]);

        if (!cancelled) {
          setCommissions(
            Array.isArray(
              commissionData?.commissions
            )
              ? commissionData.commissions
              : []
          );

          setSummary(summaryData || null);
        }
      } catch (err) {
        console.error(
          "LOAD AGENT COMMISSIONS ERROR:",
          err
        );

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load commissions."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    initialLoad();

    return () => {
      cancelled = true;
    };
  }, []);

  const formatCurrency = (value) => {
    return `KES ${Number(value || 0).toLocaleString()}`;
  };

  const formatDate = (value) => {
    if (!value) {
      return "Not available";
    }

    return new Date(value).toLocaleDateString();
  };

  if (loading) {
    return (
      <section className="page-placeholder">
        <div className="container">
          <Loader2 size={32} />

          <p>Loading commissions...</p>
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
            <h1>Commissions</h1>

            <p>
              View commissions earned from your
              managed policies.
            </p>
          </div>

          <button
            type="button"
            onClick={loadCommissions}
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

        {/* ==================================================
            COMMISSION SUMMARY
        ================================================== */}

        {summary && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                padding: "1.25rem",
                border: "1px solid #ddd",
                borderRadius: "10px",
              }}
            >
              <CircleDollarSign size={24} />

              <p>Total Policies</p>

              <h2>
                {summary.totalPolicies || 0}
              </h2>
            </div>

            <div
              style={{
                padding: "1.25rem",
                border: "1px solid #ddd",
                borderRadius: "10px",
              }}
            >
              <Wallet size={24} />

              <p>Total Premium</p>

              <h2>
                {formatCurrency(
                  summary.totalPremium
                )}
              </h2>
            </div>

            <div
              style={{
                padding: "1.25rem",
                border: "1px solid #ddd",
                borderRadius: "10px",
              }}
            >
              <CircleDollarSign size={24} />

              <p>Total Commission</p>

              <h2>
                {formatCurrency(
                  summary.totalCommission
                )}
              </h2>
            </div>

            <div
              style={{
                padding: "1.25rem",
                border: "1px solid #ddd",
                borderRadius: "10px",
              }}
            >
              <CheckCircle size={24} />

              <p>Paid Commission</p>

              <h2>
                {formatCurrency(
                  summary.paidCommission
                )}
              </h2>
            </div>

            <div
              style={{
                padding: "1.25rem",
                border: "1px solid #ddd",
                borderRadius: "10px",
              }}
            >
              <Wallet size={24} />

              <p>Unpaid Commission</p>

              <h2>
                {formatCurrency(
                  summary.unpaidCommission
                )}
              </h2>
            </div>
          </div>
        )}

        {/* ==================================================
            COMMISSION RECORDS
        ================================================== */}

        <div>
          <h2>Commission Records</h2>

          {commissions.length === 0 ? (
            <div
              style={{
                padding: "3rem",
                textAlign: "center",
              }}
            >
              <CircleDollarSign size={48} />

              <h3>No Commission Records</h3>

              <p>
                You currently have no active policy
                commissions.
              </p>
            </div>
          ) : (
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
                    <th>Premium</th>
                    <th>Rate</th>
                    <th>Commission</th>
                    <th>Status</th>
                    <th>Paid Date</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                  </tr>
                </thead>

                <tbody>
                  {commissions.map(
                    (commission) => (
                      <tr
                        key={commission._id}
                      >
                        <td>
                          {commission.policyNumber ||
                            commission._id}
                        </td>

                        <td>
                          {formatCurrency(
                            commission.premium
                          )}
                        </td>

                        <td>
                          {commission.commissionRate ||
                            0}
                          %
                        </td>

                        <td>
                          <strong>
                            {formatCurrency(
                              commission.commission
                            )}
                          </strong>
                        </td>

                        <td>
                          {commission.commissionPaid ? (
                            <span className="status approved">
                              Paid
                            </span>
                          ) : (
                            <span className="status pending">
                              Unpaid
                            </span>
                          )}
                        </td>

                        <td>
                          {formatDate(
                            commission.commissionPaidAt
                          )}
                        </td>

                        <td>
                          {formatDate(
                            commission.startDate
                          )}
                        </td>

                        <td>
                          {formatDate(
                            commission.endDate
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AgentCommissionsPage;