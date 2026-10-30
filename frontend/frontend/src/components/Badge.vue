<template>
  <span class="badge" :class="[tier, { locked }]" :style="{ width: size + 'px', height: size + 'px' }" role="img" :aria-label="label">
    <svg viewBox="0 0 64 64" :width="size" :height="size" aria-hidden="true">
      <defs>
        <linearGradient :id="gid" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" :stop-color="colors[0]" /><stop offset="100%" :stop-color="colors[1]" />
        </linearGradient>
      </defs>
      <polygon points="32,3 57,17.5 57,46.5 32,61 7,46.5 7,17.5" :fill="locked ? 'var(--surface-2)' : `url(#${gid})`" :stroke="locked ? 'var(--line)' : colors[2]" stroke-width="3.5" stroke-linejoin="round" />
      <polygon v-if="!locked" points="32,9 51.5,20.2 51.5,43.8 32,55 12.5,43.8 12.5,20.2" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1.6" stroke-linejoin="round" />
      <g transform="translate(16 16) scale(1.33)" :fill="locked ? 'var(--line)' : '#fff'" :stroke="locked ? 'var(--line)' : '#fff'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path v-if="icon === 'check'" d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke-width="3" />
        <g v-else-if="icon === 'step'" stroke="none"><ellipse cx="9" cy="8" rx="2.6" ry="3.8" /><ellipse cx="9" cy="14.2" rx="2" ry="1.7" /><ellipse cx="15.5" cy="11.5" rx="2.6" ry="3.8" /><ellipse cx="15.5" cy="17.7" rx="2" ry="1.7" /></g>
        <path v-else-if="icon === 'rocket'" d="M12 2.5c3.2 2.6 4.6 6.2 4.4 10l-2.2 3.2H9.8l-2.2-3.2c-.2-3.8 1.2-7.4 4.4-10Z M7.6 12.5 4.5 15v3.5l3.6-1.5 M16.4 12.5l3.1 2.5v3.5l-3.6-1.5 M10.5 19.5l1.5 2.5 1.5-2.5" />
        <g v-else-if="icon === 'trophy'"><path d="M7 4h10v5.5a5 5 0 0 1-10 0V4Z" /><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3" fill="none" /><path d="M12 14.5V18M8.5 20h7" fill="none" stroke-width="2.6" /></g>
        <path v-else-if="icon === 'crown'" d="M4 17.5 3 7l5 4 4-6 4 6 5-4-1 10.5H4Z" />
        <path v-else-if="icon === 'flame'" d="M12 2c.8 3.6 5.2 5.6 5.2 10.2a5.2 5.2 0 0 1-10.4 0c0-2.1 1-3.4 2.2-4.2 0 1.5.9 2.6 2 2.6C10.2 8.2 11 5 12 2Z" />
        <path v-else-if="icon === 'star'" d="m12 2.5 2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8L12 2.5Z" />
        <g v-else-if="icon === 'target'" fill="none" stroke-width="2.4"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.8" /><circle cx="12" cy="12" r="1.2" fill="currentColor" /></g>
        <path v-else-if="icon === 'sparkle'" d="m12 2 2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2L12 2Z" />
        <g v-else-if="icon === 'bag'"><path d="M6 8h12l1.2 12H4.8L6 8Z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" fill="none" /></g>
        <g v-else-if="icon === 'hat'"><path d="M12 3 18.5 18H5.5L12 3Z" /><path d="M4 20h16" fill="none" stroke-width="3" /></g>
        <g v-else-if="icon === 'timer'" fill="none" stroke-width="2.4"><circle cx="12" cy="13.5" r="7.5" /><path d="M12 9.5v4l2.5 1.5M9.5 2.5h5" /></g>
      </g>
    </svg>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ icon: String, tier: { type: String, default: 'bronze' }, locked: Boolean, size: { type: Number, default: 64 }, label: String })
const TIERS = { bronze: ['#F2A66B', '#C97B3A', '#A55F22'], silver: ['#C9D6DD', '#8FA3AE', '#6E8290'], gold: ['#FFD866', '#F0A81C', '#C98A10'], special: ['#A894FF', '#FF8FB8', '#7A62E0'] }
const colors = computed(() => TIERS[props.tier] || TIERS.bronze)
const gid = `bg-${Math.random().toString(36).slice(2, 8)}`
</script>

<style scoped>
.badge { display: inline-block; flex-shrink: 0; filter: drop-shadow(0 3px 0 rgba(0, 0, 0, .08)); }
.badge.locked { filter: none; }
</style>
