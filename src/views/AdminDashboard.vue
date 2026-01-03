<template>
  <div class="container-fluid dashboard-root">

    <!-- ================= KPI ROW ================= -->
    <el-row :gutter="16" class="mb-4">

      <el-col :xs="24" :md="6">
        <el-card class="kpi-card">
          <div class="kpi-label">Total Invested</div>
          <div class="kpi-value">₹{{ money(summary.invested) }}</div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="6">
        <el-card class="kpi-card">
          <div class="kpi-label">Current Value</div>
          <div class="kpi-value">₹{{ money(summary.current) }}</div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="6">
        <el-card class="kpi-card">
          <div :class="['kpi-label', summary.pl >= 0 ? 'pos' : 'neg']">
            Total P/L
          </div>
          <div :class="['kpi-value', summary.pl >= 0 ? 'pos' : 'neg']">
            ₹{{ money(summary.pl) }} ({{ summary.plPercent }}%)
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="6">
        <el-card class="kpi-card">
          <div class="kpi-label">Holdings</div>
          <div class="kpi-value">{{ enrichedHoldings.length }}</div>
        </el-card>
      </el-col>

    </el-row>

    <!-- ================= TABLES ================= -->
    <el-row :gutter="16" class="mb-4">

      <!-- Sector Performance -->
      <el-col :xs="24" :md="12">
        <el-card>
          <h6 class="fw-bold mb-2">Sector Performance</h6>

          <el-table :data="sectorSummary" size="small" stripe>
            <el-table-column prop="sector" label="Sector" />
            <el-table-column label="Invested" align="right">
              <template #default="{ row }">
                ₹{{ money(row.invested) }}
              </template>
            </el-table-column>
            <el-table-column label="P/L %" align="right">
              <template #default="{ row }">
                <span :class="row.pl >= 0 ? 'pos' : 'neg'">
                  {{ row.plPercent }}%
                </span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- Top Movers -->
      <el-col :xs="24" :md="12">
        <el-card>
          <h6 class="fw-bold mb-2">Top Movers</h6>

          <el-table :data="topMovers" size="small" stripe>
            <el-table-column prop="symbol" label="Stock" />
            <el-table-column label="P/L %" align="right">
              <template #default="{ row }">
                <span :class="row.pl >= 0 ? 'pos' : 'neg'">
                  {{ row.plPercent }}%
                </span>
              </template>
            </el-table-column>
            <el-table-column label="P/L ₹" align="right">
              <template #default="{ row }">
                <span :class="row.pl >= 0 ? 'pos' : 'neg'">
                  ₹{{ money(row.pl) }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

    </el-row>

    <!-- ================= BAR CHART ================= -->
    <el-card>
      <h6 class="fw-bold mb-3">Stock P/L Comparison</h6>
      <canvas ref="barChartRef" class="bar-canvas"></canvas>
    </el-card>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue"
import Chart from "chart.js/auto"
import store from "@/store/portfolio.store"

/* ---------------- REFS ---------------- */
const barChartRef = ref(null)
let barChart = null

/* ---------------- DATA ---------------- */
const enrichedHoldings = computed(() => store.enrichedHoldings.value)
const summary = computed(() => store.portfolioSummary.value)

/* ---------------- SECTOR SUMMARY ---------------- */
const sectorSummary = computed(() => {
  const map = {}

  enrichedHoldings.value.forEach(h => {
    map[h.stock.sector] ??= {
      sector: h.stock.sector,
      invested: 0,
      current: 0
    }
    map[h.stock.sector].invested += h.invested
    map[h.stock.sector].current += h.currentValue
  })

  return Object.values(map).map(s => {
    const pl = s.current - s.invested
    return {
      ...s,
      pl,
      plPercent: ((pl / s.invested) * 100).toFixed(2)
    }
  })
})

/* ---------------- TOP MOVERS ---------------- */
const topMovers = computed(() =>
  [...enrichedHoldings.value]
    .map(h => ({
      symbol: h.stock.symbol,
      pl: h.pl,
      plPercent: h.plPercent
    }))
    .sort((a, b) => Math.abs(b.pl) - Math.abs(a.pl))
    .slice(0, 5)
)

/* ---------------- CHART ---------------- */
const buildChart = () => {
  console.log('jyi');
  
  if (!enrichedHoldings.value.length) return

  barChart?.destroy()

  barChart = new Chart(barChartRef.value, {
    type: "bar",
    data: {
      labels: enrichedHoldings.value.map(h => h.stock.symbol),
      datasets: [{
        label: "P/L ₹",
        data: enrichedHoldings.value.map(h => h.pl),
        backgroundColor: enrichedHoldings.value.map(h =>
          h.pl >= 0 ? "#16a34a" : "#dc2626"
        )
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  })
}

/* ---------------- LIFECYCLE ---------------- */
onMounted(async () => {
  buildChart();
})

watch(
  () => enrichedHoldings.value,
  (newVal) => {
    if (newVal?.length > 0) {
      buildChart();
    }
  },
  { deep: true }
);

onBeforeUnmount(() => barChart?.destroy())

/* ---------------- HELPERS ---------------- */
const money = v =>
  Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 })
</script>

<style scoped>
.dashboard-root {
  padding-bottom: 20px;
}

.kpi-card {
  text-align: center;
  border-radius: 14px;
}

.kpi-label {
  font-size: 13px;
  color: #777;
}

.kpi-value {
  font-size: 20px;
  font-weight: 700;
  margin-top: 4px;
}

.pos {
  color: #16a34a;
}

.neg {
  color: #dc2626;
}

.bar-canvas {
  height: 380px !important;
}
</style>
