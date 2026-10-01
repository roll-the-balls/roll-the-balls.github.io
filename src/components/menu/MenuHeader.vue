<script setup lang="ts">
// Шапка экрана меню (UAT Фазы 1): кнопка «Назад» слева от заголовка
// (только если есть куда возвращаться) + заголовок-цель программного фокуса.
// Заголовок передаётся готовой строкой (родитель уже перевёл через t).
import { useI18n } from 'vue-i18n'

withDefaults(
  defineProps<{
    /** Уже переведённый заголовок экрана. */
    title: string
    /** Показать кнопку «Назад». На главном экране возвращаться некуда. */
    showBack?: boolean
    /** Уровень заголовка: h1 — только главный экран. */
    level?: 'h1' | 'h2'
  }>(),
  { showBack: true, level: 'h2' },
)

defineEmits<{
  /** Нажата кнопка «Назад» — куда вести решает родитель. */
  (e: 'back'): void
}>()

const { t } = useI18n()
</script>

<template>
  <div class="menu-head">
    <button
      v-if="showBack"
      class="back-btn"
      type="button"
      :aria-label="t('menu.back')"
      @click="$emit('back')"
    >
      <!-- Стрелка «назад»: только inline SVG. -->
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M12 4 6 10l6 6"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <component
      :is="level"
      class="heading"
      :class="{ 'app-title': level === 'h1' }"
      data-view-title
      tabindex="-1"
    >
      {{ title }}
    </component>
  </div>
</template>
