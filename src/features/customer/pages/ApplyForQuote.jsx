import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import api from '../../../shared/api/axios';
import Button from '../../../shared/components/Button/Button';
import Card from '../../../shared/components/Card/Card';
import LoadingState from '../../../shared/components/LoadingState/LoadingState';
import { useAuth } from '../../../app/providers/useAuth';

function ApplyForQuote() {
  const { quoteId: routeQuoteId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const quoteId =
    routeQuoteId ||
    searchParams.get('quote');

  const [quote, setQuote] = useState(null);

  const [loadingQuote, setLoadingQuote] =
    useState(Boolean(quoteId));

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    nationalId: '',
    additionalInfo: '',
  });

  useEffect(() => {
    if (authLoading || !quoteId) {
      return undefined;
    }

    let cancelled = false;

    const loadQuote = async () => {
      try {
        setLoadingQuote(true);
        setError('');

        const response = await api.get(
          `/quotes/${quoteId}`,
        );

        if (cancelled) {
          return;
        }

        const quoteData = response.data;

        setQuote(quoteData);

        setForm((current) => ({
          ...current,

          fullName:
            current.fullName ||
            quoteData.fullName ||
            user?.name ||
            '',

          phone:
            current.phone ||
            quoteData.phone ||
            user?.phone ||
            '',
        }));
      } catch (requestError) {
        if (cancelled) {
          return;
        }

        setError(
          requestError.response?.data?.message ||
            'Unable to load the selected quote.',
        );
      } finally {
        if (!cancelled) {
          setLoadingQuote(false);
        }
      }
    };

    loadQuote();

    return () => {
      cancelled = true;
    };
  }, [
    quoteId,
    authLoading,
    user?.name,
    user?.phone,
  ]);

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');

    if (!user) {
      const redirect =
        `/apply-for-quote/${encodeURIComponent(
          quoteId || '',
        )}`;

      navigate(
        `/login?redirect=${encodeURIComponent(
          redirect,
        )}`,
      );

      return;
    }

    if (!quoteId || !quote) {
      setError(
        'The selected quote could not be found.',
      );
      return;
    }

    if (!form.fullName.trim()) {
      setError(
        'Please enter your full name.',
      );
      return;
    }

    if (!form.phone.trim()) {
      setError(
        'Please enter your phone number.',
      );
      return;
    }

    if (!form.nationalId.trim()) {
      setError(
        'Please enter your National ID.',
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post(
        '/applications',
        {
          product:
            quote.product?._id ||
            quote.product,

          quote: quote._id,

          fullName:
            form.fullName.trim(),

          phone:
            form.phone.trim(),

          nationalId:
            form.nationalId.trim(),

          additionalInfo:
            form.additionalInfo.trim(),
        },
      );

      const applicationId =
        response.data?._id;

      if (applicationId) {
        navigate(
          `/applications/${applicationId}`,
        );
        return;
      }

      navigate('/applications');
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to submit your application. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <LoadingState message="Loading your account..." />
    );
  }

  if (!quoteId) {
    return (
      <section className="page-placeholder">
        <div className="container">
          <Card>
            <FileText size={32} />

            <h1>
              Unable to continue
            </h1>

            <p>
              No quote was provided.
            </p>

            <div className="hero__actions">
              <Link
                className="button button--secondary"
                to="/quote"
              >
                Back to Quote
              </Link>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  if (loadingQuote) {
    return (
      <LoadingState message="Loading your quote..." />
    );
  }

  if (!user) {
    const redirect =
      `/apply-for-quote/${encodeURIComponent(
        quoteId || '',
      )}`;

    return (
      <section className="page-placeholder">
        <div className="container">
          <Card>
            <FileText size={32} />

            <h1>
              Continue with your quote
            </h1>

            <p>
              Your quote has been calculated.
              Please sign in or create an account
              before submitting your insurance
              application.
            </p>

            <div className="hero__actions">
              <Button
                type="button"
                onClick={() =>
                  navigate(
                    `/login?redirect=${encodeURIComponent(
                      redirect,
                    )}`,
                  )
                }
              >
                Login to Continue
              </Button>

              <Link
                className="button button--secondary"
                to={`/register?redirect=${encodeURIComponent(
                  redirect,
                )}`}
              >
                Create Account
              </Link>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  if (error && !quote) {
    return (
      <section className="page-placeholder">
        <div className="container">
          <Card>
            <h1>
              Unable to continue
            </h1>

            <p>{error}</p>

            <div className="hero__actions">
              <Link
                className="button button--secondary"
                to="/quote"
              >
                Back to Quote
              </Link>
            </div>
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
            to="/quote"
          >
            <ArrowLeft size={18} />
            Back to Quote
          </Link>
        </div>

        <Card>
          <span className="eyebrow">
            INSURANCE APPLICATION
          </span>

          <h1>
            Apply for your quote
          </h1>

          <p>
            Complete the information below to
            submit your application for review.
          </p>

          {quote && (
            <div
              className="card"
              style={{
                marginTop: '2rem',
              }}
            >
              <div
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  gap: '0.75rem',
                }}
              >
                <CheckCircle2
                  size={24}
                  color="var(--color-primary)"
                />

                <div>
                  <strong>
                    {quote.product?.name ||
                      'Insurance Product'}
                  </strong>

                  <p>
                    Estimated premium:{' '}
                    <strong>
                      Ksh{' '}
                      {Number(
                        quote.estimatedPremium ||
                          0,
                      ).toLocaleString(
                        'en-KE',
                      )}
                    </strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{
              marginTop: '2rem',
              maxWidth: '720px',
            }}
          >
            {error && (
              <div
                role="alert"
                style={{
                  background:
                    'var(--color-surface-muted)',
                  border:
                    '1px solid var(--color-border)',
                  borderRadius:
                    'var(--radius-md)',
                  marginBottom: '1.5rem',
                  padding: '1rem',
                }}
              >
                {error}
              </div>
            )}

            <div className="quote-field">
              <label htmlFor="fullName">
                Full name
              </label>

              <input
                id="fullName"
                name="fullName"
                type="text"
                value={form.fullName}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </div>

            <div className="quote-field">
              <label htmlFor="phone">
                Phone number
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                autoComplete="tel"
                required
              />
            </div>

            <div className="quote-field">
              <label htmlFor="nationalId">
                National ID
              </label>

              <input
                id="nationalId"
                name="nationalId"
                type="text"
                value={form.nationalId}
                onChange={handleChange}
                autoComplete="off"
                required
              />
            </div>

            <div className="quote-field">
              <label htmlFor="additionalInfo">
                Additional information
              </label>

              <textarea
                id="additionalInfo"
                name="additionalInfo"
                value={
                  form.additionalInfo
                }
                onChange={handleChange}
                placeholder="Add any information that may help with your application."
                rows={5}
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? 'Submitting Application...'
                : 'Submit Application'}
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
}

export default ApplyForQuote;