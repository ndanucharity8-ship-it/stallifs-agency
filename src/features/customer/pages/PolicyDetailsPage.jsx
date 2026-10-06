import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  LoaderCircle,
  ShieldCheck,
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
      return <CheckCircle2 size={20} />;

    case 'expired':
    case 'cancelled':
      return <XCircle size={20} />;

    case 'pending_payment':
      return <Clock3 size={20} />;

    default:
      return <ShieldCheck size={20} />;
  }
}

function getPaymentStatusLabel(status) {
  switch (status) {
    case 'success':
      return 'Payment Successful';

    case 'failed':
      return 'Payment Failed';

    case 'pending':
      return 'Payment Pending';

    default:
      return 'Payment Status Unknown';
  }
}

function getPaymentStatusClass(status) {
  switch (status) {
    case 'success':
      return 'application-status application-status--approved';

    case 'failed':
      return 'application-status application-status--rejected';

    case 'pending':
      return 'application-status application-status--pending';

    default:
      return 'application-status application-status--pending';
  }
}

function getPaymentStatusIcon(status) {
  switch (status) {
    case 'success':
      return <CheckCircle2 size={20} />;

    case 'failed':
      return <XCircle size={20} />;

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

function getPaymentForPolicy(payments, policyId) {
  const matchingPayments = payments.filter(
    (payment) => {
      const paymentPolicyId =
        typeof payment.policy === 'object'
          ? payment.policy?._id
          : payment.policy;

      return (
        paymentPolicyId?.toString() ===
        policyId?.toString()
      );
    },
  );

  if (!matchingPayments.length) {
    return null;
  }

  return [...matchingPayments].sort(
    (firstPayment, secondPayment) => {
      const firstDate = new Date(
        firstPayment.createdAt || 0,
      ).getTime();

      const secondDate = new Date(
        secondPayment.createdAt || 0,
      ).getTime();

      return secondDate - firstDate;
    },
  )[0];
}

function PolicyDetailsPage() {
  const { policyId } = useParams();

  const [policy, setPolicy] = useState(null);
  const [payment, setPayment] = useState(null);

  const [loading, setLoading] = useState(
    Boolean(policyId),
  );

  const [error, setError] = useState(
    policyId ? '' : 'No policy was provided.',
  );

  const [phone, setPhone] = useState('');
  const [paymentLoading, setPaymentLoading] =
    useState(false);

  const [paymentMessage, setPaymentMessage] =
    useState('');

  const [paymentError, setPaymentError] =
    useState('');

  const [downloadLoading, setDownloadLoading] =
    useState('');

  const [downloadError, setDownloadError] =
    useState('');

  useEffect(() => {
    if (!policyId) {
      return undefined;
    }

    let cancelled = false;

    const loadPolicyAndPayment = async () => {
      try {
        setLoading(true);
        setError('');

        const [
          policyResponse,
          paymentsResponse,
        ] = await Promise.all([
          api.get(`/policies/my/${policyId}`),
          api.get('/payments/my'),
        ]);

        if (cancelled) {
          return;
        }

        const loadedPolicy =
          policyResponse.data;

        const paymentsData =
          Array.isArray(paymentsResponse.data)
            ? paymentsResponse.data
            : paymentsResponse.data?.payments ||
              [];

        const latestPayment =
          getPaymentForPolicy(
            paymentsData,
            policyId,
          );

        setPolicy(loadedPolicy);
        setPayment(latestPayment);

        setPhone(
          loadedPolicy.user?.phone ||
            latestPayment?.phone ||
            '',
        );

        if (
          latestPayment?.status === 'success'
        ) {
          setPaymentMessage(
            'Payment confirmed. Your policy is active.',
          );
        } else if (
          latestPayment?.status === 'failed'
        ) {
          setPaymentMessage(
            'The previous payment attempt failed. You can try again.',
          );
        } else if (
          latestPayment?.status === 'pending'
        ) {
          setPaymentMessage(
            'Payment is still being processed. Click "Check Payment Status" after completing the M-PESA prompt.',
          );
        }
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError.response?.data?.message ||
            'Unable to load your policy.',
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPolicyAndPayment();

    return () => {
      cancelled = true;
    };
  }, [policyId]);

  const handlePayPremium = async (event) => {
    event.preventDefault();

    if (!policyId) {
      setPaymentError(
        'No policy was provided.',
      );
      return;
    }

    if (!phone.trim()) {
      setPaymentError(
        'Enter the M-PESA phone number to use for payment.',
      );
      return;
    }

    try {
      setPaymentLoading(true);
      setPaymentError('');
      setPaymentMessage('');

      const response = await api.post(
        '/mpesa/stkpush',
        {
          policyId,
          phone: phone.trim(),
        },
      );

      const createdPayment =
        response.data?.payment;

      setPayment(createdPayment || null);

      setPaymentMessage(
        response.data?.message ||
          'STK Push sent. Complete payment on your phone, then click "Check Payment Status".',
      );
    } catch (requestError) {
      setPaymentError(
        requestError.response?.data?.message ||
          'Unable to initiate M-PESA payment.',
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleRefreshPayment = async () => {
    if (!policyId) {
      return;
    }

    try {
      setPaymentLoading(true);
      setPaymentError('');
      setPaymentMessage('');

      const [
        policyResponse,
        paymentsResponse,
      ] = await Promise.all([
        api.get(`/policies/my/${policyId}`),
        api.get('/payments/my'),
      ]);

      const updatedPolicy =
        policyResponse.data;

      const paymentsData =
        Array.isArray(paymentsResponse.data)
          ? paymentsResponse.data
          : paymentsResponse.data?.payments ||
            [];

      const latestPayment =
        getPaymentForPolicy(
          paymentsData,
          policyId,
        );

      setPolicy(updatedPolicy);
      setPayment(latestPayment);

      if (latestPayment?.status === 'success') {
        setPaymentMessage(
          'Payment confirmed. Your policy is now active.',
        );
      } else if (
        latestPayment?.status === 'failed'
      ) {
        setPaymentMessage(
          'Payment failed. You can try again.',
        );
      } else if (
        latestPayment?.status === 'pending'
      ) {
        setPaymentMessage(
          'The payment is still pending. If you completed the M-PESA prompt, wait a moment and check again.',
        );
      } else {
        setPaymentMessage(
          'No payment result is available yet.',
        );
      }
    } catch (requestError) {
      setPaymentError(
        requestError.response?.data?.message ||
          'Unable to refresh payment status.',
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  const downloadPdf = async ({
    endpoint,
    filename,
    type,
  }) => {
    try {
      setDownloadLoading(type);
      setDownloadError('');

      const response = await api.get(
        endpoint,
        {
          responseType: 'blob',
        },
      );

      const blob = new Blob(
        [response.data],
        {
          type:
            response.headers?.['content-type'] ||
            'application/pdf',
        },
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement('a');

      link.href = url;
      link.download = filename;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (requestError) {
      let message =
        'Unable to download the document.';

      if (
        requestError.response?.data instanceof Blob
      ) {
        try {
          const errorText =
            await requestError.response.data.text();

          const errorData =
            JSON.parse(errorText);

          message =
            errorData.message || message;
        } catch {
          // Keep default error message.
        }
      } else {
        message =
          requestError.response?.data?.message ||
          message;
      }

      setDownloadError(message);
    } finally {
      setDownloadLoading('');
    }
  };

  const handleDownloadPolicy = () => {
    if (!policyId) {
      return;
    }

    downloadPdf({
      endpoint: `/pdf/policy/${policyId}`,
      filename: `${policy?.policyNumber || 'Stallifs-Policy'}.pdf`,
      type: 'policy',
    });
  };

  const handleDownloadReceipt = () => {
    if (!payment?._id) {
      return;
    }

    downloadPdf({
      endpoint: `/pdf/payment/${payment._id}`,
      filename: `Receipt-${
        payment.mpesaReceipt ||
        payment._id
      }.pdf`,
      type: 'receipt',
    });
  };

  if (loading) {
    return (
      <LoadingState message="Loading your policy..." />
    );
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
              to="/policies"
            >
              <ArrowLeft size={18} />
              Back to Policies
            </Link>
          </Card>
        </div>
      </section>
    );
  }

  const isPaymentFailed =
    payment?.status === 'failed';

  const isPaymentSuccessful =
    payment?.status === 'success';

  const isPaymentPending =
    payment?.status === 'pending';

  return (
    <section className="page-placeholder">
      <div className="container">
        <div className="hero__actions">
          <Link
            className="button button--ghost"
            to="/policies"
          >
            <ArrowLeft size={18} />
            Back to Policies
          </Link>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <span className="eyebrow">
            {policy.policyNumber}
          </span>

          <h1>
            {policy.product?.name ||
              'Insurance Policy'}
          </h1>

          <p>
            View your policy coverage, premium, dates,
            assigned agent, payment status, and current
            policy status.
          </p>
        </div>

        <Card style={{ marginTop: '2rem' }}>
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
                    {getStatusLabel(
                      policy.status,
                    )}
                  </span>
                </span>
              </div>
            </div>

            <div>
              <span className="eyebrow">
                POLICY NUMBER
              </span>

              <strong>
                {policy.policyNumber}
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
                padding: '1.25rem',
              }}
            >
              {isPaymentFailed ? (
                <>
                  <div
                    style={{
                      alignItems: 'center',
                      display: 'flex',
                      gap: '0.5rem',
                    }}
                  >
                    <XCircle size={22} />

                    <strong>
                      Payment Failed
                    </strong>
                  </div>

                  <p
                    style={{
                      marginTop: '0.5rem',
                    }}
                  >
                    {payment.failureReason ||
                      'The M-PESA payment was not completed.'}
                  </p>

                  <p
                    style={{
                      marginTop: '0.5rem',
                    }}
                  >
                    Your policy is still awaiting
                    payment. You can try again below.
                  </p>
                </>
              ) : isPaymentPending ? (
                <>
                  <div
                    style={{
                      alignItems: 'center',
                      display: 'flex',
                      gap: '0.5rem',
                    }}
                  >
                    <Clock3 size={22} />

                    <strong>
                      Payment Pending
                    </strong>
                  </div>

                  <p
                    style={{
                      marginTop: '0.5rem',
                    }}
                  >
                    An M-PESA payment request has
                    been sent. Complete the payment
                    on your phone.
                  </p>
                </>
              ) : (
                <>
                  <strong>
                    Premium payment required
                  </strong>

                  <p
                    style={{
                      marginTop: '0.5rem',
                    }}
                  >
                    This policy has been issued and is
                    awaiting premium payment. Complete
                    the M-PESA payment below to activate
                    your policy.
                  </p>
                </>
              )}

              <form
                onSubmit={handlePayPremium}
                style={{ marginTop: '1rem' }}
              >
                <label
                  htmlFor="mpesa-phone"
                  style={{
                    display: 'block',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                  }}
                >
                  M-PESA phone number
                </label>

                <input
                  id="mpesa-phone"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="0712345678"
                  autoComplete="tel"
                  disabled={paymentLoading}
                  style={{
                    border:
                      '1px solid var(--color-border)',
                    borderRadius:
                      'var(--radius-md)',
                    boxSizing: 'border-box',
                    padding: '0.75rem 1rem',
                    width: '100%',
                  }}
                />

                <p
                  style={{
                    fontSize: '0.9rem',
                    marginTop: '0.5rem',
                  }}
                >
                  Premium amount:{' '}
                  <strong>
                    {formatCurrency(
                      policy.premiumAmount,
                    )}
                  </strong>
                </p>

                {paymentError && (
                  <p
                    role="alert"
                    style={{
                      marginTop: '0.75rem',
                    }}
                  >
                    {paymentError}
                  </p>
                )}

                {paymentMessage && (
                  <p
                    role="status"
                    style={{
                      marginTop: '0.75rem',
                    }}
                  >
                    {paymentMessage}
                  </p>
                )}

                {isPaymentSuccessful ? (
                  <div
                    style={{
                      marginTop: '1rem',
                    }}
                  >
                    <span
                      className={getPaymentStatusClass(
                        payment.status,
                      )}
                    >
                      {getPaymentStatusIcon(
                        payment.status,
                      )}

                      <span>
                        {getPaymentStatusLabel(
                          payment.status,
                        )}
                      </span>
                    </span>
                  </div>
                ) : (
                  <div
                    className="hero__actions"
                    style={{
                      marginTop: '1rem',
                    }}
                  >
                    <button
                      className="button button--primary"
                      type="submit"
                      disabled={paymentLoading}
                    >
                      {paymentLoading ? (
                        <>
                          <LoaderCircle
                            size={18}
                            className="spin"
                          />
                          Sending STK Push...
                        </>
                      ) : (
                        'Pay Premium'
                      )}
                    </button>

                    {isPaymentPending && (
                      <button
                        className="button button--secondary"
                        type="button"
                        onClick={
                          handleRefreshPayment
                        }
                        disabled={paymentLoading}
                      >
                        {paymentLoading
                          ? 'Checking...'
                          : 'Check Payment Status'}
                      </button>
                    )}
                  </div>
                )}
              </form>

              {isPaymentFailed &&
                payment.failureReason && (
                  <div
                    style={{
                      marginTop: '1rem',
                    }}
                  >
                    <strong>
                      Failure reason
                    </strong>

                    <p
                      style={{
                        marginTop: '0.35rem',
                      }}
                    >
                      {payment.failureReason}
                    </p>
                  </div>
                )}

              {payment?.failedAt && (
                <p
                  style={{
                    fontSize: '0.9rem',
                    marginTop: '0.75rem',
                  }}
                >
                  Failed on:{' '}
                  {formatDateTime(
                    payment.failedAt,
                  )}
                </p>
              )}
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
                padding: '1.25rem',
              }}
            >
              <div
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  gap: '0.5rem',
                }}
              >
                <CheckCircle2 size={22} />

                <strong>
                  Your policy is active
                </strong>
              </div>

              <p
                style={{
                  marginTop: '0.5rem',
                }}
              >
                Your premium payment has been
                confirmed and your policy is currently
                active.
              </p>

              {isPaymentSuccessful && (
                <p
                  style={{
                    marginTop: '0.75rem',
                  }}
                >
                  Payment received:{' '}
                  <strong>
                    {formatCurrency(
                      payment.amount,
                    )}
                  </strong>
                </p>
              )}

              {/* DOWNLOAD ACTIONS */}
              <div
                className="hero__actions"
                style={{
                  marginTop: '1.25rem',
                }}
              >
                <button
                  className="button button--primary"
                  type="button"
                  onClick={handleDownloadPolicy}
                  disabled={
                    downloadLoading === 'policy'
                  }
                >
                  {downloadLoading === 'policy' ? (
                    <>
                      <LoaderCircle
                        size={18}
                        className="spin"
                      />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download size={18} />
                      Download Policy
                    </>
                  )}
                </button>

                {isPaymentSuccessful &&
                  payment?._id && (
                    <button
                      className="button button--secondary"
                      type="button"
                      onClick={
                        handleDownloadReceipt
                      }
                      disabled={
                        downloadLoading === 'receipt'
                      }
                    >
                      {downloadLoading ===
                      'receipt' ? (
                        <>
                          <LoaderCircle
                            size={18}
                            className="spin"
                          />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <FileText size={18} />
                          Download Receipt
                        </>
                      )}
                    </button>
                  )}
              </div>

              {downloadError && (
                <p
                  role="alert"
                  style={{
                    marginTop: '0.75rem',
                  }}
                >
                  {downloadError}
                </p>
              )}
            </div>
          )}
        </Card>

        {payment && (
          <Card
            style={{
              marginTop: '1.5rem',
            }}
          >
            <span className="eyebrow">
              LATEST PAYMENT
            </span>

            <div
              style={{
                marginTop: '1rem',
              }}
            >
              <p>
                <strong>Status</strong>
                <br />

                <span
                  className={getPaymentStatusClass(
                    payment.status,
                  )}
                  style={{
                    marginTop: '0.4rem',
                  }}
                >
                  {getPaymentStatusIcon(
                    payment.status,
                  )}

                  <span>
                    {getPaymentStatusLabel(
                      payment.status,
                    )}
                  </span>
                </span>
              </p>

              <p>
                <strong>Amount</strong>
                <br />
                {formatCurrency(payment.amount)}
              </p>

              <p>
                <strong>Phone</strong>
                <br />
                {payment.phone || '—'}
              </p>

              <p>
                <strong>Initiated</strong>
                <br />
                {formatDateTime(
                  payment.createdAt,
                )}
              </p>

              {payment.paidAt && (
                <p>
                  <strong>Paid at</strong>
                  <br />
                  {formatDateTime(
                    payment.paidAt,
                  )}
                </p>
              )}

              {payment.failedAt && (
                <p>
                  <strong>Failed at</strong>
                  <br />
                  {formatDateTime(
                    payment.failedAt,
                  )}
                </p>
              )}

              {payment.mpesaReceipt && (
                <p>
                  <strong>M-PESA receipt</strong>
                  <br />
                  {payment.mpesaReceipt}
                </p>
              )}

              {payment.failureReason && (
                <p>
                  <strong>Failure reason</strong>
                  <br />
                  {payment.failureReason}
                </p>
              )}

              {/* RECEIPT DOWNLOAD */}
              {isPaymentSuccessful &&
                payment._id && (
                  <div
                    className="hero__actions"
                    style={{
                      marginTop: '1rem',
                    }}
                  >
                    <button
                      className="button button--secondary"
                      type="button"
                      onClick={
                        handleDownloadReceipt
                      }
                      disabled={
                        downloadLoading === 'receipt'
                      }
                    >
                      {downloadLoading ===
                      'receipt' ? (
                        <>
                          <LoaderCircle
                            size={18}
                            className="spin"
                          />
                          Downloading Receipt...
                        </>
                      ) : (
                        <>
                          <Download size={18} />
                          Download Payment Receipt
                        </>
                      )}
                    </button>
                  </div>
                )}
            </div>
          </Card>
        )}

        <div
          style={{
            display: 'grid',
            gap: '1.5rem',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(280px, 1fr))',
            marginTop: '1.5rem',
          }}
        >
          <Card>
            <span className="eyebrow">
              POLICY INFORMATION
            </span>

            <div style={{ marginTop: '1rem' }}>
              <p>
                <strong>Policy number</strong>
                <br />
                {policy.policyNumber}
              </p>

              <p>
                <strong>Product</strong>
                <br />
                {policy.product?.name ||
                  'Insurance Product'}
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
                {formatDateTime(
                  policy.createdAt,
                )}
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
                <strong>Renewal reminder</strong>
                <br />
                {policy.renewalReminderSent
                  ? 'Sent'
                  : 'Not sent'}
              </p>
            </div>
          </Card>

          <Card>
            <span className="eyebrow">
              ASSIGNED AGENT
            </span>

            <div style={{ marginTop: '1rem' }}>
              <p>
                <strong>Name</strong>
                <br />
                {policy.agent?.name ||
                  'Not assigned'}
              </p>

              <p>
                <strong>Phone</strong>
                <br />
                {policy.agent?.phone || '—'}
              </p>

              <p>
                <strong>Email</strong>
                <br />
                {policy.agent?.email || '—'}
              </p>

              <p>
                <strong>County</strong>
                <br />
                {policy.agent?.county || '—'}
              </p>
            </div>
          </Card>
        </div>

        <Card style={{ marginTop: '1.5rem' }}>
          <span className="eyebrow">
            APPLICATION
          </span>

          <p style={{ marginTop: '1rem' }}>
            <strong>Application number</strong>
            <br />
            {policy.application
              ?.applicationNumber || '—'}
          </p>

          {policy.application?._id && (
            <Link
              className="button button--secondary"
              style={{ marginTop: '1rem' }}
              to={`/applications/${policy.application._id}`}
            >
              View Application
            </Link>
          )}
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

export default PolicyDetailsPage;