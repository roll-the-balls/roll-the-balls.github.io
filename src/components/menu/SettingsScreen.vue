<script setup lang="ts">
// Экран настроек (MENU-02/03, STORE-01, D-11): ровно 5 рядов —
// имя + короткий ID, музыка, звуки, язык RU/EN, тема dark/felt.
// Каждое изменение пишет стор немедленно (персистенцию дебаунсит хелпер).
// Имя — только текстовая интерполяция, никогда v-html (T-03-01).
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ResetAllDialog from '../dialogs/ResetAllDialog.vue'
import { useIdentityStore } from '../../stores/identity'
import { useSettingsStore } from '../../stores/settings'
import { useUiStore } from '../../stores/ui'

const { t, locale } = useI18n()
const ui = useUiStore()
const settings = useSettingsStore()
const identity = useIdentityStore()

// Локальная видимость модалки сброса (D-12): wipe только через подтверждение.
const resetVisible = ref(false)

// Переключение языка: пишем и стор (персист), и глобальную локаль i18n —
// все строки обновляются немедленно.
function setLocale(next: 'ru' | 'en'): void {
  settings.locale = next
  locale.value = next
}

// Переключение темы: стор + немедленное применение data-theme на <html>.
function setTheme(next: 'dark' | 'felt'): void {
  settings.theme = next
  document.documentElement.dataset['theme'] = next
}
</script>

<template>
  <section class="menu" :aria-label="t('settings.title')">
    <h2 class="heading" data-view-title tabindex="-1">{{ t('settings.title') }}</h2>

    <!-- Ряд 1: имя (maxlength 24, однострочный ellipsis) + короткий ID. -->
    <label class="settings-row">
      <span class="label">{{ t('player.nameLabel') }}</span>
      <span class="name-control">
        <input
          v-model="identity.name"
          class="text-input"
          type="text"
          maxlength="24"
          :placeholder="t('player.noName')"
          :aria-label="t('player.nameLabel')"
        />
        <span class="short-id allow-select">{{ identity.shortId }}</span>
      </span>
    </label>
    <!-- Пустое имя → «Без имени» + подсказка про ID (D-11, empty E2). -->
    <p class="hint">
      <template v-if="identity.name.trim() === ''">{{ t('player.noName') }} · </template>
      {{ t('player.nameHint') }}
    </p>

    <!-- Ряд 2: музыка. -->
    <label class="settings-row">
      <span class="label">{{ t('settings.music') }}</span>
      <input v-model="settings.music" class="check" type="checkbox" />
    </label>

    <!-- Ряд 3: звуки. -->
    <label class="settings-row">
      <span class="label">{{ t('settings.sounds') }}</span>
      <input v-model="settings.sounds" class="check" type="checkbox" />
    </label>

    <!-- Ряд 4: язык — сегмент RU/EN. -->
    <div class="settings-row">
      <span class="label">{{ t('settings.language') }}</span>
      <div class="segment" role="group" :aria-label="t('settings.language')">
        <button
          class="segment-btn"
          type="button"
          :class="{ 'is-active': settings.locale === 'ru' }"
          :aria-pressed="settings.locale === 'ru'"
          @click="setLocale('ru')"
        >
          RU
        </button>
        <button
          class="segment-btn"
          type="button"
          :class="{ 'is-active': settings.locale === 'en' }"
          :aria-pressed="settings.locale === 'en'"
          @click="setLocale('en')"
        >
          EN
        </button>
      </div>
    </div>

    <!-- Ряд 5: тема — dark/felt. -->
    <div class="settings-row">
      <span class="label">{{ t('settings.theme') }}</span>
      <div class="segment" role="group" :aria-label="t('settings.theme')">
        <button
          class="segment-btn"
          type="button"
          :class="{ 'is-active': settings.theme === 'dark' }"
          :aria-pressed="settings.theme === 'dark'"
          @click="setTheme('dark')"
        >
          {{ t('settings.themeDark') }}
        </button>
        <button
          class="segment-btn"
          type="button"
          :class="{ 'is-active': settings.theme === 'felt' }"
          :aria-pressed="settings.theme === 'felt'"
          @click="setTheme('felt')"
        >
          {{ t('settings.themeFelt') }}
        </button>
      </div>
    </div>

    <!-- Сброс всех данных: только через модалку с подтверждением (D-12). -->
    <button class="menu-btn is-danger" type="button" @click="resetVisible = true">
      <!-- Иконка сброса (корзина): inline SVG. -->
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M3.5 5.5h13M8 5.5V3.8c0-.7.6-1.3 1.3-1.3h1.4c.7 0 1.3.6 1.3 1.3v1.7m2.5 0-.7 10.4c0 .9-.7 1.6-1.6 1.6H7.8c-.9 0-1.6-.7-1.6-1.6L5.5 5.5"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      {{ t('reset.title') }}
    </button>

    <button class="menu-btn" type="button" @click="ui.go('main')">
      {{ t('menu.back') }}
    </button>

    <!-- Модалка сброса: две кнопки, деструктивный #E5484D (T-03-03). -->
    <ResetAllDialog v-if="resetVisible" @close="resetVisible = false" />
  </section>
</template>

<style scoped>
/* Локальные детали ряда имени; общие примитивы меню — в assets/main.css. */
.name-control {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.short-id {
  font-size: var(--text-label);
  color: var(--text-dim);
  white-space: nowrap;
}

/* Деструктивный триггер сброса: красный только у подтверждения wipe (UI-SPEC). */
.menu-btn.is-danger {
  color: var(--danger);
  border-color: var(--danger);
}
</style>
