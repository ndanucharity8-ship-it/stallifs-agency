import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';

import Card from '../../../shared/components/Card/Card';
import api from '../../../shared/api/axios';

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');

    if (!password || !confirmPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!token) {
      setError('This password reset link is invalid.');
      return;
    }

    try {
      setLoading(true);

      await api.post(`/auth/reset-password/${token}`, {
        password,
      });

      navigate('/login', {
        replace: true,
        state: {
          message:
            'Your password has been reset successfully. Please sign in with your new password.',
        },
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to reset your password. The link may have expired.',
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

          <h1>Create a new password</h1>

          <p>
            Choose a new password for your STALLIFS account. Your reset link
            expires after 15 minutes.
          </p>
        </div>

        <Card className="auth-card">
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="auth-form__error" role="alert">
                {error}
              </div>
            )}

            <div className="form-field">
              <label htmlFor="reset-password">New password</label>

              <div
                style={{
                  position: 'relative',
                }}
              >
                <LockKeyhole
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
                  id="reset-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={loading}
                  style={{
                    paddingLeft: '2.75rem',
                    paddingRight: '2.75rem',
                    width: '100%',
                  }}
                />

                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((current) => !current)}
                  disabled={loading}
                  style={{
                    background: 'transparent',
                    border: 0,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    padding: 0,
                    position: 'absolute',
                    right: '0.9rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="reset-confirm-password">
                Confirm new password
              </label>

              <div
                style={{
                  position: 'relative',
                }}
              >
                <LockKeyhole
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
                  id="reset-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  disabled={loading}
                  style={{
                    paddingLeft: '2.75rem',
                    paddingRight: '2.75rem',
                    width: '100%',
                  }}
                />

                <button
                  type="button"
                  aria-label={
                    showConfirmPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                  onClick={() =>
                    setShowConfirmPassword((current) => !current)
                  }
                  disabled={loading}
                  style={{
                    background: 'transparent',
                    border: 0,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    padding: 0,
                    position: 'absolute',
                    right: '0.9rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <button
              className="button button--primary auth-form__submit"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Updating Password...' : 'Reset Password'}

              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="auth-card__footer">
            <p>
              Remember your password?{' '}
              <Link to="/login">Sign in</Link>
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}

export default ResetPasswordPage;