<template>
  <span class="logo" :class="{ stacked }" role="img" aria-label="Tako">
    <svg viewBox="0 0 48 48" :width="size" :height="size" aria-hidden="true">
      <path d="M5 30C5 15 14 7 24 7s19 8 19 23c0 6-8 9-19 9S5 36 5 30Z" fill="#2FB57A" stroke="#1B8A5A" stroke-width="2.5" />
      <polygon points="24,12 29,15 29,21 24,24 19,21 19,15" fill="#5BCF98" stroke="#1B8A5A" stroke-width="1.8" stroke-linejoin="round" />
      <polygon points="12.5,19 17,21.5 17,27 12.5,29.5 8,27 8,21.5" fill="#5BCF98" stroke="#1B8A5A" stroke-width="1.6" stroke-linejoin="round" opacity=".9" />
      <polygon points="35.5,19 40,21.5 40,27 35.5,29.5 31,27 31,21.5" fill="#5BCF98" stroke="#1B8A5A" stroke-width="1.6" stroke-linejoin="round" opacity=".9" />
      <ellipse cx="24" cy="32" rx="12.5" ry="10.5" fill="#A6E36E" />
      <circle cx="19.5" cy="31" r="2.3" fill="#22312C" /><circle cx="28.5" cy="31" r="2.3" fill="#22312C" />
      <circle cx="20.2" cy="30.2" r=".8" fill="#fff" /><circle cx="29.2" cy="30.2" r=".8" fill="#fff" />
      <path d="M20.5 36 Q24 39 27.5 36" fill="none" stroke="#22312C" stroke-width="1.8" stroke-linecap="round" />
      <ellipse cx="15.5" cy="35" rx="2.2" ry="1.5" fill="#FF8FA3" opacity=".6" /><ellipse cx="32.5" cy="35" rx="2.2" ry="1.5" fill="#FF8FA3" opacity=".6" />
    </svg>
    <span v-if="wordmark" class="word" :style="{ fontSize: size * 0.62 + 'px' }">tako</span>
  </span>
</template>

<script setup>
defineProps({ size: { type: Number, default: 40 }, wordmark: { type: Boolean, default: true }, stacked: Boolean })
</script>

<style scoped>
.logo { display: inline-flex; align-items: center; gap: 8px; }
.logo.stacked { flex-direction: column; gap: 2px; }
.word { font-family: var(--font-display); font-weight: 700; color: var(--tako-600); letter-spacing: .5px; line-height: 1; }
</style>
