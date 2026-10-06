import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import api from '../../../shared/api/axios';
import Card from '../../../shared/components/Card/Card';
import LoadingState from '../../../shared/components/LoadingState/LoadingState';

const STATUS_OPTIONS = [
  'all',
  'pending',
  'under_review',
  'information_requested',
  'escalated',
  'approved',
  'rejected',
];

function getStatusLabel(status) {
  if (!status) {
    return 'Pending';
  }

  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusClass(status) {
  switch (status) {
    case 'approved':
      return 'application-status application-status--approved';

    case 'rejected':
      return 'application-status application-status--rejected';

    case 'information_requested':
      return 'application-status application-status--information';

    case 'under_review':
      return 'application-status application-status--review';

    case 'escalated':
      return 'application-status application-status--escalated';

    default:
      return 'application-status application-status--pending';
  }
}

function getStatusIcon(status) {
  switch (status) {
    case 'approved':
      return <CheckCircle2 size={16} />;

    case 'rejected':
      return <XCircle size={16} />;

    case 'information_requested':
      return <AlertCircle size={16} />;

    case 'under_review':
      return <RefreshCw size={16} />;

    case 'escalated':
      return <AlertCircle size={16} />;

    default:
      return <Clock3 size={16} />;
  }
}

function formatDate(date) {
  if (!date) {
    return '—';
  }

  return new Date(date).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(amount) {
  if (
    amount === undefined ||
    amount === null ||
    amount === ''
  ) {
    return 'Premium pending';
  }

  return `Ksh ${Number(amount).toLocaleString('en-KE')}`;
}

function AdminApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadApplications = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/applications');

        if (cancelled) {
          return;
        }

        setApplications(
          Array.isArray(response.data)
            ? response.data
            : [],
        );
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError.response?.data?.message ||
            'Unable to load applications.',
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadApplications();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredApplications = applications.filter(
    (application) => {
      const matchesStatus =
        statusFilter === 'all' ||
        application.status === statusFilter;

      const search = searchTerm
        .trim()
        .toLowerCase();

      if (!search) {
        return matchesStatus;
      }

      const searchableText = [
        application.applicationNumber,
        application.fullName,
        application.phone,
        application.nationalId,
        application.user?.name,
        application.user?.email,
        application.product?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return (
        matchesStatus &&
        searchableText.includes(search)
      );
    },
  );

  if (loading) {
    return (
      <LoadingState message="Loading applications..." />
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
              ADMINISTRATION
            </span>

            <h1>Applications</h1>

            <p>
              Review customer applications and make
              underwriting decisions.
            </p>
          </div>

          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              gap: '0.75rem',
            }}
          >
            <FileText size={24} />

            <strong>
              {applications.length} application
              {applications.length === 1 ? '' : 's'}
            </strong>
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

        <Card style={{ marginTop: '2rem' }}>
          <div
            style={{
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns:
                'minmax(220px, 1fr) minmax(180px, 220px)',
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
                placeholder="Search applications..."
                aria-label="Search applications"
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
              aria-label="Filter applications by status"
            >
              {STATUS_OPTIONS.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status === 'all'
                    ? 'All statuses'
                    : getStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>
        </Card>

        <div
          style={{
            display: 'grid',
            gap: '1rem',
            marginTop: '1.5rem',
          }}
        >
          {filteredApplications.length === 0 ? (
            <Card>
              <div style={{ textAlign: 'center' }}>
                <FileText size={36} />

                <h2>No applications found</h2>

                <p>
                  There are no applications matching the
                  current search and status filter.
                </p>
              </div>
            </Card>
          ) : (
            filteredApplications.map((application) => {
              const premium =
                application.quote?.estimatedPremium ??
                application.estimatedPremium;

              return (
                <Card key={application._id}>
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
                        {application.applicationNumber ||
                          'APPLICATION'}
                      </span>

                      <h2
                        style={{
                          marginBottom: '0.35rem',
                        }}
                      >
                        {application.fullName ||
                          application.user?.name ||
                          'Customer'}
                      </h2>

                      <p style={{ margin: 0 }}>
                        {application.product?.name ||
                          'Insurance Product'}
                      </p>
                    </div>

                    <span
                      className={getStatusClass(
                        application.status,
                      )}
                    >
                      {getStatusIcon(
                        application.status,
                      )}

                      <span>
                        {getStatusLabel(
                          application.status,
                        )}
                      </span>
                    </span>
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

                      <p style={{ marginTop: '0.35rem' }}>
                        {application.user?.email ||
                          '—'}
                      </p>
                    </div>

                    <div>
                      <span className="eyebrow">
                        PHONE
                      </span>

                      <p style={{ marginTop: '0.35rem' }}>
                        {application.phone || '—'}
                      </p>
                    </div>

                    <div>
                      <span className="eyebrow">
                        ESTIMATED PREMIUM
                      </span>

                      <p style={{ marginTop: '0.35rem' }}>
                        {formatCurrency(premium)}
                      </p>
                    </div>

                    <div>
                      <span className="eyebrow">
                        SUBMITTED
                      </span>

                      <p style={{ marginTop: '0.35rem' }}>
                        {formatDate(
                          application.createdAt,
                        )}
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
                      to={`/admin/applications/${application._id}`}
                    >
                      <Eye size={18} />
                      Review Application
                    </Link>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminApplicationsPage;