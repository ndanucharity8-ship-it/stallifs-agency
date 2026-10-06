import api from "../../../shared/api/axios";

export const getAgentCommissions = async () => {
  const response = await api.get("/agent/commissions");

  return response.data;
};

export const getAgentCommissionSummary = async () => {
  const response = await api.get(
    "/agent/commissions/summary"
  );

  return response.data;
};