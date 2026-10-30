<template>
  <main class="auth">
    <section class="hero">
      <Logo :size="52" />
      <h1>Paso a paso,<br />todos los días.</h1>
      <p class="muted lead">Organiza tus tareas, mantén tu racha y cuida a tu tortuga Tako. Cada tarea que cumples la hace crecer.</p>
      <PetScene :pet="{ mood }" class="scene" :pet-size="230" />
      <ul class="perks">
        <li><span>🔥</span> Rachas diarias</li><li><span>🪙</span> Monedas y premios</li><li><span>🎨</span> Personaliza a Tako</li>
      </ul>
    </section>
    <section class="panel card"><slot /></section>
  </main>
</template>

<script setup>
import Logo from './Logo.vue'
import PetScene from './PetScene.vue'
defineProps({ mood: { type: String, default: 'happy' } })
</script>

<style scoped>
.auth { min-height: 100vh; display: grid; gap: 22px; padding: 22px 16px 40px; max-width: 1040px; margin: 0 auto; align-content: center; }
.hero { display: flex; flex-direction: column; gap: 14px; }
.hero h1 { font-size: 2.1rem; }
.lead { font-size: 1.05rem; max-width: 46ch; }
.scene { max-width: 420px; }
.perks { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 10px; }
.perks li { display: inline-flex; gap: 8px; align-items: center; padding: 6px 14px; border-radius: 999px; background: var(--surface); border: 2px solid var(--line); font-weight: 800; font-size: .92rem; }
.panel { align-self: center; }
@media (min-width: 900px) {
  .auth { grid-template-columns: 1.1fr 1fr; gap: 56px; }
  .hero h1 { font-size: 2.6rem; }
}
</style>
