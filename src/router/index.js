
import { createRouter, createWebHistory } from 'vue-router'

import Dashboard from '../pages/Dashboard.vue'
import Holdings from '../pages/Holdings.vue'
import StockDetails from '../pages/StockDetails.vue'
import Transactions from "../pages/Transactions.vue";
import StockMaster from '../pages/StockMaster.vue'
import CorporateActions from '../pages/CorporateActions.vue'

const routes = [
  { path: "/", redirect: "/dashboard" },
  { path: "/dashboard", component: Dashboard },
  { path: "/holdings", component: Holdings },
  { path: "/corporate-actions", component: CorporateActions },
  { path: "/stock/:symbol", component: StockDetails },
  {
    path: "/transactions",
    component: Transactions,
  },
  { path: "/stock-master", component: StockMaster },
];

export default createRouter({
  history: createWebHistory(),
  routes
})
