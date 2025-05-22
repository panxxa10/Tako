<template>
  <div class="calendar-container">
    <div class="tako-banner">
      <img src="../assets/logo/Tako-logo.png" alt="Tako" class="tako-image" />
      <p class="tako-text">¡Hola! Soy Tako, tu compañero de tareas 🐢</p>
    </div>

    <!-- Notificación de sticker desbloqueado -->
    <StickerNotification :stickerName="newStickerName" />

    <div class="calendar-header">
      <button @click="prevMonth" class="nav-btn">←</button>
      <h2>{{ months[currentMonth] }} {{ currentYear }}</h2>
      <button @click="nextMonth" class="nav-btn">→</button>
    </div>

    <div class="calendar-grid">
      <div
        class="day"
        v-for="day in daysInMonth"
        :key="day.date"
        :class="{
          'today': isToday(day.date),
          'completed': day.completedAll,
          'pending': day.hasTasks && !day.completedAll,
          'selected': day.date && selectedDate && day.date.toDateString() === selectedDate.toDateString()
        }"
        @click="selectDate(day.date)"
      >
        {{ day.day }}
      </div>
    </div>

    <TakoAssistant :mood="takoMood" :message="takoMessage" />

    <div class="task-list">
      <h3>Tareas para {{ formatSelectedDate }}</h3>
      <form @submit.prevent="createTask" class="task-form">
        <input v-model="newTask" type="text" placeholder="Nueva tarea..." required />
        <button type="submit">Agregar</button>
      </form>

      <ul>
        <li v-for="task in tasks" :key="task._id" class="task-item">
          <input type="checkbox" :checked="task.completed" @change="toggleComplete(task)" />
          <span :class="{ done: task.completed }">{{ task.title }}</span>
          <button @click="deleteTask(task._id)" class="delete-btn">🗑️</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import TakoAssistant from "../components/TakoAssistant.vue"
import StickerNotification from '../components/StickerNotification.vue'
import { ref, computed, watch, onMounted } from 'vue'
import axios from 'axios'
import api from '../api';

const takoMood = ref('default')
const takoMessage = ref('¡Hola! ¿Listo para tus tareas?')

const profile = ref(null)

const today = new Date()
const selectedDate = ref(new Date())
const tasks = ref([])
const newTask = ref('')

const currentMonth = ref(selectedDate.value.getMonth())
const currentYear = ref(selectedDate.value.getFullYear())

const newStickerName = ref('')

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

const daysInMonth = ref([])

function generateDaysInMonth(year, month) {
  const days = []
  const totalDays = new Date(year, month + 1, 0).getDate()
  for (let i = 1; i <= totalDays; i++) {
    const date = new Date(year, month, i)
    days.push({
      day: i,
      date,
      hasTasks: false,
      completedAll: false,
    })
  }
  return days
}

const formatSelectedDate = computed(() => selectedDate.value.toISOString().split('T')[0])

const fetchTasks = async () => {
  const token = localStorage.getItem('token')
  if (!token) return

  try {
    const { data } = await api.get(`/api/tasks/${formatSelectedDate.value}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    tasks.value = data
    updateCalendarStatus()
  } catch (err) {
    console.error('Error cargando tareas:', err)
  }
}

const createTask = async () => {
  const token = localStorage.getItem('token')
  if (!token) return

  try {
    await api.post('/api/tasks', {
      title: newTask.value,
      description: '',
      date: formatSelectedDate.value
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    newTask.value = ''
    fetchTasks()
  } catch (err) {
    console.error('Error creando tarea:', err)
  }
}

const toggleComplete = async (task) => {
  const token = localStorage.getItem('token')
  if (!token) return

  try {
    await api.patch(`/api/tasks/${task._id}/complete`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })

    await fetchTasks()

    // Verificar nuevo sticker desbloqueado
    const res = await api.get('/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })

    const updated = res.data
    const oldNames = (profile.value?.stickers || []).map(s => s.name)
    const newUnlocked = updated.stickers?.find(s => !oldNames.includes(s.name))

    if (newUnlocked) {
      newStickerName.value = newUnlocked.name
      profile.value = updated

      setTimeout(() => {
        newStickerName.value = ''
      }, 4000)
    }
  } catch (err) {
    console.error('Error completando tarea:', err)
  }
}

const deleteTask = async (id) => {
  const token = localStorage.getItem('token')
  if (!token) return

  try {
    await api.delete(`/api/tasks/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchTasks()
  } catch (err) {
    console.error('Error eliminando tarea:', err)
  }
}

const selectDate = (date) => {
  selectedDate.value = new Date(date)
  fetchTasks()
}

const isToday = (date) => {
  const today = new Date()
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear()
}

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

// Watch para regenerar días y tareas cuando cambian mes o año
watch([currentMonth, currentYear], () => {
  daysInMonth.value = generateDaysInMonth(currentYear.value, currentMonth.value)
  fetchTasks()
})

// Actualiza el estado visual de los días según tareas
const updateCalendarStatus = () => {
  const taskMap = tasks.value.reduce((map, task) => {
    const dateStr = new Date(task.date).toISOString().split('T')[0]
    if (!map[dateStr]) map[dateStr] = []
    map[dateStr].push(task)
    return map
  }, {})

  daysInMonth.value.forEach(day => {
    const dayStr = day.date.toISOString().split('T')[0]
    const dayTasks = taskMap[dayStr] || []
    day.hasTasks = dayTasks.length > 0
    day.completedAll = dayTasks.length > 0 && dayTasks.every(task => task.completed)
  })
}

// Inicialización
onMounted(() => {
  daysInMonth.value = generateDaysInMonth(currentYear.value, currentMonth.value)
  fetchTasks()
})

// Cambiar el ánimo y mensaje de Tako según tareas completadas
watch(tasks, () => {
  const completedCount = tasks.value.filter(t => t.completed).length
  const total = tasks.value.length

  if (total === 0) {
    takoMood.value = 'thinking'
    takoMessage.value = 'No tienes tareas para hoy... ¿quieres agregar una?'
  } else if (completedCount === total) {
    takoMood.value = 'celebrate'
    takoMessage.value = '¡Muy bien! Completaste todas tus tareas 🥳'
  } else if (completedCount > 0) {
    takoMood.value = 'smile'
    takoMessage.value = '¡Buen trabajo! Sigue así 💪'
  } else {
    takoMood.value = 'stud'
    takoMessage.value = '¡Hora de concentrarse! 🐢'
  }
})
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');

.calendar-container {
  font-family: 'Poppins', sans-serif;
  background-color: #f5f7fa;
  margin: 20px auto;
  max-width: 800px;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calendar-header h2 {
  font-weight: 600;
  color: #333;
}

.nav-btn {
  background-color: #81c784;
  border: none;
  color: white;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
}

.nav-btn:hover {
  background-color: #4caf50;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.day {
  background: white;
  padding: 15px;
  text-align: center;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.day.today {
  background: #ffeaa7;
}

.day.completed {
  background: #81ecec;
}

.day.pending {
  background: #fab1a0;
}

.day.selected {
  outline: 2px solid #4caf50;
  /* No cubre el fondo */
}

.task-list {
  margin-top: 30px;
}

.task-form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.task-form input {
  flex: 1;
  padding: 10px;
  border: 1.8px solid #bbb;
  border-radius: 8px;
}

.task-form button {
  background-color: #4caf50;
  color: white;
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.task-form button:hover {
  background-color: #388e3c;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.task-item .delete-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

.done {
  text-decoration: line-through;
}

.tako-banner {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  background-color: #f0fdf4;
  padding: 12px 18px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.tako-image {
  width: 60px;
  height: auto;
}

.tako-text {
  font-size: 18px;
  font-weight: 500;
  color: #388e3c;
  font-family: 'Poppins', sans-serif;
}

.sticker-toast {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background-color: #ffffff;
  border: 2px solid #4caf50;
  padding: 16px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  z-index: 1000;
  animation: fadeInOut 4s ease forwards;
}

.sticker-toast-img {
  width: 48px;
  height: 48px;
}

.sticker-toast-text {
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  color: #388e3c;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; }
  100% { opacity: 0; transform: translateY(20px); }
}
</style>

