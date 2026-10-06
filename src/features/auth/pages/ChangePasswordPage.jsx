import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockKeyhole, ArrowRight } from 'lucide-react';

import Card from '../../../shared/components/Card/Card';
import api from '../../../shared/api/axios';
import { useAuth } from '../../../app/providers/useAuth';

function ChangePasswordPage() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError('');
    setSuccess('');

    if (!password || !confirmPassword) {
      setError(
        'Please enter and confirm your new password.',
      );
      return;
    }

    if (password.length < 8) {
      setError(
        'Password must be at least 8 characters long.',
      );
      return;
    }

    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      await api.post('/auth/change-password', {
        password,
      });

      const refreshedProfile =
        await refreshProfile();

      const updatedUser =
        refreshedProfile?.user ??
        refreshedProfile ??
        user ??
        null;

      setSuccess(
        'Your password has been changed successfully.',
      );

      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        if (updatedUser?.role === 'agent') {
          navigate('/agent/dashboard', {
            replace: true,
          });

          return;
        }

        if (
          updatedUser?.role === 'admin' ||
          updatedUser?.role === 'adminAgent'
        ) {
          navigate('/admin', {
            replace: true,
          });

          return;
        }

        navigate('/dashboard', {
          replace: true,
        });
      }, 500);
    } catch (requestError) {
      console.error(
        'Change password error:',
        requestError,
      );

      setError(
        requestError.response?.data?.message ||
          'Unable to change your password. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="container auth-page__container">
        <div className="auth-page__intro">
          <div
            className="auth-page__icon"
            aria-hidden="true"
          >
            <LockKeyhole size={28} />
          </div>

          <span className="eyebrow">
            FIRST LOGIN
          </span>

          <h1>Change your password</h1>

          <p>
            Welcome to STALLIFS
            {user?.name ? `, ${user.name}` : ''}.
            For your security, you must change your
            temporary password before continuing.
          </p>
        </div>

        <Card className="auth-card">
          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            {error && (
              <div
                className="auth-form__error"
                role="alert"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                className="auth-form__success"
                role="status"
              >
                {success}
              </div>
            )}

            <div className="form-field">
              <label htmlFor="new-password">
                New password
              </label>

              <input
                id="new-password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Enter your new password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                disabled={loading}
              />
            </div>

            <div className="form-field">
              <label htmlFor="confirm-password">
                Confirm new password
              </label>

              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value,
                  )
                }
                disabled={loading}
              />
            </div>

            <button
              className="button button--primary auth-form__submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Updating Password...'
                : 'Change Password'}

              {!loading && (
                <ArrowRight size={18} />
              )}
            </button>
          </form>
        </Card>
      </div>
    </section>
  );
}

export default ChangePasswordPage;