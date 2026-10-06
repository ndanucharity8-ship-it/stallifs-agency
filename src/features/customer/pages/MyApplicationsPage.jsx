import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  XCircle,
} from 'lucide-react';

import api from '../../../shared/api/axios';
import Card from '../../../shared/components/Card/Card';
import LoadingState from '../../../shared/components/LoadingState/LoadingState';

function getStatusLabel(status) {
  if (!status) {
    return 'Pending';
  }

  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusIcon(status) {
  switch (status) {
    case 'approved':
      return <CheckCircle2 size={18} />;

    case 'rejected':
      return <XCircle size={18} />;

    case 'information_requested':
      return <FileText size={18} />;

    case 'under_review':
    case 'escalated':
      return <RefreshCw size={18} />;

    default:
      return <Clock3 size={18} />;
  }
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

function formatDate(date) {
  if (!date) {
    return '—';
  }

  return new Date(date).toLocaleDateString('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(amount) {
  if (amount === undefined || amount === null || amount === '') {
    return 'Premium pending';
  }

  return `Ksh ${Number(amount).toLocaleString('en-KE')}`;
}

function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/applications/my');

      setApplications(
        Array.isArray(response.data) ? response.data : [],
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to load your applications.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchApplications = async () => {
      try {
        const response = await api.get('/applications/my');

        if (cancelled) {
          return;
        }

        setApplications(
          Array.isArray(response.data) ? response.data : [],
        );
        setError('');
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError.response?.data?.message ||
            'Unable to load your applications.',
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchApplications();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <LoadingState message="Loading your applications..." />;
  }

  return (
    <section className="page-placeholder">
      <div className="container">
        <div className="hero__actions">
          <div>
            <span className="eyebrow">MY INSURANCE JOURNEY</span>

            <h1>My Applications</h1>

            <p>
              Track your insurance applications and follow their progress
              from submission through review and approval.
            </p>
          </div>

          <Link
            className="button button--primary"
            to="/quote"
          >
            Get a New Quote
            <ArrowRight size={18} />
          </Link>
        </div>

        {error && (
          <Card>
            <div
              className="auth-form__error"
              role="alert"
            >
              <p>{error}</p>

              <button
                className="button button--secondary"
                type="button"
                onClick={loadApplications}
              >
                Try Again
                <RefreshCw size={18} />
              </button>
            </div>
          </Card>
        )}

        {!error && applications.length === 0 && (
          <Card>
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                padding: '3rem 2rem',
                textAlign: 'center',
              }}
            >
              <FileText size={44} />

              <div>
                <h2>No applications yet</h2>

                <p>
                  You have not submitted an insurance application yet.
                  Start by getting a quote for the cover you need.
                </p>
              </div>

              <Link
                className="button button--primary"
                to="/quote"
              >
                Start With a Quote
                <ArrowRight size={18} />
              </Link>
            </div>
          </Card>
        )}

        {!error && applications.length > 0 && (
          <div
            style={{
              display: 'grid',
              gap: '1.25rem',
              marginTop: '2rem',
            }}
          >
            {applications.map((application) => {
              const premium =
                application.quote?.estimatedPremium ??
                application.estimatedPremium;

              return (
                <Card key={application._id}>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '1.5rem',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <span className="eyebrow">
                        {application.applicationNumber ||
                          'APPLICATION'}
                      </span>

                      <h2>
                        {application.product?.name ||
                          'Insurance Application'}
                      </h2>

                      <p>
                        Submitted{' '}
                        <strong>
                          {formatDate(application.createdAt)}
                        </strong>
                      </p>
                    </div>

                    <div
                      className={getStatusClass(
                        application.status,
                      )}
                    >
                      {getStatusIcon(application.status)}

                      <span>
                        {getStatusLabel(application.status)}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      borderTop:
                        '1px solid var(--color-border)',
                      display: 'grid',
                      gap: '1rem',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(180px, 1fr))',
                      marginTop: '1.5rem',
                      paddingTop: '1.5rem',
                    }}
                  >
                    <div>
                      <span className="eyebrow">
                        PREMIUM
                      </span>

                      <p>
                        <strong>
                          {formatCurrency(premium)}
                        </strong>
                      </p>
                    </div>

                    <div>
                      <span className="eyebrow">
                        RISK LEVEL
                      </span>

                      <p>
                        <strong>
                          {application.riskLevel
                            ? getStatusLabel(
                                application.riskLevel,
                              )
                            : 'Pending assessment'}
                        </strong>
                      </p>
                    </div>

                    <div>
                      <span className="eyebrow">
                        AGENT
                      </span>

                      <p>
                        <strong>
                          {application.assignedAgent?.name ||
                            'Not assigned'}
                        </strong>
                      </p>
                    </div>
                  </div>

                  {application.status ===
                    'information_requested' &&
                    application.informationRequest && (
                      <div
                        style={{
                          background:
                            'var(--color-surface-muted)',
                          border:
                            '1px solid var(--color-border)',
                          borderRadius:
                            'var(--radius-md)',
                          marginTop: '1.5rem',
                          padding: '1rem',
                        }}
                      >
                        <strong>
                          Additional information required
                        </strong>

                        <p>
                          {application.informationRequest}
                        </p>
                      </div>
                    )}

                  <div
                    style={{
                      alignItems: 'center',
                      borderTop:
                        '1px solid var(--color-border)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      justifyContent: 'space-between',
                      marginTop: '1.5rem',
                      paddingTop: '1.25rem',
                    }}
                  >
                    <div>
                      {application.approvedAt && (
                        <p>
                          Approved{' '}
                          <strong>
                            {formatDate(
                              application.approvedAt,
                            )}
                          </strong>
                        </p>
                      )}

                      {!application.approvedAt &&
                        application.rejectedAt && (
                          <p>
                            Decision made{' '}
                            <strong>
                              {formatDate(
                                application.rejectedAt,
                              )}
                            </strong>
                          </p>
                        )}

                      {!application.approvedAt &&
                        !application.rejectedAt && (
                          <p>
                            Application is currently{' '}
                            <strong>
                              {getStatusLabel(
                                application.status,
                              )}
                            </strong>
                            .
                          </p>
                        )}
                    </div>

                    <Link
                      className="button button--secondary"
                      to={`/applications/${application._id}`}
                    >
                      View Application
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default MyApplicationsPage;