import { defineStore } from "pinia";
import { searchStocks } from "../api/stockMaster";

export const useStockMasterStore = defineStore("stockMaster", {
  state: () => ({
    stocks: [], // [{ symbol, name, exchange }]
    loaded: false,
    loading: false,
  }),

  getters: {
    allStocks: (state) => {      
      return state.stocks;
    },
  },

  actions: {
    async loadOnce() {
      if (this.loaded || this.loading) return;

      this.loading = true;
      try {
        const { data } = await searchStocks("");
        this.stocks = data;
        this.loaded = true;
      } finally {
        this.loading = false;
      }
    },

    search(query = "") {
      if (!query) return this.stocks;

      const q = query.toLowerCase();
      return this.stocks.filter(
        (s) =>
          s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
      );
    },

    invalidate() {
      this.stocks = [];
      this.loaded = false;
    },
  },
});
