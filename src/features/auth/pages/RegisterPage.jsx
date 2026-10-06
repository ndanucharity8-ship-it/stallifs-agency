import { useState } from 'react';
import {
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';

import Card from '../../../shared/components/Card/Card';
import api from '../../../shared/api/axios';
import { useAuth } from '../../../app/providers/AuthContext';

function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshProfile } = useAuth();

  const quoteId = searchParams.get('quoteId');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();

    if (!firstName || !lastName) {
      setError('Please enter your first and last name.');
      return;
    }

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    if (!phone) {
      setError('Please enter your phone number.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      await api.post('/auth/register', {
        name: `${firstName} ${lastName}`,
        email,
        phone,
        password: form.password,
        quoteId: quoteId || undefined,
      });

      // Registration sets the authentication cookie.
      // Refresh AuthProvider so ProtectedRoute sees the
      // newly registered customer as authenticated.
      const profileResponse = await refreshProfile();

      if (!profileResponse) {
        setError(
          'Your account was created, but we could not establish your session. Please sign in.',
        );
        return;
      }

      if (quoteId) {
        navigate(`/apply-for-quote/${quoteId}`, {
          replace: true,
        });
        return;
      }

      navigate('/dashboard', {
        replace: true,
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to create your account. Please try again.',
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

          <span className="eyebrow">GET STARTED</span>

          <h1>Create your STALLIFS account</h1>

          <p>
            {quoteId
              ? 'Create your account to continue with your insurance application.'
              : 'Create an account to manage your insurance journey and keep your protection details in one place.'}
          </p>
        </div>

        <Card className="auth-card">
          {quoteId && (
            <div className="auth-form__notice">
              Your quote has been saved. After creating your account,
              you will continue directly to your application.
            </div>
          )}

          {error && (
            <div className="auth-form__error" role="alert">
              {error}
            </div>
          )}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <div className="form-field">
              <label htmlFor="register-first-name">
                First name
              </label>

              <input
                id="register-first-name"
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="First name"
                value={form.firstName}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="register-last-name">
                Last name
              </label>

              <input
                id="register-last-name"
                name="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Last name"
                value={form.lastName}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="register-email">
                Email address
              </label>

              <input
                id="register-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="register-phone">
                Phone number
              </label>

              <input
                id="register-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="07XXXXXXXX"
                value={form.phone}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="register-password">
                Password
              </label>

              <input
                id="register-password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="register-confirm-password">
                Confirm password
              </label>

              <input
                id="register-confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <button
              className="button button--primary auth-form__submit"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}

              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="auth-card__footer">
            <p>
              Already have an account?{' '}
              <Link
                to={
                  quoteId
                    ? `/login?quoteId=${quoteId}`
                    : '/login'
                }
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}

export default RegisterPage;