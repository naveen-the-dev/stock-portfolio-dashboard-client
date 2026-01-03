import http from "./http";

/* ================= TRANSACTIONS ================= */

export const getTransactions = () => {
  return http.get("/transactions");
};

export const getTransactionsByStock = (stockId) => {
  return http.get(`/transactions/stock/${stockId}`);
};

export const addTransaction = (payload) => {
  return http.post("/transactions", payload);
};

export const editTransaction = (id, payload) => {
  return http.put(`/transactions/${id}`, payload);
};

export const deleteTransactionById = (id) => {
  return http.delete(`/transactions/${id}`);
};
