import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  Send,
  XCircle,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import api from '../../../shared/api/axios';
import Card from '../../../shared/components/Card/Card';
import LoadingState from '../../../shared/components/LoadingState/LoadingState';

const STATUS_OPTIONS = [
  'pending',
  'under_review',
  'information_requested',
  'escalated',
  'approved',
  'rejected',
];

function getStatusLabel(status) {
  if (!status) {
    return 'Pending';
  }

  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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

function getStatusIcon(status) {
  switch (status) {
    case 'approved':
      return <CheckCircle2 size={18} />;

    case 'rejected':
      return <XCircle size={18} />;

    case 'information_requested':
      return <AlertCircle size={18} />;

    case 'under_review':
      return <RefreshCw size={18} />;

    case 'escalated':
      return <AlertCircle size={18} />;

    default:
      return <Clock3 size={18} />;
  }
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

function AdminApplicationDetailsPage() {
  const { applicationId } = useParams();

  const [application, setApplication] = useState(null);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [informationRequest, setInformationRequest] =
    useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadApplication = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get(
          `/applications/${applicationId}`,
        );

        if (cancelled) {
          return;
        }

        setApplication(response.data);
        setStatus(response.data.status || 'pending');
        setInformationRequest(
          response.data.informationRequest || '',
        );
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError.response?.data?.message ||
            'Unable to load application.',
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (applicationId) {
      loadApplication();
    }

    return () => {
      cancelled = true;
    };
  }, [applicationId]);

  const handleStatusChange = async (event) => {
    event.preventDefault();

    if (!status) {
      return;
    }

    if (
      status === 'information_requested' &&
      !informationRequest.trim()
    ) {
      setError(
        'Please explain what information is required from the customer.',
      );
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response = await api.patch(
        `/applications/${applicationId}/status`,
        {
          status,
          notes: notes.trim(),
          informationRequest:
            informationRequest.trim(),
        },
      );

      setApplication(response.data);

      setSuccess(
        `Application status changed to ${getStatusLabel(
          status,
        )}.`,
      );

      setNotes('');

      if (status !== 'information_requested') {
        setInformationRequest('');
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to update application status.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <LoadingState message="Loading application..." />
    );
  }

  if (error && !application) {
    return (
      <section className="page-placeholder">
        <div className="container">
          <Card>
            <FileText size={36} />

            <h1>Unable to load application</h1>

            <p>{error}</p>

            <Link
              className="button button--secondary"
              to="/admin/applications"
            >
              <ArrowLeft size={18} />
              Back to Applications
            </Link>
          </Card>
        </div>
      </section>
    );
  }

  if (!application) {
    return null;
  }

  const premium =
    application.quote?.estimatedPremium ??
    application.estimatedPremium;

  const timeline = Array.isArray(
    application.timeline,
  )
    ? application.timeline
    : [];

  const aiSummary = application.aiSummary || {
    score: application.riskScore,
    level: application.riskLevel,
    recommendation: application.recommendation,
    notes: application.underwritingNotes || [],
    breakdown: application.riskBreakdown || [],
  };

  return (
    <section className="page-placeholder">
      <div className="container">
        <div className="hero__actions">
          <Link
            className="button button--ghost"
            to="/admin/applications"
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

          <h1>
            {application.fullName ||
              application.user?.name ||
              'Customer Application'}
          </h1>

          <p>
            Review the submitted information and determine
            the next application state.
          </p>
        </div>

        {/* CURRENT STATUS */}
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
                CURRENT STATUS
              </span>

              <div style={{ marginTop: '0.5rem' }}>
                <span
                  className={getStatusClass(
                    application.status,
                  )}
                >
                  {getStatusIcon(application.status)}

                  <span>
                    {getStatusLabel(
                      application.status,
                    )}
                  </span>
                </span>
              </div>
            </div>

            <div>
              <span className="eyebrow">
                SUBMITTED
              </span>

              <p style={{ marginTop: '0.35rem' }}>
                {formatDateTime(
                  application.createdAt,
                )}
              </p>
            </div>
          </div>
        </Card>

        {/* CUSTOMER + INSURANCE */}
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
                <strong>Name</strong>
                <br />
                {application.fullName ||
                  application.user?.name ||
                  '—'}
              </p>

              <p>
                <strong>Email</strong>
                <br />
                {application.user?.email || '—'}
              </p>

              <p>
                <strong>Phone</strong>
                <br />
                {application.phone ||
                  application.user?.phone ||
                  '—'}
              </p>

              <p>
                <strong>National ID</strong>
                <br />
                {application.nationalId || '—'}
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
                {application.product?.name ||
                  'Insurance Product'}
              </p>

              <p>
                <strong>Estimated premium</strong>
                <br />
                {formatCurrency(premium)}
              </p>

              <p>
                <strong>Quote</strong>
                <br />
                {application.quote?._id || '—'}
              </p>

              <p>
                <strong>Application submitted</strong>
                <br />
                {formatDateTime(
                  application.createdAt,
                )}
              </p>
            </div>
          </Card>
        </div>

        {/* ADDITIONAL INFORMATION */}
        {application.additionalInfo && (
          <Card style={{ marginTop: '1.5rem' }}>
            <span className="eyebrow">
              CUSTOMER ADDITIONAL INFORMATION
            </span>

            <p style={{ marginTop: '1rem' }}>
              {application.additionalInfo}
            </p>
          </Card>
        )}

        {/* AI RISK */}
        <Card style={{ marginTop: '1.5rem' }}>
          <span className="eyebrow">
            AI RISK ASSESSMENT
          </span>

          <div
            style={{
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(180px, 1fr))',
              marginTop: '1rem',
            }}
          >
            <div>
              <span className="eyebrow">
                SCORE
              </span>

              <h2 style={{ marginTop: '0.35rem' }}>
                {aiSummary.score ?? '—'}
              </h2>
            </div>

            <div>
              <span className="eyebrow">
                RISK LEVEL
              </span>

              <h2 style={{ marginTop: '0.35rem' }}>
                {aiSummary.level || '—'}
              </h2>
            </div>

            <div>
              <span className="eyebrow">
                RECOMMENDATION
              </span>

              <p style={{ marginTop: '0.35rem' }}>
                {aiSummary.recommendation || '—'}
              </p>
            </div>
          </div>

          {aiSummary.notes?.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <span className="eyebrow">
                RISK NOTES
              </span>

              <ul style={{ marginTop: '0.75rem' }}>
                {aiSummary.notes.map((note, index) => (
                  <li key={`${note}-${index}`}>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {/* DECISION */}
        <Card style={{ marginTop: '1.5rem' }}>
          <span className="eyebrow">
            ADMIN DECISION
          </span>

          <h2 style={{ marginTop: '0.5rem' }}>
            Update Application Status
          </h2>

          <p>
            Select the state that best reflects the current
            underwriting decision.
          </p>

          <form onSubmit={handleStatusChange}>
            <div style={{ marginTop: '1.5rem' }}>
              <label htmlFor="applicationStatus">
                Application status
              </label>

              <select
                id="applicationStatus"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                disabled={saving}
                style={{
                  marginTop: '0.5rem',
                  width: '100%',
                }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {getStatusLabel(option)}
                  </option>
                ))}
              </select>
            </div>

            {status === 'information_requested' && (
              <div style={{ marginTop: '1.5rem' }}>
                <label htmlFor="informationRequest">
                  Information required from customer
                </label>

                <textarea
                  id="informationRequest"
                  value={informationRequest}
                  onChange={(event) =>
                    setInformationRequest(
                      event.target.value,
                    )
                  }
                  rows={5}
                  placeholder="Explain exactly what information or documents the customer needs to provide..."
                  disabled={saving}
                  style={{
                    marginTop: '0.5rem',
                    width: '100%',
                  }}
                />
              </div>
            )}

            <div style={{ marginTop: '1.5rem' }}>
              <label htmlFor="decisionNotes">
                Admin notes
              </label>

              <textarea
                id="decisionNotes"
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                rows={5}
                placeholder="Add internal notes about this decision..."
                disabled={saving}
                style={{
                  marginTop: '0.5rem',
                  width: '100%',
                }}
              />
            </div>

            {error && (
              <div
                className="auth-form__error"
                role="alert"
                style={{ marginTop: '1.5rem' }}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                style={{ marginTop: '1.5rem' }}
              >
                {success}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '1.5rem',
              }}
            >
              <button
                className="button button--primary"
                type="submit"
                disabled={saving}
              >
                <Send size={18} />

                {saving
                  ? 'Saving decision...'
                  : 'Save Decision'}
              </button>
            </div>
          </form>
        </Card>

        {/* TIMELINE */}
        <Card style={{ marginTop: '1.5rem' }}>
          <span className="eyebrow">
            APPLICATION TIMELINE
          </span>

          {timeline.length === 0 ? (
            <p style={{ marginTop: '1rem' }}>
              No timeline updates are available.
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
                    <CheckCircle2 size={18} />

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
                    {formatDateTime(
                      item.createdAt,
                    )}
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

export default AdminApplicationDetailsPage;