<script setup lang="ts">
// Экран настроек (MENU-02/03, STORE-01, D-11): ровно 5 рядов —
// имя + короткий ID, музыка, звуки, язык, тема.
// Каждая строка — один tab-стоп: ввод, тогл-кнопка или нативный select,
// фокус никуда не убегает. Изменения пишут стор немедленно (персистенцию
// дебаунсит хелпер, применение — подписка в main.ts).
// Имя — только текстовая интерполяция, никогда v-html (T-03-01).
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ResetAllDialog from '../dialogs/ResetAllDialog.vue'
import MenuHeader from './MenuHeader.vue'
import SettingsToggle from './SettingsToggle.vue'
import { useIdentityStore } from '../../stores/identity'
import { useSettingsStore } from '../../stores/settings'
import { useUiStore } from '../../stores/ui'

const { t } = useI18n()
const ui = useUiStore()
const settings = useSettingsStore()
const identity = useIdentityStore()

// Локальная видимость модалки сброса (D-12): wipe только через подтверждение.
const resetVisible = ref(false)
</script>

<template>
  <section class="menu" :aria-label="t('settings.title')">
    <MenuHeader :title="t('settings.title')" @back="ui.go('main')" />

    <div class="menu-scroll">
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

      <!-- Ряд 2: музыка (тогл-кнопка — один tab-стоп на строку). -->
      <div class="settings-row">
        <span class="label">{{ t('settings.music') }}</span>
        <SettingsToggle v-model="settings.music" :label="t('settings.music')" />
      </div>

      <!-- Ряд 3: звуки. -->
      <div class="settings-row">
        <span class="label">{{ t('settings.sounds') }}</span>
        <SettingsToggle v-model="settings.sounds" :label="t('settings.sounds')" />
      </div>

      <!-- Ряд 4: язык — нативный select: один tab-стоп, выбор стрелками,
           фокус остаётся на месте (UAT Фазы 1). -->
      <div class="settings-row">
        <label class="label" for="settings-locale">{{ t('settings.language') }}</label>
        <select
          id="settings-locale"
          v-model="settings.locale"
          class="select"
        >
          <option value="ru">{{ t('settings.langRu') }}</option>
          <option value="en">{{ t('settings.langEn') }}</option>
        </select>
      </div>

      <!-- Ряд 5: тема — select по той же причине. -->
      <div class="settings-row">
        <label class="label" for="settings-theme">{{ t('settings.theme') }}</label>
        <select
          id="settings-theme"
          v-model="settings.theme"
          class="select"
        >
          <option value="dark">{{ t('settings.themeDark') }}</option>
          <option value="felt">{{ t('settings.themeFelt') }}</option>
        </select>
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
    </div>

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
