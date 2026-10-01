<script setup lang="ts">
// Витрина режимов Фазы 1 (MENU-01, D-10): аркада и восьмёрка появятся
// в Фазе 4 — до этого disabled + бейдж «Скоро», без мёртвых кликов.
import { useI18n } from 'vue-i18n'
import { useUiStore } from '../../stores/ui'

const { t } = useI18n()
const ui = useUiStore()
</script>

<template>
  <section class="menu" :aria-label="t('mode.title')">
    <h2 class="heading">{{ t('mode.title') }}</h2>

    <button class="menu-btn is-disabled" type="button" disabled>
      <!-- Иконка аркады (молния): inline SVG. -->
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M11 2 4 11h5l-1 7 8-10h-5l1-6Z"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linejoin="round"
        />
      </svg>
      {{ t('mode.arcade') }} <span class="soon">{{ t('menu.soon') }}</span>
    </button>

    <button class="menu-btn is-disabled" type="button" disabled>
      <!-- Иконка восьмёрки (шар с восьмёркой): inline SVG. -->
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="7.2" stroke="currentColor" stroke-width="1.5" />
        <circle cx="10" cy="10" r="3.4" stroke="currentColor" stroke-width="1.2" />
      </svg>
      {{ t('mode.eight') }} <span class="soon">{{ t('menu.soon') }}</span>
    </button>

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
