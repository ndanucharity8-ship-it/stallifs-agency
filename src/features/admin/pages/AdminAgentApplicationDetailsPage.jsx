import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Send,
  User,
  XCircle,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import api from '../../../shared/api/axios';
import Card from '../../../shared/components/Card/Card';
import LoadingState from '../../../shared/components/LoadingState/LoadingState';

const STATUS_OPTIONS = [
  'submitted',
  'under_review',
  'information_requested',
  'shortlisted',
  'interview_scheduled',
  'interview_completed',
  'passed',
  'failed',
  'rejected',
  'converted',
];

function getStatusLabel(status) {
  if (!status) {
    return 'Submitted';
  }

  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusClass(status) {
  switch (status) {
    case 'converted':
    case 'passed':
      return 'application-status application-status--approved';

    case 'rejected':
    case 'failed':
      return 'application-status application-status--rejected';

    case 'information_requested':
      return 'application-status application-status--information';

    case 'under_review':
    case 'shortlisted':
    case 'interview_scheduled':
    case 'interview_completed':
      return 'application-status application-status--review';

    default:
      return 'application-status application-status--pending';
  }
}

function getStatusIcon(status) {
  switch (status) {
    case 'converted':
    case 'passed':
      return <CheckCircle2 size={18} />;

    case 'rejected':
    case 'failed':
      return <XCircle size={18} />;

    case 'information_requested':
      return <AlertCircle size={18} />;

    case 'under_review':
    case 'shortlisted':
    case 'interview_scheduled':
    case 'interview_completed':
      return <RefreshCw size={18} />;

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

function getFileName(path, fallback) {
  if (!path) {
    return fallback;
  }

  const cleanPath = String(path).split('?')[0];
  const parts = cleanPath.split('/');

  return parts[parts.length - 1] || fallback;
}

function DocumentLink({ label, path }) {
  if (!path) {
    return (
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          gap: '0.75rem',
          opacity: 0.6,
        }}
      >
        <FileText size={20} />
        <span>{label}: Not provided</span>
      </div>
    );
  }

  return (
    <a
      href={path}
      target="_blank"
      rel="noreferrer"
      style={{
        alignItems: 'center',
        display: 'flex',
        gap: '0.75rem',
      }}
    >
      <FileText size={20} />

      <span>
        {label}
        <br />
        <small>
          {getFileName(path, 'View document')}
        </small>
      </span>
    </a>
  );
}

function AdminAgentApplicationDetailsPage() {
  const { applicationId } = useParams();

  const [application, setApplication] = useState(null);
  const [status, setStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [informationRequest, setInformationRequest] =
    useState('');
  const [interviewFeedback, setInterviewFeedback] =
    useState('');

  const [interview, setInterview] = useState({
    scheduledAt: '',
    type: 'physical',
    location: '',
    meetingLink: '',
    notes: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [temporaryPassword, setTemporaryPassword] =
    useState('');

  useEffect(() => {
    let cancelled = false;

    const loadApplication = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get(
          `/agent-applications/${applicationId}`,
        );

        if (cancelled) {
          return;
        }

        const data = response.data;

        setApplication(data);
        setStatus(data.status || 'submitted');
        setAdminNotes(data.adminNotes || '');
        setInformationRequest(
          data.informationRequest || '',
        );
        setInterviewFeedback(
          data.interview?.feedback || '',
        );

        setInterview({
          scheduledAt: data.interview?.scheduledAt
            ? new Date(data.interview.scheduledAt)
                .toISOString()
                .slice(0, 16)
            : '',
          type: data.interview?.type || 'physical',
          location: data.interview?.location || '',
          meetingLink:
            data.interview?.meetingLink || '',
          notes: data.interview?.notes || '',
        });
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError.response?.data?.message ||
            'Unable to load agent application.',
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

  const handleInterviewChange = (event) => {
    const { name, value } = event.target;

    setInterview((current) => ({
      ...current,
      [name]: value,
    }));
  };

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
        'Please explain what information is required from the applicant.',
      );
      return;
    }

    if (
      status === 'interview_scheduled' &&
      !interview.scheduledAt
    ) {
      setError(
        'Please select the interview date and time.',
      );
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      setTemporaryPassword('');

      const response = await api.patch(
        `/agent-applications/${applicationId}`,
        {
          status,
          adminNotes: adminNotes.trim(),
          informationRequest:
            informationRequest.trim(),
          interview: {
            ...interview,
            scheduledAt:
              interview.scheduledAt || undefined,
          },
          interviewFeedback:
            interviewFeedback.trim(),
        },
      );

      const updatedApplication =
        response.data.application || response.data;

      setApplication(updatedApplication);

      setSuccess(
        `Application status changed to ${getStatusLabel(
          status,
        )}.`,
      );

      if (updatedApplication.status) {
        setStatus(updatedApplication.status);
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to update agent application.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAgentAccount = async () => {
    if (!applicationId) {
      return;
    }

    const confirmed = window.confirm(
      'Create an agent account for this applicant? This action should only be performed after the applicant has passed the interview.',
    );

    if (!confirmed) {
      return;
    }

    try {
      setCreatingAccount(true);
      setError('');
      setSuccess('');
      setTemporaryPassword('');

      const response = await api.post(
        `/agent-applications/${applicationId}/create-account`,
      );

      setSuccess(
        response.data?.message ||
          'Agent account created successfully.',
      );

      setTemporaryPassword(
        response.data?.temporaryPassword || '',
      );

      const refreshed = await api.get(
        `/agent-applications/${applicationId}`,
      );

      setApplication(refreshed.data);
      setStatus(refreshed.data.status || 'converted');
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to create agent account.',
      );
    } finally {
      setCreatingAccount(false);
    }
  };

  if (loading) {
    return (
      <LoadingState message="Loading agent application..." />
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
              to="/admin/agent-applications"
            >
              <ArrowLeft size={18} />
              Back to Agent Applications
            </Link>
          </Card>
        </div>
      </section>
    );
  }

  if (!application) {
    return null;
  }

  const timeline = Array.isArray(application.timeline)
    ? application.timeline
    : [];

  const canCreateAccount =
    application.status === 'passed' &&
    !application.accountCreated;

  return (
    <section className="page-placeholder">
      <div className="container">
        {/* BACK */}
        <div className="hero__actions">
          <Link
            className="button button--ghost"
            to="/admin/agent-applications"
          >
            <ArrowLeft size={18} />
            Back to Agent Applications
          </Link>
        </div>

        {/* HEADER */}
        <div style={{ marginTop: '1rem' }}>
          <span className="eyebrow">
            {application.applicationNumber ||
              'AGENT APPLICATION'}
          </span>

          <h1>
            {application.fullName ||
              'Agent Applicant'}
          </h1>

          <p>
            Review this applicant's recruitment
            information and update the application
            status.
          </p>
        </div>

        {/* STATUS */}
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
                  {getStatusIcon(
                    application.status,
                  )}

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

            {application.accountCreated && (
              <div>
                <span className="eyebrow">
                  AGENT CODE
                </span>

                <p style={{ marginTop: '0.35rem' }}>
                  <strong>
                    {application.agentCode ||
                      application.agent?.agentCode ||
                      'Created'}
                  </strong>
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* PERSONAL INFORMATION */}
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
              PERSONAL INFORMATION
            </span>

            <div style={{ marginTop: '1rem' }}>
              <p>
                <strong>
                  <User size={16} /> Name
                </strong>
                <br />
                {application.fullName || '—'}
              </p>

              <p>
                <strong>
                  <Mail size={16} /> Email
                </strong>
                <br />
                {application.email || '—'}
              </p>

              <p>
                <strong>
                  <Phone size={16} /> Phone
                </strong>
                <br />
                {application.phone || '—'}
              </p>

              <p>
                <strong>National ID</strong>
                <br />
                {application.nationalId || '—'}
              </p>

              <p>
                <strong>KRA PIN</strong>
                <br />
                {application.kraPin || '—'}
              </p>
            </div>
          </Card>

          <Card>
            <span className="eyebrow">
              LOCATION &amp; PROFESSIONAL INFORMATION
            </span>

            <div style={{ marginTop: '1rem' }}>
              <p>
                <strong>
                  <MapPin size={16} /> County
                </strong>
                <br />
                {application.county || '—'}
              </p>

              <p>
                <strong>
                  <GraduationCap size={16} /> Education
                </strong>
                <br />
                {application.education || '—'}
              </p>

              <p>
                <strong>
                  <BriefcaseBusiness size={16} /> Occupation
                </strong>
                <br />
                {application.occupation || '—'}
              </p>

              <p>
                <strong>Preferred Region</strong>
                <br />
                {application.preferredRegion || '—'}
              </p>
            </div>
          </Card>
        </div>

        {/* EXPERIENCE */}
        <Card style={{ marginTop: '1.5rem' }}>
          <span className="eyebrow">
            EXPERIENCE &amp; BUSINESS INFORMATION
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
                EXPERIENCE
              </span>

              <p style={{ marginTop: '0.35rem' }}>
                {application.experience || 'None'}
              </p>
            </div>

            <div>
              <span className="eyebrow">
                PREVIOUS COMPANY
              </span>

              <p style={{ marginTop: '0.35rem' }}>
                {application.previousCompany || '—'}
              </p>
            </div>

            <div>
              <span className="eyebrow">
                BUSINESS NAME
              </span>

              <p style={{ marginTop: '0.35rem' }}>
                {application.businessName || '—'}
              </p>
            </div>
          </div>
        </Card>

        {/* DOCUMENTS */}
        <Card style={{ marginTop: '1.5rem' }}>
          <span className="eyebrow">
            SUBMITTED DOCUMENTS
          </span>

          <div
            style={{
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(280px, 1fr))',
              marginTop: '1.25rem',
            }}
          >
            <DocumentLink
              label="Curriculum Vitae"
              path={application.cv}
            />

            <DocumentLink
              label="National ID Document"
              path={application.nationalIdDocument}
            />

            <DocumentLink
              label="KRA Certificate"
              path={application.kraCertificate}
            />

            <DocumentLink
              label="IRA Certificate"
              path={application.iraCertificate}
            />

            <DocumentLink
              label="Certificate of Good Conduct"
              path={application.goodConduct}
            />

            <DocumentLink
              label="Other Document"
              path={application.otherDocument}
            />
          </div>
        </Card>

        {/* INTERVIEW */}
        <Card style={{ marginTop: '1.5rem' }}>
          <span className="eyebrow">
            INTERVIEW INFORMATION
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
                INTERVIEW TYPE
              </span>

              <p style={{ marginTop: '0.35rem' }}>
                {getStatusLabel(
                  application.interview?.type,
                ) || '—'}
              </p>
            </div>

            <div>
              <span className="eyebrow">
                SCHEDULED
              </span>

              <p style={{ marginTop: '0.35rem' }}>
                {formatDateTime(
                  application.interview?.scheduledAt,
                )}
              </p>
            </div>

            <div>
              <span className="eyebrow">
                LOCATION
              </span>

              <p style={{ marginTop: '0.35rem' }}>
                {application.interview?.location ||
                  '—'}
              </p>
            </div>

            <div>
              <span className="eyebrow">
                MEETING LINK
              </span>

              <p style={{ marginTop: '0.35rem' }}>
                {application.interview?.meetingLink ? (
                  <a
                    href={
                      application.interview
                        .meetingLink
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open meeting link
                  </a>
                ) : (
                  '—'
                )}
              </p>
            </div>
          </div>

          {application.interview?.notes && (
            <div style={{ marginTop: '1rem' }}>
              <span className="eyebrow">
                INTERVIEW NOTES
              </span>

              <p style={{ marginTop: '0.35rem' }}>
                {application.interview.notes}
              </p>
            </div>
          )}

          {application.interview?.feedback && (
            <div style={{ marginTop: '1rem' }}>
              <span className="eyebrow">
                INTERVIEW FEEDBACK
              </span>

              <p style={{ marginTop: '0.35rem' }}>
                {application.interview.feedback}
              </p>
            </div>
          )}
        </Card>

        {/* UPDATE APPLICATION */}
        <Card style={{ marginTop: '1.5rem' }}>
          <span className="eyebrow">
            RECRUITMENT DECISION
          </span>

          <h2 style={{ marginTop: '0.5rem' }}>
            Update Application
          </h2>

          <p>
            Update the applicant's recruitment status
            and add any relevant administrative
            information.
          </p>

          <form onSubmit={handleStatusChange}>
            <div style={{ marginTop: '1.5rem' }}>
              <label htmlFor="agentStatus">
                Application status
              </label>

              <select
                id="agentStatus"
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
                  Information required from applicant
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
                  disabled={saving}
                  placeholder="Explain the information or documents required from the applicant..."
                  style={{
                    marginTop: '0.5rem',
                    width: '100%',
                  }}
                />
              </div>
            )}

            {status === 'interview_scheduled' && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3>Schedule Interview</h3>

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
                    <label htmlFor="scheduledAt">
                      Date and time
                    </label>

                    <input
                      id="scheduledAt"
                      name="scheduledAt"
                      type="datetime-local"
                      value={interview.scheduledAt}
                      onChange={handleInterviewChange}
                      disabled={saving}
                      style={{
                        marginTop: '0.5rem',
                        width: '100%',
                      }}
                    />
                  </div>

                  <div>
                    <label htmlFor="interviewType">
                      Interview type
                    </label>

                    <select
                      id="interviewType"
                      name="type"
                      value={interview.type}
                      onChange={handleInterviewChange}
                      disabled={saving}
                      style={{
                        marginTop: '0.5rem',
                        width: '100%',
                      }}
                    >
                      <option value="physical">
                        Physical
                      </option>

                      <option value="online">
                        Online
                      </option>

                      <option value="phone">
                        Phone
                      </option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="interviewLocation">
                      Location
                    </label>

                    <input
                      id="interviewLocation"
                      name="location"
                      type="text"
                      value={interview.location}
                      onChange={handleInterviewChange}
                      disabled={saving}
                      placeholder="Interview location"
                      style={{
                        marginTop: '0.5rem',
                        width: '100%',
                      }}
                    />
                  </div>

                  <div>
                    <label htmlFor="meetingLink">
                      Meeting link
                    </label>

                    <input
                      id="meetingLink"
                      name="meetingLink"
                      type="url"
                      value={interview.meetingLink}
                      onChange={handleInterviewChange}
                      disabled={saving}
                      placeholder="https://..."
                      style={{
                        marginTop: '0.5rem',
                        width: '100%',
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <label htmlFor="interviewNotes">
                    Interview notes
                  </label>

                  <textarea
                    id="interviewNotes"
                    name="notes"
                    value={interview.notes}
                    onChange={handleInterviewChange}
                    rows={4}
                    disabled={saving}
                    placeholder="Add interview scheduling notes..."
                    style={{
                      marginTop: '0.5rem',
                      width: '100%',
                    }}
                  />
                </div>
              </div>
            )}

            {(status === 'passed' ||
              status === 'failed' ||
              status === 'interview_completed') && (
              <div style={{ marginTop: '1.5rem' }}>
                <label htmlFor="interviewFeedback">
                  Interview feedback
                </label>

                <textarea
                  id="interviewFeedback"
                  value={interviewFeedback}
                  onChange={(event) =>
                    setInterviewFeedback(
                      event.target.value,
                    )
                  }
                  rows={5}
                  disabled={saving}
                  placeholder="Record the interview feedback..."
                  style={{
                    marginTop: '0.5rem',
                    width: '100%',
                  }}
                />
              </div>
            )}

            <div style={{ marginTop: '1.5rem' }}>
              <label htmlFor="adminNotes">
                Admin notes
              </label>

              <textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(event) =>
                  setAdminNotes(event.target.value)
                }
                rows={5}
                disabled={saving}
                placeholder="Add internal recruitment notes..."
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

            {temporaryPassword && (
              <Card style={{ marginTop: '1.5rem' }}>
                <span className="eyebrow">
                  TEMPORARY AGENT PASSWORD
                </span>

                <p style={{ marginTop: '0.75rem' }}>
                  The agent account has been created.
                  Save this temporary password securely
                  and provide it to the new agent.
                </p>

                <p
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '1.1rem',
                    marginTop: '0.75rem',
                  }}
                >
                  <strong>
                    {temporaryPassword}
                  </strong>
                </p>
              </Card>
            )}

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
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
                  ? 'Saving...'
                  : 'Save Decision'}
              </button>
            </div>
          </form>
        </Card>

        {/* CREATE AGENT ACCOUNT */}
        {(canCreateAccount ||
          application.accountCreated) && (
          <Card style={{ marginTop: '1.5rem' }}>
            <span className="eyebrow">
              AGENT ACCOUNT
            </span>

            {application.accountCreated ? (
              <div style={{ marginTop: '1rem' }}>
                <div
                  style={{
                    alignItems: 'center',
                    display: 'flex',
                    gap: '0.75rem',
                  }}
                >
                  <CheckCircle2 size={22} />

                  <strong>
                    Agent account already created
                  </strong>
                </div>

                <p style={{ marginTop: '0.75rem' }}>
                  Agent Code:{' '}
                  <strong>
                    {application.agentCode ||
                      application.agent?.agentCode ||
                      '—'}
                  </strong>
                </p>

                <p>
                  Status:{' '}
                  <strong>
                    {getStatusLabel(
                      application.status,
                    )}
                  </strong>
                </p>
              </div>
            ) : (
              <div style={{ marginTop: '1rem' }}>
                <h2>
                  Create Agent Account
                </h2>

                <p>
                  This applicant has passed the
                  interview and can now be converted
                  into a STALLIFS agent account.
                </p>

                <button
                  className="button button--primary"
                  type="button"
                  onClick={handleCreateAgentAccount}
                  disabled={creatingAccount}
                  style={{ marginTop: '1rem' }}
                >
                  <CheckCircle2 size={18} />

                  {creatingAccount
                    ? 'Creating Account...'
                    : 'Create Agent Account'}
                </button>
              </div>
            )}
          </Card>
        )}

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
                    {getStatusIcon(item.status)}

                    <strong>
                      {item.action ||
                        getStatusLabel(
                          item.status,
                        )}
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

                  {item.performedByName && (
                    <small
                      style={{
                        display: 'block',
                        marginLeft: '2rem',
                        marginTop: '0.25rem',
                      }}
                    >
                      By: {item.performedByName}
                    </small>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}

export default AdminAgentApplicationDetailsPage;