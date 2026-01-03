<template>
  <div class="container-fluid">

    <!-- ================= HEADER ================= -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="fw-bold mb-0">Transactions</h5>

      <el-button type="primary" @click="openAdd">
        + Add Transaction
      </el-button>
    </div>

    <!-- ================= TABLE ================= -->
    <el-card>
      <el-table :data="transactions" stripe border size="small">

        <el-table-column prop="date" label="Date" />
        <el-table-column prop="symbol" label="Stock" />
        <el-table-column prop="type" label="Action" />
        <el-table-column prop="quantity" label="Qty" align="right" />

        <el-table-column label="Price" align="right">
          <template #default="{ row }">
            ₹{{ row.price }}
          </template>
        </el-table-column>

        <el-table-column label="Value" align="right">
          <template #default="{ row }">
            ₹{{ row.quantity * row.price }}
          </template>
        </el-table-column>

        <!-- ACTIONS -->
        <el-table-column width="90" align="center">
          <template #default="{ row }">
            <el-button size="small" circle @click="openEdit(row)">
              <i class="bi bi-pencil"></i>
            </el-button>

            <el-button
              size="small"
              circle
              type="danger"
              @click="deleteTransaction(row)"
            >
              <i class="bi bi-trash"></i>
            </el-button>
          </template>
        </el-table-column>

      </el-table>
    </el-card>

    <!-- ================= DRAWER ================= -->
    <el-drawer
      v-model="drawerOpen"
      :title="isEdit ? 'Edit Transaction' : 'Add Transaction'"
      direction="rtl"
      size="420px"
      destroy-on-close
    >
      <el-form :model="form" label-width="110px" size="small">

        <!-- Stock -->
        <el-form-item label="Stock">
          <el-select
            v-model="form.stockId"
            filterable
            placeholder="Select stock"
            style="width:100%"
          >
            <el-option
              v-for="s in stocks"
              :key="s._id"
              :label="s.symbol"
              :value="s._id"
            />
          </el-select>
        </el-form-item>

        <!-- Action -->
        <el-form-item label="Action">
          <el-select v-model="form.type" style="width:100%">
            <el-option label="BUY" value="BUY" />
            <el-option label="SELL" value="SELL" />
          </el-select>
        </el-form-item>

        <!-- Quantity -->
        <el-form-item label="Quantity">
          <el-input-number
            v-model="form.quantity"
            :min="1"
            style="width:100%"
          />
        </el-form-item>

        <!-- Price -->
        <el-form-item label="Price">
          <el-input-number
            v-model="form.price"
            :min="1"
            style="width:100%"
          />
        </el-form-item>

        <div class="drawer-actions">
          <el-button @click="drawerOpen=false">Cancel</el-button>
          <el-button type="primary" @click="saveTransaction">
            {{ isEdit ? "Update" : "Save" }}
          </el-button>
        </div>

      </el-form>
    </el-drawer>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { ElMessage, ElNotification } from "element-plus"

import store from "@/store/portfolio.store"
import {
  getTransactions,
  addTransaction,
  editTransaction,
  deleteTransactionById
} from "@/api/transactions.api"

/* ---------------- STATE ---------------- */
const drawerOpen = ref(false)
const isEdit = ref(false)
const editId = ref(null)

const transactions = ref([])

/* ---------------- FORM ---------------- */
const resetForm = () => ({
  stockId: "",
  type: "BUY",
  quantity: 1,
  price: 0
})

const form = ref(resetForm())

/* ---------------- STORE DATA ---------------- */
const stocks = computed(() => store.state.stocks)

/* ---------------- API ---------------- */
const fetchTransactions = async () => {
  const res = await getTransactions()

  transactions.value = res.data.map(tx => {
    const stock = stocks.value.find(s => s._id === tx.stockId)

    return {
      id: tx._id,
      stockId: tx.stockId,
      symbol: stock?.symbol || "-",
      type: tx.type,
      quantity: tx.quantity,
      price: tx.price,
      date: new Date(tx.createdAt).toLocaleDateString()
    }
  })
}

/* ---------------- ACTIONS ---------------- */
const openAdd = () => {
  isEdit.value = false
  editId.value = null
  form.value = resetForm()
  drawerOpen.value = true
}

const openEdit = (row) => {
  isEdit.value = true
  editId.value = row.id

  form.value = {
    stockId: row.stockId,
    type: row.type,
    quantity: row.quantity,
    price: row.price
  }

  drawerOpen.value = true
}

const saveTransaction = async () => {
  try {
    const payload = {
      stockId: form.value.stockId,
      type: form.value.type,
      quantity: form.value.quantity,
      price: form.value.price
    }

    isEdit.value
      ? await editTransaction(editId.value, payload)
      : await addTransaction(payload)

    drawerOpen.value = false
    ElMessage.success("Transaction saved")

    await store.bootstrapPortfolio()
    await fetchTransactions()

  } catch (err) {
    ElMessage.error(err.response?.data?.message || "Failed to save transaction")
  }
}

const deleteTransaction = async (row) => {
  try {
    await deleteTransactionById(row.id)

    transactions.value = transactions.value.filter(t => t.id !== row.id)

    ElNotification.success({
      title: "Deleted",
      message: "Transaction removed"
    })

    await store.bootstrapPortfolio()

  } catch (err) {
    ElMessage.error("Failed to delete transaction")
  }
}

/* ---------------- INIT ---------------- */
onMounted(async () => {
  await fetchTransactions()
})
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
