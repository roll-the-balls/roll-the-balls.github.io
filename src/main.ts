// Boot по порядку из PATTERNS: Pinia → i18n → hydrate ДО mount → ?invite= → mount.
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { i18n } from './i18n'
import { useIdentityStore } from './stores/identity'
import { persistDebounced } from './stores/persist'
import { SETTINGS_KEY, useSettingsStore } from './stores/settings'
import { IDENTITY_KEY } from './stores/identity'

const app = createApp(App)
app.use(createPinia())
app.use(i18n)

// Гидратация из localStorage ДО mount: UI сразу рисует stored-значения.
// Битые данные = дефолты (try/catch + merge внутри hydrate, T-02-02).
const settings = useSettingsStore()
const identity = useIdentityStore()
settings.hydrate()
identity.hydrate()

// Применяет настройки к окружению: тема через data-theme, локаль в i18n.
function applyPreferences(): void {
  document.documentElement.dataset['theme'] = settings.theme
  const target = settings.locale
  // vue-i18n v11 Composition: locale — записываемая ссылка.
  if (i18n.global.locale.value !== target) i18n.global.locale.value = target
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
app.mount('#app')
