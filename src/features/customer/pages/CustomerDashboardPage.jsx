import { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  ShieldCheck,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import api from '../../../shared/api/axios';
import Card from '../../../shared/components/Card/Card';
import LoadingState from '../../../shared/components/LoadingState/LoadingState';
import { useAuth } from '../../../app/providers/useAuth';

function formatCurrency(amount) {
  if (
    amount === undefined ||
    amount === null ||
    amount === ''
  ) {
    return '—';
  }

  return `Ksh ${Number(amount).toLocaleString('en-KE')}`;
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

function getStatusLabel(status) {
  if (!status) {
    return 'Pending';
  }

  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getApplicationStatusClass(status) {
  switch (status) {
    case 'approved':
      return 'application-status application-status--approved';

    case 'rejected':
      return 'application-status application-status--rejected';

    case 'information_requested':
      return 'application-status application-status--information';

    case 'under_review':
    case 'escalated':
      return 'application-status application-status--review';

    default:
      return 'application-status application-status--pending';
  }
}

function getPolicyStatusClass(status) {
  switch (status) {
    case 'active':
      return 'application-status application-status--approved';

    case 'pending_payment':
      return 'application-status application-status--pending';

    case 'suspended':
      return 'application-status application-status--information';

    case 'expired':
    case 'cancelled':
      return 'application-status application-status--rejected';

    default:
      return 'application-status application-status--pending';
  }
}

function CustomerDashboardPage() {
  const { user, loading: authLoading } = useAuth();

  const [applications, setApplications] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) {
      return undefined;
    }

    let cancelled = false;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const [
          applicationsResponse,
          policiesResponse,
        ] = await Promise.all([
          api.get('/applications/my'),
          api.get('/policies/my'),
        ]);

        if (cancelled) {
          return;
        }

        setApplications(
          Array.isArray(applicationsResponse.data)
            ? applicationsResponse.data
            : [],
        );

        setPolicies(
          Array.isArray(policiesResponse.data)
            ? policiesResponse.data
            : [],
        );
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError.response?.data?.message ||
            'Unable to load your dashboard.',
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [authLoading]);

  if (authLoading || loading) {
    return (
      <LoadingState message="Loading your dashboard..." />
    );
  }

  const pendingPayments = policies.filter(
    (policy) =>
      policy.status === 'pending_payment',
  ).length;

  const activePolicies = policies.filter(
    (policy) =>
      policy.status === 'active',
  ).length;

  const informationRequested = applications.filter(
    (application) =>
      application.status === 'information_requested',
  );

  const recentApplications = applications.slice(0, 3);
  const recentPolicies = policies.slice(0, 3);

  const firstPendingPaymentPolicy =
    policies.find(
      (policy) =>
        policy.status === 'pending_payment',
    );

  const customerName =
    user?.name ||
    user?.fullName ||
    'Customer';

  return (
    <section className="page-placeholder">
      <div className="container">

        {/* =====================================================
            WELCOME
        ====================================================== */}

        <div
          style={{
            alignItems: 'flex-end',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            justifyContent: 'space-between',
            marginBottom: '2rem',
          }}
        >
          <div>
            <span className="eyebrow">
              MY INSURANCE
            </span>

            <h1>
              Welcome back, {customerName}
            </h1>

            <p>
              Manage your insurance, track your
              applications, and stay protected with
              STALLIFS.
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

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <Card style={{ marginBottom: '1.5rem' }}>
            <div
              className="auth-form__error"
              role="alert"
            >
              <AlertCircle size={20} />

              <p>{error}</p>
            </div>
          </Card>
        )}

        {/* =====================================================
            OVERVIEW
        ====================================================== */}

        <div
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(210px, 1fr))',
          }}
        >
          <Card>
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                gap: '1rem',
              }}
            >
              <FileText size={28} />

              <div>
                <span className="eyebrow">
                  APPLICATIONS
                </span>

                <h2 style={{ margin: 0 }}>
                  {applications.length}
                </h2>
              </div>
            </div>

            <Link
              to="/applications"
              style={{
                alignItems: 'center',
                display: 'inline-flex',
                gap: '0.35rem',
                marginTop: '1rem',
              }}
            >
              View Applications
              <ArrowRight size={16} />
            </Link>
          </Card>

          <Card>
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                gap: '1rem',
              }}
            >
              <ShieldCheck size={28} />

              <div>
                <span className="eyebrow">
                  POLICIES
                </span>

                <h2 style={{ margin: 0 }}>
                  {policies.length}
                </h2>
              </div>
            </div>

            <p style={{ marginTop: '0.75rem' }}>
              {activePolicies} active
            </p>

            <Link
              to="/policies"
              style={{
                alignItems: 'center',
                display: 'inline-flex',
                gap: '0.35rem',
              }}
            >
              View Policies
              <ArrowRight size={16} />
            </Link>
          </Card>

          <Card>
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                gap: '1rem',
              }}
            >
              <CreditCard size={28} />

              <div>
                <span className="eyebrow">
                  PAYMENTS
                </span>

                <h2 style={{ margin: 0 }}>
                  {pendingPayments}
                </h2>
              </div>
            </div>

            <p style={{ marginTop: '0.75rem' }}>
              Pending payment
            </p>

            <Link
              to="/payments"
              style={{
                alignItems: 'center',
                display: 'inline-flex',
                gap: '0.35rem',
              }}
            >
              View Payments
              <ArrowRight size={16} />
            </Link>
          </Card>

          <Card>
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                gap: '1rem',
              }}
            >
              <CheckCircle2 size={28} />

              <div>
                <span className="eyebrow">
                  PROTECTION
                </span>

                <h2 style={{ margin: 0 }}>
                  {activePolicies}
                </h2>
              </div>
            </div>

            <p style={{ marginTop: '0.75rem' }}>
              Active policies
            </p>

            <Link
              to="/policies"
              style={{
                alignItems: 'center',
                display: 'inline-flex',
                gap: '0.35rem',
              }}
            >
              Manage Protection
              <ArrowRight size={16} />
            </Link>
          </Card>
        </div>

        {/* =====================================================
            PAYMENT ALERT
        ====================================================== */}

        {firstPendingPaymentPolicy && (
          <Card
            style={{
              marginTop: '2rem',
            }}
          >
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
                  ACTION REQUIRED
                </span>

                <h2>
                  Premium payment required
                </h2>

                <p>
                  Your{' '}
                  <strong>
                    {firstPendingPaymentPolicy.product?.name ||
                      'insurance policy'}
                  </strong>{' '}
                  is awaiting premium payment.
                  Complete your M-PESA payment to
                  activate your policy.
                </p>

                <p>
                  Premium:{' '}
                  <strong>
                    {formatCurrency(
                      firstPendingPaymentPolicy.premiumAmount,
                    )}
                  </strong>
                </p>
              </div>

              <Link
                className="button button--primary"
                to={`/policies/${firstPendingPaymentPolicy._id}`}
              >
                Pay Premium
                <ArrowRight size={18} />
              </Link>
            </div>
          </Card>
        )}

        {/* =====================================================
            INFORMATION REQUEST
        ====================================================== */}

        {informationRequested.length > 0 && (
          <Card
            style={{
              marginTop: '1.5rem',
            }}
          >
            <div
              style={{
                alignItems: 'flex-start',
                display: 'flex',
                gap: '1rem',
              }}
            >
              <Clock3 size={24} />

              <div>
                <span className="eyebrow">
                  ACTION REQUIRED
                </span>

                <h2>
                  Additional information requested
                </h2>

                <p>
                  One or more of your applications
                  require additional information before
                  they can continue.
                </p>

                <Link
                  className="button button--secondary"
                  to={`/applications/${informationRequested[0]._id}/respond`}
                >
                  Respond Now
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* =====================================================
            QUICK ACTIONS
        ====================================================== */}

        <div style={{ marginTop: '2.5rem' }}>
          <span className="eyebrow">
            QUICK ACTIONS
          </span>

          <h2>
            What would you like to do?
          </h2>

          <div
            style={{
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(220px, 1fr))',
              marginTop: '1rem',
            }}
          >
            <Link
              className="button button--primary"
              to="/quote"
            >
              Get a New Quote
              <ArrowRight size={18} />
            </Link>

            <Link
              className="button button--secondary"
              to="/applications"
            >
              My Applications
              <ArrowRight size={18} />
            </Link>

            <Link
              className="button button--secondary"
              to="/policies"
            >
              My Policies
              <ArrowRight size={18} />
            </Link>

            <Link
              className="button button--secondary"
              to="/claims/new"
            >
              Make a Claim
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* =====================================================
            RECENT APPLICATIONS
        ====================================================== */}

        <div style={{ marginTop: '3rem' }}>
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div>
              <span className="eyebrow">
                INSURANCE JOURNEY
              </span>

              <h2>
                Recent Applications
              </h2>
            </div>

            <Link
              to="/applications"
              style={{
                alignItems: 'center',
                display: 'inline-flex',
                gap: '0.35rem',
              }}
            >
              View All
              <ArrowRight size={16} />
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <Card style={{ marginTop: '1rem' }}>
              <FileText size={32} />

              <h3>
                No applications yet
              </h3>

              <p>
                Start by getting an insurance quote.
              </p>

              <Link
                className="button button--primary"
                to="/quote"
              >
                Get a Quote
                <ArrowRight size={18} />
              </Link>
            </Card>
          ) : (
            <div
              style={{
                display: 'grid',
                gap: '1rem',
                marginTop: '1rem',
              }}
            >
              {recentApplications.map(
                (application) => {
                  const premium =
                    application.quote?.estimatedPremium ??
                    application.estimatedPremium;

                  return (
                    <Card key={application._id}>
                      <div
                        style={{
                          alignItems: 'center',
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

                          <h3>
                            {application.product?.name ||
                              'Insurance Application'}
                          </h3>

                          <p>
                            Submitted{' '}
                            {formatDate(
                              application.createdAt,
                            )}
                          </p>
                        </div>

                        <div
                          className={getApplicationStatusClass(
                            application.status,
                          )}
                        >
                          {getStatusLabel(
                            application.status,
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          alignItems: 'center',
                          borderTop:
                            '1px solid var(--color-border)',
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '1.5rem',
                          justifyContent: 'space-between',
                          marginTop: '1rem',
                          paddingTop: '1rem',
                        }}
                      >
                        <div>
                          <span className="eyebrow">
                            PREMIUM
                          </span>

                          <strong>
                            {formatCurrency(premium)}
                          </strong>
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
                },
              )}
            </div>
          )}
        </div>

        {/* =====================================================
            RECENT POLICIES
        ====================================================== */}

        <div style={{ marginTop: '3rem' }}>
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div>
              <span className="eyebrow">
                MY PROTECTION
              </span>

              <h2>
                Recent Policies
              </h2>
            </div>

            <Link
              to="/policies"
              style={{
                alignItems: 'center',
                display: 'inline-flex',
                gap: '0.35rem',
              }}
            >
              View All
              <ArrowRight size={16} />
            </Link>
          </div>

          {recentPolicies.length === 0 ? (
            <Card style={{ marginTop: '1rem' }}>
              <ShieldCheck size={32} />

              <h3>
                No policies yet
              </h3>

              <p>
                Your policies will appear here once
                an application has been approved.
              </p>
            </Card>
          ) : (
            <div
              style={{
                display: 'grid',
                gap: '1rem',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(300px, 1fr))',
                marginTop: '1rem',
              }}
            >
              {recentPolicies.map((policy) => (
                <Card key={policy._id}>
                  <div
                    style={{
                      alignItems: 'flex-start',
                      display: 'flex',
                      gap: '1rem',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <span className="eyebrow">
                        {policy.policyNumber}
                      </span>

                      <h3>
                        {policy.product?.name ||
                          'Insurance Policy'}
                      </h3>
                    </div>

                    <span
                      className={getPolicyStatusClass(
                        policy.status,
                      )}
                    >
                      {getStatusLabel(
                        policy.status,
                      )}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gap: '1rem',
                      gridTemplateColumns:
                        'repeat(2, minmax(0, 1fr))',
                      marginTop: '1.5rem',
                    }}
                  >
                    <div>
                      <span className="eyebrow">
                        PREMIUM
                      </span>

                      <strong>
                        {formatCurrency(
                          policy.premiumAmount,
                        )}
                      </strong>
                    </div>

                    <div>
                      <span className="eyebrow">
                        AGENT
                      </span>

                      <strong>
                        {policy.agent?.name ||
                          'Not assigned'}
                      </strong>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: '1.5rem',
                    }}
                  >
                    <Link
                      className="button button--secondary"
                      to={`/policies/${policy._id}`}
                    >
                      View Policy
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

export default CustomerDashboardPage;