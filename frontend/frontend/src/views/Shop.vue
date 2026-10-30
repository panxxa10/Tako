<template>
  <div v-if="me" class="page">
    <div class="row"><h1 class="spacer">Tienda</h1><span class="chip coin"><Icon name="coin" :size="20" filled /> {{ me.progress.coins }} monedas</span></div>

    <div class="tabs" role="tablist">
      <button role="tab" :aria-selected="tab === 'look'" :class="{ on: tab === 'look' }" @click="tab = 'look'">🎨 Vestir a {{ me.pet.name }}</button>
      <button role="tab" :aria-selected="tab === 'perks'" :class="{ on: tab === 'perks' }" @click="tab = 'perks'">🎁 Mis premios</button>
    </div>

    <template v-if="tab === 'look'">
      <section class="card preview">
        <PetScene :pet="{ mood: previewMood, shell: look.shell, hat: look.hat, glasses: look.glasses, neck: look.neck, name: me.pet.name }" :scene="look.scene" :pet-size="200" ratio="16 / 10" />
        <div v-if="selected" class="action pop-in" :key="selected.id">
          <div class="spacer"><strong>{{ selected.name }}</strong>
            <p class="small muted">{{ selected.owned ? (equipped(selected) ? 'Lo llevas puesto' : 'Ya es tuyo') : `${selected.price} monedas` }}</p></div>
          <button v-if="!selected.owned" class="btn btn-primary" :disabled="busy || me.progress.coins < selected.price" @click="buy(selected)">
            <Icon name="coin" :size="20" filled /> Comprar · {{ selected.price }}
          </button>
          <button v-else-if="!equipped(selected)" class="btn btn-primary" :disabled="busy" @click="equip(selected)">Ponérselo</button>
          <button v-else-if="selected.slot !== 'shell' && selected.slot !== 'scene'" class="btn btn-secondary" :disabled="busy" @click="unequip(selected.slot)">Quitar</button>
        </div>
        <p v-if="selected && !selected.owned && me.progress.coins < selected.price" class="small muted need">Te faltan {{ selected.price - me.progress.coins }} monedas. ¡Completa tareas para ganarlas!</p>
        <p v-if="error" class="form-error" role="alert">{{ error }}</p>
      </section>

      <div class="slots" role="tablist" aria-label="Categorías">
        <button v-for="s in SLOT_ORDER" :key="s" class="pill-btn" :class="{ active: slot === s }" role="tab" :aria-selected="slot === s" @click="slot = s">{{ SLOT_LABELS[s] }}</button>
      </div>

      <div class="items">
        <button v-if="slot === 'hat' || slot === 'glasses' || slot === 'neck'" class="item none" :class="{ sel: !look[slot] }" @click="pick(null)">
          <span class="nothing">∅</span><strong>Ninguno</strong>
        </button>
        <button v-for="it in slotItems" :key="it.id" class="item" :class="{ sel: look[slot] === it.id, mine: equipped(it) }" @click="pick(it)">
          <PetScene v-if="slot === 'scene'" :scene="it.id" :show-pet="false" ratio="4 / 3" class="mini-scene" />
          <PetAvatar v-else :size="92" :animated="false" :shell="slot === 'shell' ? it.id : me.pet.shell" :hat="slot === 'hat' ? it.id : me.pet.hat" :glasses="slot === 'glasses' ? it.id : me.pet.glasses" :neck="slot === 'neck' ? it.id : me.pet.neck" />
          <strong>{{ it.name }}</strong>
          <span v-if="equipped(it)" class="tag on">Puesto</span>
          <span v-else-if="it.owned" class="tag">Tuyo</span>
          <span v-else class="tag price"><Icon name="coin" :size="14" filled /> {{ it.price }}</span>
        </button>
      </div>

      <section class="card shield-card" v-if="shop">
        <Icon name="shield" :size="52" filled class="sh" />
        <div class="spacer"><h3>Escudo de racha</h3>
          <p class="small muted">Si un día no completas ninguna tarea, un escudo salva tu racha automáticamente. Tienes {{ me.progress.freezes }} de {{ shop.freeze.max }}.</p></div>
        <button class="btn btn-secondary" :disabled="busy || me.progress.freezes >= shop.freeze.max || me.progress.coins < shop.freeze.price" @click="buyFreeze">
          <Icon name="coin" :size="20" filled /> {{ shop.freeze.price }}
        </button>
      </section>
    </template>

    <template v-else>
      <section class="card stack">
        <div><h2>Premios propios</h2><p class="muted small">Define premios de la vida real (¡un helado, un capítulo, una salida!) y cámbialos por monedas cuando te los hayas ganado.</p></div>
        <form class="add" @submit.prevent="addReward">
          <input v-model="newReward.emoji" class="input emoji" maxlength="4" aria-label="Emoji" />
          <input v-model="newReward.title" class="input" maxlength="40" placeholder="Ej: Ver un capítulo de mi serie" required aria-label="Nombre del premio" />
          <input v-model.number="newReward.cost" class="input cost" type="number" min="5" max="1000" step="5" required aria-label="Costo en monedas" />
          <button class="btn btn-primary" type="submit" aria-label="Agregar premio"><Icon name="plus" :size="22" /></button>
        </form>
        <p v-if="error" class="form-error" role="alert">{{ error }}</p>
        <ul v-if="rewards.length" class="rewards">
          <li v-for="r in rewards" :key="r.id" class="reward">
            <span class="emo" aria-hidden="true">{{ r.emoji }}</span>
            <div class="spacer"><strong>{{ r.title }}</strong><p class="small muted">Canjeado {{ r.timesRedeemed }} {{ r.timesRedeemed === 1 ? 'vez' : 'veces' }}</p></div>
            <button class="btn btn-primary btn-sm" :disabled="busy || me.progress.coins < r.cost" @click="redeem(r)"><Icon name="coin" :size="18" filled /> {{ r.cost }}</button>
            <button class="icon-btn" :aria-label="`Eliminar ${r.title}`" @click="removeReward(r)"><Icon name="trash" :size="20" /></button>
          </li>
        </ul>
        <p v-else class="muted center">Aún no tienes premios. ¡Crea el primero!</p>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api, { errorMessage } from '../api'
import PetAvatar from '../components/PetAvatar.vue'
import PetScene from '../components/PetScene.vue'
import Icon from '../components/Icon.vue'
import { state, celebrate, toast, reaction } from '../store'
import { SLOT_LABELS, SLOT_ORDER } from '../utils/constants'

const me = computed(() => state.me)
const tab = ref('look')
const slot = ref('hat')
const shop = ref(null)
const rewards = ref([])
const busy = ref(false)
const error = ref('')
const selected = ref(null)
const previewMood = ref('happy')
const newReward = reactive({ emoji: '🎁', title: '', cost: 20 })

// Vista previa: lo que Tako lleva ahora mismo, con la prueba encima
const look = reactive({ shell: 'shell_green', hat: null, glasses: null, neck: null, scene: 'scene_meadow' })
const syncLook = () => Object.assign(look, { shell: me.value.pet.shell, hat: me.value.pet.hat, glasses: me.value.pet.glasses, neck: me.value.pet.neck, scene: me.value.pet.scene })

const slotItems = computed(() => (shop.value?.items || []).filter((i) => i.slot === slot.value))
const equipped = (it) => me.value.pet[it.slot] === it.id

function pick(it) {
  error.value = ''
  if (it === null) { look[slot.value] = null; selected.value = null; previewMood.value = 'happy'; return }
  look[slot.value] = it.id
  selected.value = it
  previewMood.value = it.owned ? 'happy' : 'love'
}

async function refresh() {
  const { data } = await api.get('/api/shop')
  shop.value = data
  if (selected.value) selected.value = data.items.find((i) => i.id === selected.value.id) || null
}

async function buy(it) {
  busy.value = true; error.value = ''
  try {
    const { data } = await api.post('/api/shop/buy', { itemId: it.id })
    celebrate(data)
    await refresh()
    reaction('celebrate', '¡Qué bien me queda! Gracias 💚')
    await equip(selected.value)
  } catch (e) { error.value = errorMessage(e) } finally { busy.value = false }
}
async function buyFreeze() {
  busy.value = true; error.value = ''
  try {
    const { data } = await api.post('/api/shop/buy', { itemId: 'freeze' })
    celebrate(data); await refresh()
    toast({ kind: 'info', text: '🛡️ Escudo guardado: protegerá tu racha si falta un día.' })
  } catch (e) { error.value = errorMessage(e) } finally { busy.value = false }
}
async function equip(it) {
  if (!it) return
  busy.value = true; error.value = ''
  try {
    const { data } = await api.put('/api/me/pet', { [it.slot]: it.id })
    celebrate(data); syncLook()
  } catch (e) { error.value = errorMessage(e) } finally { busy.value = false }
}
async function unequip(s) {
  busy.value = true
  try { const { data } = await api.put('/api/me/pet', { [s]: null }); celebrate(data); syncLook() } catch (e) { error.value = errorMessage(e) } finally { busy.value = false }
}

async function loadRewards() { rewards.value = (await api.get('/api/shop/rewards')).data }
async function addReward() {
  error.value = ''
  try {
    const { data } = await api.post('/api/shop/rewards', { title: newReward.title, emoji: newReward.emoji, cost: newReward.cost })
    rewards.value.push(data); rewards.value.sort((a, b) => a.cost - b.cost)
    newReward.title = ''
  } catch (e) { error.value = errorMessage(e) }
}
async function redeem(r) {
  busy.value = true; error.value = ''
  try {
    const { data } = await api.post(`/api/shop/rewards/${r.id}/redeem`)
    celebrate(data); await loadRewards()
    toast({ kind: 'goal', text: `¡Disfruta tu premio: ${r.emoji} ${r.title}!` })
  } catch (e) { error.value = errorMessage(e) } finally { busy.value = false }
}
async function removeReward(r) {
  try { await api.delete(`/api/shop/rewards/${r.id}`); rewards.value = rewards.value.filter((x) => x.id !== r.id) } catch (e) { error.value = errorMessage(e) }
}

onMounted(async () => { syncLook(); await Promise.all([refresh(), loadRewards()]) })
</script>

<style scoped>
.chip.coin { background: color-mix(in srgb, var(--sun) 24%, transparent); color: var(--sun-dark); }
.chip.coin :deep(svg) { color: var(--sun); }
.tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: var(--surface-2); padding: 6px; border-radius: 18px; }
.tabs button { min-height: 44px; border: 0; border-radius: 14px; background: transparent; font-family: var(--font-display); font-weight: 600; cursor: pointer; color: var(--ink-soft); }
.tabs button.on { background: var(--surface); color: var(--ink); box-shadow: var(--shadow); }

.preview { display: flex; flex-direction: column; gap: 12px; padding: 12px; }
.action { display: flex; align-items: center; gap: 12px; padding: 4px 6px; flex-wrap: wrap; }
.need { padding: 0 6px; }
.slots { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
.slots .pill-btn { flex-shrink: 0; }

.items { display: grid; grid-template-columns: repeat(auto-fill, minmax(128px, 1fr)); gap: 12px; }
.item { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 6px 12px; border: 2px solid var(--line); border-radius: var(--radius-sm); background: var(--surface); cursor: pointer; text-align: center; box-shadow: 0 4px 0 var(--line); transition: transform .1s; }
.item:hover { transform: translateY(-2px); }
.item.sel { border-color: var(--tako-500); box-shadow: 0 4px 0 var(--tako-500); background: var(--tako-50); }
.item strong { font-size: .86rem; line-height: 1.2; }
.item.none { justify-content: center; min-height: 150px; }
.nothing { font-size: 2.4rem; color: var(--ink-soft); }
.mini-scene { width: 100%; border-radius: 12px; }
.tag { font-size: .78rem; font-weight: 900; padding: 2px 10px; border-radius: 99px; background: var(--surface-2); color: var(--ink-soft); display: inline-flex; align-items: center; gap: 4px; }
.tag.on { background: var(--tako-500); color: #fff; }
.tag.price { background: color-mix(in srgb, var(--sun) 25%, transparent); color: var(--sun-dark); }
.tag.price :deep(svg) { color: var(--sun); }

.shield-card { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.sh { color: var(--sky); }
.add { display: flex; gap: 8px; flex-wrap: wrap; }
.add .emoji { width: 64px; text-align: center; font-size: 1.3rem; padding: 6px; }
.add .cost { width: 96px; }
.add > .input:nth-child(2) { flex: 1; min-width: 160px; }
.rewards { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.reward { display: flex; align-items: center; gap: 10px; padding: 10px 8px 10px 14px; border: 2px solid var(--line); border-radius: var(--radius-sm); }
.emo { font-size: 1.8rem; }
</style>

