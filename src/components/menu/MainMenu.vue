<script setup lang="ts">
// Главное меню (MENU-01, D-10): единственная amber-CTA «Играть»,
// пункты Режим/Соперник/Настройки; неготовое — disabled + бейдж «Скоро»,
// без мёртвых кликов. Штамп версии — в слоте stamp (детектор base, D-16).
import { useI18n } from 'vue-i18n'
import { useUiStore } from '../../stores/ui'
import MenuHeader from './MenuHeader.vue'

const { t } = useI18n()
const ui = useUiStore()

// Глобальные константы сборки из define в vite.config.ts (штамп версии, D-16).
const version = __APP_VERSION__
const buildDate = __BUILD_DATE__
// Хеш коммита: диагностика, какой именно билд открыт (рассинхрон SW-кеша).
const commit = __COMMIT__
</script>

<template>
  <nav class="menu" :aria-label="t('app.title')">
    <MenuHeader :title="t('app.title')" :show-back="false" level="h1" />

    <div class="menu-scroll">
    <!-- Единственная amber-кнопка приложения: ведёт на выбор режима (D-10). -->
    <button class="cta" type="button" @click="ui.go('mode')">
      <!-- Иконка кия: только inline SVG. -->
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M4 16 15 5m1.5-1.5L18 2l-1.5 1.5M4 16l1.2-3.8L14.7 3l2.3 2.3-9.2 9.5L4 16Z"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      {{ t('menu.play') }}
    </button>

    <button class="menu-btn" type="button" @click="ui.go('mode')">{{ t('menu.mode') }}</button>
    <button class="menu-btn" type="button" @click="ui.go('opponent')">
      {{ t('menu.opponent') }}
    </button>
    <button class="menu-btn" type="button" @click="ui.go('settings')">
      {{ t('menu.settings') }}
    </button>

    <!-- Правила режимов ещё не реализованы: видимый disabled-пункт с бейджем (D-10). -->
    <button class="menu-btn is-disabled" type="button" disabled>
      {{ t('menu.rules') }} <span class="soon">{{ t('menu.soon') }}</span>
    </button>

    <!-- Гость в узком ландшафте: правая панель схлопнута в меню (D-16) —
         видна только в диапазоне 700–1023px (класс narrow-only). -->
    <p class="guest-line narrow-only">
      <span class="avatar-xs" aria-hidden="true">{{ t('player.guest').slice(0, 1) }}</span>
      {{ t('player.guest') }}
    </p>

    <!-- Слот штампа версии: по умолчанию локализованная подпись v{версия} · {дата}. -->
    <slot name="stamp">
      <span class="version-stamp">
        {{ t('app.versionLabel', { version, date: buildDate }) }} · {{ commit }}
      </span>
    </slot>
    </div>
  </nav>
</template>
