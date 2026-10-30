<template>
  <div class="page">
    <div class="row">
      <h1 class="spacer">Calendario</h1>
      <button class="btn btn-secondary btn-sm" @click="goToday">Hoy</button>
    </div>

    <section class="card">
      <div class="row nav">
        <button class="icon-btn" aria-label="Mes anterior" @click="changeMonth(-1)"><Icon name="chevron-left" /></button>
        <h2 class="spacer center">{{ MONTHS[month] }} {{ year }}</h2>
        <button class="icon-btn" aria-label="Mes siguiente" @click="changeMonth(1)"><Icon name="chevron-right" /></button>
      </div>

      <div class="weekdays" aria-hidden="true"><span v-for="w in WEEK" :key="w">{{ w }}</span></div>
      <div class="grid">
        <span v-for="n in blanks" :key="'b' + n"></span>
        <button v-for="d in days" :key="d.key" type="button" class="day"
                :class="{ today: d.key === todayStr, selected: d.key === selected, [d.status]: true }"
                :aria-label="`${d.day} de ${MONTHS[month]}${d.total ? `, ${d.done} de ${d.total} tareas completadas` : ''}`" :aria-pressed="d.key === selected" @click="selected = d.key">
          <span class="num">{{ d.day }}</span>
          <span v-if="d.total" class="dots" aria-hidden="true"><i v-for="n in Math.min(d.total, 4)" :key="n" :class="{ on: n <= d.done }"></i></span>
        </button>
      </div>
      <p class="legend small muted"><i class="lg done"></i> Todo listo <i class="lg pending"></i> Pendiente <i class="lg upcoming"></i> Próximo</p>
    </section>

    <section class="card">
      <h2 class="cap">{{ formatLong(selected) }}</h2>
      <p v-if="dayTasks.length" class="muted small count">{{ doneCount }} de {{ dayTasks.length }} completadas</p>
      <TaskList :tasks="dayTasks" :loading="loading" :error="error" :title="`Tareas del ${selected}`" empty-text="Nada planeado para este día."
                @add="(payload, done) => onAdd(payload, done)" @toggle="toggle" @edit="edit" @remove="remove" />
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import Icon from '../components/Icon.vue'
import TaskList from '../components/TaskList.vue'
import { useDayTasks } from '../composables/useDayTasks'
import { toDateKey, todayKey, monthRange, formatLong, MONTHS } from '../utils/date'

const WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const todayStr = todayKey()
const now = new Date()
const year = ref(now.getFullYear())
const month = ref(now.getMonth())
const selected = ref(todayStr)

const { tasks, loading, error, load, add, toggle, edit, remove } = useDayTasks()

const blanks = computed(() => (new Date(year.value, month.value, 1).getDay() + 6) % 7) // la semana empieza en lunes
const byDay = computed(() => {
  const map = {}
  for (const t of tasks.value) (map[t.date] ||= []).push(t)
  return map
})
const days = computed(() => {
  const total = new Date(year.value, month.value + 1, 0).getDate()
  return Array.from({ length: total }, (_, i) => {
    const key = toDateKey(new Date(year.value, month.value, i + 1))
    const list = byDay.value[key] || []
    const done = list.filter((t) => t.completed).length
    let status = 'none'
    if (list.length) status = done === list.length ? 'done' : key > todayStr ? 'upcoming' : 'pending'
    return { day: i + 1, key, total: list.length, done, status }
  })
})
const dayTasks = computed(() => byDay.value[selected.value] || [])
const doneCount = computed(() => dayTasks.value.filter((t) => t.completed).length)

const reload = () => { const r = monthRange(year.value, month.value); return load(r.from, r.to) }
watch([year, month], reload)
onMounted(reload)

function changeMonth(delta) {
  const d = new Date(year.value, month.value + delta, 1)
  year.value = d.getFullYear(); month.value = d.getMonth()
  selected.value = toDateKey(d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() ? now : d)
}
function goToday() { year.value = now.getFullYear(); month.value = now.getMonth(); selected.value = todayStr }
async function onAdd(payload, done) { done(await add({ ...payload, date: selected.value })) }
</script>

<style scoped>
.nav { margin-bottom: 8px; }
.weekdays, .grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
.weekdays { text-align: center; font-weight: 800; font-size: .8rem; color: var(--ink-soft); margin-bottom: 6px; }
.day { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; aspect-ratio: 1; min-height: 46px; padding: 2px; border: 2px solid var(--line); border-radius: 14px; background: var(--surface); cursor: pointer; transition: transform .1s; }
.day:hover { transform: translateY(-2px); }
.num { font-family: var(--font-display); font-weight: 600; font-size: 1.02rem; }
.dots { display: flex; gap: 3px; }
.dots i { width: 6px; height: 6px; border-radius: 50%; background: var(--line); }
.dots i.on { background: var(--tako-500); }
.day.done { background: var(--tako-50); border-color: var(--tako-300); }
.day.pending { background: var(--coral-soft); border-color: color-mix(in srgb, var(--coral) 45%, var(--line)); }
.day.pending .dots i.on { background: var(--tako-500); }
.day.upcoming { background: color-mix(in srgb, var(--sky) 10%, var(--surface)); border-color: color-mix(in srgb, var(--sky) 40%, var(--line)); }
.day.today .num { background: var(--tako-500); color: #fff; border-radius: 99px; padding: 0 9px; }
.day.selected { border-color: var(--ink); box-shadow: 0 3px 0 var(--ink); }
.legend { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 12px; }
.lg { width: 12px; height: 12px; border-radius: 4px; display: inline-block; margin-left: 8px; border: 2px solid; }
.lg.done { background: var(--tako-50); border-color: var(--tako-300); }
.lg.pending { background: var(--coral-soft); border-color: var(--coral); }
.lg.upcoming { background: color-mix(in srgb, var(--sky) 20%, var(--surface)); border-color: var(--sky); }
.cap { text-transform: capitalize; margin-bottom: 4px; }
.count { margin-bottom: 12px; }
</style>
