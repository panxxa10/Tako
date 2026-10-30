<template>
  <div v-if="me" class="page">
    <section class="hero card">
      <PetScene :pet="petProps" :scene="me.pet.scene" :pet-size="210" ratio="16 / 10">
        <div class="bubble pop-in" :key="mood.message"><p>{{ mood.message }}</p></div>
        <span class="name-tag">{{ me.pet.name }} · Nv {{ p.level }} {{ p.title }}</span>
      </PetScene>
      <div class="xp">
        <div class="row small"><strong>Experiencia</strong><div class="spacer"></div><span class="muted">{{ p.xpInLevel }} / {{ p.xpForNext }} XP</span></div>
        <div class="bar" role="progressbar" :aria-valuenow="p.xpInLevel" aria-valuemin="0" :aria-valuemax="p.xpForNext"><div :style="{ width: (p.xpInLevel / p.xpForNext) * 100 + '%' }"></div></div>
      </div>
    </section>

    <section class="grid2">
      <div class="card goal">
        <ProgressRing :value="p.doneToday" :max="p.dailyGoal" :size="92" :stroke="11" :color="p.goalReached ? 'var(--tako-500)' : 'var(--sky)'">
          <span class="ring-num">{{ Math.min(p.doneToday, p.dailyGoal) }}/{{ p.dailyGoal }}</span>
        </ProgressRing>
        <div><h3>Meta de hoy</h3><p class="muted small">{{ p.goalReached ? '¡Cumplida! 🎉' : `Te ${p.dailyGoal - p.doneToday === 1 ? 'falta 1 tarea' : `faltan ${p.dailyGoal - p.doneToday} tareas`}` }}</p></div>
      </div>
      <router-link to="/progreso" class="card streak" :class="{ risk: p.streakAtRisk }">
        <Icon name="flame" :size="56" filled class="flame" />
        <div>
          <h3>{{ p.streak }} {{ p.streak === 1 ? 'día' : 'días' }}</h3>
          <p class="small">{{ streakText }}</p>
          <p v-if="p.freezes" class="small shield"><Icon name="shield" :size="14" filled /> {{ p.freezes }} {{ p.freezes === 1 ? 'escudo' : 'escudos' }}</p>
        </div>
      </router-link>
    </section>

    <section v-if="overdue.length" class="card alert">
      <div class="row">
        <Icon name="clock" :size="28" />
        <div class="spacer"><strong>{{ overdue.length }} {{ overdue.length === 1 ? 'tarea atrasada' : 'tareas atrasadas' }}</strong>
          <p class="small">Sin presión: pásalas a hoy y sigue a tu ritmo.</p></div>
        <button class="btn btn-secondary btn-sm" :disabled="moving" @click="moveOverdue">Pasar a hoy</button>
      </div>
    </section>

    <section v-if="tip" class="card tip" :class="tip.kind">
      <span class="tip-icon" aria-hidden="true">{{ tip.icon }}</span>
      <div class="spacer"><strong>{{ tip.title }}</strong><p class="small">{{ tip.body }}</p></div>
      <router-link to="/progreso" class="btn btn-ghost btn-sm">Más consejos</router-link>
    </section>

    <section class="card">
      <div class="row head"><h2>Tareas de hoy</h2><div class="spacer"></div><router-link to="/enfoque" class="btn btn-secondary btn-sm"><Icon name="timer" :size="18" /> Enfocarme</router-link></div>
      <TaskList :tasks="tasks" :loading="loading" :error="error" title="Tareas de hoy" empty-text="No tienes tareas para hoy. ¡Planea 2 o 3 pequeñas para empezar!"
                @add="(payload, done) => onAdd(payload, done)" @toggle="onToggle" @edit="edit" @remove="remove" />
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '../api'
import PetScene from '../components/PetScene.vue'
import ProgressRing from '../components/ProgressRing.vue'
import TaskList from '../components/TaskList.vue'
import Icon from '../components/Icon.vue'
import { state, loadMe } from '../store'
import { useDayTasks } from '../composables/useDayTasks'
import { todayKey, addDaysKey } from '../utils/date'

const me = computed(() => state.me)
const p = computed(() => me.value.progress)
const today = todayKey()

const { tasks, loading, error, load, add, toggle, edit, remove } = useDayTasks()
const overdue = ref([])
const tip = ref(null)
const moving = ref(false)

const petProps = computed(() => ({ mood: mood.value.mood, shell: me.value.pet.shell, hat: me.value.pet.hat, glasses: me.value.pet.glasses, neck: me.value.pet.neck, name: me.value.pet.name }))

const streakText = computed(() => {
  if (p.value.streakAtRisk) return '¡Completa 1 tarea hoy para salvar tu racha!'
  if (p.value.doneToday > 0) return 'Hoy ya sumaste a tu racha ✔'
  return 'Completa una tarea y empieza tu racha'
})

// Estado de ánimo y mensaje de Tako según lo que pasa en el día
const mood = computed(() => {
  const pr = p.value
  const hour = new Date().getHours()
  const name = me.value.user.username
  if (state.reactionMood) return { mood: state.reactionMood, message: state.reactionText }
  if (pr.goalReached) return { mood: 'celebrate', message: `¡Meta cumplida, ${name}! Estoy muy orgullosa de ti 🎉` }
  if (hour >= 22 || hour < 5) return { mood: 'sleepy', message: 'Zzz… ya es tarde. ¡Mañana seguimos, descansa bien!' }
  if (pr.streakAtRisk && hour >= 17) return { mood: 'worried', message: `Tu racha de ${pr.streak} días corre peligro. ¡Con una tarea la salvas!` }
  if (pr.streak === 0 && pr.bestStreak >= 3 && pr.doneToday === 0) return { mood: 'sad', message: 'Te extrañé… pero hoy es un buen día para empezar de nuevo 💚' }
  if (!tasks.value.length && pr.doneToday === 0) return { mood: 'thinking', message: '¿Qué te gustaría lograr hoy? Agrega una tarea pequeña.' }
  if (pr.doneToday > 0) return { mood: 'proud', message: `¡Vas genial! Te ${pr.dailyGoal - pr.doneToday === 1 ? 'falta 1' : `faltan ${pr.dailyGoal - pr.doneToday}`} para tu meta.` }
  const hi = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'
  return { mood: 'happy', message: `${hi}, ${name}. ¡Hagamos un día genial!` }
})

async function loadExtras() {
  try {
    const [o, i] = await Promise.all([api.get('/api/tasks/overdue'), api.get('/api/insights')])
    overdue.value = o.data
    tip.value = i.data.items.find((x) => x.id !== 'overdue' && x.id !== 'welcome') || null
  } catch { /* secundario */ }
}

async function onAdd(payload, done) {
  const ok = await add({ ...payload, date: today })
  done(ok)
}
async function onToggle(t) { await toggle(t); loadExtras() }

async function moveOverdue() {
  moving.value = true
  try {
    await api.post('/api/tasks/reschedule', { to: today })
    await Promise.all([load(), loadExtras()])
  } finally { moving.value = false }
}

onMounted(async () => {
  await Promise.all([load(today, today), loadExtras(), loadMe().catch(() => {})])
})
</script>

<style scoped>
.hero { padding: 12px; display: flex; flex-direction: column; gap: 12px; }
.bubble { position: absolute; top: 10px; left: 10px; right: 10px; display: flex; }
.bubble p { background: var(--surface); border: 2px solid var(--line); padding: 10px 14px; border-radius: 18px 18px 18px 4px; font-weight: 800; font-size: .98rem; box-shadow: var(--shadow); max-width: 78%; }
.name-tag { position: absolute; left: 10px; bottom: 10px; padding: 4px 12px; border-radius: 999px; background: color-mix(in srgb, var(--surface) 90%, transparent); font-family: var(--font-display); font-weight: 600; font-size: .9rem; }
.xp { padding: 0 6px 4px; }
.bar { height: 14px; border-radius: 99px; background: var(--surface-2); overflow: hidden; margin-top: 6px; }
.bar > div { height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--lilac), #B7A9FF); transition: width .8s cubic-bezier(.3, 1, .4, 1); }

.grid2 { display: grid; grid-template-columns: 1fr; gap: 14px; }
@media (min-width: 560px) { .grid2 { grid-template-columns: 1fr 1fr; } }
.goal, .streak { display: flex; align-items: center; gap: 16px; }
.ring-num { font-size: 1.25rem; }
.streak { color: var(--ink); text-decoration: none; }
.streak:hover { text-decoration: none; }
.flame { color: var(--flame); filter: drop-shadow(0 3px 0 rgba(255, 122, 61, .25)); }
.streak.risk { border-color: var(--flame); background: color-mix(in srgb, var(--flame) 8%, var(--surface)); }
.shield { color: var(--sky); display: flex; align-items: center; gap: 4px; font-weight: 800; }

.alert { border-color: var(--coral); background: var(--coral-soft); }
.alert svg { color: var(--coral); flex-shrink: 0; }
.tip { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.tip-icon { font-size: 2rem; }
.tip.praise { background: var(--tako-50); border-color: var(--tako-100); }
.tip.improve { background: color-mix(in srgb, var(--sun) 10%, var(--surface)); border-color: color-mix(in srgb, var(--sun) 40%, var(--line)); }
.head { margin-bottom: 14px; }
</style>
