<template>
    <div class="container-fluid">

        <!-- ================= HEADER ================= -->
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold mb-0">Stocks</h5>

            <el-button type="primary" @click="openAdd">
                + Add Stock
            </el-button>
        </div>

        <!-- ================= STOCK TABLE ================= -->
        <el-card>
            <el-table :data="stocks" stripe border size="small">

                <el-table-column prop="symbol" label="Symbol" />
                <el-table-column prop="name" label="Name" />
                <el-table-column prop="sector" label="Sector" />

                <el-table-column label="Latest Price" align="right">
                    <template #default="{ row }">
                        ₹{{ row.latestPrice ?? "-" }}
                    </template>
                </el-table-column>

                <el-table-column label="Updated At" align="center">
                    <template #default="{ row }">
                        {{ formatDate(row.updatedAt) }}
                    </template>
                </el-table-column>

            </el-table>
        </el-card>

        <!-- ================= ADD STOCK DRAWER ================= -->
        <el-drawer v-model="drawerOpen" title="Add Stock" direction="rtl" size="420px" destroy-on-close>
            <el-form :model="form" label-width="110px" size="small">

                <!-- Symbol -->
                <el-form-item label="Symbol">
                    <el-input v-model="form.symbol" placeholder="Eg: TCS, INFY"
                        @input="form.symbol = form.symbol.toUpperCase()" />
                </el-form-item>

                <!-- Name -->
                <el-form-item label="Name">
                    <el-input v-model="form.name" placeholder="Company name" />
                </el-form-item>

                <!-- Sector -->
                <el-form-item label="Sector">
                    <el-select v-model="form.sector" style="width:100%">
                        <el-option v-for="s in sectors" :key="s" :label="s" :value="s" />
                    </el-select>
                </el-form-item>

                <div class="drawer-actions">
                    <el-button @click="drawerOpen = false">Cancel</el-button>
                    <el-button type="primary" @click="saveStock">
                        Save
                    </el-button>
                </div>

            </el-form>
        </el-drawer>

    </div>
</template>

<script setup>
import { ref, computed } from "vue"
import { ElMessage } from "element-plus"
import store from "@/store/portfolio.store"
import { createStock } from "@/api/stocks.api"

/* ---------------- DATA ---------------- */
const stocks = computed(() => store.state.stocks)

/* ---------------- DRAWER ---------------- */
const drawerOpen = ref(false)

const resetForm = () => ({
    symbol: "",
    name: "",
    sector: ""
})

const form = ref(resetForm())

const sectors = [
    "IT",
    "Finance",
    "Banking",
    "Energy",
    "FMCG",
    "Pharma",
    "Auto",
    "Metal"
]

/* ---------------- ACTIONS ---------------- */
const openAdd = () => {
    form.value = resetForm()
    drawerOpen.value = true
}

const saveStock = async () => {
    try {
        if (!form.value.symbol || !form.value.name || !form.value.sector) {
            ElMessage.warning("All fields are required")
            return
        }

        const res = await createStock({
            symbol: form.value.symbol,
            name: form.value.name,
            sector: form.value.sector
        })

        // ✅ Update store directly (no re-fetch)
        store.state.stocks.unshift(res.data)

        drawerOpen.value = false
        ElMessage.success("Stock added")

    } catch (err) {
        ElMessage.error(
            err.response?.data?.message || "Failed to add stock"
        )
    }
}

/* ---------------- HELPERS ---------------- */
const formatDate = (d) => {
    if (!d) return "-"
    return new Date(d).toLocaleString()
}
</script>

<style scoped>
.el-card {
    border-radius: 14px;
}

.drawer-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 16px;
}
</style>
