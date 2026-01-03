<template>
  <div class="d-flex vh-100">

    <!-- ================= SIDEBAR ================= -->
    <aside class="bg-light shadow-sm d-flex flex-column p-2 sidebar-container">

      <router-link to="/" class="sidebar-icon" title="Dashboard">
        <i class="bi bi-speedometer2"></i>
      </router-link>

      <router-link to="/holdings" class="sidebar-icon" title="Holdings">
        <i class="bi bi-table"></i>
      </router-link>

      <router-link to="/transactions" class="sidebar-icon" title="Transactions">
        <i class="bi bi-arrow-left-right"></i>
      </router-link>

      <!-- <hr class="sidebar-divider my-2" /> -->

      <router-link to="/stocks" class="sidebar-icon " title="Stocks">
        <i class="bi bi-bar-chart-line"></i>
      </router-link>
    </aside>

    <!-- ================= MAIN ================= -->
    <div class="flex-grow-1 d-flex flex-column">

      <!-- ===== TOP NAV ===== -->
      <nav class="navbar navbar-light bg-white shadow-sm sticky-top px-3">
        <span class="navbar-brand fw-bold">My Stock Portfolio</span>

        <!-- Portfolio Summary -->
        <div v-if="!store.state.loading" class="d-flex gap-4 align-items-center">

          <div class="text-center">
            <small class="text-muted">Invested</small><br />
            <strong>₹{{ summary.invested.toLocaleString() }}</strong>
          </div>

          <div class="text-center">
            <small class="text-muted">Current</small><br />
            <strong>₹{{ summary.current.toLocaleString() }}</strong>
          </div>

          <div class="text-center">
            <small class="text-muted">P/L</small><br />
            <strong :class="summary.pl >= 0 ? 'pos' : 'neg'">
              ₹{{ summary.pl.toLocaleString() }}
            </strong>
          </div>

        </div>
      </nav>

      <!-- ===== CONTENT ===== -->
      <div class="flex-grow-1 overflow-auto p-3">

        <!-- LOADING STATE -->
        <div v-if="store.state.loading" class="d-flex justify-content-center align-items-center h-100">
          <el-icon class="is-loading" size="32">
            <Loading />
          </el-icon>
        </div>

        <!-- ROUTES -->
        <router-view v-else />

      </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from "vue";
import portfolioStore from "@/store/portfolio.store";
import { Loading } from "@element-plus/icons-vue";

const store = portfolioStore;

const summary = computed(() => store.portfolioSummary.value);

onMounted(() => {
  store.bootstrapPortfolio();
});
</script>

<style scoped>
/* ================= SIDEBAR ================= */
.sidebar-container {
  width: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.sidebar-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  font-size: 22px;
  color: #333;
  border-radius: 12px;
  transition: 0.2s;
}

.sidebar-icon:hover {
  color: #42a5f5;
  background-color: rgba(66, 165, 245, 0.1);
}

.sidebar-icon.router-link-active {
  color: #42a5f5;
  background-color: rgba(66, 165, 245, 0.2);
}

.sidebar-divider {
  width: 60%;
  border: none;
  height: 1px;
  background-color: #ccc;
}

/* ================= COLORS ================= */
.pos {
  color: #16a34a;
}

.neg {
  color: #dc2626;
}
</style>
