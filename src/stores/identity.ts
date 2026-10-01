// Стор идентичности: имя + UUID игрока (D-07).
import { defineStore } from 'pinia'
import { loadStored } from './persist'

// One-way ключ персистенции: зафиксирован гейтом 01-02 (locked-keys, D-05).
export const IDENTITY_KEY = 'bt.identity.v1'

// Генерация ID один раз при первом запуске: криптографический UUID,
// простой fallback для окружений без crypto.randomUUID.
function generateUuid(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const b = crypto.getRandomValues(new Uint8Array(16))
      b[6] = (b[6]! & 0x0f) | 0x40
      b[8] = (b[8]! & 0x3f) | 0x80
      const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('')
      return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
    }
  } catch {
    // Падаем в Math.random-ветку ниже.
  }
  // Последний шанс: некриптографический ID (хуже, но лучше отсутствия).
  const r = () => Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0')
  return `${r()}${r()}-${r()}-4${r().slice(1)}-${r()}-${r()}${r()}${r()}`
}

export const useIdentityStore = defineStore('identity', {
  state: () => ({ name: '', id: '' }),
  getters: {
    // Короткий ID рядом с именем: первые 8 символов UUID.
    shortId: (s): string => s.id.slice(0, 8),
  },
  actions: {
    // Выдаёт ID, если его нет. Сброс ID — только через «Сбросить все данные» (D-07/D-12).
    ensureId(): void {
      if (this.id === '') this.id = generateUuid()
    },
    // Гидратация ДО mount: хранит ранее выданный ID, иначе генерирует один раз.
    hydrate(): void {
      const raw = loadStored(IDENTITY_KEY)
      if (raw !== null) {
        try {
          const parsed: unknown = JSON.parse(raw)
          if (typeof parsed === 'object' && parsed !== null) {
            const p = parsed as Partial<Record<string, unknown>>
            if (typeof p['name'] === 'string') this.name = p['name']
            if (typeof p['id'] === 'string' && p['id'] !== '') this.id = p['id']
          }
        } catch {
          // Битые данные = дефолты + новый ID (T-02-02).
        }
      }
      this.ensureId()
    },
  },
})
