import { createRouter, createWebHistory } from 'vue-router'
import { state, loadMe, clearSession } from '../store'

const routes = [
  { path: '/', redirect: () => (localStorage.getItem('token') ? '/hoy' : '/entrar') },
  { path: '/entrar', component: () => import('../views/Login.vue'), meta: { public: true } },
  { path: '/registro', component: () => import('../views/Register.vue'), meta: { public: true } },
  { path: '/bienvenida', component: () => import('../views/Onboarding.vue'), meta: { shell: false } },
  { path: '/enfoque', component: () => import('../views/Focus.vue'), meta: { shell: false } },
  { path: '/hoy', component: () => import('../views/Home.vue') },
  { path: '/calendario', component: () => import('../views/Calendar.vue') },
  { path: '/progreso', component: () => import('../views/Progress.vue') },
  { path: '/tienda', component: () => import('../views/Shop.vue') },
  { path: '/perfil', component: () => import('../views/Profile.vue') },
  { path: '/ajustes', component: () => import('../views/Settings.vue') },
  { path: '/login', redirect: '/entrar' },
  { path: '/register', redirect: '/registro' },
  { path: '/calendar', redirect: '/calendario' },
  { path: '/profile', redirect: '/perfil' },
  { path: '/settings', redirect: '/ajustes' },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to) => {
  const token = localStorage.getItem('token')
  if (to.meta.public) return token ? '/hoy' : true
  if (!token) return '/entrar'

  if (!state.loaded) {
    try {
      state.loadError = ''
      await loadMe()
    } catch (e) {
      if (e.response?.status === 401) { clearSession(); return '/entrar' }
      state.loadError = 'No se pudo conectar con el servidor. Si es la primera vez en un rato, puede tardar unos segundos en despertar.'
    }
  }
  if (state.me && !state.me.user.onboarded && to.path !== '/bienvenida') return '/bienvenida'
  if (state.me?.user.onboarded && to.path === '/bienvenida') return '/hoy'
})

export default router
