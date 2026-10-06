import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import api from '../../../shared/api/axios';
import Card from '../../../shared/components/Card/Card';
import LoadingState from '../../../shared/components/LoadingState/LoadingState';

function getStatusLabel(status) {
  switch (status) {
    case 'success':
      return 'Successful';

    case 'pending':
      return 'Pending';

    case 'failed':
      return 'Failed';

    default:
      return status || 'Unknown';
  }
}

function getStatusClass(status) {
  switch (status) {
    case 'success':
      return 'application-status application-status--approved';

    case 'pending':
      return 'application-status application-status--pending';

    case 'failed':
      return 'application-status application-status--rejected';

    default:
      return 'application-status application-status--pending';
  }
}

function getStatusIcon(status) {
  switch (status) {
    case 'success':
      return <CheckCircle2 size={18} />;

    case 'failed':
      return <XCircle size={18} />;

    case 'pending':
      return <Clock3 size={18} />;

    default:
      return <CreditCard size={18} />;
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

function formatDateTime(date) {
  if (!date) {
    return '—';
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return '—';
  }

  return parsedDate.toLocaleString('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function getPolicyNumber(policy) {
  if (!policy) {
    return 'Policy unavailable';
  }

  return policy.policyNumber || 'Policy';
}

function getProductName(policy) {
  if (!policy) {
    return 'Insurance Policy';
  }

  return policy.product?.name || 'Insurance Policy';
}

function MyPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadPayments = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/payments/my');

        if (cancelled) {
          return;
        }

        setPayments(
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
            'Unable to load your payment history.',
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPayments();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <LoadingState message="Loading your payment history..." />
    );
  }

  return (
    <section className="page-placeholder">
      <div className="container">
        <div style={{ marginTop: '1rem' }}>
          <span className="eyebrow">
            PAYMENT HISTORY
          </span>

          <h1>My Payments</h1>

          <p>
            View your premium payments, M-PESA receipts,
            payment status, and transaction details.
          </p>
        </div>

        {error && (
          <Card style={{ marginTop: '1.5rem' }}>
            <p role="alert">{error}</p>
          </Card>
        )}

        {!error && payments.length === 0 && (
          <Card style={{ marginTop: '2rem' }}>
            <CreditCard size={40} />

            <h2 style={{ marginTop: '1rem' }}>
              No payments yet
            </h2>

            <p>
              Your premium payment transactions will
              appear here once you make a payment.
            </p>

            <Link
              className="button button--primary"
              style={{ marginTop: '1rem' }}
              to="/policies"
            >
              View My Policies
            </Link>
          </Card>
        )}

        {!error && payments.length > 0 && (
          <div
            style={{
              display: 'grid',
              gap: '1.5rem',
              marginTop: '2rem',
            }}
          >
            {payments.map((payment) => (
              <Card key={payment._id}>
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
                      {getPolicyNumber(payment.policy)}
                    </span>

                    <h2
                      style={{
                        marginTop: '0.5rem',
                      }}
                    >
                      {getProductName(payment.policy)}
                    </h2>
                  </div>

                  <span
                    className={getStatusClass(
                      payment.status,
                    )}
                  >
                    {getStatusIcon(payment.status)}

                    <span>
                      {getStatusLabel(payment.status)}
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
                      AMOUNT
                    </span>

                    <strong>
                      {formatCurrency(payment.amount)}
                    </strong>
                  </div>

                  <div>
                    <span className="eyebrow">
                      PAYMENT DATE
                    </span>

                    <strong>
                      {formatDateTime(
                        payment.paidAt ||
                          payment.createdAt,
                      )}
                    </strong>
                  </div>

                  <div>
                    <span className="eyebrow">
                      PHONE
                    </span>

                    <strong>
                      {payment.phone || '—'}
                    </strong>
                  </div>

                  <div>
                    <span className="eyebrow">
                      M-PESA RECEIPT
                    </span>

                    <strong>
                      {payment.mpesaReceipt || '—'}
                    </strong>
                  </div>
                </div>

                {payment.status === 'pending' && (
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
                      Payment pending
                    </strong>

                    <p
                      style={{
                        marginTop: '0.5rem',
                      }}
                    >
                      Your M-PESA payment is still being
                      processed. Your policy will become
                      active after successful confirmation.
                    </p>
                  </div>
                )}

                {payment.status === 'success' && (
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
                      Payment confirmed
                    </strong>

                    <p
                      style={{
                        marginTop: '0.5rem',
                      }}
                    >
                      This payment has been successfully
                      received and recorded.
                    </p>
                  </div>
                )}

                {payment.status === 'failed' && (
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
                      Payment failed
                    </strong>

                    <p
                      style={{
                        marginTop: '0.5rem',
                      }}
                    >
                      {payment.failureReason ||
                        'The payment was not completed. Please try again from your policy page.'}
                    </p>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    marginTop: '1.5rem',
                  }}
                >
                  {payment.policy?._id && (
                    <Link
                      className="button button--secondary"
                      to={`/policies/${payment.policy._id}`}
                    >
                      <FileText size={18} />
                      View Policy
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default MyPaymentsPage;