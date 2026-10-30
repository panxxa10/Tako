<template>
  <main class="onb">
    <div class="steps" aria-hidden="true"><span v-for="n in 3" :key="n" :class="{ on: n <= step }"></span></div>

    <section class="card stack center pop-in" :key="step">
      <template v-if="step === 1">
        <PetScene :pet="{ mood: 'celebrate', shell: shell, name: petName }" :scene="'scene_meadow'" :pet-size="210" ratio="5 / 4" />
        <h1>¡Hola! Soy tu nueva compañera 🐢</h1>
        <p class="muted">Cuando cumplas tus tareas yo crezco contigo. ¿Cómo quieres llamarme?</p>
        <label class="field left">Mi nombre
          <input v-model="petName" class="input" maxlength="20" placeholder="Tako" aria-label="Nombre de tu mascota" />
        </label>
        <div class="field left">Mi color
          <div class="row-wrap">
            <button v-for="c in FREE_SHELLS" :key="c.id" class="swatch" :class="{ on: shell === c.id }" :style="{ background: SHELLS[c.id].main }" :aria-label="c.name" :aria-pressed="shell === c.id" @click="shell = c.id"></button>
            <span class="muted small">Más colores en la tienda 🎨</span>
          </div>
        </div>
      </template>

      <template v-else-if="step === 2">
        <PetAvatar mood="thinking" :shell="shell" :size="150" />
        <h1>¿Cuántas tareas al día?</h1>
        <p class="muted">Elige una meta con la que te sientas cómodo. Siempre puedes cambiarla después.</p>
        <div class="goals">
          <button v-for="g in GOALS" :key="g.n" class="goal" :class="{ on: goal === g.n }" :aria-pressed="goal === g.n" @click="goal = g.n">
            <strong>{{ g.n }}</strong><span>{{ g.n === 1 ? 'tarea' : 'tareas' }}</span><em>{{ g.label }}</em>
          </button>
        </div>
      </template>

      <template v-else>
        <PetAvatar mood="love" :shell="shell" :size="170" />
        <h1>¡Todo listo, {{ me?.user.username }}!</h1>
        <p class="muted">Te regalo <strong class="coin-text">30 monedas</strong> para estrenar un accesorio en la tienda. Con cada tarea cumplida ganarás más.</p>
        <ul class="how">
          <li><span>✅</span> Completa tareas para ganar XP y monedas</li>
          <li><span>🔥</span> Haz al menos una al día para mantener tu racha</li>
          <li><span>🎁</span> Gasta tus monedas en looks y premios propios</li>
        </ul>
      </template>

      <p v-if="error" class="form-error" role="alert">{{ error }}</p>
      <div class="row nav">
        <button v-if="step > 1" class="btn btn-ghost" @click="step--">Atrás</button>
        <div class="spacer"></div>
        <button class="btn btn-primary" :disabled="saving || (step === 1 && !petName.trim())" @click="next">{{ step === 3 ? '¡Vamos!' : 'Continuar' }}</button>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api, { errorMessage } from '../api'
import PetAvatar from '../components/PetAvatar.vue'
import PetScene from '../components/PetScene.vue'
import { SHELLS } from '../pet/petData'
import { state, setMe } from '../store'

const router = useRouter()
const me = computed(() => state.me)
const step = ref(1)
const petName = ref(state.me?.pet.name || 'Tako')
const shell = ref(state.me?.pet.shell || 'shell_green')
const goal = ref(3)
const saving = ref(false)
const error = ref('')

const FREE_SHELLS = [{ id: 'shell_green', name: 'Verde' }, { id: 'shell_teal', name: 'Turquesa' }]
const GOALS = [{ n: 1, label: 'Tranquilo' }, { n: 3, label: 'Constante' }, { n: 5, label: 'Intenso' }]

async function next() {
  if (step.value < 3) { step.value++; return }
  saving.value = true
  error.value = ''
  try {
    await api.put('/api/me/pet', { name: petName.value.trim(), shell: shell.value })
    const { data } = await api.patch('/api/me', { dailyGoal: goal.value, onboarded: true })
    setMe(data)
    router.push('/hoy')
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.onb { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 20px 16px; max-width: 520px; margin: 0 auto; }
.steps { display: flex; gap: 8px; width: 100%; }
.steps span { flex: 1; height: 10px; border-radius: 99px; background: var(--line); transition: background .3s; }
.steps span.on { background: var(--tako-500); }
.card { width: 100%; align-items: center; }
.left { align-self: stretch; text-align: left; }
.swatch { width: 46px; height: 46px; border-radius: 50%; border: 4px solid var(--surface); box-shadow: 0 0 0 2px var(--line); cursor: pointer; }
.swatch.on { box-shadow: 0 0 0 4px var(--tako-500); }
.goals { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; width: 100%; }
.goal { display: flex; flex-direction: column; align-items: center; padding: 14px 6px; border: 2px solid var(--line); border-radius: var(--radius-sm); background: var(--surface); cursor: pointer; box-shadow: 0 4px 0 var(--line); }
.goal strong { font-family: var(--font-display); font-size: 2rem; line-height: 1; }
.goal em { font-style: normal; font-size: .85rem; color: var(--ink-soft); font-weight: 800; margin-top: 4px; }
.goal.on { border-color: var(--tako-500); background: var(--tako-50); box-shadow: 0 4px 0 var(--tako-500); }
.how { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; text-align: left; width: 100%; }
.how li { display: flex; gap: 12px; align-items: center; padding: 10px 14px; background: var(--surface-2); border-radius: 14px; font-weight: 700; }
.coin-text { color: var(--sun-dark); }
.nav { width: 100%; margin-top: 6px; }
</style>
