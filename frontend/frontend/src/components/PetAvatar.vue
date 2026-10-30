<template>
  <svg
    class="pet"
    :class="[`mood-${mood}`, { animated }]"
    viewBox="0 0 240 240"
    :width="size"
    :height="size"
    role="img"
    :aria-label="`${name}, ${MOODS[mood] || 'contento'}`"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <radialGradient id="pet-head-light" cx="35%" cy="25%" r="75%">
        <stop offset="0%" :stop-color="SKIN.skinLight" stop-opacity=".9" />
        <stop offset="100%" :stop-color="SKIN.skin" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="pet-sun-lens" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3A4A45" />
        <stop offset="100%" stop-color="#1C2724" />
      </linearGradient>
    </defs>

    <ellipse class="ground-shadow" cx="120" cy="228" rx="66" ry="8" fill="#000" opacity=".13" />

    <g class="whole">
      <!-- Patas -->
      <g class="feet">
        <ellipse cx="82" cy="216" rx="25" ry="13" :fill="SKIN.skinShade" />
        <ellipse cx="158" cy="216" rx="25" ry="13" :fill="SKIN.skinShade" />
        <ellipse cx="82" cy="213" rx="25" ry="12" :fill="SKIN.skin" />
        <ellipse cx="158" cy="213" rx="25" ry="12" :fill="SKIN.skin" />
        <circle cx="70" cy="214" r="3" :fill="SKIN.skinShade" /><circle cx="82" cy="217" r="3" :fill="SKIN.skinShade" /><circle cx="94" cy="214" r="3" :fill="SKIN.skinShade" />
        <circle cx="146" cy="214" r="3" :fill="SKIN.skinShade" /><circle cx="158" cy="217" r="3" :fill="SKIN.skinShade" /><circle cx="170" cy="214" r="3" :fill="SKIN.skinShade" />
      </g>

      <!-- Caparazón -->
      <g class="shell">
        <path d="M30 152 C30 80 72 44 120 44 C168 44 210 80 210 152 C210 178 172 192 120 192 C68 192 30 178 30 152 Z"
              :fill="shellColors.main" :stroke="shellColors.dark" stroke-width="5" stroke-linejoin="round" />
        <path d="M33 160 C40 182 78 192 120 192 C162 192 200 182 207 160 C190 172 156 178 120 178 C84 178 50 172 33 160 Z" :fill="shellColors.dark" opacity=".55" />
        <polygon :points="hex(120, 78, 25)" :fill="shellColors.hex" :stroke="shellColors.dark" stroke-width="3.5" stroke-linejoin="round" />
        <polygon :points="hex(72, 104, 22)" :fill="shellColors.hex" :stroke="shellColors.dark" stroke-width="3.5" stroke-linejoin="round" />
        <polygon :points="hex(168, 104, 22)" :fill="shellColors.hex" :stroke="shellColors.dark" stroke-width="3.5" stroke-linejoin="round" />
        <polygon :points="hex(46, 142, 16)" :fill="shellColors.hex" :stroke="shellColors.dark" stroke-width="3" stroke-linejoin="round" opacity=".9" />
        <polygon :points="hex(194, 142, 16)" :fill="shellColors.hex" :stroke="shellColors.dark" stroke-width="3" stroke-linejoin="round" opacity=".9" />
        <path d="M62 62 Q84 44 112 44" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".28" />
        <g v-if="shell === 'shell_gold'" fill="#fff" opacity=".9">
          <path d="M150 58 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" />
          <path d="M60 128 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" />
        </g>
      </g>

      <!-- Panza -->
      <ellipse cx="120" cy="192" rx="42" ry="29" :fill="SKIN.bellyShade" />
      <ellipse cx="120" cy="189" rx="42" ry="28" :fill="SKIN.belly" />

      <!-- Brazos -->
      <g class="arm arm-l"><ellipse cx="62" cy="174" rx="13" ry="27" :fill="SKIN.skin" /><ellipse cx="66" cy="176" rx="6" ry="20" :fill="SKIN.skinLight" opacity=".45" /></g>
      <g class="arm arm-r"><ellipse cx="178" cy="174" rx="13" ry="27" :fill="SKIN.skin" /><ellipse cx="174" cy="176" rx="6" ry="20" :fill="SKIN.skinLight" opacity=".45" /></g>

      <!-- Cuello (accesorios) -->
      <g v-if="neck === 'neck_scarf'">
        <path d="M74 172 Q120 200 166 172 L162 192 Q120 218 78 192 Z" fill="#FF6B6B" />
        <path d="M74 172 Q120 200 166 172" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="6 7" opacity=".55" />
        <rect x="146" y="190" width="18" height="36" rx="7" fill="#FF6B6B" transform="rotate(-8 155 200)" />
        <rect x="146" y="206" width="18" height="6" fill="#fff" opacity=".5" transform="rotate(-8 155 200)" />
      </g>
      <g v-else-if="neck === 'neck_bow'">
        <path d="M120 184 L90 168 L90 200 Z" fill="#FF6B6B" /><path d="M120 184 L150 168 L150 200 Z" fill="#FF6B6B" />
        <circle cx="120" cy="184" r="9" fill="#E24B4B" />
      </g>
      <g v-else-if="neck === 'neck_bandana'">
        <path d="M76 172 Q120 194 164 172 L120 220 Z" fill="#4DB8FF" />
        <path d="M76 172 Q120 194 164 172" fill="none" stroke="#2B8FD6" stroke-width="3" />
        <circle cx="108" cy="190" r="3" fill="#fff" /><circle cx="132" cy="190" r="3" fill="#fff" /><circle cx="120" cy="204" r="3" fill="#fff" />
      </g>
      <g v-else-if="neck === 'neck_medal'">
        <path d="M100 172 L120 200 L140 172" fill="none" stroke="#FF6B6B" stroke-width="7" stroke-linejoin="round" />
        <circle cx="120" cy="206" r="14" fill="#FFC24B" stroke="#E39A1B" stroke-width="3" />
        <path d="M120 198 l3 6 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1z" fill="#fff" opacity=".9" />
      </g>

      <!-- Cabeza -->
      <g class="head">
        <ellipse cx="120" cy="138" rx="57" ry="49" :fill="SKIN.skinShade" />
        <ellipse cx="120" cy="134" rx="57" ry="48" :fill="SKIN.skin" />
        <ellipse cx="120" cy="134" rx="57" ry="48" fill="url(#pet-head-light)" />

        <!-- Mejillas -->
        <ellipse cx="80" cy="152" rx="10" ry="7" fill="#FF8FA3" opacity=".55" />
        <ellipse cx="160" cy="152" rx="10" ry="7" fill="#FF8FA3" opacity=".55" />

        <!-- Ojos -->
        <g v-for="(x, i) in [98, 142]" :key="x">
          <g v-if="eyeStyle === 'open'" class="eye-open">
            <circle :cx="x" cy="132" r="13.5" fill="#fff" />
            <circle :cx="x + look.x" :cy="132 + look.y" r="8.5" fill="#22312C" />
            <circle :cx="x + look.x + 3" :cy="132 + look.y - 3.5" r="3.2" fill="#fff" />
            <circle :cx="x + look.x - 2.5" :cy="132 + look.y + 3" r="1.5" fill="#fff" opacity=".9" />
            <path v-if="mood === 'proud'" :transform="`translate(${x + look.x - 5} ${132 + look.y - 6})`" d="M0 0 l1.6 3.6 3.6 1.6 -3.6 1.6 -1.6 3.6 -1.6 -3.6 -3.6 -1.6 3.6 -1.6z" fill="#fff" />
          </g>
          <path v-else-if="eyeStyle === 'happy'" :d="`M${x - 11} ${135} Q${x} ${119} ${x + 11} ${135}`" fill="none" stroke="#22312C" stroke-width="5" stroke-linecap="round" />
          <path v-else-if="eyeStyle === 'closed'" :d="`M${x - 11} ${130} Q${x} ${141} ${x + 11} ${130}`" fill="none" stroke="#22312C" stroke-width="5" stroke-linecap="round" />
          <path v-else-if="eyeStyle === 'heart'" :transform="`translate(${x} ${132}) scale(1.05)`" d="M0 11 C-20 -2 -12 -17 0 -7 C12 -17 20 -2 0 11 Z" fill="#FF5C7A" class="heartbeat" />
        </g>

        <!-- Cejas -->
        <g fill="none" stroke="#22312C" stroke-width="4" stroke-linecap="round">
          <template v-if="mood === 'sad' || mood === 'worried'">
            <path d="M84 116 L109 108" /><path d="M131 108 L156 116" />
          </template>
          <template v-else-if="mood === 'focus'">
            <path d="M85 110 L109 116" /><path d="M131 116 L155 110" />
          </template>
          <template v-else-if="mood === 'thinking'">
            <path d="M86 108 Q98 100 110 106" /><path d="M132 114 L154 112" />
          </template>
        </g>

        <!-- Nariz y boca -->
        <circle cx="114" cy="143" r="1.8" :fill="SKIN.skinShade" /><circle cx="126" cy="143" r="1.8" :fill="SKIN.skinShade" />
        <g class="mouth">
          <path v-if="mouth === 'smile'" d="M105 151 Q120 166 135 151" fill="none" stroke="#22312C" stroke-width="4.5" stroke-linecap="round" />
          <g v-else-if="mouth === 'open'">
            <path d="M101 149 Q120 182 139 149 Z" fill="#3B2A2E" stroke="#3B2A2E" stroke-width="3" stroke-linejoin="round" />
            <path d="M110 164 Q120 156 130 164 Q120 176 110 164 Z" fill="#FF8FA3" />
          </g>
          <path v-else-if="mouth === 'grin'" d="M100 150 Q120 170 140 150" fill="none" stroke="#22312C" stroke-width="4.5" stroke-linecap="round" />
          <path v-else-if="mouth === 'frown'" d="M107 161 Q120 150 133 161" fill="none" stroke="#22312C" stroke-width="4.5" stroke-linecap="round" />
          <path v-else-if="mouth === 'wavy'" d="M105 158 Q112.5 150 120 158 T135 158" fill="none" stroke="#22312C" stroke-width="4" stroke-linecap="round" />
          <path v-else-if="mouth === 'soft'" d="M111 156 Q120 163 129 156" fill="none" stroke="#22312C" stroke-width="4" stroke-linecap="round" />
          <path v-else-if="mouth === 'smirk'" d="M111 158 Q124 158 134 150" fill="none" stroke="#22312C" stroke-width="4.5" stroke-linecap="round" />
          <path v-else-if="mouth === 'line'" d="M110 157 L130 157" fill="none" stroke="#22312C" stroke-width="4.5" stroke-linecap="round" />
        </g>

        <!-- Detalles de estado de ánimo -->
        <path v-if="mood === 'sad'" class="tear" d="M92 148 Q86 158 92 164 Q98 158 92 148 Z" fill="#7CC8FF" />
        <path v-if="mood === 'worried'" class="sweat" d="M166 104 Q158 118 166 124 Q174 118 166 104 Z" fill="#7CC8FF" />

        <!-- Gafas -->
        <g v-if="glasses === 'glasses_round'" fill="none" stroke="#2D3A36" stroke-width="4.5">
          <circle cx="98" cy="132" r="18" fill="#fff" fill-opacity=".18" /><circle cx="142" cy="132" r="18" fill="#fff" fill-opacity=".18" />
          <path d="M116 130 Q120 126 124 130" /><path d="M80 130 L66 126" /><path d="M160 130 L174 126" />
        </g>
        <g v-else-if="glasses === 'glasses_sun'">
          <rect x="78" y="118" width="38" height="28" rx="11" fill="url(#pet-sun-lens)" />
          <rect x="124" y="118" width="38" height="28" rx="11" fill="url(#pet-sun-lens)" />
          <path d="M116 126 Q120 122 124 126" fill="none" stroke="#2D3A36" stroke-width="4" />
          <path d="M78 126 L66 122 M162 126 L174 122" stroke="#2D3A36" stroke-width="4" />
          <path d="M84 124 L94 124 M130 124 L140 124" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5" />
        </g>
        <g v-else-if="glasses === 'glasses_heart'">
          <path transform="translate(98 132) scale(1.22)" d="M0 12 C-22 -3 -13 -19 0 -8 C13 -19 22 -3 0 12 Z" fill="#FF5C7A" fill-opacity=".85" stroke="#C93A58" stroke-width="3" />
          <path transform="translate(142 132) scale(1.22)" d="M0 12 C-22 -3 -13 -19 0 -8 C13 -19 22 -3 0 12 Z" fill="#FF5C7A" fill-opacity=".85" stroke="#C93A58" stroke-width="3" />
          <path d="M116 128 Q120 124 124 128" fill="none" stroke="#C93A58" stroke-width="3.5" />
        </g>

        <!-- Sombreros -->
        <g v-if="hat === 'hat_cap'">
          <path d="M72 102 Q72 58 120 58 Q168 58 168 102 Q120 92 72 102 Z" fill="#FF6B6B" />
          <path d="M150 96 Q190 94 200 106 Q168 112 148 104 Z" fill="#D94B4B" />
          <circle cx="120" cy="58" r="5" fill="#D94B4B" />
        </g>
        <g v-else-if="hat === 'hat_beanie'">
          <path d="M72 100 Q70 54 120 54 Q170 54 168 100 Z" fill="#FF9F43" />
          <rect x="68" y="92" width="104" height="16" rx="8" fill="#E8832A" />
          <path d="M84 92 v16 M98 92 v16 M112 92 v16 M126 92 v16 M140 92 v16 M154 92 v16" stroke="#C96A1B" stroke-width="2" opacity=".6" />
          <circle cx="120" cy="50" r="11" fill="#FFF3CF" />
        </g>
        <g v-else-if="hat === 'hat_party'" transform="rotate(-8 120 96)">
          <path d="M94 98 L120 34 L146 98 Z" fill="#8E7CFF" />
          <path d="M103 76 L137 76 M98 90 L142 90" stroke="#FFC24B" stroke-width="5" opacity=".95" />
          <ellipse cx="120" cy="99" rx="28" ry="5" fill="#6F5FE0" />
          <circle cx="120" cy="32" r="7" fill="#FFC24B" />
        </g>
        <g v-else-if="hat === 'hat_grad'">
          <path d="M92 84 L92 102 Q120 116 148 102 L148 84 Z" fill="#33423D" />
          <path d="M120 54 L180 76 L120 98 L60 76 Z" fill="#26332F" />
          <path d="M120 54 L180 76 L120 98 L60 76 Z" fill="none" stroke="#4A5C56" stroke-width="2" />
          <path d="M174 78 L174 104" stroke="#FFC24B" stroke-width="3" stroke-linecap="round" />
          <circle cx="174" cy="108" r="5" fill="#FFC24B" />
        </g>
        <g v-else-if="hat === 'hat_headphones'">
          <path d="M66 126 Q62 62 120 62 Q178 62 174 126" fill="none" stroke="#3B4A45" stroke-width="9" stroke-linecap="round" />
          <rect x="52" y="108" width="26" height="42" rx="12" fill="#FF6B6B" /><rect x="162" y="108" width="26" height="42" rx="12" fill="#FF6B6B" />
          <rect x="58" y="116" width="10" height="26" rx="5" fill="#D94B4B" /><rect x="172" y="116" width="10" height="26" rx="5" fill="#D94B4B" />
        </g>
        <g v-else-if="hat === 'hat_wizard'">
          <path d="M82 100 L112 28 Q120 14 128 28 L158 100 Z" fill="#5B4BDB" />
          <path d="M96 76 Q120 86 144 76" fill="none" stroke="#FFC24B" stroke-width="5" />
          <ellipse cx="120" cy="101" rx="50" ry="9" fill="#4637B8" />
          <path d="M116 58 l2.2 5 5 2.2 -5 2.2 -2.2 5 -2.2 -5 -5 -2.2 5 -2.2z" fill="#FFE17F" />
          <circle cx="132" cy="46" r="2.5" fill="#FFE17F" />
        </g>
        <g v-else-if="hat === 'hat_crown'">
          <path d="M80 98 L78 56 L100 76 L120 46 L140 76 L162 56 L160 98 Q120 106 80 98 Z" fill="#FFC24B" stroke="#E39A1B" stroke-width="3.5" stroke-linejoin="round" />
          <circle cx="120" cy="84" r="6" fill="#FF5C7A" /><circle cx="98" cy="88" r="4.5" fill="#4DB8FF" /><circle cx="142" cy="88" r="4.5" fill="#4DB8FF" />
          <circle cx="78" cy="54" r="4" fill="#FFE17F" /><circle cx="120" cy="44" r="4.5" fill="#FFE17F" /><circle cx="162" cy="54" r="4" fill="#FFE17F" />
        </g>
        <g v-else-if="hat === 'hat_flower'" transform="translate(160 96)">
          <path d="M-4 10 Q-16 22 -26 18 Q-18 6 -4 10 Z" fill="#2FB57A" />
          <circle v-for="a in [0, 72, 144, 216, 288]" :key="a" :cx="11 * Math.cos((a * Math.PI) / 180)" :cy="11 * Math.sin((a * Math.PI) / 180)" r="8.5" fill="#FF8FB8" />
          <circle r="7" fill="#FFC24B" />
        </g>
      </g>

      <!-- Extras de ánimo (fuera de la cabeza) -->
      <g v-if="mood === 'sleepy'" class="zzz" font-family="Fredoka, sans-serif" font-weight="700" fill="#7B8FEA">
        <text x="168" y="92" font-size="26">Z</text><text x="188" y="66" font-size="20">z</text><text x="203" y="46" font-size="15">z</text>
      </g>
      <g v-if="mood === 'thinking'" class="thought">
        <circle cx="178" cy="96" r="4" fill="#fff" stroke="#D5DDD8" stroke-width="2" />
        <circle cx="190" cy="80" r="6" fill="#fff" stroke="#D5DDD8" stroke-width="2" />
        <ellipse cx="206" cy="52" rx="24" ry="18" fill="#fff" stroke="#D5DDD8" stroke-width="2" />
        <text x="206" y="60" text-anchor="middle" font-size="22" font-weight="700" font-family="Fredoka, sans-serif" fill="#7B8FEA">?</text>
      </g>
      <g v-if="mood === 'celebrate' || mood === 'proud'" class="sparkles">
        <path class="sp s1" d="M34 70 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z" fill="#FFC24B" />
        <path class="sp s2" d="M204 58 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" fill="#FF8FB8" />
        <path class="sp s3" d="M214 128 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#4DB8FF" />
        <circle class="sp s2" cx="22" cy="130" r="5" fill="#8E7CFF" />
        <circle class="sp s1" cx="186" cy="30" r="4" fill="#2EC27E" />
        <circle class="sp s3" cx="52" cy="34" r="3.5" fill="#FF6B6B" />
      </g>
    </g>
  </svg>
</template>

<script setup>
import { computed } from 'vue'
import { SKIN, SHELLS, MOODS, hexPoints as hex } from '../pet/petData'

const props = defineProps({
  mood: { type: String, default: 'happy' },
  shell: { type: String, default: 'shell_green' },
  hat: { type: String, default: null },
  glasses: { type: String, default: null },
  neck: { type: String, default: null },
  name: { type: String, default: 'Tako' },
  size: { type: [Number, String], default: 200 },
  animated: { type: Boolean, default: true },
})

const shellColors = computed(() => SHELLS[props.shell] || SHELLS.shell_green)

const eyeStyle = computed(() => ({
  celebrate: 'happy', sleepy: 'closed', love: 'heart',
}[props.mood] || 'open'))

const look = computed(() => ({
  thinking: { x: 4, y: -4 }, sad: { x: 0, y: 3 }, focus: { x: 0, y: 2 }, worried: { x: 0, y: -1 },
}[props.mood] || { x: 0, y: 0 }))

const mouth = computed(() => ({
  happy: 'smile', love: 'smile', celebrate: 'open', proud: 'grin', sad: 'frown',
  worried: 'wavy', sleepy: 'soft', thinking: 'smirk', focus: 'line',
}[props.mood] || 'smile'))
</script>

<style scoped>
.pet { display: block; overflow: visible; }

/* Brazos: punto de giro en el hombro */
.arm { transform-origin: 66px 152px; }
.arm-r { transform-origin: 174px 152px; }
.head { transform-origin: 120px 190px; }
.whole { transform-origin: 120px 226px; }
.eye-open { transform-box: fill-box; transform-origin: center; }
.heartbeat { transform-box: fill-box; transform-origin: center; }

/* Poses */
.mood-celebrate .arm-l { transform: rotate(142deg); }
.mood-celebrate .arm-r { transform: rotate(-142deg); }
.mood-proud .arm-l { transform: rotate(14deg); }
.mood-proud .arm-r { transform: rotate(-14deg); }
.mood-sad .head { transform: translateY(5px) rotate(-3deg); }
.mood-thinking .head { transform: rotate(5deg); }
.mood-thinking .arm-r { transform: rotate(-40deg); }
.mood-sleepy .head { transform: translateY(6px) rotate(4deg); }
.mood-worried .arm-l { transform: rotate(-20deg); }
.mood-worried .arm-r { transform: rotate(20deg); }

/* Animaciones (se desactivan con prefers-reduced-motion) */
@media (prefers-reduced-motion: no-preference) {
  .animated .whole { animation: breathe 3.4s ease-in-out infinite; }
  .animated.mood-celebrate .whole { animation: jump 0.7s cubic-bezier(.3,.7,.4,1) infinite; }
  .animated.mood-sleepy .whole { animation: breathe 5s ease-in-out infinite; }
  .animated .eye-open { animation: blink 5s infinite; }
  .animated.mood-celebrate .arm-l { animation: wave-l 0.7s ease-in-out infinite; }
  .animated.mood-celebrate .arm-r { animation: wave-r 0.7s ease-in-out infinite; }
  .animated.mood-thinking .head { animation: ponder 3.2s ease-in-out infinite; }
  .animated .heartbeat { animation: heartbeat 1.1s ease-in-out infinite; }
  .animated .zzz text { animation: float-z 3s ease-in-out infinite; }
  .animated .zzz text:nth-child(2) { animation-delay: .6s; }
  .animated .zzz text:nth-child(3) { animation-delay: 1.2s; }
  .animated .sp { animation: twinkle 1.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
  .animated .sp.s2 { animation-delay: .5s; }
  .animated .sp.s3 { animation-delay: 1s; }
  .animated .tear { animation: tear 2.4s ease-in infinite; }
  .animated .sweat { animation: tear 2s ease-in infinite; }
  .animated .thought { animation: ponder 3.2s ease-in-out infinite; }
}

@keyframes breathe { 0%,100% { transform: scale(1, 1); } 50% { transform: scale(1.015, 1.03); } }
@keyframes jump { 0%,100% { transform: translateY(0) scale(1.03, .96); } 45% { transform: translateY(-22px) scale(.98, 1.04); } }
@keyframes blink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(.08); } }
@keyframes wave-l { 0%,100% { transform: rotate(142deg); } 50% { transform: rotate(135deg); } }
@keyframes wave-r { 0%,100% { transform: rotate(-142deg); } 50% { transform: rotate(-135deg); } }
@keyframes ponder { 0%,100% { transform: rotate(5deg); } 50% { transform: rotate(-1deg); } }
@keyframes heartbeat { 0%,100% { transform: scale(1); } 40% { transform: scale(1.18); } }
@keyframes float-z { 0% { opacity: 0; transform: translateY(8px); } 30% { opacity: 1; } 100% { opacity: 0; transform: translateY(-12px); } }
@keyframes twinkle { 0%,100% { opacity: .2; transform: scale(.5) rotate(0); } 50% { opacity: 1; transform: scale(1.15) rotate(20deg); } }
@keyframes tear { 0% { opacity: 0; transform: translateY(-3px); } 20% { opacity: 1; } 100% { opacity: 0; transform: translateY(14px); } }
</style>
