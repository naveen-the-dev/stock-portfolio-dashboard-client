import http from "./http";

/* ================= STOCK MASTER ================= */

export const getStocks = () => {
  return http.get("/stocks");
};

export const createStock = (payload) => {
  return http.post("/stocks", payload);
};

/* ================= PRICE REFRESH ================= */

export const refreshStockPrices = () => {
  return http.post("/stocks/refresh-prices");
};

/* ================= STOCK DETAILS ================= */

export const getStockDetails = (stockId) => {
  return http.get(`/stocks/${stockId}/details`);
};
