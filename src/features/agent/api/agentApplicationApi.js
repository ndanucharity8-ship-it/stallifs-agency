import api from "../../../shared/api/axios";

// ======================================================
// SUBMIT AGENT APPLICATION
// ======================================================

const submitAgentApplication = async (formData) => {
  const response = await api.post(
    "/agent-applications",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// ======================================================
// GET ALL AGENT APPLICATIONS
// ======================================================

const getAgentApplications = async () => {
  const response = await api.get(
    "/agent-applications"
  );

  return response.data;
};

// ======================================================
// GET SINGLE AGENT APPLICATION
// ======================================================

const getAgentApplication = async (applicationId) => {
  const response = await api.get(
    `/agent-applications/${applicationId}`
  );

  return response.data;
};

// ======================================================
// UPDATE AGENT APPLICATION
// ======================================================

const updateAgentApplication = async (
  applicationId,
  data
) => {
  const response = await api.patch(
    `/agent-applications/${applicationId}`,
    data
  );

  return response.data;
};

// ======================================================
// CREATE AGENT ACCOUNT
// ======================================================

const createAgentAccount = async (
  applicationId
) => {
  const response = await api.post(
    `/agent-applications/${applicationId}/create-account`
  );

  return response.data;
};

export {
  submitAgentApplication,
  getAgentApplications,
  getAgentApplication,
  updateAgentApplication,
  createAgentAccount,
};