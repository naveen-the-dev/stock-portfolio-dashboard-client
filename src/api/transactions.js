import api from "./axios";

export const getTransactions = () => {
  return api.get("/transactions");
};
