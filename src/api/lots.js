import api from "./axios";

export const buyLot = (payload) => {
  return api.post("/lots/buy", payload);
};

export const updateLot = (id, payload) => {
  return api.put(`/lots/${id}`, payload);
};

export const deleteLot = (id) => {
  return api.delete(`/lots/${id}`);
};
