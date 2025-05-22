<template>
  <div class="login-container">
    <h2>Iniciar sesión</h2>
    <form @submit.prevent="handleLogin" class="login-form">
      <input type="email" v-model="email" placeholder="Correo electrónico" required />
      <input type="password" v-model="password" placeholder="Contraseña" required />
      <button type="submit">Entrar</button>
    </form>
    <p class="register-text">
      ¿No tienes cuenta? <router-link to="/register">Regístrate</router-link>
    </p>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../api'  // importa tu cliente axios con baseURL configurada
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

const handleLogin = async () => {
  error.value = ''
  try {
    const { data } = await api.post('/api/auth/login', { email: email.value, password: password.value })
    localStorage.setItem('token', data.token)
    router.push('/calendar')
  } catch (e) {
    error.value = e.response?.data?.message || 'Error al iniciar sesión'
  }
}
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');

.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  background: #f5f7fa;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  font-family: 'Poppins', sans-serif;
  text-align: center;
}

.login-container h2 {
  margin-bottom: 25px;
  color: #333;
  font-weight: 600;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.login-form input {
  padding: 10px 14px;
  border: 1.8px solid #bbb;
  border-radius: 8px;
  font-size: 16px;
  font-family: 'Poppins', sans-serif;
  transition: border-color 0.3s ease;
}

.login-form input:focus {
  outline: none;
  border-color: #4caf50;
}

button {
  background-color: #4caf50;
  color: white;
  font-weight: 600;
  border: none;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #388e3c;
}

.register-text {
  margin-top: 20px;
  font-size: 14px;
  color: #555;
}

.register-text a {
  color: #4caf50;
  font-weight: 600;
  text-decoration: none;
}

.register-text a:hover {
  text-decoration: underline;
}

.error {
  margin-top: 20px;
  color: #e53935;
  font-weight: 600;
}
</style>
