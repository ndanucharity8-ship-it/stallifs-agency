import { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import api from '../../../shared/api/axios';
import Card from '../../../shared/components/Card/Card';
import LoadingState from '../../../shared/components/LoadingState/LoadingState';

function getStatusLabel(status) {
  switch (status) {
    case 'pending_payment':
      return 'Pending Payment';

    case 'active':
      return 'Active';

    case 'suspended':
      return 'Suspended';

    case 'expired':
      return 'Expired';

    case 'cancelled':
      return 'Cancelled';

    default:
      return status || 'Unknown';
  }
}

function getStatusClass(status) {
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

function getStatusIcon(status) {
  switch (status) {
    case 'active':
      return <CheckCircle2 size={18} />;

    case 'expired':
    case 'cancelled':
      return <XCircle size={18} />;

    case 'pending_payment':
      return <Clock3 size={18} />;

    default:
      return <ShieldCheck size={18} />;
  }
}

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
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function MyPoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadPolicies = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/policies/my');

        if (cancelled) {
          return;
        }

        setPolicies(
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
            'Unable to load your policies.',
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPolicies();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <LoadingState message="Loading your policies..." />
    );
  }

  return (
    <section className="page-placeholder">
      <div className="container">
        <div style={{ marginTop: '1rem' }}>
          <span className="eyebrow">
            MY INSURANCE
          </span>

          <h1>My Policies</h1>

          <p>
            View your insurance policies, payment status,
            coverage details, and policy information.
          </p>
        </div>

        {error && (
          <Card style={{ marginTop: '1.5rem' }}>
            <p>{error}</p>
          </Card>
        )}

        {!error && policies.length === 0 && (
          <Card style={{ marginTop: '2rem' }}>
            <ShieldCheck size={40} />

            <h2 style={{ marginTop: '1rem' }}>
              No policies yet
            </h2>

            <p>
              Approved insurance applications will appear here
              once a policy has been created.
            </p>

            <Link
              className="button button--primary"
              style={{ marginTop: '1rem' }}
              to="/quote"
            >
              Get a New Quote
              <ArrowRight size={18} />
            </Link>
          </Card>
        )}

        {policies.length > 0 && (
          <div
            style={{
              display: 'grid',
              gap: '1.5rem',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(320px, 1fr))',
              marginTop: '2rem',
            }}
          >
            {policies.map((policy) => (
              <Card key={policy._id}>
                <div
                  style={{
                    alignItems: 'flex-start',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <span className="eyebrow">
                      {policy.policyNumber}
                    </span>

                    <h2 style={{ marginTop: '0.5rem' }}>
                      {policy.product?.name ||
                        'Insurance Policy'}
                    </h2>
                  </div>

                  <span
                    className={getStatusClass(
                      policy.status,
                    )}
                  >
                    {getStatusIcon(policy.status)}
                    <span>
                      {getStatusLabel(policy.status)}
                    </span>
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
                      START DATE
                    </span>

                    <strong>
                      {formatDate(policy.startDate)}
                    </strong>
                  </div>

                  <div>
                    <span className="eyebrow">
                      END DATE
                    </span>

                    <strong>
                      {formatDate(policy.endDate)}
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

                {policy.status === 'pending_payment' && (
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
                      Payment required
                    </strong>

                    <p style={{ marginTop: '0.5rem' }}>
                      Your policy is awaiting premium
                      payment. It will become active after
                      successful M-PESA payment.
                    </p>
                  </div>
                )}

                {policy.status === 'active' && (
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
                      Policy active
                    </strong>

                    <p style={{ marginTop: '0.5rem' }}>
                      Your policy is currently active.
                    </p>
                  </div>
                )}

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
    </section>
  );
}

export default MyPoliciesPage;