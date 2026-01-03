<template>
  <div class="container-fluid">

    <!-- ================= HEADER ================= -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="fw-bold mb-0">Holdings</h5>
      <small class="text-muted">
        {{ enrichedHoldings.length }} stocks
      </small>
    </div>

    <!-- ================= EMPTY ================= -->
    <el-card v-if="!enrichedHoldings.length" class="text-center text-muted p-4">
      No holdings yet. Add transactions to create holdings.
    </el-card>

    <!-- ================= TABLE ================= -->
    <el-card v-else>
      <el-table :data="enrichedHoldings" stripe border size="small" class="clickable-table"
        @row-click="openTransactions">
        <el-table-column prop="stock.symbol" label="Stock" sortable />
        <el-table-column prop="stock.sector" label="Sector" sortable />

        <el-table-column prop="quantity" label="Qty" align="right" sortable />

        <el-table-column label="Avg Price" align="right">
          <template #default="{ row }">
            {{ money(row.avgPrice) }}
          </template>
        </el-table-column>

        <el-table-column label="Invested" align="right">
          <template #default="{ row }">
            {{ money(row.invested) }}
          </template>
        </el-table-column>

        <el-table-column label="Current Price" align="right">
          <template #default="{ row }">
            {{ money(row.latestPrice) }}
          </template>
        </el-table-column>

        <el-table-column label="Current Value" align="right">
          <template #default="{ row }">
            <span :class="row.pl >= 0 ? 'pos' : 'neg'">
              {{ money(row.currentValue) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="P/L" align="right">
          <template #default="{ row }">
            <span :class="row.pl >= 0 ? 'pos' : 'neg'">
              {{ money(row.pl) }}
            </span>
          </template>
        </el-table-column>

        <el-table-column label="P/L %" align="right">
          <template #default="{ row }">
            {{ row.plPercent }}%
          </template>
        </el-table-column>

      </el-table>
    </el-card>

  </div>
</template>

<script setup>
import { computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import store from "@/store/portfolio.store"

/* ---------------- ROUTER ---------------- */
const router = useRouter()

/* ---------------- INIT ---------------- */
onMounted(async () => {
  if (!store.state.stocks.length) {
    await store.bootstrapPortfolio()
  }
})

/* ---------------- DATA ---------------- */
const enrichedHoldings = computed(() => store.enrichedHoldings.value)

/* ---------------- HELPERS ---------------- */
const money = (v) =>
  `₹${Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 })}`

/* ---------------- ACTION ---------------- */
const openTransactions = (row) => {
  router.push({
    path: "/transactions",
    query: { stockId: row.stockId }
  })
}
</script>

<style scoped>
.clickable-table :deep(tr) {
  cursor: pointer;
}

.pos {
  color: #16a34a;
  font-weight: 600;
}

.neg {
  color: #dc2626;
  font-weight: 600;
}
</style>
