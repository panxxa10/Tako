<template>
  <div class="tako-assistant">
    <img :src="currentImage" alt="Tako" class="tako-img" />
    <p class="tako-message">{{ message }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

import takoDefault from '../assets/states/tako_study.png'
import takoHappy from '../assets/states/tako_smile.png'
import takoSad from '../assets/states/tako_sad.png'
import takoThinking from '../assets/states/tako_thinking.png'
import takoCelebrate from '../assets/states/tako_celebrate.png'
import takoSleep from '../assets/states/tako_sleep.png'

const props = defineProps({
  mood: String,     // Estado de ánimo ('happy', 'sad', etc.)
  message: String,  // Mensaje que Tako muestra
})

const currentImage = computed(() => {
  switch (props.mood) {
    case 'happy': return takoHappy
    case 'sad': return takoSad
    case 'thinking': return takoThinking
    case 'celebrate': return takoCelebrate
    case 'sleep': return takoSleep
    default: return takoDefault
  }
})
</script>

<style scoped>
.tako-assistant {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 180px;
  text-align: center;
  z-index: 1000;
}
.tako-img {
  width: 100px;
  height: auto;
}
.tako-message {
  font-size: 13px;
  margin-top: 6px;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 6px 10px;
  color: #333;
}
</style>
