<template>
  <div>
    <h2>User Management</h2>
    <el-table :data="users" stripe style="width: 100%" class="mt-3">
      <el-table-column prop="email" label="Email" width="250" />
      <el-table-column prop="role" label="Role" width="100" />
      <el-table-column label="Actions" width="120">
        <template #default="scope">
          <el-button type="danger" size="small" @click="deleteUser(scope.row)">Delete</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const users = ref([
  { email: 'admin@example.com', role: 'Admin' },
  { email: 'user1@example.com', role: 'User' },
  { email: 'user2@example.com', role: 'User' }
])

const deleteUser = (user) => {
  users.value = users.value.filter(u => u.email !== user.email)
  alert(`${user.email} deleted (frontend only)`)
}
</script>
