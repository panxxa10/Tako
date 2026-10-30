<template>
  <AuthLayout mood="happy">
    <h2>¡Qué bueno verte!</h2>
    <p class="muted sub">Entra para seguir con tu racha.</p>
    <form class="stack" @submit.prevent="submit">
      <label class="field">Correo electrónico
        <input v-model="email" class="input" type="email" autocomplete="email" placeholder="tucorreo@ejemplo.com" required />
      </label>
      <label class="field">Contraseña
        <input v-model="password" class="input" type="password" autocomplete="current-password" placeholder="Tu contraseña" required />
      </label>
      <button class="btn btn-primary btn-block" type="submit" :disabled="loading">{{ loading ? 'Entrando…' : 'Entrar' }}</button>
      <p v-if="error" class="form-error" role="alert">{{ error }}</p>
    </form>
    <p class="muted center switch">¿Primera vez? <router-link to="/registro">Crea tu cuenta</router-link></p>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api, { errorMessage } from '../api'
import AuthLayout from '../components/AuthLayout.vue'
import { clearSession } from '../store'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const { data } = await api.post('/api/auth/login', { email: email.value, password: password.value })
    clearSession()
    localStorage.setItem('token', data.token)
    router.push('/hoy')
  } catch (e) {
    error.value = errorMessage(e, 'No se pudo iniciar sesión')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.sub { margin: 4px 0 18px; }
.switch { margin-top: 18px; }
</style>
