import api from "../../../shared/api/axios";

// ======================================================
// AGENT DASHBOARD
// ======================================================

export const getAgentDashboard = async () => {
  const response = await api.get("/agents/dashboard");
  return response.data;
};

// ======================================================
// AGENT APPLICATIONS
// ======================================================

export const getAgentApplications = async () => {
  const response = await api.get("/agents/applications");
  return response.data;
};

export const getAgentApplication = async (id) => {
  const response = await api.get(`/agents/applications/${id}`);
  return response.data;
};

export const updateAgentApplication = async (id, data) => {
  const response = await api.patch(
    `/agents/applications/${id}`,
    data
  );

  return response.data;
};

// ======================================================
// AGENT CUSTOMERS
// ======================================================

export const getAgentCustomers = async () => {
  const response = await api.get("/agents/customers");
  return response.data;
};

export const getAgentCustomer = async (id) => {
  const response = await api.get(`/agents/customers/${id}`);
  return response.data;
};

// ======================================================
// AGENT POLICIES
// ======================================================

export const getAgentPolicies = async () => {
  const response = await api.get("/agents/policies");
  return response.data;
};

// ======================================================
// AGENT RENEWALS
// ======================================================

export const getAgentRenewals = async () => {
  const response = await api.get("/agents/renewals");
  return response.data;
};

// ======================================================
// AGENT NOTIFICATIONS
// ======================================================

export const getAgentNotifications = async () => {
  const response = await api.get("/agents/notifications");
  return response.data;
};

export const markAgentNotificationRead = async (id) => {
  const response = await api.patch(
    `/agents/notifications/${id}/read`
  );

  return response.data;
};

export const markAllAgentNotificationsRead = async () => {
  const response = await api.patch(
    "/agents/notifications/read-all"
  );

  return response.data;
};

// ======================================================
// AGENT PROFILE
// ======================================================

export const getAgentProfile = async () => {
  const response = await api.get("/agents/profile");
  return response.data;
};

// ======================================================
// AGENT COMMISSIONS
// ======================================================

export const getAgentCommissions = async () => {
  const response = await api.get("/agents/commissions");
  return response.data;
};

export const getAgentCommissionSummary = async () => {
  const response = await api.get(
    "/agents/commissions/summary"
  );

  return response.data;
};

// ======================================================
// DEFAULT EXPORT
// ======================================================

const agentService = {
  getAgentDashboard,

  getAgentApplications,
  getAgentApplication,
  updateAgentApplication,

  getAgentCustomers,
  getAgentCustomer,

  getAgentPolicies,

  getAgentRenewals,

  getAgentNotifications,
  markAgentNotificationRead,
  markAllAgentNotificationsRead,

  getAgentProfile,

  getAgentCommissions,
  getAgentCommissionSummary,
};

export default agentService;