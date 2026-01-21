import axios from "./axios";

export const getCorporateActions = (params = {}) =>
  axios.get("/corporate-actions", { params });

/**
 * ================= DIVIDEND =================
 * Single atomic API
 * Handles:
 * - multiple open lots
 * - reinvest
 * - multiple dividends on same ex-date
 */
export const applyDividend = (payload) =>
  axios.post("/corporate-actions/dividend", payload);

/**
 * ================= BONUS =================
 */
export const applyBonus = (payload) =>
  axios.post("/corporate-actions/bonus/apply", payload);

/**
 * ================= SPLIT =================
 */
export const applySplit = (payload) =>
  axios.post("/corporate-actions/split/apply", payload);

/**
 * ================= DEMERGER =================
 */
export const applyDemerger = (payload) =>
  axios.post("/corporate-actions/demerger/apply", payload);

/**
 * ================= RIGHTS =================
 */
export const applyRights = (payload) =>
  axios.post("/corporate-actions/rights/apply", payload);

export const allotRights = (payload) =>
  axios.post("/corporate-actions/rights/allot", payload);
