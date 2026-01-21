import api from "./axios";

export const sellStock = (payload) => {
  return api.post("/sell", payload);
};

export const getSellHistory = (params = {}) => {
  return api.get("/sell", { params });
};
