<template>
  <nav :class="['sidebar', { open: isOpen }]">
    <!-- 🔥 Logo y título -->
    <div class="logo-container">
      <img src="../assets/logo/tako_mini.png" alt="Tako logo" class="logo" />
    </div>

    <ul>
      <li><router-link to="/calendar">📅 Calendario</router-link></li>
      <li><router-link to="/profile">👤 Perfil</router-link></li>
      <li><router-link to="/settings">⚙️ Ajustes</router-link></li>
    </ul>
  </nav>
</template>

<script setup>
defineProps(['isOpen']);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');

.sidebar {
  position: fixed;
  top: 0;
  left: -250px;
  width: 240px;
  height: 100%;
  background-color: #ffffff;
  border-right: 2px solid #e0e0e0;
  padding-top: 60px;
  transition: left 0.3s ease;
  font-family: 'Poppins', sans-serif;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  z-index: 1000;
}

.sidebar.open {
  left: 0;
}

.logo-container {
  text-align: center;
  margin-bottom: 20px;
}

.logo {
  width: 60px;
  margin-bottom: 5px;
}

.app-title {
  font-size: 20px;
  font-weight: 600;
  color: #4caf50;
  margin: 0;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar ul li {
  padding: 18px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.sidebar ul li a {
  display: block;
  color: #333;
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  transition: color 0.3s ease;
}

.sidebar ul li a:hover {
  color: #4caf50;
}
</style>
