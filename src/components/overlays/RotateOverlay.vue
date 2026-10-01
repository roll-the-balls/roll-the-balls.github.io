<script setup lang="ts">
// Портретный overlay (D-15, T-04-02, Layout Contract UI-SPEC):
// полноэкранный слой «Поверните устройство» поверх всего UI.
// Автозакрытие при повороте: isPortrait из useOrientation реактивен —
// overlay исчезает сам, без таймеров и ручных dismiss-кнопок.
// На iPhone это основной путь (lock недоступен), не исключение.
import { useI18n } from 'vue-i18n'
import { useOrientation } from '../../composables/useOrientation'

const { t } = useI18n()
const { isPortrait } = useOrientation()
</script>

<template>
  <div v-if="isPortrait" class="rotate-overlay" role="alert">
    <!-- Иконка поворота устройства: только inline SVG. -->
    <svg
      class="rotate-icon"
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="20"
        y="8"
        width="24"
        height="48"
        rx="3"
        stroke="currentColor"
        stroke-width="3"
      />
      <path
        d="M10 40a22 22 0 0 0 22 16M54 24A22 22 0 0 0 32 8"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />
      <path
        d="M50 6.5 56.5 10 50 13.5M14 50.5 7.5 54l6.5 3.5"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>

    <!-- Display-заголовок 28px/600 — единственное место кроме app-title (UI-SPEC). -->
    <h2 class="rotate-title">{{ t('rotate.title') }}</h2>
    <p class="body-text rotate-body">{{ t('rotate.body') }}</p>
  </div>
</template>

<style scoped>
/* Полноэкранный слой поверх всех регионов shell: портрет блокируется. */
.rotate-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  background-color: var(--bg);
  background-image: var(--bg-image);
  padding: var(--space-xl);
  text-align: center;
}

.rotate-icon {
  color: var(--accent);
}

.rotate-title {
  font-size: var(--text-display);
  font-weight: var(--weight-semibold);
  line-height: 1.2;
  margin: 0;
}

.rotate-body {
  color: var(--text-dim);
}
</style>
