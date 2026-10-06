import api from "../../../shared/api/axios";

export const getAgentRenewals = async () => {
  const response = await api.get("/agent/renewals");

  return response.data;
};