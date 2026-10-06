import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Mail, ShieldCheck } from 'lucide-react';

import Card from '../../../shared/components/Card/Card';
import api from '../../../shared/api/axios';

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedEmail = email.trim();

    setError('');
    setMessage('');

    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);

      const response = await api.post('/auth/forgot-password', {
        email: trimmedEmail,
      });

      setMessage(
        response.data?.message ||
          'If an account exists, a password reset link has been sent.',
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to process your password reset request. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="container auth-page__container">
        <div className="auth-page__intro">
          <div className="auth-page__icon" aria-hidden="true">
            <ShieldCheck size={28} />
          </div>

          <span className="eyebrow">PASSWORD RECOVERY</span>

          <h1>Forgot your password?</h1>

          <p>
            Enter the email address associated with your STALLIFS account and
            we will send you a secure password reset link.
          </p>
        </div>

        <Card className="auth-card">
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="auth-form__error" role="alert">
                {error}
              </div>
            )}

            {message && (
              <div className="auth-form__success" role="status">
                {message}
              </div>
            )}

            <div className="form-field">
              <label htmlFor="forgot-password-email">
                Email address
              </label>

              <div
                style={{
                  position: 'relative',
                }}
              >
                <Mail
                  size={18}
                  aria-hidden="true"
                  style={{
                    left: '0.9rem',
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                />

                <input
                  id="forgot-password-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={loading}
                  style={{
                    paddingLeft: '2.75rem',
                    width: '100%',
                  }}
                />
              </div>
            </div>

            <button
              className="button button--primary auth-form__submit"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}

              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="auth-card__footer">
            <p>
              Remember your password?{' '}
              <Link to="/login">Sign in</Link>
            </p>

            <Link className="button button--secondary" to="/login">
              <ArrowLeft size={18} />
              Back to Login
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
}

export default ForgotPasswordPage;