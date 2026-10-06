import api from "../../../shared/api/axios";

// ======================================================
// GET AGENT PROFILE
// ======================================================

export const getAgentProfile = async () => {
  const response = await api.get("/agent/profile");

  return response.data;
};