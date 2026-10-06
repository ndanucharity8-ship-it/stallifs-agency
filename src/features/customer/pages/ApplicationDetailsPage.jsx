import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  Info,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

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
      return <CheckCircle2 size={20} />;

    case 'rejected':
      return <XCircle size={20} />;

    case 'information_requested':
      return <AlertCircle size={20} />;

    case 'under_review':
      return <RefreshCw size={20} />;

    case 'escalated':
      return <Info size={20} />;

    case 'pending':
    default:
      return <Clock3 size={20} />;
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

    case 'pending':
    default:
      return 'application-status application-status--pending';
  }
}

function getStatusMessage(status) {
  switch (status) {
    case 'approved':
      return 'Your application has been approved. Your policy can now be issued and managed from your customer account.';

    case 'rejected':
      return 'Your application was not approved. Please review the application timeline for the recorded decision information.';

    case 'information_requested':
      return 'The STALLIFS underwriting team needs additional information from you before your application can continue.';

    case 'under_review':
      return 'Your application is currently being reviewed by the STALLIFS underwriting team. No action is required from you at this time.';

    case 'escalated':
      return 'Your application has been escalated for additional review. No action is required from you unless STALLIFS requests more information.';

    case 'pending':
    default:
      return 'Your application has been received and is awaiting review.';
  }
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

function formatDateTime(date) {
  if (!date) {
    return '—';
  }

  return new Date(date).toLocaleString('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short',
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

function ApplicationDetailsPage() {
  const { applicationId } = useParams();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadApplication = async () => {
      if (!applicationId) {
        setError('No application was provided.');
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(
          `/applications/${applicationId}`,
        );

        if (cancelled) {
          return;
        }

        setApplication(response.data);
        setError('');
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError.response?.data?.message ||
            'Unable to load your application.',
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadApplication();

    return () => {
      cancelled = true;
    };
  }, [applicationId]);

  if (loading) {
    return (
      <LoadingState message="Loading your application..." />
    );
  }

  if (error || !application) {
    return (
      <section className="page-placeholder">
        <div className="container">
          <Card>
            <FileText size={36} />

            <h1>Unable to load application</h1>

            <p>
              {error ||
                'The requested application could not be found.'}
            </p>

            <div className="hero__actions">
              <Link
                className="button button--secondary"
                to="/applications"
              >
                <ArrowLeft size={18} />
                Back to Applications
              </Link>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  const productName =
    application.product?.name || 'Insurance Product';

  const premium =
    application.quote?.estimatedPremium ??
    application.estimatedPremium ??
    0;

  const timeline = Array.isArray(application.timeline)
    ? application.timeline
    : Array.isArray(application.decisionHistory)
      ? application.decisionHistory
      : [];

  const status = application.status || 'pending';

  return (
    <section className="page-placeholder">
      <div className="container">
        <div className="hero__actions">
          <Link
            className="button button--ghost"
            to="/applications"
          >
            <ArrowLeft size={18} />
            Back to Applications
          </Link>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <span className="eyebrow">
            {application.applicationNumber ||
              'INSURANCE APPLICATION'}
          </span>

          <h1>{productName}</h1>

          <p>
            Track the progress of your insurance application
            from submission through final decision.
          </p>
        </div>

        {/* STATUS JOURNEY */}
        <Card style={{ marginTop: '2rem' }}>
          <div
            style={{
              alignItems: 'flex-start',
              display: 'flex',
              gap: '1rem',
            }}
          >
            <div className={getStatusClass(status)}>
              {getStatusIcon(status)}

              <span>{getStatusLabel(status)}</span>
            </div>
          </div>

          <p style={{ marginTop: '1rem' }}>
            {getStatusMessage(status)}
          </p>

          {/* PENDING */}
          {status === 'pending' && (
            <div
              style={{
                background: 'var(--color-surface-muted)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                marginTop: '1.25rem',
                padding: '1.25rem',
              }}
            >
              <strong>Waiting for review</strong>

              <p style={{ marginTop: '0.5rem' }}>
                Your application has been submitted successfully.
                The underwriting team will begin reviewing it.
              </p>
            </div>
          )}

          {/* UNDER REVIEW */}
          {status === 'under_review' && (
            <div
              style={{
                background: 'var(--color-surface-muted)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                marginTop: '1.25rem',
                padding: '1.25rem',
              }}
            >
              <strong>Underwriting review in progress</strong>

              <p style={{ marginTop: '0.5rem' }}>
                The underwriting team is actively reviewing
                your application and the information provided.
              </p>
            </div>
          )}

          {/* INFORMATION REQUESTED */}
          {status === 'information_requested' && (
            <div
              style={{
                background: 'var(--color-surface-muted)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                marginTop: '1.25rem',
                padding: '1.25rem',
              }}
            >
              <div
                style={{
                  alignItems: 'flex-start',
                  display: 'flex',
                  gap: '0.75rem',
                }}
              >
                <AlertCircle size={22} />

                <div>
                  <strong>Action required</strong>

                  <p style={{ marginTop: '0.5rem' }}>
                    Please provide the requested information
                    so your application can continue through
                    underwriting review.
                  </p>

                  {application.informationRequest && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <span className="eyebrow">
                        INFORMATION REQUESTED
                      </span>

                      <p style={{ marginTop: '0.5rem' }}>
                        {application.informationRequest}
                      </p>
                    </div>
                  )}

                  <Link
                    className="button button--primary"
                    style={{ marginTop: '1rem' }}
                    to={`/applications/${application._id}/respond`}
                  >
                    Provide Information
                    <ArrowLeft
                      size={18}
                      style={{
                        transform: 'rotate(180deg)',
                      }}
                    />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ESCALATED */}
          {status === 'escalated' && (
            <div
              style={{
                background: 'var(--color-surface-muted)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                marginTop: '1.25rem',
                padding: '1.25rem',
              }}
            >
              <strong>Additional review required</strong>

              <p style={{ marginTop: '0.5rem' }}>
                Your application has been referred for additional
                underwriting review. You do not need to take any
                action unless STALLIFS contacts you.
              </p>
            </div>
          )}

          {/* APPROVED */}
          {status === 'approved' && (
            <div
              style={{
                background: 'var(--color-surface-muted)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                marginTop: '1.25rem',
                padding: '1.25rem',
              }}
            >
              <strong>Application approved</strong>

              <p style={{ marginTop: '0.5rem' }}>
                Your application has been approved. Your policy
                information will be available through your
                customer account.
              </p>

              <Link
                className="button button--secondary"
                style={{ marginTop: '1rem' }}
                to="/policies"
              >
                View My Policies
              </Link>
            </div>
          )}

          {/* REJECTED */}
          {status === 'rejected' && (
            <div
              style={{
                background: 'var(--color-surface-muted)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                marginTop: '1.25rem',
                padding: '1.25rem',
              }}
            >
              <strong>Application decision</strong>

              <p style={{ marginTop: '0.5rem' }}>
                Your application was not approved. Please review
                the timeline below for the recorded decision and
                any available notes.
              </p>
            </div>
          )}
        </Card>

        {/* SUMMARY */}
        <div
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(280px, 1fr))',
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
              <Clock3 size={24} />

              <div>
                <span className="eyebrow">
                  CURRENT STATUS
                </span>

                <div style={{ marginTop: '0.5rem' }}>
                  <span
                    className={getStatusClass(status)}
                  >
                    {getStatusIcon(status)}

                    <span>
                      {getStatusLabel(status)}
                    </span>
                  </span>
                </div>
              </div>
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
              <CheckCircle2 size={24} />

              <div>
                <span className="eyebrow">
                  ESTIMATED PREMIUM
                </span>

                <h2 style={{ marginBottom: 0 }}>
                  {formatCurrency(premium)}
                </h2>
              </div>
            </div>
          </Card>

          <Card>
            <div>
              <span className="eyebrow">
                APPLICATION NUMBER
              </span>

              <h2 style={{ marginBottom: 0 }}>
                {application.applicationNumber || '—'}
              </h2>
            </div>
          </Card>
        </div>

        {/* CUSTOMER INFORMATION */}
        <div
          style={{
            display: 'grid',
            gap: '1.5rem',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(320px, 1fr))',
            marginTop: '1.5rem',
          }}
        >
          <Card>
            <span className="eyebrow">
              CUSTOMER INFORMATION
            </span>

            <div style={{ marginTop: '1rem' }}>
              <p>
                <strong>Full name</strong>
                <br />
                {application.fullName || '—'}
              </p>

              <p>
                <strong>Phone number</strong>
                <br />
                {application.phone || '—'}
              </p>

              <p>
                <strong>National ID</strong>
                <br />
                {application.nationalId || '—'}
              </p>

              <p>
                <strong>Submitted</strong>
                <br />
                {formatDateTime(application.createdAt)}
              </p>
            </div>
          </Card>

          <Card>
            <span className="eyebrow">
              INSURANCE DETAILS
            </span>

            <div style={{ marginTop: '1rem' }}>
              <p>
                <strong>Product</strong>
                <br />
                {productName}
              </p>

              <p>
                <strong>Estimated premium</strong>
                <br />
                {formatCurrency(premium)}
              </p>

              <p>
                <strong>Quote created</strong>
                <br />
                {formatDate(application.quote?.createdAt)}
              </p>

              <p>
                <strong>Application submitted</strong>
                <br />
                {formatDate(application.createdAt)}
              </p>
            </div>
          </Card>
        </div>

        {/* ADDITIONAL INFORMATION */}
        {application.additionalInfo && (
          <Card style={{ marginTop: '1.5rem' }}>
            <span className="eyebrow">
              ADDITIONAL INFORMATION
            </span>

            <p style={{ marginTop: '1rem' }}>
              {application.additionalInfo}
            </p>
          </Card>
        )}

        {/* TIMELINE */}
        <Card style={{ marginTop: '1.5rem' }}>
          <span className="eyebrow">
            APPLICATION TIMELINE
          </span>

          {timeline.length === 0 ? (
            <p style={{ marginTop: '1rem' }}>
              No timeline updates are available yet.
            </p>
          ) : (
            <div
              style={{
                display: 'grid',
                gap: '1rem',
                marginTop: '1.5rem',
              }}
            >
              {timeline.map((item, index) => (
                <div
                  key={
                    item._id ||
                    `${item.action || 'event'}-${index}`
                  }
                  style={{
                    borderBottom:
                      index < timeline.length - 1
                        ? '1px solid var(--color-border)'
                        : 'none',
                    paddingBottom:
                      index < timeline.length - 1
                        ? '1rem'
                        : 0,
                  }}
                >
                  <div
                    style={{
                      alignItems: 'center',
                      display: 'flex',
                      gap: '0.75rem',
                    }}
                  >
                    <CheckCircle2 size={20} />

                    <strong>
                      {item.action ||
                        getStatusLabel(item.status)}
                    </strong>
                  </div>

                  {item.notes && (
                    <p
                      style={{
                        marginLeft: '2rem',
                        marginTop: '0.5rem',
                      }}
                    >
                      {item.notes}
                    </p>
                  )}

                  <small
                    style={{
                      display: 'block',
                      marginLeft: '2rem',
                      marginTop: '0.35rem',
                    }}
                  >
                    {formatDateTime(item.createdAt)}
                  </small>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}

export default ApplicationDetailsPage;