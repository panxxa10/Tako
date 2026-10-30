import { ref } from 'vue'
import api, { errorMessage } from '../api'
import { celebrate } from '../store'

/** Carga y modifica las tareas de un rango de fechas (un día en "Hoy", un mes en "Calendario"). */
export function useDayTasks() {
  const tasks = ref([])
  const loading = ref(false)
  const error = ref('')
  let range = null
  let lastRequest = 0

  async function load(from, to) {
    if (from) range = { from, to }
    const id = ++lastRequest
    loading.value = true
    error.value = ''
    try {
      const { data } = await api.get('/api/tasks', { params: range })
      if (id === lastRequest) tasks.value = data   // ignora respuestas viejas si se cambió de mes rápido
    } catch (e) {
      if (id === lastRequest) error.value = errorMessage(e, 'No se pudieron cargar las tareas.')
    } finally {
      if (id === lastRequest) loading.value = false
    }
  }

  const replace = (task) => {
    const i = tasks.value.findIndex((t) => t.id === task.id)
    if (i !== -1) tasks.value[i] = task
  }

  async function add(payload) {
    error.value = ''
    try {
      const { data } = await api.post('/api/tasks', payload)
      if (data.created > 1) await load()
      else tasks.value.push(data.task)
      return true
    } catch (e) {
      error.value = errorMessage(e, 'No se pudo crear la tarea.')
      return false
    }
  }

  async function toggle(task) {
    error.value = ''
    try {
      const { data } = await api.post(`/api/tasks/${task.id}/toggle`)
      replace(data.task)
      celebrate(data)
    } catch (e) {
      error.value = errorMessage(e, 'No se pudo actualizar la tarea.')
      await load()
    }
  }

  async function edit(task, patch) {
    error.value = ''
    try {
      const { data } = await api.patch(`/api/tasks/${task.id}`, patch)
      replace(data)
    } catch (e) {
      error.value = errorMessage(e, 'No se pudo editar la tarea.')
    }
  }

  async function remove(task, series = false) {
    error.value = ''
    try {
      await api.delete(`/api/tasks/${task.id}`, { params: series ? { series: 1 } : {} })
      if (series) await load()
      else tasks.value = tasks.value.filter((t) => t.id !== task.id)
    } catch (e) {
      error.value = errorMessage(e, 'No se pudo eliminar la tarea.')
    }
  }

  return { tasks, loading, error, load, add, toggle, edit, remove }
}
