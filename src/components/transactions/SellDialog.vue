<template>
    <div class="sell-page">

        <el-form :model="form" :label-position="isMobile ? 'top' : 'left'" label-width="120px" class="sell-form">

            <!-- STOCK -->
            <el-form-item label="Stock" required>
                <el-select v-model="form.symbol" placeholder="Select stock" class="w-100" @change="onStockChange">
                    <el-option v-for="h in holdings" :key="h.symbol" :label="stockLabel(h.symbol, h.totalQty)"
                        :value="h.symbol" />
                </el-select>
            </el-form-item>

            <!-- AVAILABLE -->
            <el-form-item label="Available Qty">
                <strong>{{ availableQty || 0 }}</strong>
            </el-form-item>

            <!-- SELL QTY -->
            <el-form-item label="Sell Qty" required>
                <el-input-number v-model="form.quantity" :min="availableQty ? 1 : 0" :max="availableQty"
                    controls-position="right" class="w-100" />
            </el-form-item>

            <!-- SELL PRICE -->
            <el-form-item label="Sell Price" required>
                <el-input-number v-model="form.price" :min="0.01" :step="0.05" controls-position="right"
                    class="w-100" />
            </el-form-item>

            <!-- DATE -->
            <el-form-item label="Sell Date" required>
                <el-date-picker v-model="form.date" type="date" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
                    :clearable="false" class="w-100" />
            </el-form-item>

            <!-- SUMMARY -->
            <el-card v-if="form.quantity && form.price" shadow="never" class="summary-card">
                <div class="summary-row">
                    <span>Sell Value</span>
                    <strong>₹ {{ sellValue.toLocaleString() }}</strong>
                </div>
            </el-card>

            <!-- ACTION BAR -->
            <div class="action-bar">
                <el-button type="danger" size="large" class="w-100" :loading="loading" @click="submit">
                    Sell • ₹ {{ sellValue || 0 }}
                </el-button>
            </div>

        </el-form>

    </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed } from 'vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'

import { getPortfolio } from '../../api/portfolio'
import { sellStock } from '../../api/sell'
import { useStockMasterStore } from '../../stores/stockMaster'

/* ================= EMITS ================= */
const emit = defineEmits(['success'])

/* ================= STORE ================= */
const stockStore = useStockMasterStore()

/* ================= RESPONSIVE ================= */
const width = ref(window.innerWidth)
const isMobile = computed(() => width.value < 768)

/* ================= STATE ================= */
const holdings = ref([])
const availableQty = ref(0)
const loading = ref(false)

/* ================= FORM ================= */
const form = reactive({
    symbol: '',
    quantity: null,
    price: null,
    date: dayjs().format('YYYY-MM-DD')
})

/* ================= COMPUTED ================= */
const sellValue = computed(() => {
    if (!form.quantity || !form.price) return 0
    return Math.round(form.quantity * form.price)
})

/* ================= LIFECYCLE ================= */
onMounted(async () => {
    stockStore.loadOnce()
    const { data } = await getPortfolio()
    holdings.value = data
})

/* ================= HELPERS ================= */
const stockLabel = (symbol, qty) => {
    const s = stockStore.allStocks.find(x => x.symbol === symbol)
    return s ? `${symbol} - ${s.name}` : symbol
}

const onStockChange = () => {
    const h = holdings.value.find(x => x.symbol === form.symbol)
    availableQty.value = h ? h.totalQty : 0
    form.quantity = null
}

/* ================= SUBMIT ================= */
const submit = async () => {
    if (!form.symbol || !form.quantity || !form.price) {
        ElMessage.error('All fields are required')
        return
    }

    try {
        loading.value = true
        await sellStock(form)
        ElMessage.success('Stock sold successfully')
        emit('success')
    } catch {
        ElMessage.error('Sell failed')
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.sell-page {
    padding: 12px;
}

.w-100 {
    width: 100%;
}

/* SUMMARY */
.summary-card {
    margin: 16px 0;
    background: #fafafa;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    font-size: 15px;
}

/* STICKY ACTION BAR (CORRECT WAY) */
.action-bar {
    position: sticky;
    bottom: 0;
    background: #fff;
    padding: 12px 0 calc(12px + env(safe-area-inset-bottom));
    border-top: 1px solid #eee;
}
</style>
