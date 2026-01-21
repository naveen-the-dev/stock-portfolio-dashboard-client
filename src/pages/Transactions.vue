<template>
    <div class="transactions-page">

        <!-- ================= HEADER ================= -->
        <div class="d-flex justify-content-between align-items-center mb-2">
            <h4 class="mb-0">Transactions</h4>

            <div class="d-none d-md-flex gap-2">
                <el-button type="primary" @click="showBuy = true">Buy</el-button>
                <el-button type="danger" plain @click="showSell = true">Sell</el-button>
            </div>
        </div>

        <!-- ================= MOBILE ACTIONS ================= -->
        <div class="d-md-none d-flex gap-2 mb-2">
            <el-button type="primary" class="flex-fill" @click="showBuy = true">Buy</el-button>
            <el-button type="danger" plain class="flex-fill" @click="showSell = true">Sell</el-button>
        </div>

        <!-- ================= FILTERS ================= -->
        <div class="filters mb-2">
            <el-segmented v-model="typeFilter" :options="['ALL', 'BUY', 'SELL']" />
            <el-segmented v-model="rangeFilter" :options="['ALL', '7D', '30D', '90D']" />
        </div>

        <!-- ================= SUMMARY ================= -->
        <!-- Desktop -->
        <el-row :gutter="16" class="mb-2 d-none d-md-flex">
            <el-col :span="8">
                <el-card shadow="never">
                    <div class="summary-label">Total Buy</div>
                    <div class="summary-value">₹ {{ totalBuy.toLocaleString() }}</div>
                </el-card>
            </el-col>

            <el-col :span="8">
                <el-card shadow="never">
                    <div class="summary-label">Total Sell</div>
                    <div class="summary-value">₹ {{ totalSell.toLocaleString() }}</div>
                </el-card>
            </el-col>

            <el-col :span="8">
                <el-card shadow="never">
                    <div class="summary-label">Realized P&L</div>
                    <div class="summary-value" :class="totalPL >= 0 ? 'profit' : 'loss'">
                        {{ totalPL >= 0 ? '+' : '' }}₹ {{ totalPL.toLocaleString() }}
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- Mobile -->
        <!-- ================= MOBILE SUMMARY (IMPROVED) ================= -->
        <div class="d-md-none mb-2">

            <!-- P&L HERO -->
            <div class="mobile-pl-card" :class="totalPL >= 0 ? 'profit-bg' : 'loss-bg'">
                <div class="pl-value">
                    {{ totalPL >= 0 ? '+' : '' }}₹ {{ totalPL.toLocaleString() }}
                </div>
                <div class="pl-label">
                    Realized P&L
                </div>
            </div>

            <!-- BUY / SELL -->
            <div class="mobile-buy-sell">
                <div>
                    <div class="label">Total Buy</div>
                    <div class="value">₹ {{ totalBuy.toLocaleString() }}</div>
                </div>

                <div class="divider"></div>

                <div class="text-end">
                    <div class="label">Total Sell</div>
                    <div class="value">₹ {{ totalSell.toLocaleString() }}</div>
                </div>
            </div>

        </div>

        <!-- ================= TABLE (DESKTOP) ================= -->
        <el-card shadow="never" class="d-none d-md-block">
            <el-table :data="filteredTransactions" border stripe height="350" v-loading="loading">

                <!-- Date -->
                <el-table-column label="Date" width="170">
                    <template #default="{ row }">
                        {{ new Date(row.date).toLocaleString() }}
                    </template>
                </el-table-column>

                <!-- Type -->
                <el-table-column label="Type" width="90">
                    <template #default="{ row }">
                        <el-tag :type="row.type === 'BUY' ? 'success' : 'danger'" effect="dark">
                            {{ row.type }}
                        </el-tag>
                    </template>
                </el-table-column>

                <!-- Stock -->
                <el-table-column prop="symbol" label="Stock" width="120" />
                <el-table-column prop="sector" label="Sector" width="140" />
                <el-table-column prop="quantity" label="Qty" width="70" />

                <!-- Price -->
                <el-table-column label="Price" width="110">
                    <template #default="{ row }">
                        ₹ {{ row.price.toLocaleString() }}
                    </template>
                </el-table-column>

                <!-- Amount -->
                <el-table-column label="Amount" width="130">
                    <template #default="{ row }">
                        ₹ {{ (row.quantity * row.price).toLocaleString() }}
                    </template>
                </el-table-column>

                <!-- ===== P&L ₹ (FIXED) ===== -->
                <el-table-column label="P&L (₹)" width="140">
                    <template #default="{ row }">

                        <!-- SELL → Realized -->
                        <template v-if="row.type === 'SELL'">
                            <span :class="row.pl >= 0 ? 'profit' : 'loss'">
                                {{ row.pl >= 0 ? '+' : '' }}₹ {{ row.pl.toLocaleString() }}
                            </span>
                        </template>

                        <!-- BUY → Unrealized -->
                        <template v-else>
                            <span :class="getUnrealizedPL(row) >= 0 ? 'profit' : 'loss'">
                                {{ getUnrealizedPL(row) >= 0 ? '+' : '' }}₹
                                {{ getUnrealizedPL(row).toLocaleString() }}
                            </span>
                        </template>

                    </template>
                </el-table-column>

                <!-- ===== P&L % (FIXED) ===== -->
                <el-table-column label="P&L %" width="110">
                    <template #default="{ row }">

                        <!-- SELL -->
                        <template v-if="row.type === 'SELL'">
                            <span :class="getRealizedPLPercent(row) >= 0 ? 'profit' : 'loss'">
                                {{ getRealizedPLPercent(row).toFixed(2) }}%
                            </span>
                        </template>

                        <!-- BUY -->
                        <template v-else>
                            <span :class="getUnrealizedPLPercent(row) >= 0 ? 'profit' : 'loss'">
                                {{ getUnrealizedPLPercent(row).toFixed(2) }}%
                            </span>
                        </template>

                    </template>
                </el-table-column>

            </el-table>
        </el-card>

        <!-- ================= MOBILE CARDS ================= -->
        <div class="d-md-none">
            <div v-for="tx in filteredTransactions" :key="tx._id" class="tx-card">

                <div class="tx-top">
                    <strong>{{ tx.symbol }}</strong>
                    <el-tag :type="tx.type === 'BUY' ? 'success' : 'danger'" size="small">
                        {{ tx.type }}
                    </el-tag>
                </div>

                <div class="tx-meta">
                    {{ new Date(tx.date).toLocaleDateString() }}
                    · {{ tx.quantity }} qty @ ₹ {{ tx.price }}
                </div>

                <div class="tx-row">
                    <div>
                        <span class="label">Amount</span>
                        <div>₹ {{ (tx.quantity * tx.price).toLocaleString() }}</div>
                    </div>

                    <div :class="tx.type === 'SELL'
                        ? (tx.pl >= 0 ? 'profit' : 'loss')
                        : (getUnrealizedPL(tx) >= 0 ? 'profit' : 'loss')">
                        <span class="label">P&L</span>
                        <div>
                            {{ tx.type === 'SELL'
                                ? (tx.pl >= 0 ? '+' : '') + '₹ ' + tx.pl.toLocaleString()
                                : (getUnrealizedPL(tx) >= 0 ? '+' : '') + '₹ ' + getUnrealizedPL(tx).toLocaleString()
                            }}
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <!-- ================= DIALOGS ================= -->
        <el-dialog v-model="showBuy" title="Buy Stock" width="600px">
            <BuyDialog @success="reload" />
        </el-dialog>

        <el-dialog v-model="showSell" title="Sell Stock" width="600px">
            <SellDialog @success="reload" />
        </el-dialog>

    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue"
import BuyDialog from "../components/transactions/BuyDialog.vue"
import SellDialog from "../components/transactions/SellDialog.vue"
import api from "../api/axios"

/* ================= STATE ================= */
const transactions = ref([])
const loading = ref(false)

const typeFilter = ref("ALL")
const rangeFilter = ref("ALL")

const showBuy = ref(false)
const showSell = ref(false)

/* ================= FETCH ================= */
const fetchTransactions = async () => {
    loading.value = true
    try {
        const { data } = await api.get("/transactions", {
            params: {
                type: typeFilter.value !== "ALL" ? typeFilter.value : undefined,
                range: rangeFilter.value !== "ALL" ? rangeFilter.value : undefined,
            },
        })
        transactions.value = data.items ?? data
    } finally {
        loading.value = false
    }
}

/* ================= DERIVED ================= */
const filteredTransactions = computed(() => transactions.value)

const totalBuy = computed(() =>
    transactions.value
        .filter(t => t.type === "BUY")
        .reduce((s, t) => s + t.quantity * t.price, 0)
)

const totalSell = computed(() =>
    transactions.value
        .filter(t => t.type === "SELL")
        .reduce((s, t) => s + t.quantity * t.price, 0)
)

const totalPL = computed(() =>
    transactions.value
        .filter(t => t.type === "SELL")
        .reduce((s, t) => s + t.pl, 0)
)

/* ================= P&L HELPERS ================= */
const getUnrealizedPL = (row) =>
    row.currentPrice
        ? row.quantity * (row.currentPrice - row.price)
        : 0

const getUnrealizedPLPercent = (row) => {
    const invested = row.quantity * row.price
    return invested ? (getUnrealizedPL(row) / invested) * 100 : 0
}

const getRealizedPLPercent = (row) => {
    const invested = row.quantity * row.price
    return invested ? (row.pl / invested) * 100 : 0
}

/* ================= HANDLERS ================= */
const reload = () => {
    showBuy.value = false
    showSell.value = false
    fetchTransactions()
}

watch([typeFilter, rangeFilter], fetchTransactions)
onMounted(fetchTransactions)
</script>

<style scoped>
.filters {
    display: flex;
    gap: 12px;
}

.summary-label,
.label {
    font-size: 12px;
    color: #6c757d;
}

.summary-value {
    font-size: 20px;
    font-weight: 600;
}

.mobile-summary {
    display: flex;
    justify-content: space-between;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 8px 12px;
}

.tx-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 10px;
}

.tx-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.tx-meta {
    font-size: 12px;
    color: #6c757d;
    margin: 4px 0;
}

.tx-row {
    display: flex;
    justify-content: space-between;
    margin-top: 6px;
}

.profit {
    color: #198754;
}

.loss {
    color: #dc3545;
}

/* ===== MOBILE SUMMARY (CLEAR) ===== */

.mobile-pl-card {
    border-radius: 10px;
    padding: 12px;
    text-align: center;
    margin-bottom: 8px;
}

.profit-bg {
    background: #ecfdf5;
    color: #198754;
}

.loss-bg {
    background: #fef2f2;
    color: #dc3545;
}

.pl-value {
    font-size: 22px;
    font-weight: 700;
}

.pl-label {
    font-size: 12px;
    opacity: 0.8;
}

.mobile-buy-sell {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 8px 12px;
}

.mobile-buy-sell .label {
    font-size: 11px;
    color: #6c757d;
}

.mobile-buy-sell .value {
    font-size: 14px;
    font-weight: 600;
}

.divider {
    width: 1px;
    height: 24px;
    background: #e5e7eb;
}
</style>
