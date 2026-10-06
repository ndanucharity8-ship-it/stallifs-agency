import api from "../../../shared/api/axios";

// ======================================================
// GET AGENT POLICIES
// ======================================================

export const getAgentPolicies = async () => {
  const response = await api.get("/agent/policies");

  return response.data;
};