<template>
    <div class="holdings-page">

        <!-- ================= HEADER ================= -->
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <h4 class="mb-0">Holdings</h4>
                <div class="meta">
                    {{ filteredHoldings.length }} Stocks
                </div>
            </div>
        </div>

        <!-- ================= SUMMARY ================= -->
        <el-row :gutter="12" class="mb-3">
            <el-col :xs="12" :sm="6">
                <el-card shadow="never">
                    <div class="summary-label">Total Invested</div>
                    <div class="summary-value">
                        ₹ {{ totalInvested.toLocaleString() }}
                    </div>
                </el-card>
            </el-col>

            <el-col :xs="12" :sm="6">
                <el-card shadow="never">
                    <div class="summary-label">Market Value</div>
                    <div class="summary-value">
                        ₹ {{ totalMarketValue.toLocaleString() }}
                    </div>
                </el-card>
            </el-col>

            <el-col :xs="12" :sm="6">
                <el-card shadow="never">
                    <div class="summary-label">Unrealized P&L</div>
                    <div class="summary-value" :class="totalPL >= 0 ? 'profit' : 'loss'">
                        {{ totalPL >= 0 ? "+" : "" }}₹ {{ totalPL.toLocaleString() }}
                    </div>
                </el-card>
            </el-col>

            <el-col :xs="12" :sm="6">
                <el-card shadow="never">
                    <div class="summary-label">Net P&L %</div>
                    <div class="summary-value" :class="netPLPercent >= 0 ? 'profit' : 'loss'">
                        {{ netPLPercent.toFixed(2) }}%
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- ================= DESKTOP TABLE ================= -->
        <el-card shadow="never" class="d-none d-md-block">
            <el-table :data="filteredHoldings" border stripe v-loading="loading" empty-text="No holdings found">
                <el-table-column label="Stock" width="150">
                    <template #default="{ row }">
                        <span class="stock-link" @click="goToStock(row.symbol)">
                            {{ row.symbol }}
                        </span>
                    </template>
                </el-table-column>

                <el-table-column prop="sector" label="Sector"  />
                <el-table-column prop="totalQty" label="Qty"  />
                <el-table-column label="Avg Buy" >
                    <template #default="{ row }">

                        ₹ {{ row.avgBuyPrice.toLocaleString() }}
                    </template>
                </el-table-column>
                <el-table-column label="LTP" >
                    <template #default="{ row }">

                        ₹ {{ row.currentPrice.toLocaleString() }}
                    </template>
                </el-table-column>
                <el-table-column label="Market Value" >
                    <template #default="{ row }">

                        ₹ {{ row.marketValue.toLocaleString() }}
                    </template>
                </el-table-column>

                <el-table-column label="P&L" >
                    <template #default="{ row }">
                        <div class="d-flex justify-content-between align-items-center">
                            <el-tag :type="row.unrealizedPL >= 0 ? 'success' : 'danger'" effect="plain">
                                {{ row.unrealizedPL >= 0 ? "+" : "" }}₹ {{ row.unrealizedPL.toLocaleString() }}
                            </el-tag>
                            <span class="pl-percent" :class="getPLPercent(row) >= 0 ? 'profit' : 'loss'">
                                {{ getPLPercent(row).toFixed(2) }}%
                            </span>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- ================= MOBILE CARDS ================= -->
        <div class="d-md-none">
            <div v-for="row in filteredHoldings" :key="row.symbol" class="holding-card" @click="goToStock(row.symbol)">
                <div class="d-flex justify-content-between align-items-center">
                    <strong>{{ row.symbol }}</strong>
                    <span :class="row.unrealizedPL >= 0 ? 'profit' : 'loss'">
                        {{ row.unrealizedPL >= 0 ? "+" : "" }}₹ {{ row.unrealizedPL.toFixed(2) }}
                    </span>
                </div>

                <div class="small text-muted mb-1">
                    {{ row.sector }}
                </div>

                <div class="row small">
                    <div class="col-6">Qty: {{ row.totalQty }}</div>
                    <div class="col-6 text-end">
                        LTP: ₹ {{ row.currentPrice }}
                    </div>
                </div>

                <div class="row small mt-1">
                    <div class="col-6">
                        Invested: ₹ {{ row.investedAmount }}
                    </div>
                    <div class="col-6 text-end">
                        Value: ₹ {{ row.marketValue }}
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>
<script setup>
import { ref, onMounted, computed } from "vue"
import { useRouter } from "vue-router"
import { getPortfolio } from "../api/portfolio"

const holdings = ref([])
const loading = ref(false)
const selectedSector = ref(null)
const router = useRouter()

const loadHoldings = async () => {
    loading.value = true
    try {
        const { data } = await getPortfolio()
        holdings.value = data
    } finally {
        loading.value = false
    }
}

const filteredHoldings = computed(() => {
    if (!selectedSector.value) return holdings.value
    return holdings.value.filter(h => h.sector === selectedSector.value)
})

const totalInvested = computed(() =>
    filteredHoldings.value.reduce((s, h) => s + h.investedAmount, 0)
)

const totalMarketValue = computed(() =>
    filteredHoldings.value.reduce((s, h) => s + h.marketValue, 0)
)

const totalPL = computed(() =>
    filteredHoldings.value.reduce((s, h) => s + h.unrealizedPL, 0)
)

const netPLPercent = computed(() =>
    totalInvested.value ? (totalPL.value / totalInvested.value) * 100 : 0
)

const getPLPercent = (row) => {
    return row.investedAmount
        ? (row.unrealizedPL / row.investedAmount) * 100
        : 0
}

const goToStock = (symbol) => {
    router.push(`/stock/${symbol}`)
}

onMounted(loadHoldings)
</script>
<style scoped>
.holdings-page {
    width: 100%;
}

.meta {
    font-size: 13px;
    color: #6c757d;
}

.summary-label {
    font-size: 13px;
    color: #6c757d;
}

.summary-value {
    font-size: 20px;
    font-weight: 600;
}

.stock-link {
    color: #409eff;
    cursor: pointer;
    font-weight: 600;
}

.stock-link:hover {
    text-decoration: underline;
}

/* MOBILE CARD */
.holding-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 10px;
}

.pl-percent {
    font-size: 12px;
}

.profit {
    color: #198754;
}

.loss {
    color: #dc3545;
}
</style>
