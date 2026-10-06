import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  FileText,
  Loader2,
  MessageSquare,
  RefreshCw,
  User,
} from "lucide-react";

import {
  getAssignedApplications,
  getAssignedApplication,
  updateAssignedApplication,
} from "../api/agentAssignedApplicationApi";

function AgentApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [informationRequest, setInformationRequest] =
    useState("");

  // ======================================================
  // LOAD ASSIGNED APPLICATIONS
  // ======================================================

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAssignedApplications();

      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(
        "LOAD AGENT APPLICATIONS ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load applications."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // LOAD SINGLE APPLICATION
  // ======================================================

  const loadApplication = async (applicationId) => {
    try {
      setDetailsLoading(true);
      setError("");
      setSuccess("");

      const data =
        await getAssignedApplication(applicationId);

      setSelectedApplication(data);
      setStatus(data.status || "");
      setNotes("");
      setInformationRequest("");
    } catch (err) {
      console.error(
        "LOAD AGENT APPLICATION ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load application details."
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

    const initialLoad = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAssignedApplications();

        if (!cancelled) {
          setApplications(
            Array.isArray(data) ? data : []
          );
        }
      } catch (err) {
        console.error(
          "LOAD AGENT APPLICATIONS ERROR:",
          err
        );

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load applications."
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

  // ======================================================
  // UPDATE APPLICATION
  // ======================================================

  const handleUpdate = async () => {
    if (!selectedApplication) {
      return;
    }

    if (!status && !notes.trim()) {
      setError(
        "Please select a status or enter a note."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const data = {};

      if (
        status &&
        status !== selectedApplication.status
      ) {
        data.status = status;
      }

      if (notes.trim()) {
        data.notes = notes.trim();
      }

      if (
        status === "information_requested" &&
        informationRequest.trim()
      ) {
        data.informationRequest =
          informationRequest.trim();
      }

      const response =
        await updateAssignedApplication(
          selectedApplication._id,
          data
        );

      const updated =
        response.application || response;

      setSelectedApplication(updated);

      setApplications((current) =>
        current.map((application) =>
          application._id === updated._id
            ? {
                ...application,
                ...updated,
              }
            : application
        )
      );

      setStatus(updated.status || "");
      setNotes("");
      setInformationRequest("");

      setSuccess(
        response.message ||
          "Application updated successfully."
      );
    } catch (err) {
      console.error(
        "UPDATE AGENT APPLICATION ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to update application."
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // BACK TO APPLICATION LIST
  // ======================================================

  const closeDetails = () => {
    setSelectedApplication(null);
    setError("");
    setSuccess("");
  };

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
      case "approved":
        return "status approved";

      case "rejected":
        return "status rejected";

      case "escalated":
        return "status escalated";

      case "information_requested":
        return "status information";

      case "under_review":
        return "status review";

      default:
        return "status pending";
    }
  };

  // ======================================================
  // APPLICATION LIST
  // ======================================================

  if (!selectedApplication) {
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
              <h1>Agent Applications</h1>

              <p>
                Applications assigned to you for
                review and processing.
              </p>
            </div>

            <button
              type="button"
              onClick={loadApplications}
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
                Loading assigned applications...
              </p>
            </div>
          ) : applications.length === 0 ? (
            <div
              style={{
                padding: "3rem",
                textAlign: "center",
              }}
            >
              <FileText size={48} />

              <h2>No Assigned Applications</h2>

              <p>
                You currently have no applications
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
                  borderCollapse: "collapse",
                }}
              >
                <thead>
                  <tr>
                    <th>Application</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {applications.map(
                    (application) => (
                      <tr
                        key={application._id}
                      >
                        <td>
                          {application.applicationNumber ||
                            application._id}
                        </td>

                        <td>
                          {application.user?.name ||
                            "Unknown"}
                        </td>

                        <td>
                          {application.product?.name ||
                            "Unknown"}
                        </td>

                        <td>
                          <span
                            className={getStatusClass(
                              application.status
                            )}
                          >
                            {formatStatus(
                              application.status
                            )}
                          </span>
                        </td>

                        <td>
                          {application.createdAt
                            ? new Date(
                                application.createdAt
                              ).toLocaleDateString()
                            : "—"}
                        </td>

                        <td>
                          <button
                            type="button"
                            onClick={() =>
                              loadApplication(
                                application._id
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

  // ======================================================
  // APPLICATION DETAILS LOADING
  // ======================================================

  if (detailsLoading) {
    return (
      <section className="page-placeholder">
        <div className="container">
          <Loader2 size={32} />

          <p>
            Loading application details...
          </p>
        </div>
      </section>
    );
  }

  const application = selectedApplication;

  // ======================================================
  // APPLICATION DETAILS
  // ======================================================

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
            marginBottom: "1rem",
          }}
        >
          <ArrowLeft size={18} />

          Back to Applications
        </button>

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
            <h1>Application Details</h1>

            <p>
              {application.applicationNumber ||
                application._id}
            </p>
          </div>

          <span
            className={getStatusClass(
              application.status
            )}
          >
            {formatStatus(
              application.status
            )}
          </span>
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
          </h2>

          <p>
            <strong>Name:</strong>{" "}
            {application.user?.name ||
              "Not available"}
          </p>

          <p>
            <strong>Email:</strong>{" "}
            {application.user?.email ||
              "Not available"}
          </p>

          <p>
            <strong>Phone:</strong>{" "}
            {application.user?.phone ||
              "Not available"}
          </p>

          <p>
            <strong>County:</strong>{" "}
            {application.user?.county ||
              "Not available"}
          </p>

          {application.user?.nationalId && (
            <p>
              <strong>National ID:</strong>{" "}
              {application.user.nationalId}
            </p>
          )}
        </div>

        {/* ==================================================
            APPLICATION INFORMATION
        ================================================== */}

        <div
          style={{
            marginBottom: "1.5rem",
          }}
        >
          <h2>
            <FileText size={20} /> Application
          </h2>

          <p>
            <strong>Application Number:</strong>{" "}
            {application.applicationNumber ||
              application._id}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {formatStatus(
              application.status
            )}
          </p>

          <p>
            <strong>Created:</strong>{" "}
            {application.createdAt
              ? new Date(
                  application.createdAt
                ).toLocaleString()
              : "Not available"}
          </p>

          {application.product && (
            <>
              <p>
                <strong>Product:</strong>{" "}
                {application.product.name ||
                  "Not available"}
              </p>

              {application.product
                .description && (
                <p>
                  <strong>
                    Product Description:
                  </strong>{" "}
                  {
                    application.product
                      .description
                  }
                </p>
              )}
            </>
          )}
        </div>

        {/* ==================================================
            QUOTE
        ================================================== */}

        {application.quote && (
          <div
            style={{
              marginBottom: "1.5rem",
            }}
          >
            <h2>Quote</h2>

            <p>
              <strong>
                Estimated Premium:
              </strong>{" "}
              KES{" "}
              {Number(
                application.quote
                  .estimatedPremium || 0
              ).toLocaleString()}
            </p>

            <p>
              <strong>
                Quote Status:
              </strong>{" "}
              {formatStatus(
                application.quote.status
              )}
            </p>
          </div>
        )}

        {/* ==================================================
            INFORMATION REQUEST
        ================================================== */}

        {application.informationRequest && (
          <div
            style={{
              marginBottom: "1.5rem",
              padding: "1rem",
              borderRadius: "8px",
              background: "#fef3c7",
            }}
          >
            <h2>
              <MessageSquare size={20} />{" "}
              Information Requested
            </h2>

            <p>
              {application.informationRequest}
            </p>

            {application.informationRequestedAt && (
              <small>
                Requested on{" "}
                {new Date(
                  application.informationRequestedAt
                ).toLocaleString()}
              </small>
            )}
          </div>
        )}

        {/* ==================================================
            DECISION HISTORY
        ================================================== */}

        <div
          style={{
            marginBottom: "1.5rem",
          }}
        >
          <h2>Decision History</h2>

          {!application.decisionHistory ||
          application.decisionHistory.length ===
            0 ? (
            <p>
              No decision history yet.
            </p>
          ) : (
            <div>
              {[
                ...application.decisionHistory,
              ]
                .reverse()
                .map(
                  (entry, index) => (
                    <div
                      key={
                        entry._id ||
                        index
                      }
                      style={{
                        padding:
                          "0.75rem",
                        marginBottom:
                          "0.75rem",
                        border:
                          "1px solid #ddd",
                        borderRadius:
                          "8px",
                      }}
                    >
                      <strong>
                        {entry.action ||
                          "Application update"}
                      </strong>

                      <p>
                        Status:{" "}
                        {formatStatus(
                          entry.status
                        )}
                      </p>

                      {entry.notes && (
                        <p>
                          Notes:{" "}
                          {entry.notes}
                        </p>
                      )}

                      <small>
                        {entry.createdAt
                          ? new Date(
                              entry.createdAt
                            ).toLocaleString()
                          : ""}
                      </small>
                    </div>
                  )
                )}
            </div>
          )}
        </div>

        {/* ==================================================
            UPDATE APPLICATION
        ================================================== */}

        <div>
          <h2>Update Application</h2>

          <div
            style={{
              display: "grid",
              gap: "1rem",
              maxWidth: "700px",
            }}
          >
            <label>
              Status

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value
                  )
                }
                style={{
                  display: "block",
                  width: "100%",
                  padding: "0.75rem",
                  marginTop: "0.4rem",
                }}
              >
                <option value="">
                  Select status
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="under_review">
                  Under Review
                </option>

                <option value="information_requested">
                  Information Requested
                </option>

                <option value="escalated">
                  Escalated
                </option>

                <option value="approved">
                  Approved
                </option>

                <option value="rejected">
                  Rejected
                </option>
              </select>
            </label>

            {status ===
              "information_requested" && (
              <label>
                Information Request

                <textarea
                  value={
                    informationRequest
                  }
                  onChange={(event) =>
                    setInformationRequest(
                      event.target.value
                    )
                  }
                  placeholder="Describe the additional information required..."
                  rows={4}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "0.75rem",
                    marginTop: "0.4rem",
                  }}
                />
              </label>
            )}

            <label>
              Notes

              <textarea
                value={notes}
                onChange={(event) =>
                  setNotes(
                    event.target.value
                  )
                }
                placeholder="Add an application note..."
                rows={4}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "0.75rem",
                  marginTop: "0.4rem",
                }}
              />
            </label>

            <button
              type="button"
              onClick={handleUpdate}
              disabled={saving}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.75rem 1rem",
              }}
            >
              {saving ? (
                <Loader2 size={18} />
              ) : (
                <CheckCircle size={18} />
              )}

              {saving
                ? "Saving..."
                : "Update Application"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AgentApplicationsPage;