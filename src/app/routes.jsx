import { Navigate, Route, Routes } from 'react-router-dom';

import ProtectedRoute from './ProtectedRoute';
import RoleGuard from './RoleGuard';

import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';

import LandingPage from '../features/landing/LandingPage';

import ProductsPage from '../features/products/pages/ProductsPage';
import ProductDetailsPage from '../features/products/pages/ProductDetailsPage';

import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage';
import ChangePasswordPage from '../features/auth/pages/ChangePasswordPage';

import GetQuote from '../features/quotes/pages/GetQuote';

import ApplyAgentPage from '../features/agent/pages/ApplyAgentPage';
import AgentDashboardPage from '../features/agent/pages/AgentDashboardPage';
import AgentApplicationsPage from '../features/agent/pages/AgentApplicationsPage';
import AgentProfilePage from '../features/agent/pages/AgentProfilePage';
import AgentCustomersPage from '../features/agent/pages/AgentCustomersPage';
import AgentPoliciesPage from '../features/agent/pages/AgentPoliciesPage';
import AgentRenewalsPage from '../features/agent/pages/AgentRenewalsPage';
import AgentNotificationsPage from '../features/agent/pages/AgentNotificationsPage';
import AgentCommissionsPage from '../features/agent/pages/AgentCommissionsPage';

import ApplyForQuote from '../features/customer/pages/ApplyForQuote';
import MyApplicationsPage from '../features/customer/pages/MyApplicationsPage';
import ApplicationDetailsPage from '../features/customer/pages/ApplicationDetailsPage';
import RespondToInformationPage from '../features/customer/pages/RespondToInformationPage';
import MyPoliciesPage from '../features/customer/pages/MyPoliciesPage';
import PolicyDetailsPage from '../features/customer/pages/PolicyDetailsPage';
import MyPaymentsPage from '../features/customer/pages/MyPaymentsPage';
import MyClaimsPage from '../features/customer/pages/MyClaimsPage';
import NewClaimPage from '../features/customer/pages/NewClaimPage';
import ClaimDetailsPage from '../features/customer/pages/ClaimDetailsPage';
import CustomerDashboardPage from '../features/customer/pages/CustomerDashboardPage';

import AdminApplicationsPage from '../features/admin/pages/AdminApplicationsPage';
import AdminApplicationDetailsPage from '../features/admin/pages/AdminApplicationDetailsPage';
import AdminPoliciesPage from '../features/admin/pages/AdminPoliciesPage';
import AdminPolicyDetailsPage from '../features/admin/pages/AdminPolicyDetailsPage';
import AdminPaymentsPage from '../features/admin/pages/AdminPaymentsPage';
import AdminPaymentDetailsPage from '../features/admin/pages/AdminPaymentDetailsPage';
import AdminClaimsPage from '../features/admin/pages/AdminClaimsPage';
import AdminClaimDetailsPage from '../features/admin/pages/AdminClaimDetailsPage';
import AdminAgentApplicationsPage from '../features/admin/pages/AdminAgentApplicationsPage';
import AdminDashboardPage from '../features/admin/pages/AdminDashboardPage';
import AdminAgentApplicationDetailsPage from '../features/admin/pages/AdminAgentApplicationDetailsPage';

function PlaceholderPage({ title }) {
  return (
    <section className="page-placeholder">
      <div className="container">
        <h1>{title}</h1>

        <p>
          This STALLIFS page will be implemented in the next
          development phase.
        </p>
      </div>
    </section>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* =====================================================
          PUBLIC ROUTES
      ====================================================== */}

      <Route element={<PublicLayout />}>
        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/products"
          element={<ProductsPage />}
        />

        <Route
          path="/products/:id"
          element={<ProductDetailsPage />}
        />

        <Route
          path="/quote"
          element={<GetQuote />}
        />

        <Route
          path="/apply"
          element={<ApplyForQuote />}
        />

        <Route
          path="/apply-agent"
          element={<ApplyAgentPage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />

        <Route
          path="/reset-password/:token"
          element={<ResetPasswordPage />}
        />
      </Route>

      {/* =====================================================
          ALL AUTHENTICATED ROUTES
      ====================================================== */}

      <Route element={<ProtectedRoute />}>
        {/* =================================================
            TEMPORARY PASSWORD
        ================================================== */}

        <Route
          path="/change-password"
          element={<ChangePasswordPage />}
        />

        {/* =================================================
            CUSTOMER ROUTES
        ================================================== */}

        <Route
          element={
            <RoleGuard allowedRoles={['customer']} />
          }
        >
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<CustomerDashboardPage />} />

            <Route
              path="/apply-for-quote/:quoteId"
              element={<ApplyForQuote />}
            />

            <Route
              path="/applications"
              element={<MyApplicationsPage />}
            />

            <Route
              path="/applications/:applicationId/respond"
              element={<RespondToInformationPage />}
            />

            <Route
              path="/applications/:applicationId"
              element={<ApplicationDetailsPage />}
            />

            <Route
              path="/policies"
              element={<MyPoliciesPage />}
            />

            <Route
              path="/policies/:policyId"
              element={<PolicyDetailsPage />}
            />

            <Route
              path="/payments"
              element={<MyPaymentsPage />}
            />

            <Route
              path="/claims"
              element={<MyClaimsPage />}
            />

            <Route
              path="/claims/new"
              element={<NewClaimPage />}
            />

            <Route
              path="/claims/:claimId"
              element={<ClaimDetailsPage />}
            />
          </Route>
        </Route>

        {/* =================================================
            AGENT ROUTES
        ================================================== */}

        <Route
          element={
            <RoleGuard allowedRoles={['agent']} />
          }
        >
          <Route element={<DashboardLayout />}>
            <Route
              path="/agent/dashboard"
              element={<AgentDashboardPage />}
            />

            <Route
              path="/agent/applications"
              element={<AgentApplicationsPage />}
            />

            <Route
              path="/agent/profile"
              element={<AgentProfilePage />}
            />

            <Route
              path="/agent/customers"
              element={<AgentCustomersPage />}
            />

            <Route
              path="/agent/policies"
              element={<AgentPoliciesPage />}
            />

            <Route
              path="/agent/renewals"
              element={<AgentRenewalsPage />}
            />

            <Route
              path="/agent/notifications"
              element={<AgentNotificationsPage />}
            />

            <Route
              path="/agent/commissions"
              element={<AgentCommissionsPage />}
            />
          </Route>
        </Route>

        {/* =================================================
            ADMIN ROUTES
        ================================================== */}

        <Route
          element={
            <RoleGuard
              allowedRoles={['admin', 'adminAgent']}
            />
          }
        >
          <Route element={<DashboardLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />

            <Route
              path="/admin/applications"
              element={<AdminApplicationsPage />}
            />

            <Route
              path="/admin/applications/:applicationId"
              element={<AdminApplicationDetailsPage />}
            />

            <Route
              path="/admin/policies"
              element={<AdminPoliciesPage />}
            />

            <Route
              path="/admin/policies/:policyId"
              element={<AdminPolicyDetailsPage />}
            />

            <Route
              path="/admin/payments"
              element={<AdminPaymentsPage />}
            />

            <Route
              path="/admin/payments/:paymentId"
              element={<AdminPaymentDetailsPage />}
            />

            <Route
              path="/admin/claims"
              element={<AdminClaimsPage />}
            />

            <Route
              path="/admin/claims/:claimId"
              element={<AdminClaimDetailsPage />}
            />

            <Route
              path="/admin/agent-applications"
              element={<AdminAgentApplicationsPage />}
            />

            <Route
              path="/admin/agent-applications/:applicationId"
              element={<AdminAgentApplicationDetailsPage />}
            />
          </Route>
        </Route>
      </Route>

      {/* =====================================================
          FALLBACK
      ====================================================== */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default AppRoutes;