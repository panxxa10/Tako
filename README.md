# 🐢 Tako — Paso a paso, todos los días

Organizador de tareas gamificado: completa tareas, mantén tu **racha**, gana **XP y monedas**, desbloquea **logros**, viste a tu tortuga **Tako** y recibe **consejos** según cómo te va.

- **Frontend:** Vue 3 + Vite (PWA instalable, modo claro/oscuro, accesible)
- **Backend:** Node + Express + PostgreSQL (JWT, bcrypt, helmet, rate-limit)
- **Base de datos:** PostgreSQL real en producción (Neon/Supabase, gratis) y **PGlite** (Postgres embebido) en tu computador: no necesitas instalar nada para desarrollar.

## Cómo abrirlo (desarrollo)

```bash
npm run install:all
cp backend/.env.example backend/.env      # pon cualquier JWT_SECRET de 24+ caracteres
npm run dev:backend                       # http://localhost:4000  (crea la BD sola en backend/.data)
npm run dev:frontend                      # http://localhost:5173
npm test                                  # 28 pruebas del backend
```

Deja `DATABASE_URL` vacío en desarrollo: se usa PGlite automáticamente.

## Producción (Render + Neon)

1. Crea una BD gratis en [neon.tech](https://neon.tech) o [supabase.com](https://supabase.com) y copia su cadena de conexión.
2. En Render: backend con `DATABASE_URL`, `JWT_SECRET` (24+ caracteres) y `CLIENT_URL` (URL del frontend). Las tablas se crean solas al arrancar.
3. Frontend: variable `VITE_API_URL` con la URL del backend (`.env.production`).
   Se incluye `render.yaml` como plantilla.

## Qué incluye

| Área | Detalle |
|---|---|
| Cuentas | Registro, login, cambio de contraseña, eliminar cuenta |
| Tareas | Hoy, calendario, categorías, repetición, reprogramar atrasadas, notas |
| Juego | XP, niveles con títulos, meta diaria con bono, racha, escudos de racha, 22 logros |
| Tako | Mascota SVG con 9 estados de ánimo; sombreros, gafas, bufandas, colores de caparazón y escenarios |
| Tienda | Artículos con monedas + **premios propios** (ej. "ver un capítulo") canjeables |
| Consejos | Qué mejorar y qué seguir haciendo, según tu cumplimiento |
| Enfoque | Temporizador de 15/25/45 min con recompensa |
| Perfil | Nivel, trofeos con fecha, nombre de tu Tako, ocupación |

Reglas anti-trampa: la recompensa se otorga una sola vez por tarea, tope de 10 tareas con recompensa por día, y borrar no quita lo ganado.

Marca: ver [docs/BRAND.md](docs/BRAND.md). Investigación: [docs/COMPETIDORES.md](docs/COMPETIDORES.md).
