<template>
  <Sidebar :isOpen="isSidebarOpen" @toggleSidebar="toggleSidebar" />
  <div :class="{'content-shift': isSidebarOpen}" class="main-content">
    <button class="menu-btn" @click="toggleSidebar">&#9776;</button>
    <router-view />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Sidebar from './components/Sidebar.vue';

const isSidebarOpen = ref(false);

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}
</script>

<style>
.main-content {
  transition: margin-left 0.3s ease;
  padding: 20px;
  margin-left: 0;
}

.content-shift {
  margin-left: 250px; /* ancho del sidebar */
}

.menu-btn {
  font-size: 24px;
  cursor: pointer;
  background: none;
  border: none;
  margin-bottom: 10px;
}
</style>
