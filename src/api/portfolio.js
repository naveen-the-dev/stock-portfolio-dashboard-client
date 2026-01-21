import api from "./axios";

export const getPortfolio = () => {
  return api.get("/stocks");
};
