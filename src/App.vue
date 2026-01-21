<template>
  <div class="layout">

    <!-- ============ SIDEBAR (ICON ONLY) ============ -->
    <aside class="sidebar">
      <nav class="nav flex-column px-2 mt-3">
        <router-link to="/dashboard" class="nav-link" title="Dashboard">
          <el-icon>
            <DataAnalysis />
          </el-icon>
        </router-link>

        <router-link to="/holdings" class="nav-link" title="Holdings">
          <el-icon>
            <Briefcase />
          </el-icon>
        </router-link>

        <router-link to="/transactions" class="nav-link" title="Transactions">
          <el-icon>
            <Document />
          </el-icon>
        </router-link>

        <router-link to="/corporate-actions" class="nav-link" title="Corporate Actions">
          <el-icon>
            <Bell />
          </el-icon>
        </router-link>

        <router-link to="/stock-master" class="nav-link" title="Stock Master">
          <el-icon>
            <Collection />
          </el-icon>
        </router-link>
      </nav>
    </aside>

    <!-- ============ MAIN ============ -->
    <div class="main">

      <!-- ===== TOP NAVBAR ===== -->
      <header class="topbar border-bottom">
        <div class="container-fluid">

          <!-- DESKTOP NAVBAR -->
          <div class="row g-3 align-items-center d-none d-md-flex">

            <div class="col">
              <div class="app-title">Stock Portfolio</div>
            </div>

            <div class="col-auto">
              <div class="row g-2 justify-content-end">
                <div class="col-auto">
                  <div class="summary-card">
                    <div class="label">Invested</div>
                    <div class="value">
                      ₹ {{ summary.totalInvested.toLocaleString() }}
                    </div>
                  </div>
                </div>

                <div class="col-auto">
                  <div class="summary-card">
                    <div class="label">Current</div>
                    <div class="value">
                      ₹ {{ summary.currentValue.toLocaleString() }}
                    </div>
                  </div>
                </div>

                <div class="col-auto">
                  <div class="summary-card">
                    <div class="label">P&amp;L</div>
                    <div class="value" :class="summary.unrealizedPLPercent >= 0 ? 'profit' : 'loss'">
                      {{ summary.unrealizedPLPercent >= 0 ? '+' : '' }}
                      {{ summary.unrealizedPLPercent.toFixed(2) }}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- MOBILE NAVBAR -->
          <div class="d-md-none mobile-navbar">

            <div class="app-title">Stock Portfolio</div>

            <div class="mobile-summary" :class="summary.unrealizedPLPercent >= 0 ? 'profit' : 'loss'">
              ₹ {{ summary.totalInvested.toLocaleString() }}
              →
              ₹ {{ summary.currentValue.toLocaleString() }}
              &nbsp;|&nbsp;
              {{ summary.unrealizedPLPercent >= 0 ? '+' : '' }}
              {{ summary.unrealizedPLPercent.toFixed(2) }}%
            </div>

          </div>

        </div>
      </header>

      <!-- ===== CONTENT ===== -->
      <main class="content p-3 p-md-4">
        <router-view />
      </main>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import api from "./api/axios"

import {
  DataAnalysis,
  Briefcase,
  Document,
  Collection,
  Bell
} from "@element-plus/icons-vue"

const summary = ref({
  totalInvested: 0,
  currentValue: 0,
  unrealizedPL: 0,
  unrealizedPLPercent: 0,
})

const loadSummary = async () => {
  const { data } = await api.get("/dashboard/summary")
  summary.value = data.kpis
}

onMounted(loadSummary)
</script>

<style scoped>
/* ===== LAYOUT ===== */
.layout {
  display: flex;
  height: 100vh;
  background: #f1f3f5;
}

/* ===== SIDEBAR ===== */
.sidebar {
  width: 64px;
  background: #ffffff;
  border-right: 1px solid #dee2e6;
}

.sidebar .nav-link {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #495057;
  padding: 12px 0;
  border-radius: 8px;
  margin-bottom: 6px;
  font-size: 18px;
}

.sidebar .nav-link.router-link-active {
  background: #e7f1ff;
  color: #0d6efd;
}

/* ===== MAIN ===== */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* ===== TOPBAR ===== */
.topbar {
  background: #ffffff;
  padding: 10px 0;
}

.app-title {
  font-size: 18px;
  font-weight: 600;
  color: #212529;
}

/* ===== DESKTOP SUMMARY ===== */
.summary-card {
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 6px 12px;
  text-align: right;
  min-width: 120px;
}

.summary-card .label {
  font-size: 11px;
  color: #6c757d;
}

.summary-card .value {
  font-weight: 600;
}

/* ===== MOBILE NAVBAR ===== */
.mobile-navbar {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mobile-summary {
  font-size: 14px;
  font-weight: 600;
}

/* ===== CONTENT ===== */
.content {
  flex: 1;
  background: #ffffff;
  margin: 12px;
  border-radius: 8px;
  overflow-y: auto;
}

/* ===== P&L ===== */
.profit {
  color: #198754;
}

.loss {
  color: #dc3545;
}
</style>
