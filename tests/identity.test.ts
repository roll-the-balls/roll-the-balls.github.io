// Тесты идентичности (MENU-02, D-07/D-12): UUID создаётся один раз,
// переживает повторную гидратацию (рестарт), сброс — только через wipe-all,
// который очищает оба ключа, и следующий boot выдаёт новый ID.
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { storageUnavailable, persistDebounced } from '../src/stores/persist'
import { IDENTITY_KEY, useIdentityStore } from '../src/stores/identity'
import { SETTINGS_KEY, useSettingsStore } from '../src/stores/settings'

// Формат UUID v4: 8-4-4-4-12 hex, версия 4 в третьем блоке.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

describe('identity store (bt.identity.v1)', () => {
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

  test('первый запуск создаёт UUID один раз', () => {
    const store = useIdentityStore()
    store.hydrate()
    expect(store.id).toMatch(UUID_RE)

    // Повторный вызов ensureId не пересоздаёт ID (генерация однократная).
    const first = store.id
    store.ensureId()
    store.ensureId()
    expect(store.id).toBe(first)
  })

  test('короткий ID — первые 8 символов UUID', () => {
    const store = useIdentityStore()
    store.hydrate()
    expect(store.shortId).toBe(store.id.slice(0, 8))
    expect(store.shortId).toHaveLength(8)
  })

  test('ID стабилен между перезапусками (повторная гидратация не меняет ID)', async () => {
    const store = useIdentityStore()
    store.$subscribe(persistDebounced(IDENTITY_KEY, () => JSON.stringify(store.$state)))
    store.hydrate()
    const first = store.id
    store.name = 'Игрок'
    await vi.advanceTimersByTimeAsync(300)
    expect(localStorage.getItem(IDENTITY_KEY)).not.toBeNull()

    // «Рестарт браузера»: новый Pinia, гидратация из того же хранилища.
    setActivePinia(createPinia())
    const reborn = useIdentityStore()
    reborn.hydrate()
    expect(reborn.id).toBe(first)
    expect(reborn.name).toBe('Игрок')
  })

  test('битые данные идентичности не роняют boot и дают новый валидный ID', () => {
    localStorage.setItem(IDENTITY_KEY, '{{{broken')
    const store = useIdentityStore()
    expect(() => store.hydrate()).not.toThrow()
    expect(store.id).toMatch(UUID_RE)
    expect(store.name).toBe('')
  })

  test('подменённые в хранилище имя/ID проходят клампы (S-01)', () => {
    localStorage.setItem(
      IDENTITY_KEY,
      JSON.stringify({
        name: 'и'.repeat(100), // длиннее maxlength=24
        id: 'not-a-uuid', // не формат UUID
      }),
    )
    const store = useIdentityStore()
    store.hydrate()

    expect(store.name).toHaveLength(24)
    // Подменённый ID отвергнут — игрок получил чистый UUID.
    expect(store.id).toMatch(UUID_RE)
    expect(store.id).not.toBe('not-a-uuid')
  })

  test('wipe-all очищает оба ключа, следующий boot генерирует новый ID (D-12)', async () => {
    // Наполняем оба хранилища, как после игровой сессии.
    const settings = useSettingsStore()
    settings.$subscribe(persistDebounced(SETTINGS_KEY, () => JSON.stringify(settings.$state)))
    const store = useIdentityStore()
    store.$subscribe(persistDebounced(IDENTITY_KEY, () => JSON.stringify(store.$state)))
    store.hydrate()
    store.name = 'Игрок'
    settings.music = false
    await vi.advanceTimersByTimeAsync(300)
    expect(localStorage.getItem(IDENTITY_KEY)).not.toBeNull()
    expect(localStorage.getItem(SETTINGS_KEY)).not.toBeNull()
    const oldId = store.id

    // Сброс всех данных — единственный путь удаления ID (D-07/D-12).
    store.wipeAll()
    settings.$reset()
    expect(localStorage.getItem(IDENTITY_KEY)).toBeNull()
    expect(localStorage.getItem(SETTINGS_KEY)).toBeNull()

    // Следующий boot: новый ID, имя пустое.
    setActivePinia(createPinia())
    const reborn = useIdentityStore()
    reborn.hydrate()
    expect(reborn.id).toMatch(UUID_RE)
    expect(reborn.id).not.toBe(oldId)
    expect(reborn.name).toBe('')
  })
})
