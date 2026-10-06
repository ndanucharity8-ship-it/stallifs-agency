import { useEffect, useState } from 'react';
import {
  Users,
  FileText,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  DollarSign,
  Bell,
  Loader2,
} from 'lucide-react';

import { useAuth } from '../../../app/providers/useAuth';
import api from '../../../shared/api/axios';

function AgentDashboardPage() {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/agent/dashboard');

      setDashboard(response.data);
    } catch (err) {
      console.error(
        'AGENT DASHBOARD FRONTEND ERROR:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Unable to load agent dashboard.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const fetchDashboard = async () => {
      try {
        setError('');

        const response = await api.get('/agent/dashboard');

        if (mounted) {
          setDashboard(response.data);
        }
      } catch (err) {
        console.error(
          'AGENT DASHBOARD FRONTEND ERROR:',
          err
        );

        if (mounted) {
          setError(
            err.response?.data?.message ||
              'Unable to load agent dashboard.'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="page-placeholder">
        <div className="container">
          <div
            style={{
              minHeight: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
          >
            <Loader2 size={24} />
            <span>Loading agent dashboard...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page-placeholder">
        <div className="container">
          <div
            style={{
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #dc2626',
            }}
          >
            <h1>Agent Dashboard</h1>

            <p>{error}</p>

            <button
              type="button"
              onClick={loadDashboard}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={18} />
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  const stats = [
    {
      title: 'Assigned Customers',
      value: dashboard?.customers ?? 0,
      icon: Users,
    },
    {
      title: 'Active Policies',
      value: dashboard?.policies ?? 0,
      icon: ShieldCheck,
    },
    {
      title: 'Applications',
      value: dashboard?.applications ?? 0,
      icon: FileText,
    },
    {
      title: 'Renewals',
      value: dashboard?.renewals ?? 0,
      icon: RefreshCw,
    },
    {
      title: 'Cases Requiring Attention',
      value: dashboard?.cases ?? 0,
      icon: AlertTriangle,
    },
    {
      title: 'Monthly Applications',
      value: dashboard?.monthlySales ?? 0,
      icon: FileText,
    },
    {
      title: 'Monthly Commission',
      value: `KES ${Number(
        dashboard?.commission ?? 0
      ).toLocaleString()}`,
      icon: DollarSign,
    },
    {
      title: 'Unread Notifications',
      value: dashboard?.notifications ?? 0,
      icon: Bell,
    },
  ];

  return (
    <section className="page-placeholder">
      <div className="container">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '20px',
            marginBottom: '30px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1>Agent Dashboard</h1>

            <p>
              Welcome, {user?.name || 'Agent'}.
            </p>

            <p>
              Agent Code:{' '}
              <strong>
                {user?.agentCode || 'Not available'}
              </strong>
            </p>

            <p>
              Agent Status:{' '}
              <strong>
                {user?.agentStatus || 'Not available'}
              </strong>
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              border: '1px solid currentColor',
              borderRadius: '8px',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
          }}
        >
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                style={{
                  padding: '22px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  background: '#ffffff',
                  boxShadow:
                    '0 2px 8px rgba(0, 0, 0, 0.05)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '14px',
                        opacity: 0.7,
                      }}
                    >
                      {stat.title}
                    </p>

                    <h2
                      style={{
                        margin: '8px 0 0',
                        fontSize: '28px',
                      }}
                    >
                      {stat.value}
                    </h2>
                  </div>

                  <Icon size={28} />
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: '30px',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            background: '#ffffff',
          }}
        >
          <h2>Agent Overview</h2>

          <p>
            Manage your assigned customers,
            applications, policies, renewals,
            commissions, and notifications from the
            agent portal.
          </p>
        </div>
      </div>
    </section>
  );
}

export default AgentDashboardPage;