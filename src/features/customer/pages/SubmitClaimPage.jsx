import { useEffect, useState } from 'react';
import { ArrowLeft, FileText, Upload } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import api from '../../../shared/api/axios';
import Card from '../../../shared/components/card/Card';
import LoadingState from '../../../shared/components/LoadingState/LoadingState';

function SubmitClaimPage() {
  const navigate = useNavigate();

  const [policies, setPolicies] = useState([]);
  const [policy, setPolicy] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadPolicies = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/policies/my');

        if (cancelled) {
          return;
        }

        const data = response.data;

        const policyList = Array.isArray(data)
          ? data
          : Array.isArray(data?.policies)
            ? data.policies
            : [];

        const activePolicies = policyList.filter(
          (item) => item.status === 'active',
        );

        setPolicies(activePolicies);

        if (activePolicies.length > 0) {
          setPolicy(activePolicies[0]._id);
        }
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError.response?.data?.message ||
            'Unable to load your active policies.',
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!policy) {
      setError('Please select a policy.');
      return;
    }

    if (!reason.trim()) {
      setError('Please enter the reason for your claim.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const formData = new FormData();

      formData.append('policy', policy);
      formData.append('reason', reason.trim());
      formData.append('description', description.trim());

      documents.forEach((file) => {
        formData.append('documents', file);
      });

      await api.post('/claims', formData);

      navigate('/claims');
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to submit your claim.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading your policies..." />;
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

        <div>
          <span className="eyebrow">
            CUSTOMER CLAIMS
          </span>

          <h1>Submit Claim</h1>

          <p>
            Submit an insurance claim for one of your
            active policies.
          </p>
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

        {policies.length === 0 ? (
          <Card style={{ marginTop: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
              <FileText size={40} />

              <h2>No active policies</h2>

              <p>
                You need an active insurance policy before
                you can submit a claim.
              </p>

              <Link
                className="button button--primary"
                to="/policies"
              >
                View My Policies
              </Link>
            </div>
          </Card>
        ) : (
          <Card style={{ marginTop: '2rem' }}>
            <form
              onSubmit={handleSubmit}
              className="auth-form"
            >
              <div className="auth-form__field">
                <label htmlFor="claim-policy">
                  Policy
                </label>

                <select
                  id="claim-policy"
                  value={policy}
                  onChange={(event) =>
                    setPolicy(event.target.value)
                  }
                  required
                >
                  <option value="">
                    Select a policy
                  </option>

                  {policies.map((item) => (
                    <option
                      key={item._id}
                      value={item._id}
                    >
                      {item.policyNumber ||
                        'Insurance Policy'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="auth-form__field">
                <label htmlFor="claim-reason">
                  Claim Reason
                </label>

                <input
                  id="claim-reason"
                  type="text"
                  value={reason}
                  onChange={(event) =>
                    setReason(event.target.value)
                  }
                  placeholder="e.g. Accident, theft, damage"
                  required
                />
              </div>

              <div className="auth-form__field">
                <label htmlFor="claim-description">
                  Description
                </label>

                <textarea
                  id="claim-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Describe what happened and provide any relevant details..."
                  rows={6}
                />
              </div>

              <div className="auth-form__field">
                <label htmlFor="claim-documents">
                  Supporting Documents
                </label>

                <div
                  style={{
                    alignItems: 'center',
                    display: 'flex',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <Upload size={20} />

                  <input
                    id="claim-documents"
                    type="file"
                    multiple
                    onChange={(event) =>
                      setDocuments(
                        Array.from(event.target.files || []),
                      )
                    }
                  />
                </div>

                {documents.length > 0 && (
                  <p>
                    {documents.length} document
                    {documents.length === 1 ? '' : 's'} selected.
                  </p>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  justifyContent: 'flex-end',
                  flexWrap: 'wrap',
                  marginTop: '1rem',
                }}
              >
                <Link
                  className="button button--secondary"
                  to="/claims"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  className="button button--primary"
                  disabled={submitting}
                >
                  {submitting
                    ? 'Submitting...'
                    : 'Submit Claim'}
                </button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </section>
  );
}

export default SubmitClaimPage;