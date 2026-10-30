<template>
  <div class="ring" :style="{ width: size + 'px', height: size + 'px' }" role="progressbar" :aria-valuenow="value" aria-valuemin="0" :aria-valuemax="max">
    <svg :viewBox="`0 0 ${size} ${size}`" :width="size" :height="size">
      <circle :cx="size / 2" :cy="size / 2" :r="r" fill="none" stroke="var(--surface-2)" :stroke-width="stroke" />
      <circle class="arc" :cx="size / 2" :cy="size / 2" :r="r" fill="none" :stroke="color" :stroke-width="stroke" stroke-linecap="round"
              :stroke-dasharray="c" :stroke-dashoffset="c * (1 - pct)" :transform="`rotate(-90 ${size / 2} ${size / 2})`" />
    </svg>
    <div class="inner"><slot /></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ value: Number, max: { type: Number, default: 1 }, size: { type: Number, default: 96 }, stroke: { type: Number, default: 10 }, color: { type: String, default: 'var(--tako-500)' } })
const r = computed(() => (props.size - props.stroke) / 2)
const c = computed(() => 2 * Math.PI * r.value)
const pct = computed(() => Math.min(1, Math.max(0, props.max ? props.value / props.max : 0)))
</script>

<style scoped>
.ring { position: relative; flex-shrink: 0; }
.inner { position: absolute; inset: 0; display: grid; place-items: center; text-align: center; font-family: var(--font-display); font-weight: 600; line-height: 1.1; }
.arc { transition: stroke-dashoffset .8s cubic-bezier(.3, 1, .4, 1); }
</style>
