<template>
  <div class="toasts" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="t in state.toasts" :key="t.id" class="toast" :class="t.kind" @click="dismissToast(t.id)">
        <template v-if="t.kind === 'reward'">
          <span class="chip xp">+{{ t.xp }} XP</span><span class="chip coin"><Icon name="coin" :size="18" filled /> +{{ t.coins }}</span>
        </template>
        <template v-else-if="t.kind === 'achievement'">
          <Badge :icon="t.achievement.icon" :tier="t.achievement.tier" :size="52" />
          <div><strong>¡Logro desbloqueado!</strong><div>{{ t.achievement.name }} <span class="coin-text">+{{ t.achievement.coins }} 🪙</span></div></div>
        </template>
        <template v-else><span>{{ t.text }}</span></template>
      </div>
    </TransitionGroup>
  </div>

  <div v-if="state.levelUp" class="modal-bg" @click.self="state.levelUp = null">
    <div class="levelup card pop-in" role="dialog" aria-modal="true" aria-labelledby="lvl-title">
      <PetAvatar mood="celebrate" v-bind="petProps" :size="190" />
      <h2 id="lvl-title">¡Subiste al nivel {{ state.levelUp.to }}!</h2>
      <p class="muted">Eres un <strong>{{ state.me?.progress.title }}</strong>. Tu constancia está dando frutos 💚</p>
      <button class="btn btn-primary btn-block" @click="state.levelUp = null">¡Genial!</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { state, dismissToast } from '../store'
import Icon from './Icon.vue'
import Badge from './Badge.vue'
import PetAvatar from './PetAvatar.vue'

const petProps = computed(() => {
  const p = state.me?.pet || {}
  return { shell: p.shell, hat: p.hat, glasses: p.glasses, neck: p.neck, name: p.name }
})
</script>

<style scoped>
.toasts { position: fixed; top: 74px; left: 0; right: 0; display: flex; flex-direction: column; align-items: center; gap: 10px; z-index: 2500; pointer-events: none; padding: 0 12px; }
.toast { pointer-events: auto; display: flex; align-items: center; gap: 12px; padding: 10px 16px; background: var(--surface); border: 2px solid var(--line); border-radius: 18px; box-shadow: var(--shadow); font-weight: 700; max-width: 440px; cursor: pointer; }
.toast.reward { padding: 6px 8px; border-radius: 999px; gap: 6px; }
.toast.achievement { border-color: var(--sun); background: color-mix(in srgb, var(--sun) 12%, var(--surface)); }
.toast.goal { border-color: var(--tako-500); background: var(--tako-50); }
.chip.xp { background: color-mix(in srgb, var(--lilac) 22%, transparent); color: var(--lilac); }
.chip.coin { background: color-mix(in srgb, var(--sun) 28%, transparent); color: var(--sun-dark); }
.chip.coin :deep(svg) { color: var(--sun); }
.coin-text { color: var(--sun-dark); font-weight: 800; margin-left: 4px; }
.toast-enter-active, .toast-leave-active { transition: all .35s cubic-bezier(.3, 1.3, .5, 1); }
.toast-enter-from { opacity: 0; transform: translateY(-16px) scale(.9); }
.toast-leave-to { opacity: 0; transform: translateY(-10px); }

.modal-bg { position: fixed; inset: 0; background: rgba(20, 30, 26, .55); display: grid; place-items: center; padding: 20px; z-index: 2600; }
.levelup { width: min(380px, 100%); display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; }
</style>
