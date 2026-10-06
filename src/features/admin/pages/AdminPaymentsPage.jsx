import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  Eye,
  FileText,
  Phone,
  Search,
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
      return <CheckCircle2 size={16} />;

    case 'failed':
      return <XCircle size={16} />;

    case 'pending':
    default:
      return <Clock3 size={16} />;
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

  const numericAmount = Number(amount);

  if (Number.isNaN(numericAmount)) {
    return '—';
  }

  return `Ksh ${numericAmount.toLocaleString('en-KE')}`;
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

function getCustomerName(payment) {
  return (
    payment.user?.name ||
    payment.user?.fullName ||
    [payment.user?.firstName, payment.user?.lastName]
      .filter(Boolean)
      .join(' ') ||
    'Customer'
  );
}

function getPolicyNumber(payment) {
  return (
    payment.policy?.policyNumber ||
    payment.policyNumber ||
    '—'
  );
}

function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadPayments = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/payments');

        if (cancelled) {
          return;
        }

        const data = response.data;

        if (Array.isArray(data)) {
          setPayments(data);
        } else if (Array.isArray(data?.payments)) {
          setPayments(data.payments);
        } else {
          setPayments([]);
        }
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError.response?.data?.message ||
            'Unable to load payments.',
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

  const filteredPayments = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return payments.filter((payment) => {
      const matchesStatus =
        statusFilter === 'all' ||
        payment.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!search) {
        return true;
      }

      const searchableText = [
        payment._id,
        payment.phone,
        payment.mpesaReceipt,
        payment.checkoutRequestID,
        payment.merchantRequestID,
        payment.user?.name,
        payment.user?.fullName,
        payment.user?.firstName,
        payment.user?.lastName,
        payment.user?.email,
        payment.policy?.policyNumber,
        payment.policy?.product?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(search);
    });
  }, [payments, searchTerm, statusFilter]);

  const successfulPayments = payments.filter(
    (payment) => payment.status === 'success',
  );

  const pendingPayments = payments.filter(
    (payment) => payment.status === 'pending',
  );

  const failedPayments = payments.filter(
    (payment) => payment.status === 'failed',
  );

  const successfulAmount = successfulPayments.reduce(
    (total, payment) =>
      total + Number(payment.amount || 0),
    0,
  );

  if (loading) {
    return <LoadingState message="Loading payments..." />;
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

            <h1>Payments</h1>

            <p>
              Review customer premium payments and
              M-PESA transaction details.
            </p>
          </div>

          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              gap: '0.75rem',
            }}
          >
            <CreditCard size={24} />

            <strong>
              {payments.length} payment
              {payments.length === 1 ? '' : 's'}
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

        <div
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(180px, 1fr))',
            marginTop: '2rem',
          }}
        >
          <Card>
            <span className="eyebrow">
              TOTAL PAYMENTS
            </span>

            <h2 style={{ marginTop: '0.5rem' }}>
              {payments.length}
            </h2>
          </Card>

          <Card>
            <span className="eyebrow">
              SUCCESSFUL
            </span>

            <h2 style={{ marginTop: '0.5rem' }}>
              {successfulPayments.length}
            </h2>
          </Card>

          <Card>
            <span className="eyebrow">
              PENDING
            </span>

            <h2 style={{ marginTop: '0.5rem' }}>
              {pendingPayments.length}
            </h2>
          </Card>

          <Card>
            <span className="eyebrow">
              FAILED
            </span>

            <h2 style={{ marginTop: '0.5rem' }}>
              {failedPayments.length}
            </h2>
          </Card>

          <Card>
            <span className="eyebrow">
              SUCCESSFUL AMOUNT
            </span>

            <h2 style={{ marginTop: '0.5rem' }}>
              {formatCurrency(successfulAmount)}
            </h2>
          </Card>
        </div>

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
                placeholder="Search payments..."
                aria-label="Search payments"
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
              aria-label="Filter payments by status"
            >
              <option value="all">
                All statuses
              </option>

              <option value="success">
                Successful
              </option>

              <option value="pending">
                Pending
              </option>

              <option value="failed">
                Failed
              </option>
            </select>
          </div>
        </Card>

        {filteredPayments.length === 0 ? (
          <Card style={{ marginTop: '1.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <CreditCard size={40} />

              <h2>
                No payments found
              </h2>

              <p>
                There are no payments matching the
                current search and status filter.
              </p>
            </div>
          </Card>
        ) : (
          <Card style={{ marginTop: '1.5rem' }}>
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  borderCollapse: 'collapse',
                  width: '100%',
                }}
              >
                <thead>
                  <tr>
                    <th>Payment</th>
                    <th>Customer</th>
                    <th>Policy</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>M-PESA Receipt</th>
                    <th>Phone</th>
                    <th>Date</th>
                    <th>Action</th>

                  </tr>
                </thead>

                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment._id}>
                      <td>
                        <strong>
                          {payment._id
                            ? payment._id.slice(-8)
                            : '—'}
                        </strong>
                      </td>

                      <td>
                        <strong>
                          {getCustomerName(payment)}
                        </strong>

                        {payment.user?.email && (
                          <div
                            style={{
                              fontSize: '0.85rem',
                              marginTop: '0.25rem',
                            }}
                          >
                            {payment.user.email}
                          </div>
                        )}
                      </td>

                      <td>
                        {payment.policy?._id ? (
                          <Link
                            to={`/admin/policies/${payment.policy._id}`}
                          >
                            {getPolicyNumber(payment)}
                          </Link>
                        ) : (
                          getPolicyNumber(payment)
                        )}
                      </td>

                      <td>
                        {formatCurrency(payment.amount)}
                      </td>

                      <td>
                        <span
                          className={getStatusClass(
                            payment.status,
                          )}
                        >
                          {getStatusIcon(
                            payment.status,
                          )}

                          <span>
                            {getStatusLabel(
                              payment.status,
                            )}
                          </span>
                        </span>
                      </td>

                      <td>
                        {payment.mpesaReceipt || '—'}
                      </td>

                      <td>
                        <span
                          style={{
                            alignItems: 'center',
                            display: 'inline-flex',
                            gap: '0.35rem',
                          }}
                        >
                          <Phone size={14} />

                          {payment.phone || '—'}
                        </span>
                      </td>

                      <td>
                        {formatDateTime(
                          payment.paidAt ||
                            payment.createdAt,
                        )}
                      </td>

                      <Link
  className="button button--ghost"
  to={`/admin/payments/${payment._id}`}
>
  <Eye size={16} />
  View
</Link>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {filteredPayments.length > 0 && (
          <Card style={{ marginTop: '1.5rem' }}>
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                gap: '0.75rem',
              }}
            >
              <FileText size={20} />

              <div>
                <strong>
                  Showing {filteredPayments.length} of{' '}
                  {payments.length} payments
                </strong>

                <p
                  style={{
                    marginBottom: 0,
                    marginTop: '0.25rem',
                  }}
                >
                  Successful payments show the recorded
                  M-PESA receipt when available.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </section>
  );
}

export default AdminPaymentsPage;