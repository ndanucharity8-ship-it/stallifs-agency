import { useEffect, useState } from "react";
import {
  ArrowLeft,
  FileText,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  User,
} from "lucide-react";

import {
  getAgentCustomers,
  getAgentCustomer,
} from "../api/agentCustomerApi";

function AgentCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [error, setError] = useState("");

  // ======================================================
  // LOAD CUSTOMERS
  // ======================================================

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAgentCustomers();

      setCustomers(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "LOAD AGENT CUSTOMERS ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load customers."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // LOAD CUSTOMER DETAILS
  // ======================================================

  const loadCustomer = async (customerId) => {
    try {
      setDetailsLoading(true);
      setError("");

      const data =
        await getAgentCustomer(customerId);

      setSelectedCustomer(data);
    } catch (err) {
      console.error(
        "LOAD AGENT CUSTOMER ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load customer details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    let cancelled = false;

    const loadInitialCustomers = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAgentCustomers();

        if (cancelled) {
          return;
        }

        setCustomers(
          Array.isArray(data) ? data : []
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "LOAD AGENT CUSTOMERS ERROR:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load customers."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadInitialCustomers();

    return () => {
      cancelled = true;
    };
  }, []);

  // ======================================================
  // CLOSE CUSTOMER DETAILS
  // ======================================================

  const closeDetails = () => {
    setSelectedCustomer(null);
    setError("");
  };

  // ======================================================
  // CUSTOMER DETAILS LOADING
  // ======================================================

  if (selectedCustomer && detailsLoading) {
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
              Loading customer details...
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ======================================================
  // CUSTOMER DETAILS
  // ======================================================

  if (selectedCustomer) {
    const customer =
      selectedCustomer.customer;

    const policies =
      Array.isArray(
        selectedCustomer.policies
      )
        ? selectedCustomer.policies
        : [];

    const applications =
      Array.isArray(
        selectedCustomer.applications
      )
        ? selectedCustomer.applications
        : [];

    return (
      <section className="page-placeholder">
        <div className="container">
          <button
            type="button"
            onClick={closeDetails}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <ArrowLeft size={18} />

            Back to Customers
          </button>

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
              CUSTOMER HEADER
          ================================================== */}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "1rem",
              flexWrap: "wrap",
              marginBottom: "1.5rem",
            }}
          >
            <div>
              <h1>
                {customer?.name ||
                  "Customer"}
              </h1>

              <p>
                Customer details and account
                activity.
              </p>
            </div>

            <span
              className={
                customer?.active
                  ? "status approved"
                  : "status pending"
              }
            >
              {customer?.active
                ? "Active"
                : "Inactive"}
            </span>
          </div>

          {/* ==================================================
              CUSTOMER INFORMATION
          ================================================== */}

          <div
            style={{
              marginBottom: "1.5rem",
            }}
          >
            <h2>
              <User size={20} /> Customer
              Information
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
                  {customer?.name ||
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
                  {customer?.email ||
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
                  {customer?.phone ||
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
                  {customer?.county ||
                    "Not available"}
                </p>
              </div>
            </div>
          </div>

          {/* ==================================================
              POLICIES
          ================================================== */}

          <div
            style={{
              marginBottom: "1.5rem",
            }}
          >
            <h2>
              <ShieldCheck size={20} /> Policies
            </h2>

            {policies.length === 0 ? (
              <p>
                This customer has no policies
                managed by you.
              </p>
            ) : (
              <div
                style={{
                  overflowX: "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse:
                      "collapse",
                  }}
                >
                  <thead>
                    <tr>
                      <th>Policy</th>
                      <th>Product</th>
                      <th>Status</th>
                      <th>Premium</th>
                      <th>Start Date</th>
                      <th>End Date</th>
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
                          <td>
                            {policy.policyNumber ||
                              policy._id}
                          </td>

                          <td>
                            {policy.product
                              ?.name ||
                              "Unknown"}
                          </td>

                          <td>
                            {policy.status ||
                              "Unknown"}
                          </td>

                          <td>
                            KES{" "}
                            {Number(
                              policy.premiumAmount ||
                                0
                            ).toLocaleString()}
                          </td>

                          <td>
                            {policy.startDate
                              ? new Date(
                                  policy.startDate
                                ).toLocaleDateString()
                              : "—"}
                          </td>

                          <td>
                            {policy.endDate
                              ? new Date(
                                  policy.endDate
                                ).toLocaleDateString()
                              : "—"}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ==================================================
              APPLICATIONS
          ================================================== */}

          <div>
            <h2>
              <FileText size={20} /> Applications
            </h2>

            {applications.length ===
            0 ? (
              <p>
                This customer has no
                applications assigned to you.
              </p>
            ) : (
              <div
                style={{
                  overflowX: "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse:
                      "collapse",
                  }}
                >
                  <thead>
                    <tr>
                      <th>Application</th>
                      <th>Product</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {applications.map(
                      (application) => (
                        <tr
                          key={
                            application._id
                          }
                        >
                          <td>
                            {application.applicationNumber ||
                              application._id}
                          </td>

                          <td>
                            {application
                              .product
                              ?.name ||
                              "Unknown"}
                          </td>

                          <td>
                            {application.status ||
                              "Unknown"}
                          </td>

                          <td>
                            {application.createdAt
                              ? new Date(
                                  application.createdAt
                                ).toLocaleDateString()
                              : "—"}
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

  // ======================================================
  // CUSTOMER LIST
  // ======================================================

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
            <h1>Agent Customers</h1>

            <p>
              Customers assigned to you.
            </p>
          </div>

          <button
            type="button"
            onClick={loadCustomers}
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

        {loading ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
            }}
          >
            <Loader2 size={32} />

            <p>
              Loading customers...
            </p>
          </div>
        ) : customers.length === 0 ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
            }}
          >
            <User size={48} />

            <h2>No Assigned Customers</h2>

            <p>
              You currently have no customers
              assigned to you.
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
                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>County</th>
                  <th>Policies</th>
                  <th>Applications</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {customers.map(
                  (customer) => (
                    <tr
                      key={
                        customer._id
                      }
                    >
                      <td>
                        {customer.name ||
                          "Unknown"}
                      </td>

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
                          <Mail
                            size={15}
                          />

                          {customer.email ||
                            "—"}
                        </span>
                      </td>

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
                          <Phone
                            size={15}
                          />

                          {customer.phone ||
                            "—"}
                        </span>
                      </td>

                      <td>
                        {customer.county ||
                          "—"}
                      </td>

                      <td>
                        {customer.policyCount ??
                          0}
                      </td>

                      <td>
                        {customer.applications ??
                          0}
                      </td>

                      <td>
                        <span
                          className={
                            customer.active
                              ? "status approved"
                              : "status pending"
                          }
                        >
                          {customer.active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          onClick={() =>
                            loadCustomer(
                              customer._id
                            )
                          }
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default AgentCustomersPage;