<script setup lang="ts">
// Заглушка экрана правил (view 'rules'): наполнение — в фазах режимов.
// Путь из меню в Фазе 1 — disabled + «Скоро»; экран доступен через ui.go('rules', …).
import { useI18n } from 'vue-i18n'
import { useUiStore } from '../../stores/ui'

const { t } = useI18n()
const ui = useUiStore()
</script>

<template>
  <section class="menu" :aria-label="t('rules.title')">
    <h2 class="heading">{{ t('rules.title') }}</h2>
    <p class="body-text">{{ t('rules.stub') }}</p>
    <button class="menu-btn" type="button" @click="ui.go('main')">
      <!-- Иконка «назад»: inline SVG. -->
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M12 4 6 10l6 6"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      {{ t('menu.back') }}
    </button>
  </section>
</template>
