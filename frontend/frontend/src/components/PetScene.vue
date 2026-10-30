<template>
  <div class="scene" :class="scene" :style="{ aspectRatio: ratio }">
    <svg class="bg" viewBox="0 0 320 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky-meadow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ADFFF" /><stop offset="1" stop-color="#EAFBFF" /></linearGradient>
        <linearGradient id="sky-beach" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FD3FF" /><stop offset="1" stop-color="#E4F7FF" /></linearGradient>
        <linearGradient id="sky-sunset" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7C6BE6" /><stop offset=".55" stop-color="#FF8FA3" /><stop offset="1" stop-color="#FFD08A" /></linearGradient>
        <linearGradient id="sky-night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121744" /><stop offset="1" stop-color="#3C4196" /></linearGradient>
        <linearGradient id="sky-space" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#080826" /><stop offset="1" stop-color="#241E6B" /></linearGradient>
      </defs>

      <g v-if="scene === 'scene_meadow'">
        <rect width="320" height="240" fill="url(#sky-meadow)" />
        <circle cx="262" cy="52" r="42" fill="#FFE9A0" opacity=".45" /><circle cx="262" cy="52" r="24" fill="#FFD866" />
        <g fill="#fff" opacity=".95"><ellipse cx="60" cy="48" rx="30" ry="11" /><ellipse cx="84" cy="40" rx="20" ry="11" /><ellipse cx="170" cy="30" rx="26" ry="9" /><ellipse cx="190" cy="24" rx="16" ry="9" /></g>
        <path d="M0 170 Q70 130 150 160 T320 150 V240 H0Z" fill="#A5E8B0" />
        <path d="M0 196 Q90 166 190 190 T320 180 V240 H0Z" fill="#6FD08C" />
        <g><circle cx="40" cy="214" r="4" fill="#FF8FB8" /><circle cx="70" cy="224" r="3.5" fill="#FFD866" /><circle cx="250" cy="212" r="4" fill="#fff" /><circle cx="285" cy="226" r="4" fill="#FF8FB8" /><circle cx="22" cy="228" r="3" fill="#fff" /><circle cx="300" cy="204" r="3" fill="#FFD866" /></g>
      </g>
      <g v-else-if="scene === 'scene_beach'">
        <rect width="320" height="240" fill="url(#sky-beach)" />
        <circle cx="64" cy="48" r="36" fill="#FFE9A0" opacity=".5" /><circle cx="64" cy="48" r="21" fill="#FFD866" />
        <g fill="#fff"><ellipse cx="200" cy="40" rx="28" ry="9" /><ellipse cx="222" cy="33" rx="18" ry="9" /></g>
        <rect y="120" width="320" height="60" fill="#4DB8FF" /><rect y="120" width="320" height="14" fill="#7FD3FF" />
        <g fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"><path d="M20 146 q10 -8 20 0 t20 0" /><path d="M200 138 q10 -8 20 0 t20 0" /><path d="M110 160 q10 -8 20 0 t20 0" /></g>
        <path d="M0 176 Q120 160 320 182 V240 H0Z" fill="#FFE2A8" /><path d="M0 206 Q160 190 320 210 V240 H0Z" fill="#FFD488" />
        <path d="M258 210 q4 -20 14 -26 M258 210 q-8 -16 -18 -20" stroke="#8B5E34" stroke-width="5" stroke-linecap="round" fill="none" />
        <g fill="#2FB57A"><path d="M272 184 q22 -14 34 6 q-18 -2 -34 -6Z" /><path d="M272 184 q-8 -22 -30 -18 q16 8 30 18Z" /><path d="M272 184 q4 -20 24 -22 q-14 8 -24 22Z" /></g>
      </g>
      <g v-else-if="scene === 'scene_sunset'">
        <rect width="320" height="240" fill="url(#sky-sunset)" />
        <circle cx="160" cy="168" r="70" fill="#FFE9A0" opacity=".35" /><circle cx="160" cy="168" r="44" fill="#FFD866" />
        <g stroke="#fff" stroke-width="2.5" stroke-linecap="round" fill="none" opacity=".8"><path d="M60 60 q5 -6 10 0 q5 -6 10 0" /><path d="M240 84 q4 -5 8 0 q4 -5 8 0" /></g>
        <path d="M0 178 Q80 150 160 172 T320 160 V240 H0Z" fill="#6A58C4" />
        <path d="M0 204 Q100 184 200 206 T320 196 V240 H0Z" fill="#4C3C9E" />
      </g>
      <g v-else-if="scene === 'scene_night'">
        <rect width="320" height="240" fill="url(#sky-night)" />
        <g fill="#fff"><circle cx="30" cy="30" r="1.8" /><circle cx="80" cy="60" r="1.3" /><circle cx="130" cy="22" r="2" /><circle cx="190" cy="48" r="1.5" /><circle cx="236" cy="22" r="1.8" /><circle cx="296" cy="64" r="1.4" /><circle cx="50" cy="110" r="1.4" /><circle cx="280" cy="120" r="1.8" /><circle cx="150" cy="86" r="1.2" /><circle cx="108" cy="126" r="1.2" /></g>
        <circle cx="258" cy="52" r="26" fill="#FFF3C4" /><circle cx="268" cy="46" r="23" fill="#2A2F78" />
        <path d="M0 184 Q90 160 170 182 T320 170 V240 H0Z" fill="#1E6B56" /><path d="M0 208 Q120 190 220 210 T320 202 V240 H0Z" fill="#14503F" />
      </g>
      <g v-else-if="scene === 'scene_space'">
        <rect width="320" height="240" fill="url(#sky-space)" />
        <g fill="#fff"><circle cx="24" cy="28" r="1.6" /><circle cx="90" cy="52" r="1.2" /><circle cx="140" cy="20" r="1.8" /><circle cx="200" cy="70" r="1.3" /><circle cx="300" cy="30" r="1.6" /><circle cx="40" cy="110" r="1.2" /><circle cx="280" cy="140" r="1.5" /><circle cx="170" cy="120" r="1" /><circle cx="110" cy="96" r="1.1" /></g>
        <circle cx="246" cy="62" r="26" fill="#FF8FB8" /><ellipse cx="246" cy="62" rx="44" ry="9" fill="none" stroke="#FFD866" stroke-width="4" transform="rotate(-18 246 62)" />
        <circle cx="60" cy="70" r="10" fill="#4DB8FF" />
        <ellipse cx="160" cy="262" rx="230" ry="80" fill="#6F4FD6" /><ellipse cx="160" cy="262" rx="230" ry="80" fill="none" stroke="#9B7BFF" stroke-width="4" />
        <g fill="#5A3DBA"><ellipse cx="60" cy="204" rx="16" ry="5" /><ellipse cx="260" cy="212" rx="22" ry="6" /><ellipse cx="170" cy="224" rx="12" ry="4" /></g>
      </g>
      <rect v-else width="320" height="240" fill="var(--tako-50)" />
    </svg>
    <div v-if="showPet" class="pet-wrap">
      <PetAvatar v-bind="pet" :size="petSize" />
    </div>
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import PetAvatar from './PetAvatar.vue'

const props = defineProps({
  pet: { type: Object, default: () => ({}) },   // props de PetAvatar (mood, shell, hat, ...)
  scene: { type: String, default: 'scene_meadow' },
  showPet: { type: Boolean, default: true },
  petSize: { type: Number, default: 200 },
  ratio: { type: String, default: '4 / 3' },
})
const scene = computed(() => props.scene || 'scene_meadow')
</script>

<style scoped>
.scene { position: relative; overflow: hidden; border-radius: var(--radius); border: 2px solid var(--line); width: 100%; }
.bg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.pet-wrap { position: absolute; left: 50%; bottom: 2%; transform: translateX(-50%); display: flex; }
</style>
