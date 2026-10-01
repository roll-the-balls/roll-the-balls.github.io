<script setup lang="ts">
// Модальный слой меню (решение пользователя из UAT Фазы 1): настоящий
// нативный <dialog> на весь экран. Два слоя приложения: диалог
// (меню, статистика, лобби) и основной (игра). Будущие лобби Фаз 4/7
// и статистика Фазы 6 монтируются в этот же диалог через слот.
// Кнопка fullscreen дублирует кнопку инфо-бара (тот же toggleFullscreen).
//
// ВАЖНО: диалог НЕМОДАЛЬНЫЙ (атрибут open, без showModal) — осознанно.
// По whatwg/fullscreen#227 в Chrome/Safari documentElement.requestFullscreen()
// кладёт корень в top-layer поверх showModal-диалога: меню гаснет и страница
// становится inert до выхода из fullscreen. Немодальный fixed-диалог —
// потомок корня, поэтому переживает fullscreen и виден в нём.
// Модальность поведения даёт inert игрового слоя (выставляет App.vue).
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { toggleFullscreen } from '../../composables/useFullscreen'
import { useUiStore } from '../../stores/ui'
import StorageBanner from '../overlays/StorageBanner.vue'
import { MENU_DIALOG_VIEWS } from './menuDialogViews'

const { t } = useI18n()
const ui = useUiStore()

const isOpen = computed(() => MENU_DIALOG_VIEWS.has(ui.view))
</script>

<template>
  <dialog class="menu-dialog" :open="isOpen" :aria-label="t('app.title')">
    <div class="menu-dialog-card">
      <button
        class="dialog-fullscreen"
        type="button"
        :aria-label="t('info.fullscreen')"
        :title="t('info.fullscreen')"
        @click="void toggleFullscreen()"
      >
        <!-- Та же иконка развёртки, что в инфо-баре (только inline SVG). -->
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M3 7V3h4M17 13v4h-4M3 3l5 5M17 17l-5-5"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <!-- Баннер недоступности хранилища: в слое диалога (D-08). -->
      <StorageBanner />
      <slot />
    </div>
  </dialog>
</template>

<style scoped>
/* Лист на весь экран: flex-центрирование карточки, без зависимости
   от UA-центрирования диалога. position: fixed — потомок корня,
   поэтому виден и в fullscreen-режиме документа. */
.menu-dialog {
  position: fixed;
  inset: 0;
  z-index: 30;
  margin: 0;
  padding: var(--space-md);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: rgba(0, 0, 0, 0.55);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

/* Скрытый диалог (open=false) не должен занимать место/перехватывать клики. */
.menu-dialog:not([open]) {
  display: none;
}

.menu-dialog-card {
  position: relative;
  width: min(560px, 100%);
  max-height: 100%;
  overflow-y: auto;
  background: var(--panel);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: var(--space-lg) var(--space-md) var(--space-md);
}

/* Тач-цель ≥44px, как у кнопки инфо-бара (UI-SPEC Interaction). */
.dialog-fullscreen {
  position: absolute;
  top: var(--space-sm);
  right: var(--space-sm);
  min-width: var(--touch-min);
  min-height: var(--touch-min);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--text-dim);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
}

.dialog-fullscreen:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
</style>
