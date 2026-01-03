<template>
  <div class="container mt-5">
    <h2>Admin Login</h2>
    <el-form @submit.prevent="login" class="mt-3">
      <el-form-item label="Email">
        <el-input v-model="email"></el-input>
      </el-form-item>
      <el-form-item label="Password">
        <el-input type="password" v-model="password"></el-input>
      </el-form-item>
      <el-button type="primary" @click="login">Login</el-button>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../firebase/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'

// Reactive state
const email = ref('')
const password = ref('')
const router = useRouter()

const login = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
    const user = userCredential.user
    if (user.email === 'admin@example.com') {
      router.push('/dashboard')
    } else {
      router.push('/holdings')
    }
  } catch (err) {
    alert(err.message)
  }
}
</script>
