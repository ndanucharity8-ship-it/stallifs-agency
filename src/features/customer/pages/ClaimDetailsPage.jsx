import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  XCircle,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import api from '../../../shared/api/axios';
import Card from '../../../shared/components/Card/Card';
import LoadingState from '../../../shared/components/LoadingState/LoadingState';

function getStatusLabel(status) {
  switch (status) {
    case 'submitted':
      return 'Submitted';

    case 'assigned':
      return 'Assigned';

    case 'under_review':
      return 'Under Review';

    case 'information_requested':
      return 'Information Requested';

    case 'escalated':
      return 'Escalated';

    case 'approved':
      return 'Approved';

    case 'rejected':
      return 'Rejected';

    case 'settled':
      return 'Settled';

    case 'closed':
      return 'Closed';

    default:
      return status || 'Unknown';
  }
}

function getStatusClass(status) {
  switch (status) {
    case 'approved':
    case 'settled':
      return 'application-status application-status--approved';

    case 'rejected':
    case 'closed':
      return 'application-status application-status--rejected';

    case 'under_review':
    case 'assigned':
      return 'application-status application-status--review';

    case 'information_requested':
    case 'escalated':
      return 'application-status application-status--information';

    case 'submitted':
    default:
      return 'application-status application-status--pending';
  }
}

function getStatusIcon(status) {
  switch (status) {
    case 'approved':
    case 'settled':
      return <CheckCircle2 size={18} />;

    case 'rejected':
    case 'closed':
      return <XCircle size={18} />;

    default:
      return <Clock3 size={18} />;
  }
}

function formatDate(date) {
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

function getPolicyNumber(claim) {
  return (
    claim.policy?.policyNumber ||
    claim.policyNumber ||
    '—'
  );
}

function ClaimDetailsPage() {
  const { claimId } = useParams();

  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadClaim = async () => {
      try {
        setLoading(true);
        setError('');

        /*
         * The backend currently exposes GET /api/claims/my
         * rather than GET /api/claims/:id.
         *
         * We therefore load the customer's claims and
         * find the requested claim.
         */
        const response = await api.get('/claims/my');

        if (cancelled) {
          return;
        }

        const data = response.data;

        const claims = Array.isArray(data)
          ? data
          : Array.isArray(data?.claims)
            ? data.claims
            : [];

        const foundClaim = claims.find(
          (item) => item._id === claimId,
        );

        if (!foundClaim) {
          setError('Claim not found.');
          setClaim(null);
          return;
        }

        setClaim(foundClaim);
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError.response?.data?.message ||
            'Unable to load claim details.',
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

  if (loading) {
    return <LoadingState message="Loading claim details..." />;
  }

  if (error || !claim) {
    return (
      <section className="page-placeholder">
        <div className="container">
          <Link
            className="button button--secondary"
            to="/claims"
          >
            <ArrowLeft size={18} />
            Back to Claims
          </Link>

          <Card style={{ marginTop: '2rem' }}>
            <div
              className="auth-form__error"
              role="alert"
            >
              {error || 'Claim not found.'}
            </div>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="page-placeholder">
      <div className="container">
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            className="button button--secondary"
            to="/claims"
          >
            <ArrowLeft size={18} />
            Back to Claims
          </Link>
        </div>

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
              CUSTOMER CLAIM
            </span>

            <h1>
              Claim {claim._id?.slice(-8)}
            </h1>

            <p>
              Review your claim details, documents, and
              current status.
            </p>
          </div>

          <span
            className={getStatusClass(claim.status)}
          >
            {getStatusIcon(claim.status)}

            <span>
              {getStatusLabel(claim.status)}
            </span>
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(220px, 1fr))',
            marginTop: '2rem',
          }}
        >
          <Card>
            <span className="eyebrow">
              STATUS
            </span>

            <h2 style={{ marginTop: '0.5rem' }}>
              {getStatusLabel(claim.status)}
            </h2>
          </Card>

          <Card>
            <span className="eyebrow">
              POLICY
            </span>

            <h2 style={{ marginTop: '0.5rem' }}>
              {getPolicyNumber(claim)}
            </h2>
          </Card>

          <Card>
            <span className="eyebrow">
              SUBMITTED
            </span>

            <h2 style={{ marginTop: '0.5rem' }}>
              {formatDate(
                claim.submittedAt ||
                  claim.createdAt,
              )}
            </h2>
          </Card>
        </div>

        <Card style={{ marginTop: '1.5rem' }}>
          <span className="eyebrow">
            CLAIM DETAILS
          </span>

          <h2 style={{ marginTop: '0.5rem' }}>
            {claim.reason || 'Insurance Claim'}
          </h2>

          <p style={{ whiteSpace: 'pre-wrap' }}>
            {claim.description ||
              'No additional description was provided.'}
          </p>
        </Card>

        <Card style={{ marginTop: '1.5rem' }}>
          <span className="eyebrow">
            POLICY
          </span>

          <div
            style={{
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(200px, 1fr))',
              marginTop: '1rem',
            }}
          >
            <div>
              <strong>Policy Number</strong>

              <p>
                {getPolicyNumber(claim)}
              </p>
            </div>

            <div>
              <strong>Policy Status</strong>

              <p>
                {claim.policy?.status || '—'}
              </p>
            </div>

            <div>
              <strong>Start Date</strong>

              <p>
                {formatDate(
                  claim.policy?.startDate,
                )}
              </p>
            </div>

            <div>
              <strong>End Date</strong>

              <p>
                {formatDate(
                  claim.policy?.endDate,
                )}
              </p>
            </div>
          </div>
        </Card>

        <Card style={{ marginTop: '1.5rem' }}>
          <span className="eyebrow">
            DOCUMENTS
          </span>

          {claim.documents?.length > 0 ? (
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
                  >
                    <FileText size={18} />
                    View Document {index + 1}
                  </a>
                ),
              )}
            </div>
          ) : (
            <p>
              No supporting documents were uploaded.
            </p>
          )}
        </Card>

        {claim.fraudFlag && (
          <Card style={{ marginTop: '1.5rem' }}>
            <span className="eyebrow">
              ADDITIONAL REVIEW
            </span>

            <h2 style={{ marginTop: '0.5rem' }}>
              Your claim requires additional review.
            </h2>

            <p>
              The claim has been flagged for additional
              review. This does not by itself determine
              the outcome of your claim.
            </p>
          </Card>
        )}

        {claim.adminNotes && (
          <Card style={{ marginTop: '1.5rem' }}>
            <span className="eyebrow">
              CLAIM UPDATE
            </span>

            <p
              style={{
                marginTop: '0.75rem',
                whiteSpace: 'pre-wrap',
              }}
            >
              {claim.adminNotes}
            </p>
          </Card>
        )}

        <Card style={{ marginTop: '1.5rem' }}>
          <span className="eyebrow">
            TIMELINE
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
                )}
              </p>
            </div>

            <div>
              <strong>Last Updated</strong>

              <p>
                {formatDate(claim.updatedAt)}
              </p>
            </div>

            {claim.reviewedAt && (
              <div>
                <strong>Reviewed</strong>

                <p>
                  {formatDate(claim.reviewedAt)}
                </p>
              </div>
            )}

            {claim.resolvedAt && (
              <div>
                <strong>Resolved</strong>

                <p>
                  {formatDate(claim.resolvedAt)}
                </p>
              </div>
            )}

            {claim.closedAt && (
              <div>
                <strong>Closed</strong>

                <p>
                  {formatDate(claim.closedAt)}
                </p>
              </div>
            )}
          </div>
        </Card>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            marginTop: '1.5rem',
          }}
        >
          <Link
            className="button button--secondary"
            to="/claims"
          >
            <ArrowLeft size={18} />
            Back to Claims
          </Link>

          <Link
            className="button button--primary"
            to="/policies"
          >
            View My Policies
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ClaimDetailsPage;