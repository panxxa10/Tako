<template>
  <main class="focus" :class="{ running }">
    <button class="btn btn-ghost close" @click="leave"><Icon name="chevron-left" :size="22" /> Volver</button>

    <PetAvatar :mood="mood" :shell="pet.shell" :hat="pet.hat" :glasses="pet.glasses" :neck="pet.neck" :size="190" />

    <ProgressRing :value="elapsed" :max="total" :size="210" :stroke="14" color="var(--tako-500)">
      <div><div class="time">{{ mm }}:{{ ss }}</div><div class="small muted">{{ finished ? '¡Terminaste!' : running ? 'Concentrado' : 'Listo para empezar' }}</div></div>
    </ProgressRing>

    <p class="msg">{{ message }}</p>

    <div v-if="!running && !finished" class="row-wrap center-row">
      <button v-for="m in [15, 25, 45]" :key="m" class="pill-btn" :class="{ active: minutes === m }" :aria-pressed="minutes === m" @click="minutes = m">{{ m }} min</button>
    </div>

    <div class="actions">
      <button v-if="!running && !finished" class="btn btn-primary btn-block" @click="start">Empezar a enfocarme</button>
      <button v-else-if="running" class="btn btn-secondary btn-block" @click="giveUp">Terminar antes</button>
      <template v-else>
        <button class="btn btn-primary btn-block" @click="again">Otra sesión</button>
        <router-link class="btn btn-secondary btn-block" to="/hoy">Volver a mis tareas</router-link>
      </template>
    </div>
    <p v-if="error" class="form-error" role="alert">{{ error }}</p>
  </main>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import api, { errorMessage } from '../api'
import PetAvatar from '../components/PetAvatar.vue'
import ProgressRing from '../components/ProgressRing.vue'
import Icon from '../components/Icon.vue'
import { state, celebrate } from '../store'

const router = useRouter()
const pet = computed(() => state.me?.pet || {})
const minutes = ref(25)
const running = ref(false)
const finished = ref(false)
const gaveUp = ref(false)
const error = ref('')
const remaining = ref(25 * 60)
let endAt = 0
let timer = null

const total = computed(() => minutes.value * 60)
const elapsed = computed(() => (running.value || finished.value ? total.value - remaining.value : 0))
const shown = computed(() => (running.value ? remaining.value : finished.value ? 0 : total.value))
const mm = computed(() => String(Math.floor(shown.value / 60)).padStart(2, '0'))
const ss = computed(() => String(shown.value % 60).padStart(2, '0'))
const mood = computed(() => (finished.value ? 'celebrate' : gaveUp.value ? 'sad' : running.value ? 'focus' : 'happy'))
const message = computed(() => {
  if (finished.value) return '¡Excelente! Lo lograste. Tómate un respiro 💚'
  if (gaveUp.value) return 'No pasa nada, a veces cuesta. ¡Inténtalo de nuevo cuando quieras!'
  if (running.value) return 'Deja el teléfono a un lado. Yo me quedo contigo.'
  return 'Elige cuánto quieres concentrarte y yo te acompaño.'
})

function tick() {
  remaining.value = Math.max(0, Math.round((endAt - Date.now()) / 1000))
  if (remaining.value === 0) complete()
}
function start() {
  gaveUp.value = false; error.value = ''
  remaining.value = total.value
  endAt = Date.now() + total.value * 1000
  running.value = true
  timer = setInterval(tick, 500)
}
function stop() { clearInterval(timer); timer = null; running.value = false }
async function complete() {
  stop(); finished.value = true
  try { const { data } = await api.post('/api/focus', { minutes: minutes.value }); celebrate(data) } catch (e) { error.value = errorMessage(e) }
}
function giveUp() { stop(); gaveUp.value = true; remaining.value = total.value }
function again() { finished.value = false; gaveUp.value = false; remaining.value = total.value }
function leave() { router.push('/hoy') }
onBeforeUnmount(stop)
</script>

<style scoped>
.focus { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; padding: 20px 16px; max-width: 460px; margin: 0 auto; text-align: center; }
.close { position: absolute; top: 14px; left: 10px; }
.time { font-family: var(--font-display); font-size: 3rem; line-height: 1; }
.msg { font-weight: 700; min-height: 3em; }
.center-row { justify-content: center; }
.actions { display: flex; flex-direction: column; gap: 10px; width: 100%; }
.focus.running { background: radial-gradient(circle at 50% 30%, var(--tako-50), var(--bg) 70%); }
</style>
