// Тесты персистенции настроек (STORE-01, D-05):
// debounce-запись ≤300мс, битый JSON = дефолты, merge частичных сейвов
// с дефолтами (включая forward-поля Фазы 2), флаг недоступного хранилища.
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { storageUnavailable, persistDebounced } from '../src/stores/persist'
import { DEFAULT_SETTINGS, SETTINGS_KEY, useSettingsStore } from '../src/stores/settings'

// Полноценный снимок дефолтов для сравнения после гидратации битых данных.
const DEFAULTS_SNAPSHOT = JSON.parse(JSON.stringify(DEFAULT_SETTINGS))

describe('settings persistence (bt.settings.v1)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
    storageUnavailable.value = false
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  test('запись после изменения видна в localStorage не позже 300мс (debounce 250мс)', async () => {
    const store = useSettingsStore()
    store.$subscribe(persistDebounced(SETTINGS_KEY, () => JSON.stringify(store.$state)))

    store.music = false
    // До истечения debounce записи нет — в localStorage на каждый keystroke писать запрещено.
    await vi.advanceTimersByTimeAsync(200)
    expect(localStorage.getItem(SETTINGS_KEY)).toBeNull()

    // Debounce 250мс ≤ контрактные 300мс (D-05).
    await vi.advanceTimersByTimeAsync(100)
    const raw = localStorage.getItem(SETTINGS_KEY)
    expect(raw).not.toBeNull()
    expect(JSON.parse(raw!)).toMatchObject({ music: false })
  })

  test('серия быстрых изменений схлопывается в одну запись (последнее значение)', async () => {
    const store = useSettingsStore()
    store.$subscribe(persistDebounced(SETTINGS_KEY, () => JSON.stringify(store.$state)))

    store.music = false
    await vi.advanceTimersByTimeAsync(100)
    store.sounds = false
    await vi.advanceTimersByTimeAsync(100)
    store.theme = 'felt'
    await vi.advanceTimersByTimeAsync(300)

    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY)!)
    expect(saved).toMatchObject({ music: false, sounds: false, theme: 'felt' })
  })

  test('битый JSON даёт дефолты без исключений (T-02-02)', () => {
    localStorage.setItem(SETTINGS_KEY, '{not-json!!!')
    const store = useSettingsStore()
    expect(() => store.hydrate()).not.toThrow()
    expect(JSON.parse(JSON.stringify(store.$state))).toEqual(DEFAULTS_SNAPSHOT)
  })

  test('не-объект в хранилище даёт дефолты без исключений', () => {
    localStorage.setItem(SETTINGS_KEY, '"строка вместо объекта"')
    const store = useSettingsStore()
    expect(() => store.hydrate()).not.toThrow()
    expect(JSON.parse(JSON.stringify(store.$state))).toEqual(DEFAULTS_SNAPSHOT)
  })

  test('частичный объект мержится с дефолтами, forward-поля Фазы 2 на месте', () => {
    // Сейв из «прошлой версии»: только одно UI-поле, остальных ключей нет.
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ music: false }))
    const store = useSettingsStore()
    store.hydrate()

    // Сохранённое значение подхвачено.
    expect(store.music).toBe(false)
    // Forward-дефолты Фазы 2 (D-06) — точные значения из схемы.
    expect(store.clothColor).toBe('#0A6C03')
    expect(store.markings).toBe('dim')
    expect(store.trajectory).toEqual({ style: 'dashes', width: 2, density: 1 })
    expect(store.bigNumbers).toBe(false)
    // Остальные UI-поля — дефолтные.
    expect(store.sounds).toBe(true)
    expect(store.locale).toBe('ru')
    expect(store.theme).toBe('dark')
  })

  test('подмена типов полей через консоль откатывается к дефолтам', () => {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        music: 'yes',
        sounds: null,
        locale: 'de',
        theme: 'neon',
        clothColor: 42,
        markings: 'ultra',
        trajectory: { style: 'laser', width: 'wide', density: null },
        bigNumbers: 'false',
      }),
    )
    const store = useSettingsStore()
    store.hydrate()
    expect(JSON.parse(JSON.stringify(store.$state))).toEqual(DEFAULTS_SNAPSHOT)
  })

  test('недоступное хранилище выставляет in-memory флаг для баннера (D-08)', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded / private mode')
    })
    const store = useSettingsStore()
    store.$subscribe(persistDebounced(SETTINGS_KEY, () => JSON.stringify(store.$state)))

    store.music = false
    await vi.advanceTimersByTimeAsync(300)

    expect(storageUnavailable.value).toBe(true)
    // Стор продолжает работать in-memory: значение изменено.
    expect(store.music).toBe(false)
  })

  test('чтение из недоступного хранилища тоже выставляет флаг и не роняет boot', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError: private mode')
    })
    const store = useSettingsStore()
    expect(() => store.hydrate()).not.toThrow()
    expect(storageUnavailable.value).toBe(true)
    expect(JSON.parse(JSON.stringify(store.$state))).toEqual(DEFAULTS_SNAPSHOT)
  })

  test('мутация forward-поля не портит DEFAULT_SETTINGS: $reset() возвращает чистые дефолты (S-02)', () => {
    const first = useSettingsStore()
    first.trajectory.width = 99
    first.clothColor = '#FFFFFF'

    // Новый стор из нового Pinia получает дефолты из того же объекта — если бы
    // он был общим, подменённые значения пережили бы сброс и записались обратно.
    setActivePinia(createPinia())
    const second = useSettingsStore()
    expect(second.trajectory.width).toBe(2)
    expect(second.clothColor).toBe('#0A6C03')

    second.trajectory.width = 42
    second.$reset()
    expect(second.trajectory).toEqual({ style: 'dashes', width: 2, density: 1 })
    expect(second.clothColor).toBe('#0A6C03')
    expect(DEFAULT_SETTINGS.trajectory.width).toBe(2)
  })
})
