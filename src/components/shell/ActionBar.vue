<script setup lang="ts">
// Панель действий (D-13): 64px full-width, нижний ряд shell-grid.
// В Фазе 1 — слоты-заглушки под Фазу 3 (слайдер силы, удар, финты):
// видимые disabled-пункты с бейджем «Скоро», без мёртвых кликов (D-10).
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <footer class="action-bar">
    <!-- Слот слайдера силы: Фаза 3 заменит заглушку рабочим контролом. -->
    <slot name="power">
      <button class="menu-btn is-disabled action-stub" type="button" disabled>
        {{ t('actions.power') }} <span class="soon">{{ t('menu.soon') }}</span>
      </button>
    </slot>

    <!-- Слот удара: Фаза 3 подключит обработку жеста. -->
    <slot name="hit">
      <button class="menu-btn is-disabled action-stub" type="button" disabled>
        {{ t('actions.hit') }} <span class="soon">{{ t('menu.soon') }}</span>
      </button>
    </slot>

    <!-- Слот финтов (спин/накат/оттяжка): Фаза 3. -->
    <slot name="finesse">
      <button class="menu-btn is-disabled action-stub" type="button" disabled>
        {{ t('actions.finesse') }} <span class="soon">{{ t('menu.soon') }}</span>
      </button>
    </slot>
  </footer>
</template>

<style scoped>
/* Высота ряда 64px задана grid-треком в shell.css; здесь — наполнение. */
.action-bar {
  grid-area: actions;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  background: var(--panel);
  border-top: 1px solid var(--border);
  padding: 0 var(--space-md);
}

.action-stub {
  min-width: 200px;
}
</style>
