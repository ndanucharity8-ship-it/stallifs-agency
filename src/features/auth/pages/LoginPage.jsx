import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';

import Card from '../../../shared/components/Card/Card';
import api from '../../../shared/api/axios';
import { useAuth } from '../../../app/providers/useAuth';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      setError(
        'Please enter your email address and password.',
      );
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const loggedInUser =
        response.data?.user ??
        response.data ??
        null;

      if (!loggedInUser) {
        setError(
          'Login succeeded, but the user session could not be created.',
        );
        return;
      }

      console.log(
        'STALLIFS LOGIN USER:',
        loggedInUser,
      );

      setUser(loggedInUser);

      /*
       * Temporary password protection.
       *
       * This must happen before normal route restoration.
       */
      if (loggedInUser.mustChangePassword === true) {
        navigate('/change-password', {
          replace: true,
        });

        return;
      }

      /*
       * Agent dashboard.
       */
      if (loggedInUser.role === 'agent') {
        navigate('/agent/dashboard', {
          replace: true,
        });

        return;
      }

      /*
       * Admin dashboard.
       */
      if (
        loggedInUser.role === 'admin' ||
        loggedInUser.role === 'adminAgent'
      ) {
        navigate('/admin', {
          replace: true,
        });

        return;
      }

      /*
       * Customer route restoration.
       *
       * Only restore customer-accessible routes.
       */
      const requestedPath =
        location.state?.from?.pathname;

      if (
        requestedPath &&
        requestedPath !== '/login' &&
        requestedPath !== '/change-password' &&
        !requestedPath.startsWith('/agent') &&
        !requestedPath.startsWith('/admin')
      ) {
        navigate(requestedPath, {
          replace: true,
        });

        return;
      }

      /*
       * Default customer dashboard.
       */
      navigate('/dashboard', {
        replace: true,
      });
    } catch (requestError) {
      console.error(
        'Login error:',
        requestError,
      );

      setError(
        requestError.response?.data?.message ||
          'Unable to sign in. Please check your email and password.',
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
            <ShieldCheck size={28} />
          </div>

          <span className="eyebrow">
            WELCOME BACK
          </span>

          <h1>Sign in to STALLIFS</h1>

          <p>
            Access your insurance journey, manage
            your protection, and stay connected
            with STALLIFS.
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

            <div className="form-field">
              <label htmlFor="login-email">
                Email address
              </label>

              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-field">
              <div className="form-field__header">
                <label htmlFor="login-password">
                  Password
                </label>

                <Link to="/forgot-password">
                  Forgot password?
                </Link>
              </div>

              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <button
              className="button button--primary auth-form__submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Signing In...'
                : 'Sign In'}

              {!loading && (
                <ArrowRight size={18} />
              )}
            </button>
          </form>

          <div className="auth-card__footer">
            <p>
              Don't have an account?{' '}
              <Link to="/register">
                Create one
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}

export default LoginPage;