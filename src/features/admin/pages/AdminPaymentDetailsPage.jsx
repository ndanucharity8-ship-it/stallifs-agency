import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  Phone,
  UserRound,
  XCircle,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

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

    case 'failed':
      return 'application-status application-status--rejected';

    case 'pending':
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
    default:
      return <Clock3 size={18} />;
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

function AdminPaymentDetailsPage() {
  const { paymentId } = useParams();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(Boolean(paymentId));
  const [error, setError] = useState(
    paymentId ? '' : 'No payment was provided.',
  );

  useEffect(() => {
    if (!paymentId) {
      return undefined;
    }

    let cancelled = false;

    const loadPayment = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/payments');

        if (cancelled) {
          return;
        }

        const payments = Array.isArray(response.data)
          ? response.data
          : [];

        const foundPayment = payments.find(
          (item) => item._id === paymentId,
        );

        if (!foundPayment) {
          setError('The requested payment could not be found.');
          setPayment(null);
          return;
        }

        setPayment(foundPayment);
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError.response?.data?.message ||
            'Unable to load payment.',
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPayment();

    return () => {
      cancelled = true;
    };
  }, [paymentId]);

  if (loading) {
    return <LoadingState message="Loading payment..." />;
  }

  if (error || !payment) {
    return (
      <section className="page-placeholder">
        <div className="container">
          <Card>
            <CreditCard size={40} />

            <h1>Unable to load payment</h1>

            <p>
              {error ||
                'The requested payment could not be found.'}
            </p>

            <Link
              className="button button--secondary"
              style={{ marginTop: '1rem' }}
              to="/admin/payments"
            >
              <ArrowLeft size={18} />
              Back to Payments
            </Link>
          </Card>
        </div>
      </section>
    );
  }

  const customer = payment.user || {};
  const policy = payment.policy || {};

  return (
    <section className="page-placeholder">
      <div className="container">
        <div className="hero__actions">
          <Link
            className="button button--ghost"
            to="/admin/payments"
          >
            <ArrowLeft size={18} />
            Back to Payments
          </Link>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <span className="eyebrow">PAYMENT DETAILS</span>

          <h1>
            Payment {payment._id?.slice(-8) || '—'}
          </h1>

          <p>
            Review the customer, policy, amount, M-PESA
            transaction, and payment timeline.
          </p>
        </div>

        <Card style={{ marginTop: '2rem' }}>
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.5rem',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span className="eyebrow">
                PAYMENT STATUS
              </span>

              <div style={{ marginTop: '0.5rem' }}>
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
            </div>

            <div>
              <span className="eyebrow">
                AMOUNT
              </span>

              <div style={{ marginTop: '0.5rem' }}>
                <strong style={{ fontSize: '1.25rem' }}>
                  {formatCurrency(payment.amount)}
                </strong>
              </div>
            </div>
          </div>
        </Card>

        <div
          style={{
            display: 'grid',
            gap: '1.5rem',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(300px, 1fr))',
            marginTop: '1.5rem',
          }}
        >
          <Card>
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                gap: '0.75rem',
              }}
            >
              <UserRound size={24} />

              <span className="eyebrow">
                CUSTOMER
              </span>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <p>
                <strong>Name</strong>
                <br />
                {customer.name ||
                  customer.fullName ||
                  '—'}
              </p>

              <p>
                <strong>Email</strong>
                <br />
                {customer.email || '—'}
              </p>

              <p>
                <strong>Phone</strong>
                <br />
                {customer.phone || '—'}
              </p>

              <p>
                <strong>User ID</strong>
                <br />
                {customer._id || '—'}
              </p>
            </div>
          </Card>

          <Card>
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                gap: '0.75rem',
              }}
            >
              <FileText size={24} />

              <span className="eyebrow">
                POLICY
              </span>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <p>
                <strong>Policy number</strong>
                <br />

                {policy._id ? (
                  <Link
                    to={`/admin/policies/${policy._id}`}
                  >
                    {policy.policyNumber || policy._id}
                  </Link>
                ) : (
                  '—'
                )}
              </p>

              <p>
                <strong>Premium</strong>
                <br />
                {formatCurrency(
                  policy.premiumAmount,
                )}
              </p>

              <p>
                <strong>Policy status</strong>
                <br />
                {policy.status || '—'}
              </p>

              <p>
                <strong>Policy ID</strong>
                <br />
                {policy._id || '—'}
              </p>
            </div>
          </Card>
        </div>

        <Card style={{ marginTop: '1.5rem' }}>
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              gap: '0.75rem',
            }}
          >
            <CreditCard size={24} />

            <span className="eyebrow">
              PAYMENT INFORMATION
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(220px, 1fr))',
              marginTop: '1rem',
            }}
          >
            <div>
              <span className="eyebrow">
                AMOUNT
              </span>

              <p style={{ marginTop: '0.35rem' }}>
                <strong>
                  {formatCurrency(payment.amount)}
                </strong>
              </p>
            </div>

            <div>
              <span className="eyebrow">
                PHONE
              </span>

              <p style={{ marginTop: '0.35rem' }}>
                <Phone
                  size={16}
                  style={{
                    marginRight: '0.35rem',
                    verticalAlign: 'middle',
                  }}
                />

                {payment.phone || '—'}
              </p>
            </div>

            <div>
              <span className="eyebrow">
                METHOD
              </span>

              <p style={{ marginTop: '0.35rem' }}>
                {payment.method || 'M-PESA'}
              </p>
            </div>

            <div>
              <span className="eyebrow">
                PAYMENT ID
              </span>

              <p style={{ marginTop: '0.35rem' }}>
                {payment._id || '—'}
              </p>
            </div>
          </div>
        </Card>

        <Card style={{ marginTop: '1.5rem' }}>
          <span className="eyebrow">
            M-PESA TRANSACTION
          </span>

          <div
            style={{
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(250px, 1fr))',
              marginTop: '1rem',
            }}
          >
            <div>
              <span className="eyebrow">
                M-PESA RECEIPT
              </span>

              <p style={{ marginTop: '0.35rem' }}>
                <strong>
                  {payment.mpesaReceipt || '—'}
                </strong>
              </p>
            </div>

            <div>
              <span className="eyebrow">
                CHECKOUT REQUEST ID
              </span>

              <p
                style={{
                  marginTop: '0.35rem',
                  overflowWrap: 'anywhere',
                }}
              >
                {payment.checkoutRequestID || '—'}
              </p>
            </div>

            <div>
              <span className="eyebrow">
                MERCHANT REQUEST ID
              </span>

              <p
                style={{
                  marginTop: '0.35rem',
                  overflowWrap: 'anywhere',
                }}
              >
                {payment.merchantRequestID || '—'}
              </p>
            </div>
          </div>
        </Card>

        <Card style={{ marginTop: '1.5rem' }}>
          <span className="eyebrow">
            PAYMENT TIMELINE
          </span>

          <div style={{ marginTop: '1rem' }}>
            <p>
              <strong>Created</strong>
              <br />
              {formatDateTime(payment.createdAt)}
            </p>

            <p>
              <strong>Last updated</strong>
              <br />
              {formatDateTime(payment.updatedAt)}
            </p>

            <p>
              <strong>Paid at</strong>
              <br />
              {formatDateTime(payment.paidAt)}
            </p>

            <p>
              <strong>Failed at</strong>
              <br />
              {formatDateTime(payment.failedAt)}
            </p>

            {payment.failureReason && (
              <div
                style={{
                  background:
                    'var(--color-surface-muted)',
                  border:
                    '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  marginTop: '1rem',
                  padding: '1rem',
                }}
              >
                <strong>
                  Failure reason
                </strong>

                <p style={{ marginTop: '0.5rem' }}>
                  {payment.failureReason}
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card style={{ marginTop: '1.5rem' }}>
          <span className="eyebrow">
            COMMISSION
          </span>

          <div
            style={{
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(220px, 1fr))',
              marginTop: '1rem',
            }}
          >
            <div>
              <span className="eyebrow">
                COMMISSION RATE
              </span>

              <p style={{ marginTop: '0.35rem' }}>
                {payment.commissionRate ?? 10}%
              </p>
            </div>

            <div>
              <span className="eyebrow">
                COMMISSION AMOUNT
              </span>

              <p style={{ marginTop: '0.35rem' }}>
                {formatCurrency(
                  payment.commissionAmount,
                )}
              </p>
            </div>

            <div>
              <span className="eyebrow">
                COMMISSION PAID
              </span>

              <p style={{ marginTop: '0.35rem' }}>
                {payment.commissionPaid
                  ? 'Yes'
                  : 'No'}
              </p>
            </div>

            <div>
              <span className="eyebrow">
                COMMISSION PAID AT
              </span>

              <p style={{ marginTop: '0.35rem' }}>
                {formatDateTime(
                  payment.commissionPaidAt,
                )}
              </p>
            </div>
          </div>
        </Card>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginTop: '1.5rem',
          }}
        >
          <Link
            className="button button--secondary"
            to="/admin/payments"
          >
            <ArrowLeft size={18} />
            Back to Payments
          </Link>

          {policy._id && (
            <Link
              className="button button--ghost"
              to={`/admin/policies/${policy._id}`}
            >
              <FileText size={18} />
              View Policy
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminPaymentDetailsPage;