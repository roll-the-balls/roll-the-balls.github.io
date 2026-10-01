<script setup lang="ts">
// Инфо-бар (D-15): всегда видим, даже в меню; первая строка shell-grid.
// Слоты статусов (фол/ход/бонусы) — каркас под Фазу 3+; кнопка
// полноэкранного режима — пользовательский жест, поэтому здесь
// допустим полный путь ensureLandscape: fullscreen + lock (Pattern 5).
import { useI18n } from 'vue-i18n'
import { toggleFullscreen } from '../../composables/useFullscreen'

const { t } = useI18n()

// Клик по кнопке: выход из полноэкранного или вход + landscape-lock;
// отказ платформы тихо игнорируется (try/catch внутри toggleFullscreen).
function onFullscreenClick(): void {
  void toggleFullscreen()
}
</script>

<template>
  <header class="info-bar">
    <div class="info-statuses">
      <!-- Каркасные слоты статусов: в Фазе 1 — режим и готовность. -->
      <span class="info-status">{{ t('info.menu') }} · {{ t('info.statusReady') }}</span>
      <slot name="statuses" />
    </div>

    <button
      class="icon-btn"
      type="button"
      :aria-label="t('info.fullscreen')"
      :title="t('info.fullscreen')"
      @click="onFullscreenClick"
    >
      <!-- Иконка развёртки: только inline SVG, без внешних ассетов. -->
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
  </header>
</template>

<style scoped>
.info-bar {
  grid-area: info;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: var(--panel);
  border-bottom: 1px solid var(--border);
}

.info-statuses {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  min-width: 0;
}

.info-status {
  font-size: var(--text-label);
  color: var(--text-dim);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Тач-цель ≥44px, акцентный focus-visible (UI-SPEC Interaction). */
.icon-btn {
  min-width: var(--touch-min);
  min-height: var(--touch-min);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: transparent;
  color: var(--text-dim);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
}

.icon-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
</style>
