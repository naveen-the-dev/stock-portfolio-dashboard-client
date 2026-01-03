// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import AdminDashboard from '../views/AdminDashboard.vue'
import HoldingsPage from '../views/HoldingsPage.vue'
import UserManagementPage from '../views/UserManagementPage.vue'
import TransactionsPage from '../views/TransactionsPage.vue'
import StockPage from '../views/StockPage.vue'

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: "/dashboard", component: AdminDashboard },
  { path: "/holdings", component: HoldingsPage },
  { path: "/user-management", component: UserManagementPage },
  { path: "/transactions", component: TransactionsPage },
  { path: "/stocks", component: StockPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
