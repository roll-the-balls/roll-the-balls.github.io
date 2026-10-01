<script setup lang="ts">
// Витрина соперников Фазы 1 (MENU-01, D-10): ИИ — Фаза 5, второй игрок
// локально — Фаза 3, сеть — Фаза 7. До этого disabled + бейдж «Скоро».
import { useI18n } from 'vue-i18n'
import { useUiStore } from '../../stores/ui'
import MenuHeader from './MenuHeader.vue'

const { t } = useI18n()
const ui = useUiStore()
</script>

<template>
  <section class="menu" :aria-label="t('opponent.title')">
    <MenuHeader :title="t('opponent.title')" @back="ui.go('main')" />

    <div class="menu-scroll">
    <button class="menu-btn is-disabled" type="button" disabled>
      <!-- Иконка компьютера (чип): inline SVG. -->
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="5" y="5" width="10" height="10" rx="1.5" stroke="currentColor" stroke-width="1.5" />
        <path
          d="M8 2v3m4-3v3M8 15v3m4-3v3M2 8h3m-3 4h3m9-4h3m-3 4h3"
          stroke="currentColor"
          stroke-width="1.4"
          stroke-linecap="round"
        />
      </svg>
      {{ t('opponent.ai') }} <span class="soon">{{ t('menu.soon') }}</span>
    </button>

    <button class="menu-btn is-disabled" type="button" disabled>
      <!-- Иконка двух игроков: inline SVG. -->
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="2.6" stroke="currentColor" stroke-width="1.5" />
        <circle cx="13.5" cy="8" r="2.1" stroke="currentColor" stroke-width="1.4" />
        <path
          d="M2.8 16c.5-2.4 2.1-3.7 4.2-3.7S10.7 13.6 11.2 16m2-3.4c1.7 0 3.2.9 3.9 2.8"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
      {{ t('opponent.local') }} <span class="soon">{{ t('menu.soon') }}</span>
    </button>

    <button class="menu-btn is-disabled" type="button" disabled>
      <!-- Иконка сети (глобус): inline SVG. -->
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="7.2" stroke="currentColor" stroke-width="1.5" />
        <path d="M2.8 10h14.4M10 2.8c2 2 3 4.4 3 7.2s-1 5.2-3 7.2c-2-2-3-4.4-3-7.2s1-5.2 3-7.2Z" stroke="currentColor" stroke-width="1.3" />
      </svg>
      {{ t('opponent.remote') }} <span class="soon">{{ t('menu.soon') }}</span>
    </button>
    </div>
  </section>
</template>
