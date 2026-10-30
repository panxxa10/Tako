<template>
  <AuthLayout mood="love">
    <h2>Crea tu cuenta</h2>
    <p class="muted sub">Es gratis y te toma menos de un minuto.</p>
    <form class="stack" @submit.prevent="submit">
      <label class="field">Nombre de usuario
        <input v-model="username" class="input" type="text" minlength="3" maxlength="30" autocomplete="username" placeholder="¿Cómo te llamamos?" required />
      </label>
      <label class="field">Correo electrónico
        <input v-model="email" class="input" type="email" autocomplete="email" placeholder="tucorreo@ejemplo.com" required />
      </label>
      <label class="field">Contraseña
        <input v-model="password" class="input" type="password" minlength="8" autocomplete="new-password" placeholder="Mínimo 8 caracteres" required />
      </label>
      <button class="btn btn-primary btn-block" type="submit" :disabled="loading">{{ loading ? 'Creando tu cuenta…' : 'Empezar' }}</button>
      <p v-if="error" class="form-error" role="alert">{{ error }}</p>
    </form>
    <p class="muted center switch">¿Ya tienes cuenta? <router-link to="/entrar">Inicia sesión</router-link></p>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api, { errorMessage } from '../api'
import AuthLayout from '../components/AuthLayout.vue'
import { clearSession } from '../store'

const router = useRouter()
const username = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const { data } = await api.post('/api/auth/register', { username: username.value, email: email.value, password: password.value })
    clearSession()
    localStorage.setItem('token', data.token)
    router.push('/bienvenida')
  } catch (e) {
    error.value = errorMessage(e, 'No se pudo crear la cuenta')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.sub { margin: 4px 0 18px; }
.switch { margin-top: 18px; }
</style>
