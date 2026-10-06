import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  RefreshCw,
  Search,
  UserPlus,
} from "lucide-react";

import {
  getAgentApplications,
} from "../../agent/api/agentApplicationApi";

function AdminAgentApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAgentApplications();

      setApplications(
        Array.isArray(data)
          ? data
          : data?.applications || []
      );
    } catch (err) {
      console.error(
        "Failed to load agent applications:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load agent applications."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadApplications();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadApplications]);

  const filteredApplications =
    applications.filter((application) => {
      const searchValue =
        search.trim().toLowerCase();

      if (!searchValue) {
        return true;
      }

      return [
        application.fullName,
        application.email,
        application.phone,
        application.county,
        application.status,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(searchValue)
        );
    });

  const getStatusClass = (status) => {
    return `status-badge status-badge--${status}`;
  };

  return (
    <section className="admin-page">
      <div className="container">
        <div className="admin-page__header">
          <div>
            <span className="eyebrow">
              AGENT RECRUITMENT
            </span>

            <h1>Agent Applications</h1>

            <p>
              Review and manage applications from
              people who want to become STALLIFS
              insurance agents.
            </p>
          </div>

          <button
            type="button"
            className="button button--secondary"
            onClick={loadApplications}
            disabled={loading}
          >
            <RefreshCw size={17} />

            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        <div className="admin-toolbar">
          <div className="search-field">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search applicants..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <div className="application-count">
            {filteredApplications.length} application
            {filteredApplications.length === 1
              ? ""
              : "s"}
          </div>
        </div>

        {error && (
          <div className="alert alert--error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="page-state">
            <p>Loading agent applications...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="empty-state">
            <UserPlus size={40} />

            <h2>No agent applications found</h2>

            <p>
              Submitted agent applications will
              appear here.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Contact</th>
                  <th>County</th>
                  <th>Experience</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredApplications.map(
                  (application) => (
                    <tr key={application._id}>
                      <td>
                        <div className="applicant-cell">
                          <strong>
                            {application.fullName}
                          </strong>

                          <span>
                            {application.email}
                          </span>
                        </div>
                      </td>

                      <td>
                        {application.phone}
                      </td>

                      <td>
                        {application.county ||
                          "—"}
                      </td>

                      <td>
                        {application.experience ||
                          "—"}
                      </td>

                      <td>
                        <span
                          className={getStatusClass(
                            application.status
                          )}
                        >
                          {application.status
                            ?.replace(
                              /_/g,
                              " "
                            )
                            .replace(
                              /\b\w/g,
                              (letter) =>
                                letter.toUpperCase()
                            )}
                        </span>
                      </td>

                      <td>
                        {application.createdAt
                          ? new Date(
                              application.createdAt
                            ).toLocaleDateString(
                              "en-KE"
                            )
                          : "—"}
                      </td>

                      <td>
                        <Link
                          className="button button--small"
                          to={`/admin/agent-applications/${application._id}`}
                        >
                          <Eye size={16} />
                          Review
                        </Link>
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

export default AdminAgentApplicationsPage;