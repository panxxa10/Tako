<template>
  <div v-if="showShell" class="shell">
    <aside class="rail" aria-label="Menú principal">
      <router-link to="/hoy" class="rail-logo" aria-label="Tako, inicio"><Logo :size="44" /></router-link>
      <nav class="rail-nav">
        <router-link v-for="n in NAV" :key="n.to" :to="n.to" class="rail-link"><Icon :name="n.icon" :size="26" />{{ n.label }}</router-link>
      </nav>
      <router-link to="/ajustes" class="rail-link rail-settings"><Icon name="sliders" :size="26" />Ajustes</router-link>
    </aside>

    <div class="main">
      <header class="topbar">
        <router-link to="/hoy" class="top-logo" aria-label="Tako, inicio"><Logo :size="36" /></router-link>
        <div class="spacer"></div>
        <div v-if="me" class="stats">
          <router-link to="/progreso" class="chip stat flame" :title="`Racha de ${me.progress.streak} días`" :aria-label="`Racha de ${me.progress.streak} días`">
            <Icon name="flame" :size="20" filled /> {{ me.progress.streak }}
          </router-link>
          <router-link to="/tienda" class="chip stat coin" :aria-label="`${me.progress.coins} monedas`"><Icon name="coin" :size="20" filled /> {{ me.progress.coins }}</router-link>
          <router-link to="/perfil" class="chip stat lvl" :aria-label="`Nivel ${me.progress.level}`"><Icon name="star" :size="20" filled /> {{ me.progress.level }}</router-link>
        </div>
        <router-link to="/ajustes" class="icon-btn settings-top" aria-label="Ajustes"><Icon name="sliders" :size="24" /></router-link>
      </header>

      <div v-if="!me && state.loadError" class="page">
        <div class="card center stack">
          <PetAvatar mood="sad" :size="140" />
          <h2>No pude conectarme</h2>
          <p class="muted">{{ state.loadError }}</p>
          <button class="btn btn-primary" @click="retry">Reintentar</button>
        </div>
      </div>
      <router-view v-else v-slot="{ Component }"><component :is="Component" /></router-view>
    </div>

    <nav class="tabbar" aria-label="Menú principal">
      <router-link v-for="n in NAV" :key="n.to" :to="n.to" class="tab"><Icon :name="n.icon" :size="26" /><span>{{ n.label }}</span></router-link>
    </nav>
  </div>
  <router-view v-else />

  <CelebrationHost />
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Logo from './components/Logo.vue'
import Icon from './components/Icon.vue'
import PetAvatar from './components/PetAvatar.vue'
import CelebrationHost from './components/CelebrationHost.vue'
import { state, clearSession, loadMe } from './store'

const NAV = [
  { to: '/hoy', label: 'Hoy', icon: 'home' },
  { to: '/calendario', label: 'Calendario', icon: 'calendar' },
  { to: '/progreso', label: 'Progreso', icon: 'chart' },
  { to: '/tienda', label: 'Tienda', icon: 'bag' },
  { to: '/perfil', label: 'Perfil', icon: 'user' },
]

const route = useRoute()
const router = useRouter()
const me = computed(() => state.me)
const showShell = computed(() => !route.meta.public && route.meta.shell !== false)

const onUnauthorized = () => { clearSession(); router.push('/entrar') }
onMounted(() => window.addEventListener('tako:unauthorized', onUnauthorized))
onBeforeUnmount(() => window.removeEventListener('tako:unauthorized', onUnauthorized))

async function retry() {
  state.loadError = ''
  try { await loadMe() } catch { state.loadError = 'Sigue sin responder el servidor. Inténtalo en un momento.' }
}
</script>

<style scoped>
.shell { min-height: 100vh; display: flex; }
.main { flex: 1; min-width: 0; display: flex; flex-direction: column; }

.rail { display: none; }
.topbar { position: sticky; top: 0; z-index: 50; display: flex; align-items: center; gap: 10px; padding: 8px 14px; background: color-mix(in srgb, var(--bg) 88%, transparent); backdrop-filter: blur(10px); border-bottom: 2px solid var(--line); }
.stats { display: flex; gap: 8px; }
.stat { text-decoration: none; color: var(--ink); }
.stat.flame { color: var(--flame); background: color-mix(in srgb, var(--flame) 14%, transparent); }
.stat.coin { color: var(--sun-dark); background: color-mix(in srgb, var(--sun) 22%, transparent); }
.stat.coin :deep(svg) { color: var(--sun); }
.stat.lvl { color: var(--lilac); background: color-mix(in srgb, var(--lilac) 16%, transparent); }
.stat:hover { text-decoration: none; filter: brightness(.96); }
.settings-top { display: none; }

.tabbar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 60; display: flex; justify-content: space-around; padding: 6px 6px calc(6px + env(safe-area-inset-bottom)); background: var(--surface); border-top: 2px solid var(--line); }
.tab { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 2px; border-radius: 14px; color: var(--ink-soft); font-size: .72rem; font-weight: 800; text-decoration: none; }
.tab:hover { text-decoration: none; }
.tab.router-link-active { color: var(--tako-600); background: var(--tako-50); }

@media (min-width: 900px) {
  .rail { display: flex; flex-direction: column; gap: 14px; width: 250px; padding: 20px 14px; position: sticky; top: 0; height: 100vh; border-right: 2px solid var(--line); background: var(--surface); }
  .rail-logo { padding: 4px 10px 12px; display: block; }
  .rail-nav { display: flex; flex-direction: column; gap: 6px; flex: 1; }
  .rail-link { display: flex; align-items: center; gap: 14px; padding: 12px 14px; border-radius: 16px; color: var(--ink-soft); font-family: var(--font-display); font-weight: 600; font-size: 1.08rem; text-decoration: none; border: 2px solid transparent; }
  .rail-link:hover { background: var(--surface-2); text-decoration: none; }
  .rail-link.router-link-active { color: var(--tako-600); background: var(--tako-50); border-color: var(--tako-100); }
  .tabbar, .top-logo, .settings-top { display: none; }
  .topbar { justify-content: flex-end; }
}
</style>
