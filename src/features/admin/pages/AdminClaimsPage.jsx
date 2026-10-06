import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Eye,
  FileWarning,
  Search,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import api from '../../../shared/api/axios';
import Card from '../../../shared/components/Card/Card';
import LoadingState from '../../../shared/components/LoadingState/LoadingState';

function getStatusLabel(status) {
  switch (status) {
    case 'submitted':
      return 'Submitted';

    case 'assigned':
      return 'Assigned';

    case 'under_review':
      return 'Under Review';

    case 'information_requested':
      return 'Information Requested';

    case 'escalated':
      return 'Escalated';

    case 'approved':
      return 'Approved';

    case 'rejected':
      return 'Rejected';

    case 'settled':
      return 'Settled';

    case 'closed':
      return 'Closed';

    default:
      return status || 'Unknown';
  }
}

function getStatusClass(status) {
  switch (status) {
    case 'approved':
    case 'settled':
      return 'application-status application-status--approved';

    case 'rejected':
    case 'closed':
      return 'application-status application-status--rejected';

    case 'information_requested':
    case 'escalated':
      return 'application-status application-status--information';

    case 'under_review':
    case 'assigned':
      return 'application-status application-status--review';

    case 'submitted':
    default:
      return 'application-status application-status--pending';
  }
}

function getStatusIcon(status) {
  switch (status) {
    case 'approved':
    case 'settled':
      return <CheckCircle2 size={16} />;

    case 'rejected':
    case 'closed':
      return <XCircle size={16} />;

    case 'information_requested':
    case 'escalated':
      return <AlertCircle size={16} />;

    case 'under_review':
    case 'assigned':
      return <Clock3 size={16} />;

    case 'submitted':
    default:
      return <Clock3 size={16} />;
  }
}

function formatDate(date) {
  if (!date) {
    return '—';
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return '—';
  }

  return parsedDate.toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getPolicyNumber(claim) {
  return (
    claim.policy?.policyNumber ||
    claim.policyNumber ||
    'Policy'
  );
}

function getCustomerName(claim) {
  return (
    claim.user?.name ||
    claim.user?.email ||
    'Customer'
  );
}

function getAgentName(claim) {
  return (
    claim.assignedAgent?.name ||
    claim.assignedAgent?.email ||
    'Unassigned'
  );
}

function AdminClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadClaims = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/claims');

        if (cancelled) {
          return;
        }

        const data = response.data;

        if (Array.isArray(data)) {
          setClaims(data);
        } else if (Array.isArray(data?.claims)) {
          setClaims(data.claims);
        } else {
          setClaims([]);
        }
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError.response?.data?.message ||
            'Unable to load claims.',
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadClaims();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredClaims = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return claims.filter((claim) => {
      const matchesStatus =
        statusFilter === 'all' ||
        claim.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!search) {
        return true;
      }

      const searchableText = [
        claim._id,
        claim.reason,
        claim.description,
        claim.user?.name,
        claim.user?.email,
        claim.policy?.policyNumber,
        claim.assignedAgent?.name,
        claim.assignedAgent?.email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(search);
    });
  }, [claims, searchTerm, statusFilter]);

  const submittedClaims = claims.filter(
    (claim) => claim.status === 'submitted',
  );

  const underReviewClaims = claims.filter(
    (claim) =>
      claim.status === 'under_review' ||
      claim.status === 'assigned',
  );

  const informationClaims = claims.filter(
    (claim) =>
      claim.status === 'information_requested' ||
      claim.status === 'escalated',
  );

  const approvedClaims = claims.filter(
    (claim) =>
      claim.status === 'approved' ||
      claim.status === 'settled',
  );

  const rejectedClaims = claims.filter(
    (claim) =>
      claim.status === 'rejected' ||
      claim.status === 'closed',
  );

  const fraudClaims = claims.filter(
    (claim) => claim.fraudFlag,
  );

  if (loading) {
    return (
      <LoadingState message="Loading claims..." />
    );
  }

  return (
    <section className="page-placeholder">
      <div className="container">
        <div
          style={{
            alignItems: 'flex-start',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span className="eyebrow">
              ADMIN CLAIMS
            </span>

            <h1>Claims Management</h1>

            <p>
              Review customer claims, monitor their
              status, and manage claim processing.
            </p>
          </div>
        </div>

        {error && (
          <Card style={{ marginTop: '1.5rem' }}>
            <div
              className="auth-form__error"
              role="alert"
            >
              {error}
            </div>
          </Card>
        )}

        <div
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(170px, 1fr))',
            marginTop: '2rem',
          }}
        >
          <Card>
            <span className="eyebrow">
              TOTAL CLAIMS
            </span>

            <h2 style={{ marginTop: '0.5rem' }}>
              {claims.length}
            </h2>
          </Card>

          <Card>
            <span className="eyebrow">
              SUBMITTED
            </span>

            <h2 style={{ marginTop: '0.5rem' }}>
              {submittedClaims.length}
            </h2>
          </Card>

          <Card>
            <span className="eyebrow">
              UNDER REVIEW
            </span>

            <h2 style={{ marginTop: '0.5rem' }}>
              {underReviewClaims.length}
            </h2>
          </Card>

          <Card>
            <span className="eyebrow">
              MORE INFORMATION
            </span>

            <h2 style={{ marginTop: '0.5rem' }}>
              {informationClaims.length}
            </h2>
          </Card>

          <Card>
            <span className="eyebrow">
              APPROVED
            </span>

            <h2 style={{ marginTop: '0.5rem' }}>
              {approvedClaims.length}
            </h2>
          </Card>

          <Card>
            <span className="eyebrow">
              REJECTED / CLOSED
            </span>

            <h2 style={{ marginTop: '0.5rem' }}>
              {rejectedClaims.length}
            </h2>
          </Card>

          <Card>
            <span className="eyebrow">
              FRAUD FLAGS
            </span>

            <h2 style={{ marginTop: '0.5rem' }}>
              {fraudClaims.length}
            </h2>
          </Card>
        </div>

        <Card style={{ marginTop: '2rem' }}>
          <div
            style={{
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns:
                'minmax(220px, 1fr) minmax(200px, 240px)',
            }}
          >
            <div style={{ position: 'relative' }}>
              <Search
                size={18}
                style={{
                  left: '0.75rem',
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search claims, customers, policies..."
                aria-label="Search claims"
                style={{
                  paddingLeft: '2.5rem',
                  width: '100%',
                }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              aria-label="Filter claims by status"
            >
              <option value="all">
                All statuses
              </option>

              <option value="submitted">
                Submitted
              </option>

              <option value="assigned">
                Assigned
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

              <option value="settled">
                Settled
              </option>

              <option value="closed">
                Closed
              </option>
            </select>
          </div>
        </Card>

        {filteredClaims.length === 0 ? (
          <Card style={{ marginTop: '1.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <FileWarning size={40} />

              <h2>No claims found</h2>

              <p>
                {claims.length === 0
                  ? 'There are currently no customer claims.'
                  : 'No claims match your current search and filter.'}
              </p>
            </div>
          </Card>
        ) : (
          <div
            style={{
              display: 'grid',
              gap: '1rem',
              marginTop: '1.5rem',
            }}
          >
            {filteredClaims.map((claim) => (
              <Card key={claim._id}>
                <div
                  style={{
                    alignItems: 'flex-start',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span className="eyebrow">
                      CLAIM {claim._id?.slice(-8)}
                    </span>

                    <h2
                      style={{
                        marginBottom: '0.35rem',
                      }}
                    >
                      {claim.reason ||
                        'Insurance Claim'}
                    </h2>

                    <p style={{ margin: 0 }}>
                      {getCustomerName(claim)}
                    </p>
                  </div>

                  <div
                    style={{
                      alignItems: 'center',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <span
                      className={getStatusClass(
                        claim.status,
                      )}
                    >
                      {getStatusIcon(claim.status)}

                      <span>
                        {getStatusLabel(
                          claim.status,
                        )}
                      </span>
                    </span>

                    {claim.fraudFlag && (
                      <span
                        className="application-status application-status--rejected"
                      >
                        <AlertCircle size={16} />
                        Fraud Flag
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gap: '1rem',
                    gridTemplateColumns:
                      'repeat(auto-fit, minmax(180px, 1fr))',
                    marginTop: '1.5rem',
                  }}
                >
                  <div>
                    <span className="eyebrow">
                      CUSTOMER
                    </span>

                    <p
                      style={{
                        marginTop: '0.35rem',
                      }}
                    >
                      {getCustomerName(claim)}
                    </p>
                  </div>

                  <div>
                    <span className="eyebrow">
                      POLICY
                    </span>

                    <p
                      style={{
                        marginTop: '0.35rem',
                      }}
                    >
                      {getPolicyNumber(claim)}
                    </p>
                  </div>

                  <div>
                    <span className="eyebrow">
                      SUBMITTED
                    </span>

                    <p
                      style={{
                        marginTop: '0.35rem',
                      }}
                    >
                      {formatDate(
                        claim.submittedAt ||
                          claim.createdAt,
                      )}
                    </p>
                  </div>

                  <div>
                    <span className="eyebrow">
                      ASSIGNED AGENT
                    </span>

                    <p
                      style={{
                        marginTop: '0.35rem',
                      }}
                    >
                      {getAgentName(claim)}
                    </p>
                  </div>

                  <div>
                    <span className="eyebrow">
                      DOCUMENTS
                    </span>

                    <p
                      style={{
                        marginTop: '0.35rem',
                      }}
                    >
                      {claim.documents?.length || 0}{' '}
                      document
                      {claim.documents?.length === 1
                        ? ''
                        : 's'}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: '1.5rem',
                  }}
                >
                  <Link
                    className="button button--primary"
                    to={`/admin/claims/${claim._id}`}
                  >
                    <Eye size={18} />
                    View Claim
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

        {filteredClaims.length > 0 && (
          <Card style={{ marginTop: '1.5rem' }}>
            <strong>
              Showing {filteredClaims.length} of{' '}
              {claims.length} claims
            </strong>
          </Card>
        )}
      </div>
    </section>
  );
}

export default AdminClaimsPage;