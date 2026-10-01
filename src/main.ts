// Boot по порядку из PATTERNS: Pinia → i18n → hydrate ДО mount → ?invite= → mount.
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { i18n } from './i18n'
import { useIdentityStore } from './stores/identity'
import { persistDebounced } from './stores/persist'
import { SETTINGS_KEY, useSettingsStore } from './stores/settings'
import { IDENTITY_KEY } from './stores/identity'

// Глобальные стили: порядок важен — themes.css переопределяет фон body
// из scaffold base.css (внутри main.css), shell.css задаёт grid-раскладку.
import './assets/main.css'
import './styles/tokens.css'
import './styles/themes.css'
import './styles/shell.css'

const app = createApp(App)
app.use(createPinia())
app.use(i18n)

// Гидратация из localStorage ДО mount: UI сразу рисует stored-значения.
// Битые данные = дефолты (try/catch + merge внутри hydrate, T-02-02).
const settings = useSettingsStore()
const identity = useIdentityStore()
settings.hydrate()
identity.hydrate()

// Применяет настройки к окружению: тема через data-theme, локаль в i18n,
// lang и title документа — за локалью (index.html задаёт только стартовые).
function applyPreferences(): void {
  document.documentElement.dataset['theme'] = settings.theme
  const target = settings.locale
  // vue-i18n v11 Composition: locale — записываемая ссылка.
  if (i18n.global.locale.value !== target) i18n.global.locale.value = target
  document.documentElement.lang = target
  document.title = i18n.global.t('app.title')
}
applyPreferences()

// Подписки: debounced-персистенция ≤300мс (D-05) + немедленное применение.
settings.$subscribe(persistDebounced(SETTINGS_KEY, () => JSON.stringify(settings.$state)))
settings.$subscribe(() => applyPreferences())
identity.$subscribe(persistDebounced(IDENTITY_KEY, () => JSON.stringify(identity.$state)))

// Задел Фазы 7: invite-код читаем без навигации и роутера (D-09).
// Код приходит ручным обменом; потребление — в сетевой фазе.
export const pendingInvite: string | null = (() => {
  try {
    return new URLSearchParams(window.location.search).get('invite')
  } catch {
    return null
  }
})()

// Autoplay-policy (UI-SPEC Interaction): AudioContext создаётся лениво
// и разблокируется по первому пользовательскому жесту. Один контекст
// на приложение; без Web Audio — тихий пропуск (feature-detect).
let audioCtx: AudioContext | null = null

function unlockAudioContext(): void {
  try {
    if (audioCtx === null) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      if (typeof Ctor !== 'function') return
      audioCtx = new Ctor()
    }
    if (audioCtx.state === 'suspended') void audioCtx.resume().catch(() => {})
  } catch {
    // Web Audio недоступен: приложение работает без звука, boot не падает.
  }
}

// D-15: fullscreen + landscape-lock ТОЛЬКО по явным кнопкам (инфо-бар,
// диалог меню). Авто-переход по первому жесту убран решением пользователя:
// полноэкранный режим не должен включаться от любого чиха на странице.
// Отказ тихий (T-04-02): при недоступном lock путь берёт RotateOverlay.
function onFirstGesture(): void {
  window.removeEventListener('pointerdown', onFirstGesture)
  window.removeEventListener('keydown', onFirstGesture)
  unlockAudioContext()
}
window.addEventListener('pointerdown', onFirstGesture)
window.addEventListener('keydown', onFirstGesture)

// Контекстное меню (правый клик / long-press) нигде не нужно
// решением пользователя: все действия — явными кнопками и жестами игры.
window.addEventListener('contextmenu', (event: Event) => event.preventDefault())

app.mount('#app')
