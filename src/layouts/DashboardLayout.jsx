import { Link, Outlet, useLocation } from 'react-router-dom';

import {
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  FileWarning,
  ClipboardList,
  Users,
  CalendarClock,
  Bell,
  User,
} from 'lucide-react';

import { useAuth } from '../app/providers/useAuth';

function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isAdmin =
    user?.role === 'admin' ||
    user?.role === 'adminAgent';

  const isAgent = user?.role === 'agent';

  const customerNavigation = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'My Applications',
      path: '/applications',
      icon: FileText,
    },
    {
      label: 'My Policies',
      path: '/policies',
      icon: ShieldCheck,
    },
    {
      label: 'My Claims',
      path: '/claims',
      icon: FileWarning,
    },
  ];

  const agentNavigation = [
    {
      label: 'Dashboard',
      path: '/agent/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Applications',
      path: '/agent/applications',
      icon: ClipboardList,
    },
    {
      label: 'Customers',
      path: '/agent/customers',
      icon: Users,
    },
    {
      label: 'Policies',
      path: '/agent/policies',
      icon: ShieldCheck,
    },
    {
      label: 'Renewals',
      path: '/agent/renewals',
      icon: CalendarClock,
    },
    {
      label: 'Commissions',
      path: '/agent/commissions',
      icon: CreditCard,
    },
    {
      label: 'Notifications',
      path: '/agent/notifications',
      icon: Bell,
    },
    {
      label: 'Profile',
      path: '/agent/profile',
      icon: User,
    },
  ];

  const adminNavigation = [
    {
      label: 'Dashboard',
      path: '/admin',
      icon: LayoutDashboard,
    },
    {
      label: 'Applications',
      path: '/admin/applications',
      icon: FileText,
    },
    {
      label: 'Policies',
      path: '/admin/policies',
      icon: ShieldCheck,
    },
    {
      label: 'Payments',
      path: '/admin/payments',
      icon: CreditCard,
    },
    {
      label: 'Claims',
      path: '/admin/claims',
      icon: FileWarning,
    },
    {
      label: 'Agent Applications',
      path: '/admin/agent-applications',
      icon: ClipboardList,
    },
  ];

  const navigation = isAdmin
    ? adminNavigation
    : isAgent
      ? agentNavigation
      : customerNavigation;

  const homePath = isAdmin
    ? '/admin'
    : isAgent
      ? '/agent/dashboard'
      : '/dashboard';

  return (
    <div className="app-shell dashboard-shell">
      <header className="site-header">
        <div className="container site-header__inner">
          <Link
            className="brand"
            to={homePath}
          >
            STALLIFS
          </Link>

          <div className="dashboard-header__actions">
            <span>
              {user?.firstName ||
                user?.name ||
                user?.email ||
                'Account'}
            </span>

            <button
              type="button"
              className="button button--ghost"
              onClick={logout}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav
        style={{
          borderBottom:
            '1px solid var(--color-border)',
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              padding: '0.75rem 0',
            }}
          >
            {navigation.map((item) => {
              const Icon = item.icon;

              const isActive =
                location.pathname === item.path ||
                location.pathname.startsWith(
                  `${item.path}/`,
                );

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={
                    isActive
                      ? 'button button--primary'
                      : 'button button--ghost'
                  }
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="site-main">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;