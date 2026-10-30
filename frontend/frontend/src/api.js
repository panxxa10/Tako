import axios from 'axios';
import { todayKey } from './utils/date';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 25000, // el plan gratis de Render tarda en "despertar"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // Fecha y hora local: así "hoy" y las rachas respetan la zona horaria del usuario
  config.headers['X-Client-Date'] = todayKey();
  config.headers['X-Client-Hour'] = String(new Date().getHours());
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthCall = (error.config?.url || '').includes('/api/auth/');
    if (error.response?.status === 401 && !isAuthCall) window.dispatchEvent(new Event('tako:unauthorized'));
    return Promise.reject(error);
  }
);

export const errorMessage = (error, fallback = 'Algo salió mal. Intenta de nuevo.') => {
  if (error.code === 'ECONNABORTED') return 'El servidor tardó demasiado en responder. Intenta de nuevo.';
  if (!error.response) return 'No se pudo conectar con el servidor.';
  return error.response.data?.message || fallback;
};

export default api;
