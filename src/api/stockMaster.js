import api from "./axios";

export const searchStocks = (query = "") => {
  return api.get("/stock-master", {
    params: { q: query },
  });
};

export const addStock = (payload) => {
  return api.post("/stock-master", payload);
};
