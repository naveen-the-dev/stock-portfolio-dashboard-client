<template>
    <aside class="bg-white border-end p-2" style="width: 220px">
        <div class="px-3 py-2 fw-semibold border-bottom mb-2">
            Stock Portfolio
        </div>

        <nav class="nav flex-column gap-1">
            <SidebarLink to="/dashboard" label="Dashboard">
                <DataAnalysis />
            </SidebarLink>

            <SidebarLink to="/holdings" label="Holdings">
                <Briefcase />
            </SidebarLink>

            <SidebarLink to="/transactions" label="Transactions">
                <Document />
            </SidebarLink>

            <SidebarLink to="/corporate-actions" label="Corporate Actions">
                <Bell />
            </SidebarLink>

            <SidebarLink to="/stock-master" label="Stock Master">
                <Collection />
            </SidebarLink>
        </nav>
    </aside>
</template>

<script setup>
import {
    DataAnalysis,
    Briefcase,
    Document,
    Collection,
    Bell,
} from "@element-plus/icons-vue";
</script>

<script>
export default {
    components: {
        SidebarLink: {
            props: ["to", "label"],
            template: `
        <router-link
          :to="to"
          class="nav-link d-flex align-items-center gap-2 rounded px-3 py-2 text-secondary"
          active-class="bg-primary-subtle text-primary fw-semibold"
        >
          <el-icon><slot /></el-icon>
          <span>{{ label }}</span>
        </router-link>
      `,
        },
    },
};
</script>

<style scoped>
.nav-link:hover {
    background-color: #f1f5f9;
}
</style>
