import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  ShieldCheck,
  UserRound,
  XCircle,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import api from '../../../shared/api/axios';
import Card from '../../../shared/components/Card/Card';
import LoadingState from '../../../shared/components/LoadingState/LoadingState';

function getStatusLabel(status) {
  switch (status) {
    case 'pending_payment':
      return 'Pending Payment';

    case 'pending':
      return 'Pending';

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
    case 'pending':
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
      return <CheckCircle2 size={20} />;

    case 'expired':
    case 'cancelled':
      return <XCircle size={20} />;

    case 'pending_payment':
    case 'pending':
      return <Clock3 size={20} />;

    default:
      return <ShieldCheck size={20} />;
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

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return '—';
  }

  return parsedDate.toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
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

function AdminPolicyDetailsPage() {
  const { policyId } = useParams();

  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(Boolean(policyId));
  const [error, setError] = useState(
    policyId ? '' : 'No policy was provided.',
  );

  useEffect(() => {
    if (!policyId) {
      return undefined;
    }

    let cancelled = false;

    const loadPolicy = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get(
          `/policies/admin/${policyId}`,
        );

        if (cancelled) {
          return;
        }

        setPolicy(response.data);
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError.response?.data?.message ||
            'Unable to load policy.',
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPolicy();

    return () => {
      cancelled = true;
    };
  }, [policyId]);

  if (loading) {
    return <LoadingState message="Loading policy..." />;
  }

  if (error || !policy) {
    return (
      <section className="page-placeholder">
        <div className="container">
          <Card>
            <FileText size={40} />

            <h1>Unable to load policy</h1>

            <p>
              {error ||
                'The requested policy could not be found.'}
            </p>

            <Link
              className="button button--secondary"
              style={{ marginTop: '1rem' }}
              to="/admin/policies"
            >
              <ArrowLeft size={18} />
              Back to Policies
            </Link>
          </Card>
        </div>
      </section>
    );
  }

  const payment =
    policy.payment ||
    policy.latestPayment ||
    null;

  const paymentSuccessful =
    payment?.status === 'success' ||
    policy.paymentStatus === 'success';

  const paymentPending =
    payment?.status === 'pending' ||
    policy.paymentStatus === 'pending';

  return (
    <section className="page-placeholder">
      <div className="container">
        <div className="hero__actions">
          <Link
            className="button button--ghost"
            to="/admin/policies"
          >
            <ArrowLeft size={18} />
            Back to Policies
          </Link>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <span className="eyebrow">
            {policy.policyNumber || 'POLICY'}
          </span>

          <h1>
            {policy.product?.name ||
              'Insurance Policy'}
          </h1>

          <p>
            Review policy details, payment status,
            customer information, and assigned agent.
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
                POLICY STATUS
              </span>

              <div style={{ marginTop: '0.5rem' }}>
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
            </div>

            <div>
              <span className="eyebrow">
                POLICY NUMBER
              </span>

              <div style={{ marginTop: '0.5rem' }}>
                <strong>
                  {policy.policyNumber || '—'}
                </strong>
              </div>
            </div>
          </div>

          {policy.status === 'pending_payment' && (
            <div
              style={{
                background:
                  'var(--color-surface-muted)',
                border:
                  '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                marginTop: '1.5rem',
                padding: '1.25rem',
              }}
            >
              <strong>
                Awaiting customer payment
              </strong>

              <p style={{ marginTop: '0.5rem' }}>
                The application has been approved and the
                policy has been created, but the required
                premium payment has not been confirmed.
                The policy must remain pending until a
                successful M-PESA payment is recorded.
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
                borderRadius: 'var(--radius-md)',
                marginTop: '1.5rem',
                padding: '1.25rem',
              }}
            >
              <strong>
                Policy is active
              </strong>

              <p style={{ marginTop: '0.5rem' }}>
                This policy is currently marked as active.
                Payment information below shows whether a
                successful premium payment is recorded.
              </p>
            </div>
          )}
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
                {policy.user?.name ||
                  policy.user?.fullName ||
                  '—'}
              </p>

              <p>
                <strong>Email</strong>
                <br />
                {policy.user?.email || '—'}
              </p>

              <p>
                <strong>Phone</strong>
                <br />
                {policy.user?.phone || '—'}
              </p>

              <p>
                <strong>County</strong>
                <br />
                {policy.user?.county || '—'}
              </p>
            </div>
          </Card>

          <Card>
            <span className="eyebrow">
              POLICY INFORMATION
            </span>

            <div style={{ marginTop: '1rem' }}>
              <p>
                <strong>Policy number</strong>
                <br />
                {policy.policyNumber || '—'}
              </p>

              <p>
                <strong>Product</strong>
                <br />
                {policy.product?.name || '—'}
              </p>

              <p>
                <strong>Premium</strong>
                <br />
                {formatCurrency(
                  policy.premiumAmount,
                )}
              </p>

              <p>
                <strong>Created</strong>
                <br />
                {formatDateTime(policy.createdAt)}
              </p>
            </div>
          </Card>

          <Card>
            <span className="eyebrow">
              COVER PERIOD
            </span>

            <div style={{ marginTop: '1rem' }}>
              <p>
                <strong>Start date</strong>
                <br />
                {formatDate(policy.startDate)}
              </p>

              <p>
                <strong>End date</strong>
                <br />
                {formatDate(policy.endDate)}
              </p>

              <p>
                <strong>Commission rate</strong>
                <br />
                {policy.commissionRate ?? 10}%
              </p>

              <p>
                <strong>Commission paid</strong>
                <br />
                {policy.commissionPaid
                  ? 'Yes'
                  : 'No'}
              </p>
            </div>
          </Card>
        </div>

        <Card style={{ marginTop: '1.5rem' }}>
          <span className="eyebrow">
            PAYMENT
          </span>

          <div style={{ marginTop: '1rem' }}>
            <p>
              <strong>Payment status</strong>
              <br />

              {paymentSuccessful ? (
                <span className="application-status application-status--approved">
                  <CheckCircle2 size={16} />
                  Paid
                </span>
              ) : paymentPending ? (
                <span className="application-status application-status--pending">
                  <Clock3 size={16} />
                  Pending
                </span>
              ) : (
                <span className="application-status application-status--pending">
                  <Clock3 size={16} />
                  No successful payment recorded
                </span>
              )}
            </p>

            <p>
              <strong>Amount</strong>
              <br />
              {formatCurrency(
                payment?.amount ??
                  policy.premiumAmount,
              )}
            </p>

            <p>
              <strong>M-PESA receipt</strong>
              <br />
              {payment?.mpesaReceipt ||
                policy.mpesaReceipt ||
                '—'}
            </p>

            <p>
              <strong>Checkout request ID</strong>
              <br />
              {payment?.checkoutRequestID ||
                policy.checkoutRequestID ||
                '—'}
            </p>

            <p>
              <strong>Payment date</strong>
              <br />
              {formatDateTime(
                payment?.paidAt ||
                  payment?.updatedAt,
              )}
            </p>
          </div>
        </Card>

        <Card style={{ marginTop: '1.5rem' }}>
          <span className="eyebrow">
            ASSIGNED AGENT
          </span>

          {policy.agent ? (
            <div style={{ marginTop: '1rem' }}>
              <p>
                <strong>Name</strong>
                <br />
                {policy.agent.name || '—'}
              </p>

              <p>
                <strong>Agent code</strong>
                <br />
                {policy.agent.agentCode || '—'}
              </p>

              <p>
                <strong>Phone</strong>
                <br />
                {policy.agent.phone || '—'}
              </p>

              <p>
                <strong>Email</strong>
                <br />
                {policy.agent.email || '—'}
              </p>

              <p>
                <strong>County</strong>
                <br />
                {policy.agent.county || '—'}
              </p>
            </div>
          ) : (
            <p style={{ marginTop: '1rem' }}>
              No agent is currently assigned to this
              policy.
            </p>
          )}
        </Card>

        <Card style={{ marginTop: '1.5rem' }}>
          <span className="eyebrow">
            SOURCE APPLICATION
          </span>

          <div style={{ marginTop: '1rem' }}>
            <p>
              <strong>Application number</strong>
              <br />
              {policy.application?.applicationNumber ||
                '—'}
            </p>

            <p>
              <strong>Application status</strong>
              <br />
              {policy.application?.status ||
                '—'}
            </p>

            {policy.application?._id && (
              <Link
                className="button button--secondary"
                style={{ marginTop: '1rem' }}
                to={`/admin/applications/${policy.application._id}`}
              >
                View Application
              </Link>
            )}
          </div>
        </Card>

        {policy.notes && (
          <Card style={{ marginTop: '1.5rem' }}>
            <span className="eyebrow">
              POLICY NOTES
            </span>

            <p style={{ marginTop: '1rem' }}>
              {policy.notes}
            </p>
          </Card>
        )}
      </div>
    </section>
  );
}

export default AdminPolicyDetailsPage;