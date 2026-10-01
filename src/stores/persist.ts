// Хелпер debounced-персистенции Pinia-сторов в localStorage (D-05).
//
// Правила: стор применяет изменения немедленно, запись в localStorage идёт
// с debounce ≤300мс; при недоступном хранилище (private mode) стор продолжает
// работать in-memory, а shell показывает инлайн-баннер (D-08).
import { ref } from 'vue'

// In-memory флаг недоступности localStorage: выставляется при первом
// броске setItem/getItem и никогда не сбрасывается до перезагрузки.
export const storageUnavailable = ref(false)

// Отдельный таймер на каждый ключ: иначе два стора (`bt.settings.v1`,
// `bt.identity.v1`) сбивали бы друг другу отложенную запись общим таймером.
const timers = new Map<string, ReturnType<typeof setTimeout>>()

// Возвращает колбэк для `store.$subscribe`: пишет `save()` в `key`
// с задержкой `ms`. Ошибки записи глотаются с выставлением флага (D-08).
export function persistDebounced(key: string, save: () => string, ms = 250) {
  return (_state: unknown) => {
    void _state
    const prev = timers.get(key)
    if (prev !== undefined) clearTimeout(prev)
    timers.set(
      key,
      setTimeout(() => {
        timers.delete(key)
        try {
          localStorage.setItem(key, save())
        } catch {
          // Private mode / квота: данные живут только в памяти (D-08).
          storageUnavailable.value = true
        }
      }, ms),
    )
  }
}

// Безопасное чтение сырого значения для hydrate при старте:
// битое/подменённое через консоль хранилище не должно ронять boot (T-02-02).
export function loadStored(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    storageUnavailable.value = true
    return null
  }
}
