<template>
  <svg viewBox="0 0 24 24" :width="size" :height="size" aria-hidden="true" :class="['icon', `icon-${name}`]"
       :fill="filled ? 'currentColor' : 'none'" :stroke="filled ? 'none' : 'currentColor'" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <template v-if="name === 'home'"><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v10h4.5v-6h4v6h4.5V10" /></template>
    <template v-else-if="name === 'calendar'"><rect x="3" y="5" width="18" height="16" rx="4" /><path d="M8 3v4M16 3v4M3 10.5h18" /></template>
    <template v-else-if="name === 'chart'"><path d="M5 20V11M12 20V4M19 20v-6" /></template>
    <template v-else-if="name === 'bag'"><path d="M6 8h12l1.2 12H4.8L6 8Z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></template>
    <template v-else-if="name === 'user'"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" /></template>
    <template v-else-if="name === 'plus'"><path d="M12 5v14M5 12h14" /></template>
    <template v-else-if="name === 'check'"><path d="m5 12.5 4.5 4.5L19 7.5" /></template>
    <template v-else-if="name === 'x'"><path d="M6 6l12 12M18 6 6 18" /></template>
    <template v-else-if="name === 'edit'"><path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3Z" /></template>
    <template v-else-if="name === 'trash'"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></template>
    <template v-else-if="name === 'repeat'"><path d="M17 3l3 3-3 3" /><path d="M4 11V9a3 3 0 0 1 3-3h13" /><path d="M7 21l-3-3 3-3" /><path d="M20 13v2a3 3 0 0 1-3 3H4" /></template>
    <template v-else-if="name === 'sliders'"><path d="M4 7h9M17 7h3M4 17h3M11 17h9" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" /></template>
    <template v-else-if="name === 'chevron-left'"><path d="m15 5-7 7 7 7" /></template>
    <template v-else-if="name === 'chevron-right'"><path d="m9 5 7 7-7 7" /></template>
    <template v-else-if="name === 'timer'"><circle cx="12" cy="13.5" r="7.5" /><path d="M12 9.5v4l2.5 1.5M9.5 2.5h5" /></template>
    <template v-else-if="name === 'clock'"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></template>
    <template v-else-if="name === 'bulb'"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z" /></template>
    <template v-else-if="name === 'shield'"><path d="M12 3 4.5 6v5.5c0 4.5 3 8 7.5 9.5 4.5-1.5 7.5-5 7.5-9.5V6L12 3Z" /></template>
    <template v-else-if="name === 'flame'"><path d="M12 2c.8 3.6 5.2 5.6 5.2 10.2a5.2 5.2 0 0 1-10.4 0c0-2.1 1-3.4 2.2-4.2 0 1.5.9 2.6 2 2.6C10.2 8.2 11 5 12 2Z" /></template>
    <template v-else-if="name === 'coin'"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6.4" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1.8" /><path d="M12 8.2v7.6M9.4 10.2h5.2" stroke="rgba(0,0,0,.35)" stroke-width="1.8" /></template>
    <template v-else-if="name === 'star'"><path d="m12 2.5 2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8L12 2.5Z" /></template>
    <template v-else-if="name === 'lock'"><rect x="5" y="11" width="14" height="10" rx="3" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></template>
  </svg>
</template>

<script setup>
defineProps({ name: String, size: { type: [Number, String], default: 24 }, filled: Boolean })
</script>
