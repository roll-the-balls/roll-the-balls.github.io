<script setup lang="ts">
// Модальный слой меню (решение пользователя из UAT Фазы 1): настоящий
// нативный <dialog> через showModal() на весь экран. Два слоя приложения:
// диалог (меню, статистика, лобби) и основной (игра). Будущие лобби
// Фаз 4/7 и статистика Фазы 6 монтируются в этот же диалог через слот.
// Кнопка fullscreen дублирует кнопку инфо-бара (тот же toggleFullscreen).
// Esc заблокирован: за диалогом нет игрового слоя, ронять его некуда.
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toggleFullscreen } from '../../composables/useFullscreen'
import { useUiStore } from '../../stores/ui'
import RotateOverlay from '../overlays/RotateOverlay.vue'
import StorageBanner from '../overlays/StorageBanner.vue'

const { t } = useI18n()
const ui = useUiStore()
const dlg = useTemplateRef<HTMLDialogElement>('dlg')

// Виды, живущие в диалоге. Игровой вид (Фаза 3+) сюда не входит:
// при нём диалог закрыт и виден только игровой слой.
const DIALOG_VIEWS = new Set(['main', 'mode', 'opponent', 'settings', 'rules'])

function syncDialog(): void {
  const el = dlg.value
  if (!el) return
  const wantOpen = DIALOG_VIEWS.has(ui.view)
  // showModal на открытом диалоге бросает InvalidStateError — guard обязателен.
  if (wantOpen && !el.open) el.showModal()
  else if (!wantOpen && el.open) el.close()
}

// Esc (событие cancel) не должен закрывать меню: за ним пустота, а не игра.
function blockCancel(event: Event): void {
  event.preventDefault()
}

onMounted(() => {
  dlg.value?.addEventListener('cancel', blockCancel)
  syncDialog()
})
onBeforeUnmount(() => {
  dlg.value?.removeEventListener('cancel', blockCancel)
})

watch(
  () => ui.view,
  () => syncDialog(),
)
</script>

<template>
  <dialog ref="dlg" class="menu-dialog" :aria-label="t('app.title')">
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
    <!-- Баннер недоступности хранилища: в слое диалога, иначе скрыт за backdrop. -->
    <StorageBanner />
    <slot />
    <!-- Overlay поворота в слое диалога: showModal кладёт диалог в top-layer
         поверх всего, включая standalone RotateOverlay игрового слоя. -->
    <RotateOverlay />
  </dialog>
</template>

<style scoped>
/* Нативный диалог центрируется сам (UA margin: auto); весь экран
   перекрывает ::backdrop, сама карточка — 560px по ширине меню-колонки. */
.menu-dialog {
  width: min(560px, calc(100vw - 32px));
  max-height: calc(100dvh - 64px);
  overflow-y: auto;
  background: var(--panel);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: var(--space-lg) var(--space-md) var(--space-md);
}

.menu-dialog::backdrop {
  background: rgba(0, 0, 0, 0.55);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
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
