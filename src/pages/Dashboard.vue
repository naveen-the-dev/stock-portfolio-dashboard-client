<template>
    <div class="dashboard-page">

        <!-- ================= HEADER ================= -->
        <div class="header mb-3">
            <h3 class="mb-1">Dashboard</h3>
            <div class="meta">Portfolio overview</div>
        </div>

        <!-- ================= KPI CARDS ================= -->
        <el-row :gutter="12" class="mb-3">
            <el-col v-for="card in kpiCards" :key="card.label" :xs="12" :sm="6">
                <el-card shadow="never" class="kpi-card">
                    <div class="kpi-label">{{ card.label }}</div>
                    <div class="kpi-value" :class="card.class">
                        {{ card.prefix }}₹ {{ card.value }}
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- ================= CHARTS ================= -->
        <el-row :gutter="12" class="mb-3">
            <el-col :xs="24" :md="12">
                <el-card shadow="never" class="chart-card">
                    <template #header>Sector Allocation</template>
                    <div ref="sectorChartRef" class="chart"></div>
                </el-card>
            </el-col>

            <el-col :xs="24" :md="12">
                <el-card shadow="never" class="chart-card">
                    <template #header>Top Stocks</template>
                    <div ref="stockChartRef" class="chart"></div>
                </el-card>
            </el-col>
        </el-row>

        <!-- ================= TOP HOLDINGS (DESKTOP) ================= -->
        <el-card shadow="never" class="table-card d-none d-md-block">
            <template #header>Top Holdings</template>

            <el-table :data="topHoldings" size="small">
                <el-table-column prop="symbol" label="Stock" />
                <el-table-column prop="sector" label="Sector" />
                <el-table-column label="Market Value" align="right">
                    <template #default="{ row }">
                        ₹ {{ row.currentValue.toLocaleString() }}
                    </template>
                </el-table-column>
                <el-table-column label="Unrealized P&L" align="right">
                    <template #default="{ row }">
                        <span :class="row.unrealizedPL >= 0 ? 'profit' : 'loss'">
                            {{ row.unrealizedPL >= 0 ? '+' : '' }}₹
                            {{ row.unrealizedPL.toLocaleString() }}
                        </span>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- ================= TOP HOLDINGS (MOBILE) ================= -->
        <div class="d-md-none">
            <div v-for="row in topHoldings" :key="row.symbol" class="mobile-holding-card">
                <div class="d-flex justify-content-between align-items-center">
                    <strong>{{ row.symbol }}</strong>
                    <span :class="row.unrealizedPL >= 0 ? 'profit' : 'loss'">
                        {{ row.unrealizedPL >= 0 ? '+' : '' }}₹{{ row.unrealizedPL }}
                    </span>
                </div>

                <div class="small text-muted">{{ row.sector }}</div>

                <div class="mt-1">
                    Market Value:
                    <strong>₹ {{ row.currentValue.toLocaleString() }}</strong>
                </div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import * as echarts from "echarts";
import api from "../api/axios";

/* ================= STATE ================= */

const kpis = ref({
    totalInvested: 0,
    currentValue: 0,
    unrealizedPL: 0,
    unrealizedPLPercent: 0,
    realizedPL: 0,
});

const sectorAllocation = ref([]);
const topHoldings = ref([]);

/* ================= KPI CARDS ================= */

const kpiCards = computed(() => [
    {
        label: "Invested",
        value: kpis.value.totalInvested.toLocaleString(),
        class: "",
        prefix: "",
    },
    {
        label: "Market Value",
        value: kpis.value.currentValue.toLocaleString(),
        class: "",
        prefix: "",
    },
    {
        label: "Unrealized P&L",
        value: `${kpis.value.unrealizedPL.toLocaleString()} (${kpis.value.unrealizedPLPercent.toFixed(2)}%)`,
        class: kpis.value.unrealizedPL >= 0 ? "profit" : "loss",
        prefix: kpis.value.unrealizedPL >= 0 ? "+" : "",
    },
    {
        label: "Realized P&L",
        value: kpis.value.realizedPL.toLocaleString(),
        class: kpis.value.realizedPL >= 0 ? "profit" : "loss",
        prefix: kpis.value.realizedPL >= 0 ? "+" : "",
    },
]);

/* ================= LOAD ================= */

const loadDashboard = async () => {
    const { data } = await api.get("/dashboard/summary");
    kpis.value = data.kpis;
    sectorAllocation.value = data.sectorAllocation;
    topHoldings.value = data.topHoldings;
};

/* ================= CHARTS ================= */

const sectorChartRef = ref(null);
const stockChartRef = ref(null);

let sectorChart;
let stockChart;

const isMobile = () => window.innerWidth < 768;

const renderSectorChart = () => {
    if (!sectorChart) sectorChart = echarts.init(sectorChartRef.value);

    sectorChart.setOption({
        tooltip: { trigger: "axis" },
        grid: { left: 40, right: 20, bottom: 40, top: 20 },
        xAxis: {
            type: "category",
            data: sectorAllocation.value.map(s => s.sector),
            axisLabel: { rotate: isMobile() ? 0 : 30 },
        },
        yAxis: { type: "value" },
        series: [
            {
                type: "bar",
                data: sectorAllocation.value.map(s => s.currentValue),
                itemStyle: { color: "#2563eb" },
            },
        ],
    });
};

const renderStockChart = () => {
    if (!stockChart) stockChart = echarts.init(stockChartRef.value);

    stockChart.setOption({
        tooltip: { trigger: "axis" },
        grid: { left: 40, right: 20, bottom: 40, top: 20 },
        xAxis: {
            type: "category",
            data: topHoldings.value.map(s => s.symbol),
            axisLabel: { rotate: isMobile() ? 0 : 30 },
        },
        yAxis: { type: "value" },
        series: [
            {
                type: "bar",
                data: topHoldings.value.map(s => s.currentValue),
                itemStyle: { color: "#16a34a" },
            },
        ],
    });
};

watch(sectorAllocation, renderSectorChart);
watch(topHoldings, renderStockChart);

onMounted(async () => {
    await loadDashboard();
    renderSectorChart();
    renderStockChart();

    window.addEventListener("resize", () => {
        sectorChart?.resize();
        stockChart?.resize();
    });
});
</script>

<style scoped>
.dashboard-page {
    padding: 16px;
    background: #f8fafc;
}

/* HEADER */
.header h3 {
    margin: 0;
}

.meta {
    font-size: 13px;
    color: #6b7280;
}

/* KPI */
.kpi-card {
    border-radius: 10px;
}

.kpi-label {
    font-size: 12px;
    color: #6b7280;
}

.kpi-value {
    font-size: 20px;
    font-weight: 600;
    margin-top: 4px;
}

/* CHART */
.chart {
    height: 280px;
}

/* MOBILE HOLDINGS */
.mobile-holding-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 10px;
}

/* P&L */
.profit {
    color: #16a34a;
}

.loss {
    color: #dc2626;
}

/* MOBILE TWEAKS */
@media (max-width: 576px) {
    .chart {
        height: 220px;
    }

    .kpi-value {
        font-size: 18px;
    }
}
</style>
