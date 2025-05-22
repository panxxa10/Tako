<template>
  <div class="profile-container">
    <div v-if="loading" class="loading">Cargando perfil...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div class="header">
        <h1>Perfil de {{ profile.username || 'Usuario' }}</h1>
      </div>

      <div class="profile-info">
        <label class="avatar-upload">
          <img
            :src="previewImage || getAvatarUrl(profile.avatar) || defaultAvatar"
            alt="Foto de perfil"
            class="avatar"
          />
          <input type="file" accept="image/*" @change="onFileChange" />
          <span class="upload-text">Cambiar foto</span>
        </label>

        <div class="info-text">
          <p><strong>Nombre de usuario:</strong> <input v-model="profile.username" /></p>
          <p><strong>Correo:</strong> <input v-model="profile.email" type="email" /></p>
          <p><strong>Ocupación:</strong> <input v-model="profile.occupation" placeholder="Escribe tu ocupación" /></p>
          <p><strong>Nivel:</strong> {{ profile.level }}</p>
          <p><strong>Experiencia:</strong> {{ profile.xp }} / {{ profile.maxXp }}</p>

          <div class="progress-bar-container">
            <div class="progress-bar" :style="{ width: levelProgress + '%' }"></div>
          </div>

          <div class="sticker-section">
            <h3>Recompensas desbloqueadas</h3>
            <div v-if="profile && profile.stickers">
              <img
                v-for="sticker in profile.stickers"
                :key="sticker.name"
                :src="getStickerUrl(sticker.img)"
                :alt="sticker.name"
                :title="sticker.name"
                class="sticker-img"
              />
            </div>
          </div>

          <p><strong>Racha actual:</strong> <span class="fire-emoji">🔥</span> {{ profile.streak }}</p>
          <p><strong>Tareas completadas:</strong> {{ profile.completed }}</p>
        </div>
      </div>

      <button class="save-btn" @click="saveProfile">Guardar cambios</button>
    </div>

    <StickerNotification :stickerName="lastUnlockedSticker" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'  // Importa tu cliente axios configurado con baseURL
import StickerNotification from '../components/StickerNotification.vue'

const lastUnlockedSticker = ref('')
const profile = ref(null)
const loading = ref(true)
const error = ref(null)
const defaultAvatar = '/default-avatar.png'

const previewImage = ref(null)

const getAvatarUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${import.meta.env.VITE_API_URL}${path}`  // Cambiado a variable de entorno
}

const getStickerUrl = (filename) => {
  return new URL(`../assets/achievements/${filename}`, import.meta.url).href
}

onMounted(async () => {
  try {
    const res = await api.get('/api/users/profile', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    profile.value = res.data
  } catch (e) {
    error.value = 'Error cargando perfil'
    console.error(e)
  } finally {
    loading.value = false
  }
})

function onFileChange(event) {
  const file = event.target.files[0]
  if (!file) return
  previewImage.value = URL.createObjectURL(file)
  profile.value.avatarFile = file
}

const levelProgress = computed(() => {
  if (!profile.value) return 0
  if (!profile.value.maxXp) return 0
  return Math.min((profile.value.xp / profile.value.maxXp) * 100, 100)
})

async function saveProfile() {
  try {
    const formData = new FormData()
    formData.append('username', profile.value.username)
    formData.append('email', profile.value.email)
    formData.append('occupation', profile.value.occupation)
    if (profile.value.avatarFile) {
      formData.append('avatar', profile.value.avatarFile)
    }

    await api.put('/api/users/profile', formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data',
      },
    })

    const res = await api.get('/api/users/profile', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })

    const antiguosStickers = profile.value?.stickers?.map(s => s.name) || []
    const nuevosStickers = res.data.stickers.map(s => s.name)
    const desbloqueados = nuevosStickers.filter(name => !antiguosStickers.includes(name))

    if (desbloqueados.length > 0) {
      lastUnlockedSticker.value = desbloqueados[0]
    }

    profile.value = res.data
    previewImage.value = null

    alert('Perfil actualizado con éxito')
  } catch (e) {
    console.error(e)
    alert('Error al guardar perfil')
  }
}
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');

.profile-container {
  max-width: 600px;
  margin: 20px auto;
  font-family: 'Poppins', sans-serif;
  background-color: #f5f7fa;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.header {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
}

.avatar-upload {
  position: relative;
  display: inline-block;
  cursor: pointer;
  margin-right: 25px;
}

.avatar-upload input[type="file"] {
  display: none;
}

.avatar-upload .upload-text {
  display: block;
  text-align: center;
  margin-top: 8px;
  color: #666;
  font-size: 14px;
}

.avatar {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #81c784;
  transition: box-shadow 0.3s ease;
}

.avatar-upload:hover .avatar {
  box-shadow: 0 0 10px #81c784;
}

.profile-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.info-text {
  flex: 1;
  min-width: 250px;
}

.info-text p {
  margin: 12px 0;
  font-weight: 500;
  color: #444;
}

.info-text input {
  width: 100%;
  padding: 7px 10px;
  margin-top: 5px;
  border-radius: 6px;
  border: 1.8px solid #bbb;
  font-size: 16px;
  font-family: 'Poppins', sans-serif;
  transition: border-color 0.3s ease;
}

.info-text input:focus {
  outline: none;
  border-color: #4caf50;
}

.progress-bar-container {
  background-color: #ddd;
  height: 16px;
  border-radius: 12px;
  overflow: hidden;
  margin: 20px 0;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #81c784);
  transition: width 0.5s ease;
  border-radius: 12px 0 0 12px;
}

.stats p {
  margin: 8px 0;
  font-size: 16px;
  color: #333;
}

.fire-emoji {
  font-size: 20px;
  margin-right: 6px;
}

.error {
  color: #e53935;
  text-align: center;
  font-weight: 600;
}

.loading {
  text-align: center;
  font-style: italic;
  color: #666;
}

.save-btn {
  margin-top: 15px;
  padding: 10px 18px;
  background-color: #4caf50;
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.save-btn:hover {
  background-color: #388e3c;
}

.sticker-section {
  margin-top: 20px;
}

.sticker-gallery {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.sticker-img {
  width: 60px;
  height: 60px;
}


</style>
