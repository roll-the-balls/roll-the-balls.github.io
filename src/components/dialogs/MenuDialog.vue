<script setup lang="ts">
// Модальный диалог меню поверх стола (решение пользователя из UAT Фазы 1):
// меню и будущие лобби живут в этом диалоге, стол виден за блюром backdrop.
// Кнопка fullscreen дублирует кнопку инфо-бара (тот же toggleFullscreen).
// Лобби Фаз 4/7 переиспользует этот же диалог через слот контента.
import { useI18n } from 'vue-i18n'
import { toggleFullscreen } from '../../composables/useFullscreen'

const { t } = useI18n()

// Клик: выход из полноэкранного или вход + landscape-lock;
// отказ платформы тихо игнорируется внутри toggleFullscreen.
function onFullscreenClick(): void {
  void toggleFullscreen()
}
</script>

<template>
  <div class="menu-dialog-backdrop">
    <div
      class="menu-dialog"
      role="dialog"
      aria-modal="true"
      :aria-label="t('app.title')"
    >
      <button
        class="dialog-fullscreen"
        type="button"
        :aria-label="t('info.fullscreen')"
        :title="t('info.fullscreen')"
        @click="onFullscreenClick"
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
      <slot />
    </div>
  </div>
</template>

<style scoped>
.menu-dialog-backdrop {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
  /* Затемнение + блюр стола под диалогом; сам стол интерактивен с Фазы 3. */
  background: rgba(0, 0, 0, 0.55);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

.menu-dialog {
  position: relative;
  width: min(560px, 100%);
  max-height: 100%;
  overflow-y: auto;
  background: var(--panel);
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
