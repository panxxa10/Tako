<template>
  <div v-if="me" class="page">
    <section class="card hero">
      <PetScene :pet="{ mood: 'happy', shell: me.pet.shell, hat: me.pet.hat, glasses: me.pet.glasses, neck: me.pet.neck, name: me.pet.name }" :scene="me.pet.scene" :pet-size="200" ratio="16 / 10" />
      <div class="row names">
        <template v-if="editingName">
          <input v-model="petName" class="input" maxlength="20" aria-label="Nombre de tu mascota" @keyup.enter="savePetName" @keyup.esc="editingName = false" />
          <button class="btn btn-primary btn-sm" @click="savePetName">Guardar</button>
        </template>
        <template v-else>
          <h1>{{ me.pet.name }}</h1>
          <button class="icon-btn" aria-label="Cambiar nombre de tu mascota" @click="startName"><Icon name="edit" :size="20" /></button>
          <div class="spacer"></div>
          <router-link to="/tienda" class="btn btn-secondary btn-sm">Vestir</router-link>
        </template>
      </div>
    </section>

    <section class="card stack">
      <div class="row"><div class="lvl"><strong>{{ p.level }}</strong></div>
        <div class="spacer"><h2>{{ p.title }}</h2><p class="muted small">Nivel {{ p.level }} · {{ p.xpInLevel }}/{{ p.xpForNext }} XP para el siguiente</p></div></div>
      <div class="bar"><div :style="{ width: (p.xpInLevel / p.xpForNext) * 100 + '%' }"></div></div>
      <div class="stats">
        <div><strong>{{ p.streak }}</strong><span>días de racha</span></div>
        <div><strong>{{ p.totalCompleted }}</strong><span>tareas</span></div>
        <div><strong>{{ unlocked.length }}</strong><span>logros</span></div>
        <div><strong>{{ p.coins }}</strong><span>monedas</span></div>
      </div>
    </section>

    <section class="card stack">
      <div class="row"><h2 class="spacer">Mis recompensas</h2><router-link to="/progreso" class="small">Ver todas</router-link></div>
      <div v-if="unlocked.length" class="shelf">
        <div v-for="a in unlocked" :key="a.id" class="trophy" :title="a.desc">
          <Badge :icon="a.icon" :tier="a.tier" :size="64" :label="a.name" />
          <strong>{{ a.name }}</strong>
          <span class="small muted">{{ formatShort(a.unlockedAt.slice(0, 10)) }}</span>
        </div>
      </div>
      <p v-else class="muted">Aquí guardaré todos tus logros. ¡Completa tu primera tarea para estrenar la repisa!</p>
    </section>

    <section class="card">
      <h2>Mi cuenta</h2>
      <form class="stack form" @submit.prevent="save">
        <label class="field">Nombre de usuario<input v-model="form.username" class="input" minlength="3" maxlength="30" required /></label>
        <label class="field">Ocupación<input v-model="form.occupation" class="input" maxlength="60" placeholder="Estudiante, diseñadora, ingeniero…" /></label>
        <p class="muted small">Correo: {{ me.user.email }} · Miembro desde {{ since }}</p>
        <div class="row"><button class="btn btn-primary" type="submit" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar cambios' }}</button>
          <span v-if="msg" :class="msgOk ? 'ok-text' : 'form-error'" role="status">{{ msg }}</span></div>
      </form>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api, { errorMessage } from '../api'
import PetScene from '../components/PetScene.vue'
import Badge from '../components/Badge.vue'
import Icon from '../components/Icon.vue'
import { state, setMe, celebrate } from '../store'
import { formatShort } from '../utils/date'

const me = computed(() => state.me)
const p = computed(() => me.value.progress)
const achievements = ref([])
const unlocked = computed(() => achievements.value.filter((a) => a.unlocked).sort((a, b) => b.unlockedAt.localeCompare(a.unlockedAt)))
const form = reactive({ username: '', occupation: '' })
const saving = ref(false)
const msg = ref('')
const msgOk = ref(true)
const editingName = ref(false)
const petName = ref('')
const since = computed(() => new Date(me.value.user.createdAt).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }))

function startName() { petName.value = me.value.pet.name; editingName.value = true }
async function savePetName() {
  try { const { data } = await api.put('/api/me/pet', { name: petName.value }); celebrate(data); editingName.value = false } catch (e) { msg.value = errorMessage(e); msgOk.value = false }
}
async function save() {
  saving.value = true; msg.value = ''
  try {
    const { data } = await api.patch('/api/me', { username: form.username, occupation: form.occupation })
    setMe(data); msg.value = 'Perfil actualizado'; msgOk.value = true
  } catch (e) { msg.value = errorMessage(e); msgOk.value = false } finally { saving.value = false }
}

onMounted(async () => {
  Object.assign(form, { username: me.value.user.username, occupation: me.value.user.occupation })
  try { achievements.value = (await api.get('/api/me/achievements')).data } catch { /* secundario */ }
})
</script>

<style scoped>
.hero { padding: 12px; display: flex; flex-direction: column; gap: 10px; }
.names { padding: 0 6px 4px; }
.lvl { width: 58px; height: 58px; display: grid; place-items: center; border-radius: 18px; background: var(--lilac); color: #fff; font-family: var(--font-display); font-size: 1.7rem; box-shadow: 0 4px 0 #6E5CD8; }
.bar { height: 14px; border-radius: 99px; background: var(--surface-2); overflow: hidden; }
.bar > div { height: 100%; background: linear-gradient(90deg, var(--lilac), #B7A9FF); border-radius: 99px; }
.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; text-align: center; }
.stats strong { display: block; font-family: var(--font-display); font-size: 1.5rem; }
.stats span { font-size: .78rem; color: var(--ink-soft); font-weight: 800; }
.shelf { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 12px; padding: 14px; border-radius: var(--radius-sm); background: var(--surface-2); }
.trophy { display: flex; flex-direction: column; align-items: center; gap: 2px; text-align: center; font-size: .85rem; }
.form { margin-top: 12px; }
</style>
