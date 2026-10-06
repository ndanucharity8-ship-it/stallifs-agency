import { useEffect, useState } from 'react';
import {
Activity,
AlertTriangle,
ArrowUpRight,
CheckCircle,
Clock,
CreditCard,
FileText,
Package,
Shield,
Users,
XCircle,
} from 'lucide-react';
import { api } from '../../../shared/api';

function AdminDashboardPage() {
const [dashboard, setDashboard] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

const loadDashboard = async () => {
try {
setLoading(true);
setError('');


  const response = await api.get('/admin/stats');

  setDashboard(response.data);
} catch (err) {
  console.error('Failed to load admin dashboard:', err);

  setError(
    err.response?.data?.message ||
      'Unable to load the admin dashboard.'
  );
} finally {
  setLoading(false);
}


};

useEffect(() => {
loadDashboard();
}, []);

if (loading) {
return ( <section className="admin-dashboard"> <div className="admin-dashboard__loading"> <div className="admin-dashboard__spinner" /> <p>Loading admin dashboard...</p> </div> </section>
);
}

if (error) {
return ( <section className="admin-dashboard"> <div className="admin-dashboard__error"> <AlertTriangle size={28} />


      <div>
        <h2>Dashboard unavailable</h2>
        <p>{error}</p>

        <button
          type="button"
          onClick={loadDashboard}
          className="admin-dashboard__retry"
        >
          Try again
        </button>
      </div>
    </div>
  </section>
);


}

const stats = dashboard?.stats || {};
const charts = dashboard?.charts || {};
const aiInsights = dashboard?.aiInsights || [];
const systemHealth = dashboard?.systemHealth || {};
const underwritingQueue = dashboard?.underwritingQueue || [];
const claimsQueue = dashboard?.claimsQueue || [];
const activities = dashboard?.activities || [];
const fraudAlerts = dashboard?.fraudAlerts || [];

const formatCurrency = (value) => {
return new Intl.NumberFormat('en-KE', {
style: 'currency',
currency: 'KES',
maximumFractionDigits: 0,
}).format(value || 0);
};

const formatDate = (value) => {
if (!value) return 'N/A';


return new Date(value).toLocaleDateString('en-KE', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});


};

const formatDateTime = (value) => {
if (!value) return 'N/A';


return new Date(value).toLocaleString('en-KE', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});


};

const getStatusClass = (status) => {
if (!status) return 'neutral';

const normalized = String(status).toLowerCase();

if (
normalized.includes('success') ||
normalized.includes('approved') ||
normalized.includes('active') ||
normalized.includes('healthy')
) {
return 'success';
}

if (
normalized.includes('pending') ||
normalized.includes('review') ||
normalized.includes('information') ||
normalized.includes('warning')
) {
return 'warning';
}

if (
normalized.includes('failed') ||
normalized.includes('rejected') ||
normalized.includes('danger') ||
normalized.includes('high')
) {
return 'danger';
}

return 'neutral';
};

return ( <section className="admin-dashboard"> <div className="admin-dashboard__container">


    {/* HEADER */}
    <div className="admin-dashboard__header">
      <div>
        <span className="admin-dashboard__eyebrow">
          STALLIFS ADMINISTRATION
        </span>

        <h1>Admin Dashboard</h1>

        <p>
          Monitor customers, policies, payments, applications,
          claims and underwriting activity from one place.
        </p>
      </div>

      <button
        type="button"
        className="admin-dashboard__refresh"
        onClick={loadDashboard}
      >
        <Activity size={18} />
        Refresh
      </button>
    </div>

    {/* STAT CARDS */}
    <div className="admin-dashboard__stats">

      <div className="admin-stat-card">
        <div className="admin-stat-card__icon">
          <Users size={22} />
        </div>

        <div>
          <span>Customers</span>
          <strong>{stats.customers || 0}</strong>
        </div>

        <ArrowUpRight size={18} className="admin-stat-card__arrow" />
      </div>

      <div className="admin-stat-card">
        <div className="admin-stat-card__icon">
          <Package size={22} />
        </div>

        <div>
          <span>Products</span>
          <strong>{stats.products || 0}</strong>
        </div>

        <ArrowUpRight size={18} className="admin-stat-card__arrow" />
      </div>

      <div className="admin-stat-card">
        <div className="admin-stat-card__icon">
          <FileText size={22} />
        </div>

        <div>
          <span>Applications</span>
          <strong>{stats.applications || 0}</strong>
        </div>

        <ArrowUpRight size={18} className="admin-stat-card__arrow" />
      </div>

      <div className="admin-stat-card">
        <div className="admin-stat-card__icon">
          <Shield size={22} />
        </div>

        <div>
          <span>Policies</span>
          <strong>{stats.policies || 0}</strong>
        </div>

        <ArrowUpRight size={18} className="admin-stat-card__arrow" />
      </div>

      <div className="admin-stat-card">
        <div className="admin-stat-card__icon">
          <CreditCard size={22} />
        </div>

        <div>
          <span>Payments</span>
          <strong>{stats.payments || 0}</strong>
        </div>

        <ArrowUpRight size={18} className="admin-stat-card__arrow" />
      </div>

      <div className="admin-stat-card admin-stat-card--revenue">
        <div className="admin-stat-card__icon">
          <ArrowUpRight size={22} />
        </div>

        <div>
          <span>Total Revenue</span>
          <strong>{formatCurrency(stats.revenue)}</strong>
        </div>
      </div>

    </div>

    {/* SYSTEM HEALTH + AI */}
    <div className="admin-dashboard__top-grid">

      <div className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <span className="admin-panel__eyebrow">
              SYSTEM
            </span>
            <h2>System Health</h2>
          </div>

          <span
            className={`admin-status admin-status--${getStatusClass(
              systemHealth.overall
            )}`}
          >
            {systemHealth.overall || 'Unknown'}
          </span>
        </div>

        <div className="system-health">

          <div className="system-health__item">
            <CheckCircle size={18} />
            <div>
              <span>Database</span>
              <strong>{systemHealth.database || 'Unknown'}</strong>
            </div>
          </div>

          <div className="system-health__item">
            <CheckCircle size={18} />
            <div>
              <span>API</span>
              <strong>{systemHealth.api || 'Unknown'}</strong>
            </div>
          </div>

          <div className="system-health__item">
            <Clock size={18} />
            <div>
              <span>Underwriting Queue</span>
              <strong>
                {systemHealth.underwritingQueue || 0}
              </strong>
            </div>
          </div>

          <div className="system-health__item">
            <Shield size={18} />
            <div>
              <span>Active Policies</span>
              <strong>
                {systemHealth.activePolicies || 0}
              </strong>
            </div>
          </div>

          <div className="system-health__item">
            <CreditCard size={18} />
            <div>
              <span>Pending Payments</span>
              <strong>
                {systemHealth.pendingPayments || 0}
              </strong>
            </div>
          </div>

          <div className="system-health__item">
            <AlertTriangle size={18} />
            <div>
              <span>Pending Claims</span>
              <strong>
                {systemHealth.pendingClaims || 0}
              </strong>
            </div>
          </div>

        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <span className="admin-panel__eyebrow">
              AI MONITORING
            </span>
            <h2>AI Insights</h2>
          </div>
        </div>

        <div className="ai-insights">

          {aiInsights.length === 0 ? (
            <div className="admin-empty">
              <CheckCircle size={22} />
              <p>No insights available.</p>
            </div>
          ) : (
            aiInsights.map((insight, index) => (
              <div
                className={`ai-insight ai-insight--${getStatusClass(
                  insight.type
                )}`}
                key={`${insight.title}-${index}`}
              >
                <div className="ai-insight__icon">
                  {insight.type === 'danger' ? (
                    <AlertTriangle size={18} />
                  ) : insight.type === 'warning' ? (
                    <Clock size={18} />
                  ) : (
                    <CheckCircle size={18} />
                  )}
                </div>

                <div>
                  <strong>{insight.title}</strong>
                  <p>{insight.description}</p>
                </div>
              </div>
            ))
          )}

        </div>
      </div>

    </div>

    {/* CHARTS */}
    <div className="admin-dashboard__charts">

      <div className="admin-panel admin-chart-panel">
        <div className="admin-panel__header">
          <div>
            <span className="admin-panel__eyebrow">
              REVENUE
            </span>
            <h2>Revenue Overview</h2>
          </div>
        </div>

        <div className="admin-chart">
          {charts.revenue?.length ? (
            <div className="chart-bars">
              {charts.revenue.map((item, index) => {
                const maxRevenue = Math.max(
                  ...charts.revenue.map(
                    (entry) => entry.revenue || 0
                  ),
                  1
                );

                const height =
                  ((item.revenue || 0) / maxRevenue) * 100;

                return (
                  <div
                    className="chart-bar-column"
                    key={`${item.month}-${index}`}
                  >
                    <div className="chart-bar-value">
                      {formatCurrency(item.revenue)}
                    </div>

                    <div className="chart-bar-track">
                      <div
                        className="chart-bar-fill"
                        style={{
                          height: `${Math.max(height, 3)}%`,
                        }}
                      />
                    </div>

                    <span>{item.month}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="admin-empty">
              <p>No revenue data available.</p>
            </div>
          )}
        </div>
      </div>

      <div className="admin-panel admin-chart-panel">
        <div className="admin-panel__header">
          <div>
            <span className="admin-panel__eyebrow">
              APPLICATIONS
            </span>
            <h2>Application Activity</h2>
          </div>
        </div>

        <div className="admin-chart">
          {charts.applications?.length ? (
            <div className="simple-chart-list">
              {charts.applications.map((item, index) => (
                <div
                  className="simple-chart-row"
                  key={`${item.month}-${index}`}
                >
                  <span>{item.month}</span>

                  <div className="simple-chart-track">
                    <div
                      className="simple-chart-fill"
                      style={{
                        width: `${Math.min(
                          (item.applications /
                            Math.max(
                              ...charts.applications.map(
                                (entry) =>
                                  entry.applications || 0
                              ),
                              1
                            )) *
                            100,
                          100
                        )}%`,
                      }}
                    />
                  </div>

                  <strong>{item.applications}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-empty">
              <p>No application data available.</p>
            </div>
          )}
        </div>
      </div>

    </div>

    {/* RISK + PAYMENT CHARTS */}
    <div className="admin-dashboard__three-grid">

      <div className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <span className="admin-panel__eyebrow">
              UNDERWRITING
            </span>
            <h2>Risk Distribution</h2>
          </div>
        </div>

        <div className="risk-chart">
          {(charts.risk || []).map((item) => (
            <div className="risk-row" key={item.name}>
              <div className="risk-row__label">
                <span>{item.name}</span>
                <strong>{item.value}</strong>
              </div>

              <div className="risk-row__track">
                <div
                  className={`risk-row__fill risk-row__fill--${item.name.toLowerCase()}`}
                  style={{
                    width: `${Math.min(
                      ((item.value || 0) /
                        Math.max(
                          ...(charts.risk || []).map(
                            (entry) => entry.value || 0
                          ),
                          1
                        )) *
                        100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <span className="admin-panel__eyebrow">
              PAYMENTS
            </span>
            <h2>Payment Activity</h2>
          </div>
        </div>

        <div className="payment-chart">
          {(charts.payments || []).length ? (
            charts.payments.map((item, index) => (
              <div
                className="payment-chart__row"
                key={`${item.month}-${index}`}
              >
                <span>{item.month}</span>

                <div className="payment-chart__values">
                  <span className="payment-success">
                    Success {item.success || 0}
                  </span>

                  <span className="payment-pending">
                    Pending {item.pending || 0}
                  </span>

                  <span className="payment-failed">
                    Failed {item.failed || 0}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="admin-empty">
              <p>No payment data available.</p>
            </div>
          )}
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-panel__header">
          <div>
            <span className="admin-panel__eyebrow">
              CLAIMS
            </span>
            <h2>Claims Activity</h2>
          </div>
        </div>

        <div className="simple-chart-list">
          {(charts.claims || []).length ? (
            charts.claims.map((item, index) => (
              <div
                className="simple-chart-row"
                key={`${item.month}-${index}`}
              >
                <span>{item.month}</span>

                <div className="simple-chart-track">
                  <div
                    className="simple-chart-fill simple-chart-fill--claims"
                    style={{
                      width: `${Math.min(
                        ((item.claims || 0) /
                          Math.max(
                            ...(charts.claims || []).map(
                              (entry) => entry.claims || 0
                            ),
                            1
                          )) *
                          100,
                        100
                      )}%`,
                    }}
                  />
                </div>

                <strong>{item.claims || 0}</strong>
              </div>
            ))
          ) : (
            <div className="admin-empty">
              <p>No claims data available.</p>
            </div>
          )}
        </div>
      </div>

    </div>

    {/* UNDERWRITING QUEUE */}
    <div className="admin-panel">
      <div className="admin-panel__header">
        <div>
          <span className="admin-panel__eyebrow">
            UNDERWRITING
          </span>
          <h2>Underwriting Queue</h2>
        </div>

        <span className="admin-panel__count">
          {underwritingQueue.length}
        </span>
      </div>

      {underwritingQueue.length === 0 ? (
        <div className="admin-empty admin-empty--large">
          <CheckCircle size={28} />
          <h3>Queue is clear</h3>
          <p>No applications currently require underwriting attention.</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Product</th>
                <th>Status</th>
                <th>Risk</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {underwritingQueue.map((application) => (
                <tr key={application._id}>
                  <td>
                    <strong>
                      {application.user?.name || 'Unknown'}
                    </strong>

                    <span>
                      {application.user?.email || 'N/A'}
                    </span>
                  </td>

                  <td>
                    {application.product?.name || 'N/A'}
                  </td>

                  <td>
                    <span
                      className={`admin-status admin-status--${getStatusClass(
                        application.status
                      )}`}
                    >
                      {application.status || 'Unknown'}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`admin-status admin-status--${getStatusClass(
                        application.riskLevel
                      )}`}
                    >
                      {application.riskLevel || 'N/A'}
                    </span>
                  </td>

                  <td>
                    {formatDate(application.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

    {/* CLAIMS QUEUE */}
    <div className="admin-panel">
      <div className="admin-panel__header">
        <div>
          <span className="admin-panel__eyebrow">
            CLAIMS
          </span>
          <h2>Claims Queue</h2>
        </div>

        <span className="admin-panel__count">
          {claimsQueue.length}
        </span>
      </div>

      {claimsQueue.length === 0 ? (
        <div className="admin-empty admin-empty--large">
          <CheckCircle size={28} />
          <h3>No claims waiting</h3>
          <p>There are no claims currently awaiting review.</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Policy</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {claimsQueue.map((claim) => (
                <tr key={claim._id}>
                  <td>
                    <strong>
                      {claim.user?.name || 'Unknown'}
                    </strong>

                    <span>
                      {claim.user?.email || 'N/A'}
                    </span>
                  </td>

                  <td>
                    {claim.policy?.policyNumber || 'N/A'}
                  </td>

                  <td>
                    <span
                      className={`admin-status admin-status--${getStatusClass(
                        claim.status
                      )}`}
                    >
                      {claim.status || 'Unknown'}
                    </span>
                  </td>

                  <td>
                    {formatDate(claim.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>

    {/* FRAUD ALERTS */}
    <div className="admin-panel">
      <div className="admin-panel__header">
        <div>
          <span className="admin-panel__eyebrow">
            SECURITY
          </span>
          <h2>Fraud Alerts</h2>
        </div>

        <span className="admin-panel__count admin-panel__count--danger">
          {fraudAlerts.length}
        </span>
      </div>

      {fraudAlerts.length === 0 ? (
        <div className="admin-empty admin-empty--large">
          <CheckCircle size={28} />
          <h3>No fraud alerts</h3>
          <p>No claims have currently been flagged for potential fraud.</p>
        </div>
      ) : (
        <div className="fraud-alerts">
          {fraudAlerts.map((alert) => (
            <div
              className="fraud-alert"
              key={alert.id}
            >
              <div className="fraud-alert__icon">
                <AlertTriangle size={20} />
              </div>

              <div className="fraud-alert__content">
                <strong>{alert.customer}</strong>

                <span>
                  Policy: {alert.policy}
                </span>

                <p>{alert.reason}</p>

                <small>
                  {formatDateTime(alert.createdAt)}
                </small>
              </div>

              <span
                className={`admin-status admin-status--${getStatusClass(
                  alert.status
                )}`}
              >
                {alert.status || 'Review'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* RECENT ACTIVITY */}
    <div className="admin-panel">
      <div className="admin-panel__header">
        <div>
          <span className="admin-panel__eyebrow">
            ACTIVITY
          </span>
          <h2>Recent Activity</h2>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="admin-empty admin-empty--large">
          <Activity size={28} />
          <h3>No recent activity</h3>
          <p>System activity will appear here.</p>
        </div>
      ) : (
        <div className="activity-list">
          {activities.map((activity, index) => (
            <div
              className="activity-item"
              key={`${activity.createdAt}-${index}`}
            >
              <div className="activity-item__icon">
                {activity.type === 'claim' ? (
                  <Shield size={18} />
                ) : (
                  <FileText size={18} />
                )}
              </div>

              <div className="activity-item__content">
                <strong>
                  {activity.title || 'Activity'}
                </strong>

                <p>
                  {activity.description || ''}
                </p>

                <span>
                  Performed by:{' '}
                  {activity.performedBy || 'System'}
                </span>
              </div>

              <time>
                {formatDateTime(activity.createdAt)}
              </time>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* FOOTER STATUS */}
    <div className="admin-dashboard__footer">
      <div>
        <span>
          Last checked
        </span>

        <strong>
          {formatDateTime(
            dashboard?.checkedAt ||
              systemHealth.checkedAt
          )}
        </strong>
      </div>

      <div className="admin-dashboard__footer-status">
        <CheckCircle size={17} />
        STALLIFS systems operational
      </div>
    </div>

  </div>
</section>


);
}

export default AdminDashboardPage;
