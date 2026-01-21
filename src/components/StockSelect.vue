<template>
    <el-select v-model="localValue" filterable placeholder="Select stock"
         style="width: 100%">
       <el-option v-for="s in stockStore.allStocks" :key="s.symbol" :label="`${s.symbol} - ${s.name}`"
            :value="s.symbol" />
    </el-select>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useStockMasterStore } from '../stores/stockMaster'

/* ================= STORE ================= */
const stockStore = useStockMasterStore()

/* ================= PROPS / EMITS ================= */
const props = defineProps({
    modelValue: {
        type: String,
        default: ""
    }
});

const emit = defineEmits(["update:modelValue"]);

/* ================= STATE ================= */

const stocks = ref([]);
const loading = ref(false);
const localValue = ref(props.modelValue);

/* ================= WATCHERS ================= */

watch(
    () => props.modelValue,
    val => {
        localValue.value = val;
    }
);

watch(localValue, val => {
    emit("update:modelValue", val);
});




/* ================= LIFECYCLE ================= */
onMounted(() => {
    stockStore.loadOnce()
})
</script>
