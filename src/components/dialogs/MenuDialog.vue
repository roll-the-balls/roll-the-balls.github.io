<script setup lang="ts">
// Модальный слой меню (решение пользователя из UAT Фазы 1): настоящий
// нативный <dialog> через showModal() на весь экран. Два слоя приложения:
// диалог (меню, статистика, лобби) и основной (игра). Будущие лобби
// Фаз 4/7 и статистика Фазы 6 монтируются в этот же диалог через слот.
// Кнопка fullscreen дублирует кнопку инфо-бара (тот же toggleFullscreen).
// Esc заблокирован: за диалогом нет игрового слоя, ронять его некуда.
//
// ВАЖНО (whatwg/fullscreen#227): в Chrome/Safari
// documentElement.requestFullscreen() кладёт корень в top-layer ПОВЕРХ
// showModal-диалога — меню гаснет, страница inert. Порядок top-layer =
// порядок вставки, поэтому на каждое изменение fullscreen диалог
// закрывается и открывается заново, вставая выше (порядок восстанавливается
// и при выходе). Проверено пользователем через консоль до автоматизации.
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { toggleFullscreen } from '../../composables/useFullscreen'
import { useUiStore } from '../../stores/ui'
import RotateOverlay from '../overlays/RotateOverlay.vue'
import StorageBanner from '../overlays/StorageBanner.vue'
import { MENU_DIALOG_VIEWS } from './menuDialogViews'

const { t } = useI18n()
const ui = useUiStore()
const dlg = useTemplateRef<HTMLDialogElement>('dlg')

function openDialog(): void {
  const el = dlg.value
  // showModal на открытом диалоге бросает InvalidStateError — guard обязателен.
  if (el && !el.open) {
    try {
      el.showModal()
    } catch {
      // Гонка открытий: диалог уже открыт, делать нечего.
    }
  }
}

function syncDialog(): void {
  if (MENU_DIALOG_VIEWS.has(ui.view)) openDialog()
  else dlg.value?.close() // close на закрытом — тихий no-op.
}

// Переоткрытие при входе/выходе из fullscreen: ставит диалог в top-layer
// выше fullscreen-корня. Без жеста пользователя работает (showModal,
// в отличие от requestFullscreen, transient activation не требует).
function onFullscreenChange(): void {
  if (!dlg.value?.open) return
  dlg.value.close()
  openDialog()
}

// Esc (событие cancel) не должен закрывать меню: за ним пустота, а не игра.
// Биндинг декларативный (@cancel в шаблоне), а не через addEventListener.
function blockCancel(event: Event): void {
  event.preventDefault()
}

// Страховка: если диалог всё же закрылся (Esc в экзотическом браузере,
// сторонний close) — немедленно переоткрыть, пока вид относится к меню.
// Рекурсии нет: showModal событие close не порождает; при игровом виде
// условие ложно и переоткрытия нет.
function onDialogClose(): void {
  if (MENU_DIALOG_VIEWS.has(ui.view)) openDialog()
}

onMounted(() => {
  document.addEventListener('fullscreenchange', onFullscreenChange)
  syncDialog()
})
onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
})

watch(
  () => ui.view,
  () => syncDialog(),
)
</script>

<template>
  <dialog
    ref="dlg"
    class="menu-dialog"
    :aria-label="t('app.title')"
    @cancel="blockCancel"
    @close="onDialogClose"
  >
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
    <!-- Overlay поворота в слое диалога: showModal-диалог в top-layer
         поверх всего, включая standalone RotateOverlay игрового слоя. -->
    <RotateOverlay />
  </dialog>
</template>

<style scoped>
/* Центрирование явное: UA ставит диалогу margin: auto, но глобальный
   reset *{margin:0} из base.css его убивает — без этой строки диалог
   липнет влево по fit-content. Позиционирование — UA (absolute + inset). */
.menu-dialog {
  margin: auto;
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
