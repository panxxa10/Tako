<template>
  <div class="settings-container">
    <h2>Configuraciones</h2>

    <div class="settings-options">
      <button class="logout-btn" @click="logout">🚪 Cerrar sesión</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const logout = () => {
  localStorage.removeItem('token');
  router.push('/login');
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');

.settings-container {
  max-width: 500px;
  margin: 40px auto;
  padding: 30px;
  background-color: #f5f7fa;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  text-align: center;
  font-family: 'Poppins', sans-serif;
}

.settings-container h2 {
  color: #333;
  font-weight: 600;
  margin-bottom: 30px;
}

.settings-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.logout-btn {
  background-color: #ff6b6b;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.logout-btn:hover {
  background-color: #ff5252;
}
</style>
