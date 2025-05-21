import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue';
import Register from '../components/Register.vue';
import Calendar from '../components/Calendar.vue';
import Profile from '../components/Profile.vue';
import Settings from '../components/Settings.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/calendar', component: Calendar },
  { path: '/profile', component: Profile },
  { path: '/settings', component: Settings },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
