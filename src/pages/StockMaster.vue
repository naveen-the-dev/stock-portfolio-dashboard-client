<template>
    <div class="stock-master-page">

        <!-- ================= HEADER ================= -->
        <div class="page-header">
            <h4>Stock Master</h4>

            <el-button type="primary" size="small" @click="openCreate">
                Add Stock
            </el-button>
        </div>

        <!-- ================= SEARCH ================= -->
        <el-input v-model="search" placeholder="Search by symbol or name" clearable @input="fetchStocks" class="mb-3" />

        <!-- ================= DESKTOP TABLE ================= -->
        <el-table v-if="!isMobile" :data="stocks" border stripe v-loading="loading">
            <el-table-column prop="symbol" label="Symbol" width="140" />
            <el-table-column prop="name" label="Name" />
            <el-table-column prop="sector" label="Sector" width="180" />
            <el-table-column prop="industry" label="Industry" />
            <el-table-column prop="exchange" label="Exchange" width="100" />

            <el-table-column label="Actions" width="120">
                <template #default="{ row }">
                    <el-button size="small" @click="openEdit(row)">Edit</el-button>
                    <el-button size="small" type="danger" plain @click="remove(row)">
                        Delete
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- ================= MOBILE SINGLE-LINE LIST ================= -->
        <div v-else class="mobile-list">
            <div v-for="s in stocks" :key="s._id" class="stock-row">
                <!-- LEFT -->
                <div class="row-left">
                    <div class="symbol">{{ s.symbol }}</div>
                    <div class="name">{{ s.name }}</div>
                </div>

                <!-- RIGHT -->
                <div class="row-right">
                    <el-tag size="small" effect="plain">
                        {{ s.exchange }}
                    </el-tag>

                    <el-button text size="small" @click="openEdit(s)">
                        ✏️
                    </el-button>

                    <el-button text size="small" type="danger" @click="remove(s)">
                        🗑️
                    </el-button>
                </div>
            </div>
        </div>

        <!-- ================= MODAL ================= -->
        <el-dialog v-model="showModal" :title="form._id ? 'Edit Stock' : 'Add Stock'" :fullscreen="isMobile"
            width="500px">
            <el-form :model="form" :label-position="isMobile ? 'top' : 'left'" label-width="120px">
                <el-form-item label="Symbol" required>
                    <el-input v-model="form.symbol" :disabled="!!form._id" placeholder="TATAMOTORS" />
                </el-form-item>

                <el-form-item label="Name" required>
                    <el-input v-model="form.name" />
                </el-form-item>

                <el-form-item label="Sector" required>
                    <el-select v-model="form.sector" placeholder="Select Sector" filterable clearable class="w-100">
                        <el-option v-for="sector in SECTORS" :key="sector" :label="sector" :value="sector" />
                    </el-select>
                </el-form-item>

                <el-form-item label="Industry">
                    <el-input v-model="form.industry" />
                </el-form-item>

                <el-form-item label="Exchange">
                    <el-select v-model="form.exchange" class="w-100">
                        <el-option label="NSE" value="NSE" />
                        <el-option label="BSE" value="BSE" />
                    </el-select>
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="showModal = false">Cancel</el-button>
                <el-button type="primary" @click="save">Save</el-button>
            </template>
        </el-dialog>

    </div>
</template>
<script setup>
import { ref, reactive, onMounted, computed, onUnmounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import api from "../api/axios";

/* ================= RESPONSIVE ================= */
const width = ref(window.innerWidth);
const isMobile = computed(() => width.value < 768);

const onResize = () => {
    width.value = window.innerWidth;
};

/* ================= CONSTANTS ================= */
const SECTORS = [
    "Automobile", "Banking", "Financial Services", "IT", "Technology",
    "Pharmaceuticals", "Healthcare", "FMCG", "Consumer Durables", "Retail",
    "Hotels & Hospitality", "Aviation", "Metals", "Mining", "Energy", "Power",
    "Telecom", "Infrastructure", "Capital Goods", "Real Estate", "Chemicals",
    "Agriculture", "Textiles", "Logistics", "Media & Entertainment", "PSU"
];

/* ================= STATE ================= */
const stocks = ref([]);
const loading = ref(false);
const search = ref("");
const showModal = ref(false);

const form = reactive({
    _id: null,
    symbol: "",
    name: "",
    sector: "",
    industry: "",
    exchange: "NSE",
});

/* ================= FETCH ================= */
async function fetchStocks() {
    loading.value = true;
    const { data } = await api.get("/stock-master", {
        params: { q: search.value },
    });
    stocks.value = data;
    loading.value = false;
}

onMounted(() => {
    fetchStocks();
    window.addEventListener("resize", onResize);
});

onUnmounted(() => {
    window.removeEventListener("resize", onResize);
});

/* ================= ACTIONS ================= */
function openCreate() {
    Object.assign(form, {
        _id: null,
        symbol: "",
        name: "",
        sector: "",
        industry: "",
        exchange: "NSE",
    });
    showModal.value = true;
}

function openEdit(row) {
    Object.assign(form, row);
    showModal.value = true;
}

async function save() {
    if (!form.symbol || !form.name || !form.sector) {
        ElMessage.error("Symbol, Name and Sector are required");
        return;
    }

    if (form._id) {
        await api.put(`/stock-master/${form._id}`, form);
        ElMessage.success("Stock updated");
    } else {
        await api.post("/stock-master", form);
        ElMessage.success("Stock created");
    }

    showModal.value = false;
    fetchStocks();
}

async function remove(row) {
    await ElMessageBox.confirm(
        `Deactivate ${row.symbol}?`,
        "Confirm",
        { type: "warning" }
    );

    await api.delete(`/stock-master/${row._id}`);
    ElMessage.success("Stock deactivated");
    fetchStocks();
}
</script>
<style scoped>
.stock-master-page {
    padding: 12px;
}

/* HEADER */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

/* MOBILE LIST */
.mobile-list {
    display: flex;
    flex-direction: column;
}

/* ROW */
.stock-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 6px;
    border-bottom: 1px solid #eee;
}

/* LEFT */
.row-left {
    display: flex;
    flex-direction: column;
}

.symbol {
    font-size: 14px;
    font-weight: 600;
}

.name {
    font-size: 12px;
    color: #666;
}

/* RIGHT */
.row-right {
    display: flex;
    align-items: center;
    gap: 6px;
}

/* UTILS */
.w-100 {
    width: 100%;
}
</style>
