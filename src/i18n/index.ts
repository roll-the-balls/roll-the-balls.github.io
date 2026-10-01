// vue-i18n в Composition-режиме: Legacy API deprecated в v11 (D-07).
// Дефолтная локаль RU; паритет ключей RU/EN проверяет тест плана 01-03.
import { createI18n } from 'vue-i18n'
import ru from './ru.json'
import en from './en.json'

export const i18n = createI18n({
  legacy: false,
  locale: 'ru',
  fallbackLocale: 'en',
  messages: { ru, en },
})
