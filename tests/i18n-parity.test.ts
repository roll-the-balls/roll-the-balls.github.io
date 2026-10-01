// Паритет ключей RU/EN (MENU-03) — самый ценный тест Фазы 1 (01-RESEARCH Pattern 3):
// отсортированные списки ключей совпадают полностью + присутствуют все ключи
// копирайтинг-контракта UI-SPEC.
import { expect, test } from 'vitest'
import ru from '../src/i18n/ru.json'
import en from '../src/i18n/en.json'

// Рекурсивный обход словаря: собирает полные пути всех листовых строк.
const keys = (o: object, p = ''): string[] =>
  Object.entries(o).flatMap(([k, v]) =>
    typeof v === 'object' && v ? keys(v, `${p}${k}.`) : [`${p}${k}`],
  )

// Проверяет наличие значения по точечному пути (напр. 'reset.title').
function resolve(dict: object, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (typeof acc === 'object' && acc !== null) {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, dict)
}

test('ru/en dictionaries have identical keys', () => {
  expect(keys(en).sort()).toEqual(keys(ru).sort())
})

test('все строки — непустые', () => {
  for (const dict of [ru, en]) {
    for (const k of keys(dict)) {
      const v = resolve(dict, k)
      expect(typeof v, `${k} должен быть строкой`).toBe('string')
      expect((v as string).trim().length, `${k} не пустой`).toBeGreaterThan(0)
    }
  }
})

// Обязательные ключи копирайтинг-контракта (acceptance 01-03 task 2):
// play/mode/opponent/settings/soon, noName/nameHint, reset-диалог,
// баннер хранилища, rotate-overlay, ошибка загрузки, versionLabel,
// music/sounds/language/theme + dark/felt.
const REQUIRED_PATHS = [
  'menu.play',
  'menu.mode',
  'menu.opponent',
  'menu.settings',
  'menu.soon',
  'player.noName',
  'player.nameHint',
  'reset.title',
  'reset.body',
  'reset.confirm',
  'reset.cancel',
  'storage.unavailable',
  'rotate.title',
  'rotate.body',
  'error.loadError',
  'app.versionLabel',
  'settings.music',
  'settings.sounds',
  'settings.language',
  'settings.theme',
  'settings.themeDark',
  'settings.themeFelt',
]

test('словари содержат все ключи копирайтинг-контракта (RU и EN)', () => {
  for (const path of REQUIRED_PATHS) {
    expect(resolve(ru, path), `ru: ${path}`).toBeTruthy()
    expect(resolve(en, path), `en: ${path}`).toBeTruthy()
  }
})

test('reset-диалог: точный копирайтинг из UI-SPEC', () => {
  // Деструктивное подтверждение (D-12) — строки зафиксированы контрактом.
  expect(resolve(ru, 'reset.title')).toBe('Сбросить все данные')
  expect(resolve(ru, 'reset.body')).toBe(
    'Это удалит имя, ID, настройки и статистику. Продолжить?',
  )
  expect(resolve(en, 'reset.title')).toBe('Reset all data')
  expect(resolve(en, 'reset.body')).toBe(
    'This deletes the name, ID, settings and statistics. Continue?',
  )
})
