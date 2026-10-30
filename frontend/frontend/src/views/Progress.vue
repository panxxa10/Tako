<template>
  <div class="page">
    <h1>Mi progreso</h1>

    <section v-if="me" class="tiles">
      <div class="tile"><Icon name="flame" :size="30" filled class="c-flame" /><strong>{{ me.progress.streak }}</strong><span>Racha actual</span></div>
      <div class="tile"><Icon name="star" :size="30" filled class="c-sun" /><strong>{{ me.progress.bestStreak }}</strong><span>Mejor racha</span></div>
      <div class="tile"><Icon name="check" :size="30" class="c-green" /><strong>{{ me.progress.totalCompleted }}</strong><span>Tareas completadas</span></div>
      <div class="tile"><Icon name="shield" :size="30" filled class="c-sky" /><strong>{{ me.progress.freezes }}/{{ me.progress.freezeMax }}</strong><span>Escudos</span></div>
    </section>

    <section class="card advice">
      <div class="row head">
        <PetAvatar v-if="me" :mood="summary?.mood || 'happy'" :shell="me.pet.shell" :hat="me.pet.hat" :glasses="me.pet.glasses" :neck="me.pet.neck" :size="86" />
        <div><h2>Consejos de {{ me?.pet.name || 'Tako' }}</h2><p class="muted small">Basados en cómo te ha ido las últimas semanas</p></div>
      </div>
      <p v-if="loading" class="muted">Pensando…</p>
      <ul v-else class="tips">
        <li v-for="i in items" :key="i.id" class="tipc" :class="`k-${i.kind}`">
          <span class="ic" aria-hidden="true">{{ i.icon }}</span>
          <div class="spacer"><span class="kind">{{ KINDS[i.kind] }}</span><strong>{{ i.title }}</strong><p class="small">{{ i.body }}</p></div>
        </li>
      </ul>
    </section>

    <section class="card">
      <div class="row"><h2 class="spacer">Esta semana</h2>
        <span v-if="summary" class="chip">{{ summary.weekDone }}/{{ summary.weekPlanned }} · {{ summary.weekRate }}%</span></div>
      <svg class="chart" viewBox="0 0 320 170" role="img" :aria-label="`Tareas completadas por día: ${week.map((d) => `${d.label} ${d.done}`).join(', ')}`">
        <g v-for="(d, i) in week" :key="d.date">
          <rect :x="i * 45 + 8" :y="150 - barH(d.planned)" width="30" :height="barH(d.planned)" rx="9" fill="var(--surface-2)" />
          <rect :x="i * 45 + 8" :y="150 - barH(d.done)" width="30" :height="barH(d.done)" rx="9" :fill="d.date === today ? 'var(--tako-500)' : 'var(--tako-300)'" />
          <text :x="i * 45 + 23" :y="150 - barH(Math.max(d.done, d.planned)) - 6" text-anchor="middle" class="val">{{ d.done || '' }}</text>
          <text :x="i * 45 + 23" y="166" text-anchor="middle" class="lab" :class="{ now: d.date === today }">{{ d.label }}</text>
        </g>
      </svg>
      <p class="muted small">Verde: tareas que completaste. Gris: tareas que tenías planeadas.</p>
    </section>

    <section class="card">
      <h2>Últimas 4 semanas</h2>
      <div class="heat" role="img" aria-label="Mapa de actividad de los últimos 28 días">
        <span v-for="d in days" :key="d.date" class="cell" :class="'l' + level(d.done)" :title="`${d.date}: ${d.done} completadas`"></span>
      </div>
      <p class="muted small legend">Menos <i class="cell l0"></i><i class="cell l1"></i><i class="cell l2"></i><i class="cell l3"></i> Más</p>
    </section>

    <section class="card">
      <div class="row"><h2 class="spacer">Logros</h2><span class="chip">{{ unlocked }}/{{ achievements.length }}</span></div>
      <div class="ach-grid">
        <div v-for="a in achievements" :key="a.id" class="ach" :class="{ locked: !a.unlocked }">
          <Badge :icon="a.icon" :tier="a.tier" :locked="!a.unlocked" :size="68" :label="a.name" />
          <strong>{{ a.name }}</strong>
          <span class="small muted">{{ a.desc }}</span>
          <div v-if="!a.unlocked" class="mini" :aria-label="`${a.current} de ${a.target}`"><div :style="{ width: (a.current / a.target) * 100 + '%' }"></div></div>
          <span v-if="!a.unlocked" class="small muted">{{ a.current }}/{{ a.target }}</span>
          <span v-else class="small ok-text">+{{ a.coins }} 🪙 ganadas</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'
import PetAvatar from '../components/PetAvatar.vue'
import Badge from '../components/Badge.vue'
import Icon from '../components/Icon.vue'
import { state } from '../store'
import { todayKey, weekdayShort } from '../utils/date'

const KINDS = { praise: '¡Bien hecho!', improve: 'A mejorar', tip: 'Consejo', alert: 'Atención' }
const me = computed(() => state.me)
const today = todayKey()
const loading = ref(true)
const items = ref([])
const summary = ref(null)
const days = ref([])
const achievements = ref([])

const week = computed(() => days.value.slice(-7).map((d) => ({ ...d, label: weekdayShort(d.date) })))
const maxBar = computed(() => Math.max(4, ...week.value.map((d) => Math.max(d.done, d.planned))))
const barH = (n) => (n ? Math.max(10, (n / maxBar.value) * 120) : 0)
const level = (n) => (n === 0 ? 0 : n <= 1 ? 1 : n <= 3 ? 2 : 3)
const unlocked = computed(() => achievements.value.filter((a) => a.unlocked).length)

onMounted(async () => {
  const [ins, ach] = await Promise.allSettled([api.get('/api/insights'), api.get('/api/me/achievements')])
  if (ins.status === 'fulfilled') { items.value = ins.value.data.items; summary.value = ins.value.data.summary; days.value = ins.value.data.days }
  if (ach.status === 'fulfilled') achievements.value = ach.value.data
  loading.value = false
})
</script>

<style scoped>
.tiles { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
@media (min-width: 620px) { .tiles { grid-template-columns: repeat(4, 1fr); } }
.tile { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 14px 8px; background: var(--surface); border: 2px solid var(--line); border-radius: var(--radius); box-shadow: var(--shadow); text-align: center; }
.tile strong { font-family: var(--font-display); font-size: 1.8rem; line-height: 1.1; }
.tile span { font-size: .82rem; color: var(--ink-soft); font-weight: 800; }
.c-flame { color: var(--flame); } .c-sun { color: var(--sun); } .c-green { color: var(--tako-500); } .c-sky { color: var(--sky); }

.head { margin-bottom: 8px; }
.tips { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.tipc { display: flex; gap: 12px; padding: 12px 14px; border-radius: var(--radius-sm); border: 2px solid var(--line); }
.tipc .ic { font-size: 1.8rem; line-height: 1.2; }
.tipc .kind { display: block; font-size: .72rem; font-weight: 900; text-transform: uppercase; letter-spacing: .6px; color: var(--ink-soft); }
.tipc.k-praise { background: var(--tako-50); border-color: var(--tako-100); }
.tipc.k-improve { background: color-mix(in srgb, var(--sun) 12%, var(--surface)); border-color: color-mix(in srgb, var(--sun) 45%, var(--line)); }
.tipc.k-alert { background: var(--coral-soft); border-color: color-mix(in srgb, var(--coral) 40%, var(--line)); }
.tipc.k-tip { background: color-mix(in srgb, var(--sky) 9%, var(--surface)); border-color: color-mix(in srgb, var(--sky) 35%, var(--line)); }

.chart { width: 100%; height: auto; margin: 8px 0 4px; }
.chart .val { font: 700 12px var(--font-display); fill: var(--ink); }
.chart .lab { font: 700 11px var(--font-body); fill: var(--ink-soft); }
.chart .lab.now { fill: var(--tako-600); }

.heat { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin: 12px 0 8px; }
.cell { aspect-ratio: 1; border-radius: 8px; background: var(--surface-2); display: block; }
.cell.l1 { background: var(--tako-100); } .cell.l2 { background: var(--tako-300); } .cell.l3 { background: var(--tako-500); }
.legend { display: flex; align-items: center; gap: 4px; }
.legend .cell { width: 16px; height: 16px; aspect-ratio: auto; border-radius: 5px; display: inline-block; }

.ach-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; margin-top: 14px; }
.ach { display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center; padding: 14px 8px; border-radius: var(--radius-sm); background: var(--surface-2); }
.ach.locked strong { color: var(--ink-soft); }
.mini { width: 80%; height: 8px; background: var(--line); border-radius: 99px; overflow: hidden; }
.mini > div { height: 100%; background: var(--tako-500); border-radius: 99px; }
</style>
