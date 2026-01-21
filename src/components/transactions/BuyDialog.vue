<template>
    <div class="buy-page">

        <el-form :model="form" :label-position="isMobile ? 'top' : 'left'" label-width="120px" class="buy-form">

            <!-- STOCK -->
            <el-form-item label="Stock" required>
                <el-select v-model="form.symbol" placeholder="Select stock" filterable class="w-100">
                    <el-option v-for="s in stockStore.allStocks" :key="s.symbol" :label="`${s.symbol} - ${s.name}`"
                        :value="s.symbol" />
                </el-select>
            </el-form-item>

            <!-- QUANTITY -->
            <el-form-item label="Quantity" required>
                <el-input-number v-model="form.quantity" :min="1" controls-position="right" class="w-100" />
            </el-form-item>

            <!-- BUY PRICE -->
            <el-form-item label="Buy Price" required>
                <el-input-number v-model="form.price" :min="0.01" :step="0.05" controls-position="right"
                    class="w-100" />
            </el-form-item>

            <!-- BUY DATE -->
            <el-form-item label="Buy Date" required>
                <el-date-picker v-model="form.date" type="date" format="YYYY-MM-DD" value-format="YYYY-MM-DD"
                    :clearable="false" class="w-100" />
            </el-form-item>

            <!-- BROKER -->
            <el-form-item label="Broker">
                <el-input v-model="form.broker" disabled />
            </el-form-item>

            <!-- SUMMARY -->
            <el-card v-if="form.quantity && form.price" shadow="never" class="summary-card">
                <div class="summary-row">
                    <span>Total Amount</span>
                    <strong>₹ {{ totalAmount.toLocaleString() }}</strong>
                </div>
            </el-card>

            <!-- STICKY ACTION -->
            <div class="action-bar">
                <el-button type="primary" size="large" class="w-100" :loading="loading" @click="submit">
                    Buy • ₹ {{ totalAmount || 0 }}
                </el-button>
            </div>

        </el-form>

    </div>
</template>

<script setup>
import { reactive, onMounted, ref, computed } from 'vue'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'

import { buyLot } from '../../api/lots'
import { useStockMasterStore } from '../../stores/stockMaster'

const emit = defineEmits(['success'])
const stockStore = useStockMasterStore()

const width = ref(window.innerWidth)
const isMobile = computed(() => width.value < 768)

const form = reactive({
    symbol: '',
    quantity: null,
    price: null,
    date: dayjs().format('YYYY-MM-DD'),
    broker: 'Zerodha'
})

const loading = ref(false)

const totalAmount = computed(() => {
    if (!form.quantity || !form.price) return 0
    return Math.round(form.quantity * form.price)
})

onMounted(() => {
    stockStore.loadOnce()
})

const submit = async () => {
    if (!form.symbol || !form.quantity || !form.price) {
        ElMessage.error('All required fields must be filled')
        return
    }

    try {
        loading.value = true
        await buyLot({
            symbol: form.symbol,
            buyDate: form.date,
            buyPrice: form.price,
            originalQty: form.quantity,
            broker: form.broker
        })
        ElMessage.success('Stock bought successfully')
        emit('success')
    } catch {
        ElMessage.error('Buy failed')
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.buy-page {
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

/* PROPER MOBILE ACTION BAR */
.action-bar {
    position: sticky;
    bottom: 0;
    background: #fff;
    padding: 12px 0 calc(12px + env(safe-area-inset-bottom));
    border-top: 1px solid #eee;
}
</style>
