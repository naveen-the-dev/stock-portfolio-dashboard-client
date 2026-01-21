<template>
    <div class="stock-details-page">

        <!-- ================= BREADCRUMB ================= -->
        <el-breadcrumb separator="/" class="mb-3">
            <el-breadcrumb-item class="breadcrumb-link" @click="$router.push('/holdings')">
                Holdings
            </el-breadcrumb-item>
            <el-breadcrumb-item>{{ symbol }}</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- ================= HEADER ================= -->
        <div class="header mb-3">
            <div>
                <h4 class="mb-0">{{ symbol }}</h4>
                <div class="sub-text">
                    {{ stockMeta.sector }}
                    <span v-if="stockMeta.industry"> · {{ stockMeta.industry }}</span>
                </div>
                <div class="sub-text">
                    Open Lots · {{ openLots.length }}
                </div>
            </div>
        </div>

        <!-- ================= SUMMARY (DESKTOP) ================= -->
        <el-row :gutter="12" class="mb-3 d-none d-md-flex">
            <el-col :span="6">
                <el-card shadow="never">
                    <div class="summary-label">Total Qty</div>
                    <div class="summary-value">{{ totalQty }}</div>
                </el-card>
            </el-col>

            <el-col :span="6">
                <el-card shadow="never">
                    <div class="summary-label">Invested</div>
                    <div class="summary-value">
                        ₹ {{ totalInvested.toLocaleString() }}
                    </div>
                </el-card>
            </el-col>

            <el-col :span="6">
                <el-card shadow="never">
                    <div class="summary-label">Market Value</div>
                    <div class="summary-value">
                        ₹ {{ totalMarketValue.toLocaleString() }}
                    </div>
                </el-card>
            </el-col>

            <el-col :span="6">
                <el-card shadow="never">
                    <div class="summary-label">Unrealized P&L</div>
                    <div class="summary-value" :class="totalPL >= 0 ? 'profit' : 'loss'">
                        {{ totalPL >= 0 ? "+" : "" }}₹ {{ totalPL.toLocaleString() }}
                        <span class="pl-percent">
                            ({{ totalPLPercent.toFixed(2) }}%)
                        </span>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- ================= SUMMARY (MOBILE) ================= -->
        <div class="d-md-none mb-3">
            <div class="mobile-summary-card">

                <div class="mobile-summary-row">
                    <div>
                        <div class="label">Total Qty</div>
                        <div class="value">{{ totalQty }}</div>
                    </div>

                    <div class="text-end">
                        <div class="label">Invested</div>
                        <div class="value">
                            ₹ {{ totalInvested.toLocaleString() }}
                        </div>
                    </div>
                </div>

                <hr />

                <div class="mobile-summary-row">
                    <div>
                        <div class="label">Market Value</div>
                        <div class="value">
                            ₹ {{ totalMarketValue.toLocaleString() }}
                        </div>
                    </div>

                    <div class="text-end">
                        <div class="label">Unrealized P&L</div>
                        <div class="value" :class="totalPL >= 0 ? 'profit' : 'loss'">
                            {{ totalPL >= 0 ? "+" : "" }}₹ {{ totalPL.toLocaleString() }}
                            <div class="percent">
                                {{ totalPLPercent.toFixed(2) }}%
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <!-- ================= OPEN LOTS (DESKTOP) ================= -->
        <el-card shadow="never" class="d-none d-md-block">
            <template #header>
                <strong>Open Lots</strong>
            </template>

            <el-table :data="openLots" border stripe v-loading="loading" empty-text="No open lots found">
                <el-table-column label="Buy Date" width="140">
                    <template #default="{ row }">
                        {{ formatDate(row.buyDate) }}
                    </template>
                </el-table-column>

                <el-table-column label="Buy Price" width="110">
                    <template #default="{ row }">
                        ₹ {{ row.buyPrice.toLocaleString() }}
                    </template>
                </el-table-column>

                <el-table-column label="Qty (Left / Bought)" width="150">
                    <template #default="{ row }">
                        {{ row.remainingQty }} / {{ row.originalQty }}
                    </template>
                </el-table-column>

                <el-table-column label="Invested" width="130">
                    <template #default="{ row }">
                        ₹ {{ row.investedAmount.toLocaleString() }}
                    </template>
                </el-table-column>

                <el-table-column label="LTP" width="110">
                    <template #default="{ row }">
                        ₹ {{ row.currentPrice.toLocaleString() }}
                    </template>
                </el-table-column>

                <el-table-column label="Market Value" width="140">
                    <template #default="{ row }">
                        ₹ {{ row.marketValue.toLocaleString() }}
                    </template>
                </el-table-column>

                <el-table-column label="P&L" width="160">
                    <template #default="{ row }">
                        <div class="d-flex justify-content-between align-items-center">
                            <el-tag :type="row.unrealizedPL >= 0 ? 'success' : 'danger'" effect="plain">
                                {{ row.unrealizedPL >= 0 ? "+" : "" }}₹
                                {{ row.unrealizedPL.toLocaleString() }}
                            </el-tag>
                            <span class="pl-percent" :class="getPLPercent(row) >= 0 ? 'profit' : 'loss'">
                                {{ getPLPercent(row).toFixed(2) }}%
                            </span>
                        </div>
                    </template>
                </el-table-column>

                <el-table-column label="Days Held" width="110">
                    <template #default="{ row }">
                        {{ row.holdingDays }}
                    </template>
                </el-table-column>

                <el-table-column prop="broker" label="Broker" />
            </el-table>
        </el-card>

        <!-- ================= OPEN LOTS (MOBILE) ================= -->
        <div class="d-md-none">
            <div v-for="lot in openLots" :key="lot._id" class="lot-card">

                <div class="lot-top">
                    <div class="lot-date">
                        {{ formatDate(lot.buyDate) }}
                    </div>

                    <div class="lot-pl" :class="lot.unrealizedPL >= 0 ? 'profit' : 'loss'">
                        {{ lot.unrealizedPL >= 0 ? "+" : "" }}₹
                        {{ lot.unrealizedPL.toLocaleString() }}
                    </div>
                </div>
                <div class="lot-top">
                    <div class="lot-meta">
                        Qty {{ lot.remainingQty }}/{{ lot.originalQty }}
                        · {{ lot.holdingDays }} days
                        · {{ lot.broker }}
                    </div>

                    <div class="lot-percent" :class="getPLPercent(lot) >= 0 ? 'profit' : 'loss'">
                        {{ getPLPercent(lot).toFixed(2) }}%
                    </div>
                   
                </div>


                <div class="lot-row">
                    <div>
                        <div class="label">Buy</div>
                        <div class="value">₹ {{ lot.buyPrice }}</div>
                    </div>

                    <div class="text-end">
                        <div class="label">LTP</div>
                        <div class="value">₹ {{ lot.currentPrice }}</div>
                    </div>
                </div>

                <div class="lot-row">
                    <div>
                        <div class="label">Invested</div>
                        <div class="value">₹ {{ lot.investedAmount }}</div>
                    </div>

                    <div class="text-end">
                        <div class="label">Value</div>
                        <div class="value">₹ {{ lot.marketValue }}</div>
                    </div>
                </div>


            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useRoute } from "vue-router"
import api from "../api/axios"

const route = useRoute()
const symbol = route.params.symbol

const openLots = ref([])
const loading = ref(false)

const stockMeta = computed(() => {
    if (!openLots.value.length) return {}
    const { sector, industry } = openLots.value[0]
    return { sector, industry }
})

const loadOpenLots = async () => {
    loading.value = true
    try {
        const { data } = await api.get(`/stocks/${symbol}/open-lots`)
        openLots.value = data
    } finally {
        loading.value = false
    }
}

const totalQty = computed(() =>
    openLots.value.reduce((s, l) => s + l.remainingQty, 0)
)

const totalInvested = computed(() =>
    openLots.value.reduce((s, l) => s + l.investedAmount, 0)
)

const totalMarketValue = computed(() =>
    openLots.value.reduce((s, l) => s + l.marketValue, 0)
)

const totalPL = computed(() =>
    openLots.value.reduce((s, l) => s + l.unrealizedPL, 0)
)

const totalPLPercent = computed(() =>
    totalInvested.value ? (totalPL.value / totalInvested.value) * 100 : 0
)

const getPLPercent = (row) =>
    row.investedAmount
        ? (row.unrealizedPL / row.investedAmount) * 100
        : 0

const formatDate = (date) =>
    new Date(date).toLocaleDateString()

onMounted(loadOpenLots)
</script>

<style scoped>
.stock-details-page {
    width: 100%;
}

.breadcrumb-link {
    cursor: pointer;
    color: #409eff;
}

.breadcrumb-link:hover {
    text-decoration: underline;
}

.sub-text {
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

.pl-percent {
    font-size: 12px;
}

/* ===== MOBILE SUMMARY ===== */
.mobile-summary-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 12px;
}

.mobile-summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.mobile-summary-card .label {
    font-size: 12px;
    color: #6c757d;
}

.mobile-summary-card .value {
    font-size: 16px;
    font-weight: 600;
}

.mobile-summary-card .percent {
    font-size: 12px;
}

.mobile-summary-card hr {
    margin: 8px 0;
    border-color: #e5e7eb;
}

/* ===== MOBILE LOTS ===== */
.lot-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 12px;
}

.lot-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.lot-date {
    font-weight: 600;
}

.lot-pl {
    font-size: 16px;
    font-weight: 600;
}

.lot-meta {
    font-size: 12px;
    color: #6c757d;
    margin: 4px 0 8px;
}

.lot-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
}

.label {
    font-size: 11px;
    color: #6c757d;
}

.value {
    font-size: 14px;
    font-weight: 500;
}

.lot-percent {
    font-size: 13px;
    font-weight: 600;
    text-align: right;
}

.profit {
    color: #198754;
}

.loss {
    color: #dc3545;
}
</style>
