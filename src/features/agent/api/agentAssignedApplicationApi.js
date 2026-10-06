import api from "../../../shared/api/axios";

// ======================================================
// GET APPLICATIONS ASSIGNED TO LOGGED-IN AGENT
// GET /api/agent/applications
// ======================================================

const getAssignedApplications = async () => {
  const response = await api.get("/agent/applications");

  return response.data;
};

// ======================================================
// GET SINGLE APPLICATION
// GET /api/agent/applications/:id
// ======================================================

const getAssignedApplication = async (applicationId) => {
  const response = await api.get(
    `/agent/applications/${applicationId}`
  );

  return response.data;
};

// ======================================================
// UPDATE ASSIGNED APPLICATION
// PATCH /api/agent/applications/:id
// ======================================================

const updateAssignedApplication = async (
  applicationId,
  data
) => {
  const response = await api.patch(
    `/agent/applications/${applicationId}`,
    data
  );

  return response.data;
};

export {
  getAssignedApplications,
  getAssignedApplication,
  updateAssignedApplication,
};