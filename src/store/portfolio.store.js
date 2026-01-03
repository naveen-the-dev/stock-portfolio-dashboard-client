import { reactive, computed } from "vue";
import { getStocks, refreshStockPrices } from "@/api/stocks.api";
import { getHoldings } from "@/api/holdings.api";
import { getTransactions } from "@/api/transactions.api";

/**
 * SINGLE SOURCE OF TRUTH
 */
const state = reactive({
  loading: false,

  stocks: [],
  holdings: [],
  transactions: [],

  lastUpdated: null,
});

/* =====================================================
   BOOTSTRAP (CALL ON APP LOAD)
===================================================== */
const bootstrapPortfolio = async () => {
  try {
    state.loading = true;

    // 1️⃣ Fetch stocks
    const stocksRes = await getStocks();
    state.stocks = stocksRes.data;

    // 2️⃣ Refresh prices if stale
    await refreshStockPrices();

    // 3️⃣ Re-fetch stocks (updated prices)
    const stocksUpdated = await getStocks();
    state.stocks = stocksUpdated.data;

    // 4️⃣ Fetch holdings
    const holdingsRes = await getHoldings();

    state.holdings = holdingsRes.data;

    // 5️⃣ Fetch transactions
    const txRes = await getTransactions();
    state.transactions = txRes.data;

    state.lastUpdated = new Date();
  } catch (err) {
    console.error("BOOTSTRAP ERROR:", err);
  } finally {
    state.loading = false;
  }
};

/* =====================================================
   DERIVED / COMPUTED DATA
===================================================== */

/* Merge holdings + stocks */
const enrichedHoldings = computed(() => {
  return state.holdings.map((h) => {
    const stock = state.stocks.find((s) => s._id === h.stockId);

    const latestPrice = stock?.latestPrice || 0;
    const currentValue = h.quantity * latestPrice;
    const invested = h.quantity * h.avgPrice;
    const pl = currentValue - invested;

    return {
      ...h,
      stock,
      latestPrice,
      invested,
      currentValue,
      pl,
      plPercent: invested ? ((pl / invested) * 100).toFixed(2) : 0,
    };
  });
});

/* Dashboard summary */
const portfolioSummary = computed(() => {
  const invested = enrichedHoldings.value.reduce((s, h) => s + h.invested, 0);
  const current = enrichedHoldings.value.reduce(
    (s, h) => s + h.currentValue,
    0
  );

  const pl = current - invested;

  return {
    invested,
    current,
    pl,
    plPercent: invested ? ((pl / invested) * 100).toFixed(2) : 0,
  };
});

/* Stock-wise transactions */
const transactionsByStock = computed(() => {
  const map = {};
  state.transactions.forEach((tx) => {
    map[tx.stockId] ??= [];
    map[tx.stockId].push(tx);
  });
  return map;
});

export default {
  state,

  // actions
  bootstrapPortfolio,

  // getters
  enrichedHoldings,
  portfolioSummary,
  transactionsByStock,
};
