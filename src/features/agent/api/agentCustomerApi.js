import api from "../../../shared/api/axios";

// ======================================================
// GET AGENT CUSTOMERS
// ======================================================

export const getAgentCustomers = async () => {
  const response = await api.get("/agent/customers");

  return response.data;
};

// ======================================================
// GET SINGLE AGENT CUSTOMER
// ======================================================

export const getAgentCustomer = async (customerId) => {
  const response = await api.get(
    `/agent/customers/${customerId}`
  );

  return response.data;
};