<template>
  <section class="tasks" :aria-label="title">
    <form class="add" @submit.prevent="submit">
      <div class="add-row">
        <input v-model="form.title" class="input" type="text" :placeholder="placeholder" maxlength="200" required aria-label="Nueva tarea" />
        <button class="btn btn-primary" type="submit" :disabled="saving" aria-label="Agregar tarea"><Icon name="plus" :size="22" /><span class="hide-sm">Agregar</span></button>
      </div>
      <div class="cat-row" role="group" aria-label="Categoría">
        <button v-for="c in CATEGORIES" :key="c.id" type="button" class="pill-btn" :aria-pressed="form.category === c.id" @click="form.category = c.id">
          <span aria-hidden="true">{{ c.emoji }}</span>{{ c.name }}
        </button>
      </div>
      <div class="row-wrap opts">
        <label class="small muted row"><Icon name="repeat" :size="18" />
          <select v-model="form.repeat" class="select select-sm" aria-label="Repetir">
            <option value="none">No se repite</option><option value="daily">Todos los días (4 semanas)</option>
            <option value="weekdays">Lunes a viernes (4 semanas)</option><option value="weekly">Cada semana (8 semanas)</option>
          </select>
        </label>
      </div>
    </form>

    <p v-if="error" class="form-error" role="alert">{{ error }}</p>
    <p v-if="loading && !tasks.length" class="muted center">Cargando tareas…</p>
    <div v-else-if="!tasks.length" class="empty">
      <PetAvatar mood="thinking" :size="110" />
      <p class="muted">{{ emptyText }}</p>
    </div>

    <ul v-else class="list">
      <li v-for="t in tasks" :key="t.id" class="item" :class="{ done: t.completed }">
        <button class="check" :class="{ on: t.completed }" :aria-pressed="t.completed" :aria-label="`${t.completed ? 'Desmarcar' : 'Completar'}: ${t.title}`" @click="$emit('toggle', t)">
          <Icon v-if="t.completed" name="check" :size="22" />
        </button>

        <div class="body">
          <input v-if="editingId === t.id" ref="editInput" v-model="editTitle" class="input edit" maxlength="200" aria-label="Editar tarea"
                 @keyup.enter="saveEdit(t)" @keyup.esc="editingId = null" @blur="saveEdit(t)" />
          <span v-else class="title" @dblclick="startEdit(t)">{{ t.title }}</span>
          <span class="meta small muted">
            <span aria-hidden="true">{{ categoryOf(t.category).emoji }}</span> {{ categoryOf(t.category).name }}
            <template v-if="t.seriesId"> · <Icon name="repeat" :size="14" /> se repite</template>
          </span>
        </div>

        <button v-if="editingId !== t.id" class="icon-btn" :aria-label="`Editar ${t.title}`" @click="startEdit(t)"><Icon name="edit" :size="20" /></button>
        <button class="icon-btn" :aria-label="`Eliminar ${t.title}`" @click="askDelete(t)"><Icon name="trash" :size="20" /></button>
      </li>
    </ul>

    <div v-if="toDelete" class="modal-bg" @click.self="toDelete = null">
      <div class="modal card pop-in" role="dialog" aria-modal="true" aria-labelledby="del-title">
        <h3 id="del-title">¿Eliminar «{{ toDelete.title }}»?</h3>
        <p class="muted">Si ya la completaste, tu experiencia y tu racha se conservan.</p>
        <div class="stack">
          <button class="btn btn-danger" @click="confirmDelete(false)">Eliminar solo esta</button>
          <button v-if="toDelete.seriesId" class="btn btn-secondary" @click="confirmDelete(true)">Eliminar esta y las siguientes</button>
          <button class="btn btn-ghost" @click="toDelete = null">Cancelar</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref, nextTick } from 'vue'
import Icon from './Icon.vue'
import PetAvatar from './PetAvatar.vue'
import { CATEGORIES, categoryOf } from '../utils/constants'

const props = defineProps({
  tasks: { type: Array, default: () => [] },
  loading: Boolean,
  error: String,
  title: { type: String, default: 'Tareas' },
  placeholder: { type: String, default: '¿Qué quieres lograr?' },
  emptyText: { type: String, default: 'Aún no hay tareas. ¡Agrega la primera!' },
})
const emit = defineEmits(['add', 'toggle', 'edit', 'remove'])

const form = reactive({ title: '', category: 'personal', repeat: 'none' })
const saving = ref(false)
const editingId = ref(null)
const editTitle = ref('')
const editInput = ref(null)
const toDelete = ref(null)

async function submit() {
  const title = form.title.trim()
  if (!title) return
  saving.value = true
  const ok = await new Promise((resolve) => emit('add', { title, category: form.category, repeat: form.repeat }, resolve))
  saving.value = false
  if (ok) { form.title = ''; form.repeat = 'none' }
}

async function startEdit(t) {
  editingId.value = t.id
  editTitle.value = t.title
  await nextTick()
  const el = Array.isArray(editInput.value) ? editInput.value[0] : editInput.value
  el?.focus()
}
function saveEdit(t) {
  if (editingId.value !== t.id) return
  const title = editTitle.value.trim()
  editingId.value = null
  if (title && title !== t.title) emit('edit', t, { title })
}
function askDelete(t) { toDelete.value = t }
function confirmDelete(series) { emit('remove', toDelete.value, series); toDelete.value = null }
</script>

<style scoped>
.tasks { display: flex; flex-direction: column; gap: 14px; }
.add { display: flex; flex-direction: column; gap: 10px; }
.add-row { display: flex; gap: 10px; }
.cat-row { display: flex; gap: 8px; overflow-x: auto; padding: 2px 2px 6px; scrollbar-width: thin; }
.cat-row .pill-btn { flex-shrink: 0; min-height: 38px; font-size: .9rem; }
.select-sm { min-height: 38px; padding: 4px 10px; width: auto; font-size: .9rem; }
.hide-sm { display: inline; }
@media (max-width: 520px) { .hide-sm { display: none; } .add-row .btn { padding: 10px 14px; } }

.list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.item { display: flex; align-items: center; gap: 12px; padding: 10px 8px 10px 14px; background: var(--surface); border: 2px solid var(--line); border-radius: var(--radius-sm); }
.item.done { background: var(--tako-50); border-color: var(--tako-100); }
.item.done .title { text-decoration: line-through; color: var(--ink-soft); }
.check { width: 36px; height: 36px; flex-shrink: 0; display: grid; place-items: center; border-radius: 50%; border: 3px solid var(--line); background: var(--surface); color: #fff; cursor: pointer; transition: all .15s; }
.check:hover { border-color: var(--tako-500); }
.check.on { background: var(--tako-500); border-color: var(--tako-600); box-shadow: 0 3px 0 var(--tako-700); }
.body { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.title { font-weight: 700; word-break: break-word; }
.meta { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.edit { min-height: 40px; padding: 4px 10px; }
.empty { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 0 4px; text-align: center; }

.modal-bg { position: fixed; inset: 0; background: rgba(20, 30, 26, .5); display: grid; place-items: center; padding: 20px; z-index: 2000; }
.modal { width: min(420px, 100%); display: flex; flex-direction: column; gap: 14px; }
</style>
