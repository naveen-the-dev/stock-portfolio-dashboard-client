import http from "./http";

/* ================= HOLDINGS ================= */

export const getHoldings = () => {
  return http.get("/holdings");
};

export const getHoldingByStock = (stockId) => {
  return http.get(`/holdings/stock/${stockId}`);
};
