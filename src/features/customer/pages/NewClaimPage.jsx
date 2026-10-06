import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  FileText,
  Upload,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import api from '../../../shared/api/axios';
import Card from '../../../shared/components/Card/Card';
import LoadingState from '../../../shared/components/LoadingState/LoadingState';

function NewClaimPage() {
  const navigate = useNavigate();

  const [policies, setPolicies] = useState([]);
  const [loadingPolicies, setLoadingPolicies] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [policy, setPolicy] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadPolicies = async () => {
      try {
        setLoadingPolicies(true);
        setError('');

        const response = await api.get('/policies/my');

        if (cancelled) {
          return;
        }

        const data = response.data;

        const loadedPolicies = Array.isArray(data)
          ? data
          : Array.isArray(data?.policies)
            ? data.policies
            : [];

        const activePolicies = loadedPolicies.filter(
          (item) => item.status === 'active',
        );

        setPolicies(activePolicies);

        if (activePolicies.length === 1) {
          setPolicy(activePolicies[0]._id);
        }
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError.response?.data?.message ||
            'Unable to load your policies.',
        );
      } finally {
        if (!cancelled) {
          setLoadingPolicies(false);
        }
      }
    };

    loadPolicies();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(
      event.target.files || [],
    );

    setDocuments(selectedFiles);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!policy) {
      setError('Please select a policy.');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a claim reason.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();

      formData.append('policy', policy);
      formData.append('reason', reason.trim());
      formData.append(
        'description',
        description.trim(),
      );

      documents.forEach((file) => {
        formData.append('documents', file);
      });

      await api.post('/claims', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

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

  if (loadingPolicies) {
    return (
      <LoadingState message="Loading your policies..." />
    );
  }

  return (
    <section className="page-placeholder">
      <div className="container">
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/claims"
            className="button button--secondary"
          >
            <ArrowLeft size={18} />
            Back to Claims
          </Link>
        </div>

        <div>
          <span className="eyebrow">
            CUSTOMER CLAIMS
          </span>

          <h1>Submit a Claim</h1>

          <p>
            Submit your insurance claim with the relevant
            details and supporting documents.
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
                You need an active policy before you can
                submit a claim.
              </p>

              <Link
                to="/policies"
                className="button button--primary"
              >
                View My Policies
              </Link>
            </div>
          </Card>
        ) : (
          <Card style={{ marginTop: '2rem' }}>
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: 'grid',
                  gap: '1.5rem',
                }}
              >
                <div>
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
                    style={{ width: '100%' }}
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
                          'Policy'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
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
                    placeholder="e.g. Accident damage"
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
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
                    style={{
                      width: '100%',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="claim-documents">
                    Supporting Documents
                  </label>

                  <div
                    style={{
                      alignItems: 'center',
                      border: '1px dashed currentColor',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      marginTop: '0.5rem',
                      padding: '2rem',
                      textAlign: 'center',
                    }}
                  >
                    <Upload size={32} />

                    <p style={{ margin: 0 }}>
                      Upload supporting documents
                    </p>

                    <input
                      id="claim-documents"
                      type="file"
                      multiple
                      onChange={handleFileChange}
                    />

                    {documents.length > 0 && (
                      <div>
                        {documents.map((file) => (
                          <div
                            key={`${file.name}-${file.size}`}
                            style={{
                              fontSize: '0.9rem',
                              marginTop: '0.25rem',
                            }}
                          >
                            {file.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    justifyContent: 'flex-end',
                    flexWrap: 'wrap',
                  }}
                >
                  <Link
                    to="/claims"
                    className="button button--secondary"
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
              </div>
            </form>
          </Card>
        )}
      </div>
    </section>
  );
}

export default NewClaimPage;