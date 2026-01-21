import { defineStore } from "pinia";
import { getPortfolio } from "../api/portfolio";

const TTL = 5 * 60 * 1000; // 5 minutes (frontend cache)

export const useMarketPriceStore = defineStore("marketPrice", {
  state: () => ({
    prices: {}, // { TCS: 3850, INFY: 1520 }
    lastFetched: null,
    loading: false,
  }),

  getters: {
    getPrice: (state) => (symbol) => {
      return state.prices[symbol] ?? null;
    },
  },

  actions: {
    async loadPrices() {
      if (this.loading) return;

      // TTL check
      if (this.lastFetched && Date.now() - this.lastFetched < TTL) {
        return;
      }

      this.loading = true;
      try {
        const { data } = await getPortfolio();

        const map = {};
        data.forEach((stock) => {
          map[stock.symbol] = stock.ltp;
        });

        this.prices = map;
        this.lastFetched = Date.now();
      } finally {
        this.loading = false;
      }
    },

    invalidate() {
      this.prices = {};
      this.lastFetched = null;
    },
  },
});
