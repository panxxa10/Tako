<template>
  <div v-if="me" class="page">
    <h1>Ajustes</h1>

    <section class="card stack">
      <h2>Meta diaria</h2>
      <p class="muted small">¿Cuántas tareas quieres completar cada día? Al cumplirla ganas un bono de XP y monedas.</p>
      <div class="row-wrap">
        <button v-for="n in [1, 2, 3, 4, 5, 7]" :key="n" class="pill-btn" :class="{ active: me.user.dailyGoal === n }" :aria-pressed="me.user.dailyGoal === n" @click="update({ dailyGoal: n })">{{ n }} {{ n === 1 ? 'tarea' : 'tareas' }}</button>
      </div>
    </section>

    <section class="card stack">
      <h2>Apariencia</h2>
      <div class="row-wrap">
        <button v-for="t in THEMES" :key="t.id" class="pill-btn" :class="{ active: me.user.theme === t.id }" :aria-pressed="me.user.theme === t.id" @click="update({ theme: t.id })">{{ t.icon }} {{ t.label }}</button>
      </div>
    </section>

    <section class="card stack">
      <h2>Cambiar contraseña</h2>
      <form class="stack" @submit.prevent="changePassword">
        <label class="field">Contraseña actual<input v-model="pw.current" class="input" type="password" autocomplete="current-password" required /></label>
        <label class="field">Nueva contraseña<input v-model="pw.next" class="input" type="password" minlength="8" autocomplete="new-password" placeholder="Mínimo 8 caracteres" required /></label>
        <div class="row"><button class="btn btn-secondary" type="submit">Actualizar</button><span v-if="pwMsg" :class="pwOk ? 'ok-text' : 'form-error'" role="status">{{ pwMsg }}</span></div>
      </form>
    </section>

    <section class="card stack">
      <h2>Sesión</h2>
      <button class="btn btn-secondary" @click="logout">Cerrar sesión</button>
    </section>

    <section class="card stack danger">
      <h2>Eliminar mi cuenta</h2>
      <p class="muted small">Se borrarán para siempre tus tareas, logros, monedas y a tu Tako. Esta acción no se puede deshacer.</p>
      <form v-if="confirming" class="stack" @submit.prevent="deleteAccount">
        <label class="field">Escribe tu contraseña para confirmar<input v-model="delPw" class="input" type="password" autocomplete="current-password" required /></label>
        <div class="row"><button class="btn btn-danger" type="submit">Sí, eliminar todo</button><button class="btn btn-ghost" type="button" @click="confirming = false">Cancelar</button></div>
        <p v-if="delErr" class="form-error" role="alert">{{ delErr }}</p>
      </form>
      <button v-else class="btn btn-secondary" @click="confirming = true">Eliminar mi cuenta…</button>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import api, { errorMessage } from '../api'
import { state, setMe, clearSession } from '../store'

const router = useRouter()
const me = computed(() => state.me)
const THEMES = [{ id: 'auto', icon: '🌗', label: 'Automático' }, { id: 'light', icon: '☀️', label: 'Claro' }, { id: 'dark', icon: '🌙', label: 'Oscuro' }]
const pw = reactive({ current: '', next: '' })
const pwMsg = ref('')
const pwOk = ref(true)
const confirming = ref(false)
const delPw = ref('')
const delErr = ref('')

async function update(patch) {
  try { const { data } = await api.patch('/api/me', patch); setMe(data) } catch { /* sin cambios */ }
}
async function changePassword() {
  pwMsg.value = ''
  try {
    await api.post('/api/auth/password', { currentPassword: pw.current, newPassword: pw.next })
    pwMsg.value = 'Contraseña actualizada'; pwOk.value = true; pw.current = ''; pw.next = ''
  } catch (e) { pwMsg.value = errorMessage(e); pwOk.value = false }
}
function logout() { clearSession(); router.push('/entrar') }
async function deleteAccount() {
  delErr.value = ''
  try {
    await api.delete('/api/auth/me', { data: { password: delPw.value } })
    clearSession(); router.push('/registro')
  } catch (e) { delErr.value = errorMessage(e) }
}
</script>

<style scoped>
.danger { border-color: color-mix(in srgb, var(--coral) 40%, var(--line)); }
</style>
