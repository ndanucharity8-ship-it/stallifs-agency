import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  FileText,
  Send,
  Upload,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import api from '../../../shared/api/axios';
import Card from '../../../shared/components/Card/Card';
import LoadingState from '../../../shared/components/LoadingState/LoadingState';

function RespondToInformationPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [customerResponse, setCustomerResponse] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleDocumentChange = (event) => {
    setDocuments(Array.from(event.target.files || []));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !customerResponse.trim() &&
      documents.length === 0
    ) {
      setError(
        'Please provide a response or upload at least one supporting document.',
      );
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const formData = new FormData();

      formData.append(
        'customerResponse',
        customerResponse.trim(),
      );

      documents.forEach((document) => {
        formData.append('documents', document);
      });

      await api.post(
        `/applications/${applicationId}/respond`,
        formData,
      );

      setSuccess(
        'Your response has been submitted successfully.',
      );

      setTimeout(() => {
        navigate(`/applications/${applicationId}`);
      }, 800);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to submit your response.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <LoadingState message="Loading your application..." />
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
              to="/applications"
            >
              <ArrowLeft size={18} />
              Back to Applications
            </Link>
          </Card>
        </div>
      </section>
    );
  }

  if (
    application?.status !== 'information_requested'
  ) {
    return (
      <section className="page-placeholder">
        <div className="container">
          <Card>
            <FileText size={36} />

            <h1>No response required</h1>

            <p>
              This application is not currently awaiting
              additional information.
            </p>

            <Link
              className="button button--secondary"
              to={`/applications/${applicationId}`}
            >
              <ArrowLeft size={18} />
              Back to Application
            </Link>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="page-placeholder">
      <div className="container">
        <div className="hero__actions">
          <Link
            className="button button--ghost"
            to={`/applications/${applicationId}`}
          >
            <ArrowLeft size={18} />
            Back to Application
          </Link>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <span className="eyebrow">
            {application.applicationNumber ||
              'INSURANCE APPLICATION'}
          </span>

          <h1>Additional Information Required</h1>

          <p>
            Please provide the information requested by the
            STALLIFS underwriting team.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gap: '1.5rem',
            marginTop: '2rem',
          }}
        >
          <Card>
            <span className="eyebrow">
              INFORMATION REQUESTED
            </span>

            <div
              style={{
                background:
                  'var(--color-surface-muted)',
                border:
                  '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                marginTop: '1rem',
                padding: '1.25rem',
              }}
            >
              <p style={{ margin: 0 }}>
                {application.informationRequest ||
                  'Additional information is required for this application.'}
              </p>
            </div>
          </Card>

          <Card>
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="customerResponse">
                  Your response
                </label>

                <textarea
                  id="customerResponse"
                  name="customerResponse"
                  value={customerResponse}
                  onChange={(event) =>
                    setCustomerResponse(event.target.value)
                  }
                  placeholder="Provide the requested information..."
                  rows={7}
                  style={{
                    marginTop: '0.5rem',
                    width: '100%',
                  }}
                  disabled={submitting}
                />
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <label htmlFor="documents">
                  Supporting documents
                </label>

                <div
                  style={{
                    alignItems: 'center',
                    border:
                      '1px dashed var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    gap: '0.75rem',
                    marginTop: '0.5rem',
                    padding: '1rem',
                  }}
                >
                  <Upload size={20} />

                  <input
                    id="documents"
                    name="documents"
                    type="file"
                    multiple
                    onChange={handleDocumentChange}
                    disabled={submitting}
                  />
                </div>

                {documents.length > 0 && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <p>
                      <strong>
                        {documents.length}{' '}
                        {documents.length === 1
                          ? 'file'
                          : 'files'}{' '}
                        selected
                      </strong>
                    </p>

                    <ul>
                      {documents.map((document) => (
                        <li key={`${document.name}-${document.size}`}>
                          {document.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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
                  style={{
                    marginTop: '1.5rem',
                  }}
                  role="status"
                >
                  {success}
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginTop: '1.5rem',
                }}
              >
                <Link
                  className="button button--secondary"
                  to={`/applications/${applicationId}`}
                >
                  Cancel
                </Link>

                <button
                  className="button button--primary"
                  type="submit"
                  disabled={submitting}
                >
                  <Send size={18} />

                  {submitting
                    ? 'Submitting...'
                    : 'Submit Information'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default RespondToInformationPage;