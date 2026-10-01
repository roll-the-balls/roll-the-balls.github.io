// Стор настроек: только UI/сессия, игровое состояние — вне Pinia (D-08).
import { defineStore } from 'pinia'
import { loadStored } from './persist'

// One-way ключ персистенции: зафиксирован гейтом 01-02 (locked-keys, D-05),
// читается всеми будущими фазами — переименование потребует миграции.
export const SETTINGS_KEY = 'bt.settings.v1'

// Схема настроек (locked, D-05/D-06): 5 полей с UI в Фазе 1 плюс
// forward-дефолты полей Фазы 2 (цвет сукна, разметка, траектория, номера) без UI.
export interface SettingsState {
  music: boolean
  sounds: boolean
  locale: 'ru' | 'en'
  theme: 'dark' | 'felt'
  // Forward-дефолты Фазы 2: в схеме есть, в UI нет.
  clothColor: string
  markings: 'dim' | 'bright' | 'off'
  trajectory: { style: 'dashes' | 'dots'; width: number; density: number }
  bigNumbers: boolean
}

export const DEFAULT_SETTINGS: SettingsState = {
  music: true,
  sounds: true,
  locale: 'ru',
  theme: 'dark',
  clothColor: '#0A6C03',
  markings: 'dim',
  trajectory: { style: 'dashes', width: 2, density: 1 },
  bigNumbers: false,
}

// Проверка типов при hydrate: подмена через консоль даёт дефолты, а не белый экран (T-02-02).
function isLocale(v: unknown): v is 'ru' | 'en' {
  return v === 'ru' || v === 'en'
}

function isTheme(v: unknown): v is 'dark' | 'felt' {
  return v === 'dark' || v === 'felt'
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({ ...DEFAULT_SETTINGS }),
  actions: {
    // Гидратация ДО mount (вызывается из main.ts): битый JSON = дефолты,
    // старые сейвы подхватывают новые поля через merge дефолтов.
    hydrate(): void {
      const raw = loadStored(SETTINGS_KEY)
      if (raw === null) return
      let parsed: unknown
      try {
        parsed = JSON.parse(raw)
      } catch {
        return
      }
      if (typeof parsed !== 'object' || parsed === null) return
      const p = parsed as Partial<Record<string, unknown>>
      if (typeof p['music'] === 'boolean') this.music = p['music']
      if (typeof p['sounds'] === 'boolean') this.sounds = p['sounds']
      if (isLocale(p['locale'])) this.locale = p['locale']
      if (isTheme(p['theme'])) this.theme = p['theme']
      if (typeof p['clothColor'] === 'string') this.clothColor = p['clothColor']
      if (p['markings'] === 'dim' || p['markings'] === 'bright' || p['markings'] === 'off') {
        this.markings = p['markings']
      }
      if (typeof p['trajectory'] === 'object' && p['trajectory'] !== null) {
        const t = p['trajectory'] as Partial<Record<string, unknown>>
        if (t['style'] === 'dashes' || t['style'] === 'dots') this.trajectory.style = t['style']
        if (typeof t['width'] === 'number') this.trajectory.width = t['width']
        if (typeof t['density'] === 'number') this.trajectory.density = t['density']
      }
      if (typeof p['bigNumbers'] === 'boolean') this.bigNumbers = p['bigNumbers']
    },
  },
})
