import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  Flag,
  User,
  UserCheck,
  UserMinus,
  Users,
  XCircle,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import api from '../../../shared/api/axios';
import Card from '../../../shared/components/Card/Card';
import LoadingState from '../../../shared/components/LoadingState/LoadingState';

const statusOptions = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'under_review', label: 'Under Review' },
  {
    value: 'information_requested',
    label: 'Information Requested',
  },
  { value: 'escalated', label: 'Escalated' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'settled', label: 'Settled' },
  { value: 'closed', label: 'Closed' },
];

function getStatusLabel(status) {
  const option = statusOptions.find(
    (item) => item.value === status,
  );

  return option?.label || status || 'Unknown';
}

function getStatusClass(status) {
  switch (status) {
    case 'approved':
    case 'settled':
      return 'application-status application-status--approved';

    case 'rejected':
    case 'closed':
      return 'application-status application-status--rejected';

    case 'information_requested':
    case 'escalated':
      return 'application-status application-status--information';

    case 'under_review':
    case 'assigned':
      return 'application-status application-status--review';

    case 'submitted':
    default:
      return 'application-status application-status--pending';
  }
}

function getStatusIcon(status) {
  switch (status) {
    case 'approved':
    case 'settled':
      return <CheckCircle2 size={16} />;

    case 'rejected':
    case 'closed':
      return <XCircle size={16} />;

    case 'information_requested':
    case 'escalated':
      return <AlertCircle size={16} />;

    default:
      return <Clock3 size={16} />;
  }
}

function formatDate(date, includeTime = false) {
  if (!date) {
    return '—';
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return '—';
  }

  return parsedDate.toLocaleString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(includeTime
      ? {
          hour: '2-digit',
          minute: '2-digit',
        }
      : {}),
  });
}

function getUserName(user) {
  if (!user) {
    return '—';
  }

  return (
    user.name ||
    user.email ||
    'Unknown user'
  );
}

function getPolicyNumber(claim) {
  return (
    claim?.policy?.policyNumber ||
    claim?.policyNumber ||
    '—'
  );
}

function getAgentLabel(agent) {
  if (!agent) {
    return 'Unknown agent';
  }

  if (agent.name && agent.agentCode) {
    return `${agent.name} (${agent.agentCode})`;
  }

  return agent.name || agent.email || 'Unknown agent';
}

function AdminClaimDetailsPage() {
  const { claimId } = useParams();

  const [claim, setClaim] = useState(null);
  const [agents, setAgents] = useState([]);

  const [selectedStatus, setSelectedStatus] =
    useState('');

  const [adminNotes, setAdminNotes] = useState('');
  const [resolution, setResolution] = useState('');

  const [selectedAgentId, setSelectedAgentId] =
    useState('');

  const [assignmentReason, setAssignmentReason] =
    useState('');

  const [loading, setLoading] = useState(true);
  const [loadingAgents, setLoadingAgents] =
    useState(true);

  const [saving, setSaving] = useState(false);
  const [assigning, setAssigning] =
    useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ======================================================
  // LOAD CLAIM
  // ======================================================

  useEffect(() => {
    let cancelled = false;

    const loadClaim = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get(
          `/claims/${claimId}`,
        );

        if (cancelled) {
          return;
        }

        const data = response.data;

        setClaim(data);
        setSelectedStatus(data.status || '');
        setAdminNotes(data.adminNotes || '');
        setResolution(data.resolution || '');

        setSelectedAgentId(
          data.assignedAgent?._id || '',
        );
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError.response?.data?.message ||
            'Unable to load claim.',
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadClaim();

    return () => {
      cancelled = true;
    };
  }, [claimId]);

  // ======================================================
  // LOAD AGENTS
  // ======================================================

  useEffect(() => {
    let cancelled = false;

    const loadAgents = async () => {
      try {
        setLoadingAgents(true);

        const response = await api.get(
          '/claims/agents',
        );

        if (cancelled) {
          return;
        }

        const data = response.data;

        if (Array.isArray(data)) {
          setAgents(data);
        } else {
          setAgents([]);
        }
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setAgents([]);

        setError(
          requestError.response?.data?.message ||
            'Unable to load claim agents.',
        );
      } finally {
        if (!cancelled) {
          setLoadingAgents(false);
        }
      }
    };

    loadAgents();

    return () => {
      cancelled = true;
    };
  }, []);

  // ======================================================
  // UPDATE CLAIM STATUS
  // ======================================================

  const updateClaim = async (event) => {
    event.preventDefault();

    if (!claim) {
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.patch(
        `/claims/${claim._id}`,
        {
          status: selectedStatus,
          adminNotes,
          resolution,
        },
      );

      const updatedClaim = response.data;

      setClaim(updatedClaim);

      setSelectedStatus(
        updatedClaim.status || selectedStatus,
      );

      setAdminNotes(
        updatedClaim.adminNotes || '',
      );

      setResolution(
        updatedClaim.resolution || '',
      );

      setSelectedAgentId(
        updatedClaim.assignedAgent?._id || '',
      );

      setSuccess(
        'Claim updated successfully.',
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to update claim.',
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // ASSIGN / REASSIGN CLAIM
  // ======================================================

  const assignClaim = async (event) => {
    event.preventDefault();

    if (!claim || !selectedAgentId) {
      setError(
        'Please select an agent.',
      );

      return;
    }

    setAssigning(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.patch(
        `/claims/${claim._id}/assign`,
        {
          agentId: selectedAgentId,
          reason: assignmentReason,
        },
      );

      const updatedClaim = response.data;

      setClaim(updatedClaim);

      setSelectedStatus(
        updatedClaim.status || selectedStatus,
      );

      setSelectedAgentId(
        updatedClaim.assignedAgent?._id || '',
      );

      setAssignmentReason('');

      setSuccess(
        updatedClaim.assignmentHistory?.some(
          (item) =>
            item.action === 'reassigned',
        )
          ? 'Claim reassigned successfully.'
          : 'Claim assigned successfully.',
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to assign claim.',
      );
    } finally {
      setAssigning(false);
    }
  };

  // ======================================================
  // UNASSIGN CLAIM
  // ======================================================

  const unassignClaim = async () => {
    if (!claim?.assignedAgent) {
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to unassign this claim?',
    );

    if (!confirmed) {
      return;
    }

    setAssigning(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.patch(
        `/claims/${claim._id}/unassign`,
        {
          reason: assignmentReason,
        },
      );

      const updatedClaim = response.data;

      setClaim(updatedClaim);

      setSelectedStatus(
        updatedClaim.status || selectedStatus,
      );

      setSelectedAgentId('');

      setAssignmentReason('');

      setSuccess(
        'Claim unassigned successfully.',
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to unassign claim.',
      );
    } finally {
      setAssigning(false);
    }
  };

  // ======================================================
  // ASSIGNMENT HISTORY
  // ======================================================

  const assignmentHistory = useMemo(() => {
    if (
      !Array.isArray(
        claim?.assignmentHistory,
      )
    ) {
      return [];
    }

    return [...claim.assignmentHistory].reverse();
  }, [claim]);

  if (loading) {
    return (
      <LoadingState message="Loading claim details..." />
    );
  }

  if (error && !claim) {
    return (
      <section className="page-placeholder">
        <div className="container">
          <Card>
            <div
              className="auth-form__error"
              role="alert"
            >
              {error}
            </div>

            <Link
              className="button button--secondary"
              to="/admin/claims"
              style={{ marginTop: '1rem' }}
            >
              <ArrowLeft size={18} />
              Back to Claims
            </Link>
          </Card>
        </div>
      </section>
    );
  }

  if (!claim) {
    return null;
  }

  return (
    <section className="page-placeholder">
      <div className="container">
        {/* ==================================================
            BACK
        ================================================== */}

        <div
          style={{
            marginBottom: '1.5rem',
          }}
        >
          <Link
            to="/admin/claims"
            className="button button--secondary"
          >
            <ArrowLeft size={18} />
            Back to Claims
          </Link>
        </div>

        {/* ==================================================
            HEADER
        ================================================== */}

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
              ADMIN CLAIM
            </span>

            <h1>
              Claim {claim._id?.slice(-8)}
            </h1>

            <p>
              Review the customer's claim and manage
              its processing workflow.
            </p>
          </div>

          <span
            className={getStatusClass(
              claim.status,
            )}
          >
            {getStatusIcon(claim.status)}

            <span>
              {getStatusLabel(claim.status)}
            </span>
          </span>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

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

        {/* ==================================================
            SUCCESS
        ================================================== */}

        {success && (
          <Card style={{ marginTop: '1.5rem' }}>
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                gap: '0.5rem',
              }}
            >
              <CheckCircle2 size={18} />

              <span>{success}</span>
            </div>
          </Card>
        )}

        <div
          style={{
            display: 'grid',
            gap: '1.5rem',
            gridTemplateColumns:
              'minmax(0, 2fr) minmax(300px, 1fr)',
            marginTop: '2rem',
          }}
        >
          {/* ==================================================
              LEFT COLUMN
          ================================================== */}

          <div
            style={{
              display: 'grid',
              gap: '1.5rem',
            }}
          >
            {/* CUSTOMER */}

            <Card>
              <span className="eyebrow">
                CUSTOMER
              </span>

              <div
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  gap: '1rem',
                  marginTop: '1rem',
                }}
              >
                <User size={24} />

                <div>
                  <h2
                    style={{
                      marginBottom: '0.25rem',
                    }}
                  >
                    {getUserName(claim.user)}
                  </h2>

                  {claim.user?.email && (
                    <p style={{ margin: 0 }}>
                      {claim.user.email}
                    </p>
                  )}

                  {claim.user?.phone && (
                    <p style={{ margin: 0 }}>
                      {claim.user.phone}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* CLAIM DETAILS */}

            <Card>
              <span className="eyebrow">
                CLAIM DETAILS
              </span>

              <h2 style={{ marginTop: '0.5rem' }}>
                {claim.reason ||
                  'Insurance Claim'}
              </h2>

              <p
                style={{
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {claim.description ||
                  'No description provided.'}
              </p>
            </Card>

            {/* POLICY */}

            <Card>
              <span className="eyebrow">
                POLICY
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
                    POLICY NUMBER
                  </span>

                  <p>
                    {getPolicyNumber(claim)}
                  </p>
                </div>

                <div>
                  <span className="eyebrow">
                    POLICY STATUS
                  </span>

                  <p>
                    {claim.policy?.status || '—'}
                  </p>
                </div>

                <div>
                  <span className="eyebrow">
                    START DATE
                  </span>

                  <p>
                    {formatDate(
                      claim.policy?.startDate,
                      true,
                    )}
                  </p>
                </div>

                <div>
                  <span className="eyebrow">
                    END DATE
                  </span>

                  <p>
                    {formatDate(
                      claim.policy?.endDate,
                      true,
                    )}
                  </p>
                </div>
              </div>
            </Card>

            {/* DOCUMENTS */}

            <Card>
              <span className="eyebrow">
                DOCUMENTS
              </span>

              {claim.documents?.length ? (
                <div
                  style={{
                    display: 'grid',
                    gap: '0.75rem',
                    marginTop: '1rem',
                  }}
                >
                  {claim.documents.map(
                    (document, index) => (
                      <a
                        key={`${document}-${index}`}
                        href={document}
                        target="_blank"
                        rel="noreferrer"
                        className="button button--secondary"
                        style={{
                          justifyContent:
                            'flex-start',
                        }}
                      >
                        <FileText size={18} />
                        View Document {index + 1}
                      </a>
                    ),
                  )}
                </div>
              ) : (
                <p>
                  No documents were attached to this
                  claim.
                </p>
              )}
            </Card>

            {/* FRAUD */}

            {claim.fraudFlag && (
              <Card>
                <div
                  style={{
                    alignItems: 'center',
                    display: 'flex',
                    gap: '0.75rem',
                  }}
                >
                  <Flag size={22} />

                  <div>
                    <span className="eyebrow">
                      FRAUD REVIEW FLAG
                    </span>

                    <h2
                      style={{
                        marginTop: '0.35rem',
                      }}
                    >
                      Additional review required
                    </h2>
                  </div>
                </div>

                {claim.fraudReason && (
                  <p>
                    {claim.fraudReason}
                  </p>
                )}
              </Card>
            )}

            {/* TIMELINE */}

            <Card>
              <span className="eyebrow">
                CLAIM TIMELINE
              </span>

              <div
                style={{
                  display: 'grid',
                  gap: '1rem',
                  marginTop: '1rem',
                }}
              >
                <div>
                  <strong>Submitted</strong>

                  <p>
                    {formatDate(
                      claim.submittedAt ||
                        claim.createdAt,
                      true,
                    )}
                  </p>
                </div>

                {claim.assignedAt && (
                  <div>
                    <strong>Assigned</strong>

                    <p>
                      {formatDate(
                        claim.assignedAt,
                        true,
                      )}
                    </p>
                  </div>
                )}

                {claim.reviewedAt && (
                  <div>
                    <strong>
                      Last Reviewed
                    </strong>

                    <p>
                      {formatDate(
                        claim.reviewedAt,
                        true,
                      )}
                    </p>
                  </div>
                )}

                {claim.resolvedAt && (
                  <div>
                    <strong>Resolved</strong>

                    <p>
                      {formatDate(
                        claim.resolvedAt,
                        true,
                      )}
                    </p>
                  </div>
                )}

                {claim.closedAt && (
                  <div>
                    <strong>Closed</strong>

                    <p>
                      {formatDate(
                        claim.closedAt,
                        true,
                      )}
                    </p>
                  </div>
                )}

                <div>
                  <strong>Last Updated</strong>

                  <p>
                    {formatDate(
                      claim.updatedAt,
                      true,
                    )}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* ==================================================
              RIGHT COLUMN
          ================================================== */}

          <div
            style={{
              display: 'grid',
              gap: '1.5rem',
              alignContent: 'start',
            }}
          >
            {/* ==================================================
                CLAIM WORKFLOW
            ================================================== */}

            <Card>
              <span className="eyebrow">
                CLAIM WORKFLOW
              </span>

              <form
                onSubmit={updateClaim}
                style={{
                  display: 'grid',
                  gap: '1rem',
                  marginTop: '1rem',
                }}
              >
                <div>
                  <label htmlFor="claim-status">
                    Status
                  </label>

                  <select
                    id="claim-status"
                    value={selectedStatus}
                    onChange={(event) =>
                      setSelectedStatus(
                        event.target.value,
                      )
                    }
                    style={{
                      marginTop: '0.35rem',
                      width: '100%',
                    }}
                  >
                    {statusOptions.map(
                      (option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div>
                  <label htmlFor="admin-notes">
                    Admin Notes
                  </label>

                  <textarea
                    id="admin-notes"
                    value={adminNotes}
                    onChange={(event) =>
                      setAdminNotes(
                        event.target.value,
                      )
                    }
                    rows={6}
                    placeholder="Add notes about this claim..."
                    style={{
                      marginTop: '0.35rem',
                      width: '100%',
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="resolution">
                    Resolution
                  </label>

                  <textarea
                    id="resolution"
                    value={resolution}
                    onChange={(event) =>
                      setResolution(
                        event.target.value,
                      )
                    }
                    rows={5}
                    placeholder="Enter the claim resolution..."
                    style={{
                      marginTop: '0.35rem',
                      width: '100%',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="button button--primary"
                  disabled={saving}
                >
                  {saving
                    ? 'Updating...'
                    : 'Update Claim'}
                </button>
              </form>
            </Card>

            {/* ==================================================
                ASSIGNMENT
            ================================================== */}

            <Card>
              <div
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  gap: '0.75rem',
                }}
              >
                <Users size={22} />

                <div>
                  <span className="eyebrow">
                    CLAIM ASSIGNMENT
                  </span>

                  <h2
                    style={{
                      marginTop: '0.35rem',
                    }}
                  >
                    {claim.assignedAgent
                      ? getAgentLabel(
                          claim.assignedAgent,
                        )
                      : 'Unassigned'}
                  </h2>
                </div>
              </div>

              <p>
                Assignment status:{' '}
                {claim.assignmentStatus ||
                  'unassigned'}
              </p>

              <form
                onSubmit={assignClaim}
                style={{
                  display: 'grid',
                  gap: '1rem',
                  marginTop: '1rem',
                }}
              >
                <div>
                  <label htmlFor="claim-agent">
                    {claim.assignedAgent
                      ? 'Reassign Agent'
                      : 'Assign Agent'}
                  </label>

                  <select
                    id="claim-agent"
                    value={selectedAgentId}
                    onChange={(event) =>
                      setSelectedAgentId(
                        event.target.value,
                      )
                    }
                    disabled={
                      loadingAgents ||
                      assigning
                    }
                    style={{
                      marginTop: '0.35rem',
                      width: '100%',
                    }}
                  >
                    <option value="">
                      Select an agent
                    </option>

                    {agents.map((agent) => (
                      <option
                        key={agent._id}
                        value={agent._id}
                      >
                        {getAgentLabel(agent)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="assignment-reason">
                    Assignment Reason
                  </label>

                  <textarea
                    id="assignment-reason"
                    value={assignmentReason}
                    onChange={(event) =>
                      setAssignmentReason(
                        event.target.value,
                      )
                    }
                    rows={3}
                    placeholder="Optional reason for assigning or reassigning this claim..."
                    style={{
                      marginTop: '0.35rem',
                      width: '100%',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="button button--primary"
                  disabled={
                    assigning ||
                    loadingAgents ||
                    !selectedAgentId
                  }
                >
                  <UserCheck size={18} />

                  {assigning
                    ? 'Assigning...'
                    : claim.assignedAgent
                      ? 'Reassign Claim'
                      : 'Assign Claim'}
                </button>

                {claim.assignedAgent && (
                  <button
                    type="button"
                    className="button button--secondary"
                    onClick={unassignClaim}
                    disabled={assigning}
                  >
                    <UserMinus size={18} />

                    {assigning
                      ? 'Updating...'
                      : 'Unassign Claim'}
                  </button>
                )}
              </form>

              {loadingAgents && (
                <p
                  style={{
                    marginTop: '1rem',
                  }}
                >
                  Loading available agents...
                </p>
              )}

              {!loadingAgents &&
                agents.length === 0 && (
                  <p
                    style={{
                      marginTop: '1rem',
                    }}
                  >
                    No active claim agents are
                    currently available.
                  </p>
                )}
            </Card>

            {/* ==================================================
                ASSIGNMENT HISTORY
            ================================================== */}

            <Card>
              <span className="eyebrow">
                ASSIGNMENT HISTORY
              </span>

              {assignmentHistory.length === 0 ? (
                <p>
                  No assignment history recorded
                  yet.
                </p>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gap: '1rem',
                    marginTop: '1rem',
                  }}
                >
                  {assignmentHistory.map(
                    (entry, index) => (
                      <div
                        key={`${entry.assignedAt}-${index}`}
                        style={{
                          borderBottom:
                            '1px solid var(--border-color, #ddd)',
                          paddingBottom:
                            '1rem',
                        }}
                      >
                        <strong>
                          {entry.action ===
                          'reassigned'
                            ? 'Reassigned'
                            : entry.action ===
                                'unassigned'
                              ? 'Unassigned'
                              : 'Assigned'}
                        </strong>

                        <p
                          style={{
                            margin:
                              '0.35rem 0',
                          }}
                        >
                          Agent:{' '}
                          {getUserName(
                            entry.agent,
                          )}
                        </p>

                        <p
                          style={{
                            margin:
                              '0.35rem 0',
                          }}
                        >
                          Date:{' '}
                          {formatDate(
                            entry.assignedAt,
                            true,
                          )}
                        </p>

                        {entry.reason && (
                          <p
                            style={{
                              margin:
                                '0.35rem 0',
                            }}
                          >
                            Reason:{' '}
                            {entry.reason}
                          </p>
                        )}
                      </div>
                    ),
                  )}
                </div>
              )}
            </Card>

            {/* ==================================================
                REVIEW
            ================================================== */}

            <Card>
              <span className="eyebrow">
                REVIEW
              </span>

              <p>
                <strong>
                  Reviewed By:
                </strong>{' '}
                {getUserName(
                  claim.reviewedBy,
                )}
              </p>

              <p>
                <strong>
                  Reviewed At:
                </strong>{' '}
                {formatDate(
                  claim.reviewedAt,
                  true,
                )}
              </p>
            </Card>

            {/* ==================================================
                RESOLUTION
            ================================================== */}

            <Card>
              <span className="eyebrow">
                RESOLUTION
              </span>

              <p>
                {claim.resolution ||
                  'No resolution recorded yet.'}
              </p>

              <p>
                <strong>
                  Resolved By:
                </strong>{' '}
                {getUserName(
                  claim.resolvedBy,
                )}
              </p>

              <p>
                <strong>
                  Resolved At:
                </strong>{' '}
                {formatDate(
                  claim.resolvedAt,
                  true,
                )}
              </p>
            </Card>
          </div>
        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            marginTop: '2rem',
          }}
        >
          <Link
            to="/admin/claims"
            className="button button--secondary"
          >
            <ArrowLeft size={18} />
            Back to Claims
          </Link>

          <Link
            to="/admin/policies"
            className="button button--secondary"
          >
            View Policies
          </Link>
        </div>
      </div>
    </section>
  );
}

export default AdminClaimDetailsPage;