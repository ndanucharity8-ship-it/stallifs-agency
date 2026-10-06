import { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
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
      return <CheckCircle2 size={18} />;

    case 'expired':
    case 'cancelled':
      return <XCircle size={18} />;

    case 'pending_payment':
    case 'pending':
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

function AdminPoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadPolicies = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/policies');

        if (cancelled) {
          return;
        }

        const data = response.data;

        if (Array.isArray(data)) {
          setPolicies(data);
        } else if (Array.isArray(data?.policies)) {
          setPolicies(data.policies);
        } else {
          setPolicies([]);
        }
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError.response?.data?.message ||
            'Unable to load policies.',
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
    return <LoadingState message="Loading policies..." />;
  }

  return (
    <section className="page-placeholder">
      <div className="container">
        <div style={{ marginTop: '1rem' }}>
          <span className="eyebrow">ADMINISTRATION</span>

          <h1>Policies</h1>

          <p>
            Review all insurance policies, payment status,
            customers, products, and assigned agents.
          </p>
        </div>

        {error && (
          <Card style={{ marginTop: '1.5rem' }}>
            <p>{error}</p>
          </Card>
        )}

        {!error && policies.length === 0 && (
          <Card style={{ marginTop: '2rem' }}>
            <FileText size={40} />

            <h2 style={{ marginTop: '1rem' }}>
              No policies found
            </h2>

            <p>
              Policies will appear here when applications
              are approved and policies are created.
            </p>
          </Card>
        )}

        {policies.length > 0 && (
          <Card style={{ marginTop: '2rem' }}>
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  borderCollapse: 'collapse',
                  width: '100%',
                }}
              >
                <thead>
                  <tr>
                    <th>Policy</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Premium</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Agent</th>
                    <th>Created</th>
                    <th />
                  </tr>
                </thead>

                <tbody>
                  {policies.map((policy) => {
                    const paymentSuccessful =
                      policy.payment?.status === 'success' ||
                      policy.paymentStatus === 'success';

                    return (
                      <tr key={policy._id}>
                        <td>
                          <strong>
                            {policy.policyNumber || '—'}
                          </strong>
                        </td>

                        <td>
                          {policy.user?.name ||
                            policy.user?.fullName ||
                            '—'}
                        </td>

                        <td>
                          {policy.product?.name || '—'}
                        </td>

                        <td>
                          {formatCurrency(
                            policy.premiumAmount,
                          )}
                        </td>

                        <td>
                          <span
                            className={getStatusClass(
                              policy.status,
                            )}
                          >
                            {getStatusIcon(
                              policy.status,
                            )}

                            <span>
                              {getStatusLabel(
                                policy.status,
                              )}
                            </span>
                          </span>
                        </td>

                        <td>
                          {paymentSuccessful ? (
                            <span
                              className="application-status application-status--approved"
                            >
                              <CheckCircle2 size={16} />
                              Paid
                            </span>
                          ) : (
                            <span
                              className="application-status application-status--pending"
                            >
                              <Clock3 size={16} />
                              Unpaid
                            </span>
                          )}
                        </td>

                        <td>
                          {policy.agent?.name ||
                            'Not assigned'}
                        </td>

                        <td>
                          {formatDate(
                            policy.createdAt,
                          )}
                        </td>

                        <td>
                          <Link
                            className="button button--ghost"
                            to={`/admin/policies/${policy._id}`}
                          >
                            View
                            <ArrowRight size={16} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </section>
  );
}

export default AdminPoliciesPage;