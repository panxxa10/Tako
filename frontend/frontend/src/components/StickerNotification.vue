<template>
  <transition name="fade">
    <div v-if="visible" class="notification">
      🎉 ¡Has desbloqueado una nueva insignia: {{ stickerName }}!
    </div>
  </transition>
</template>

<script setup>
import { watch, ref } from 'vue'

const props = defineProps({
  stickerName: String
})

const visible = ref(false)

watch(() => props.stickerName, (name) => {
  if (name) {
    visible.value = true
    setTimeout(() => (visible.value = false), 3000)
  }
})
</script>

<style scoped>
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #4caf50;
  color: white;
  padding: 12px 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  font-weight: 600;
  z-index: 1000;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

