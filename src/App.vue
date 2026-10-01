<script setup lang="ts">
// Shell-каркас (D-13, D-14, D-15, D-16): grid-раскладка из shell.css,
// регионы — компоненты shell/ (инфо-бар, панели игроков, бокс стола,
// панель действий). Экраны меню (план 01-03) переключаются внутри
// центральной колонки только через ui-стор, без роутера (D-09).
// Все пользовательские строки — из словарей; имя — текстовая
// интерполяция, никогда v-html (T-03-01).
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import MainMenu from './components/menu/MainMenu.vue'
import ModeSelect from './components/menu/ModeSelect.vue'
import OpponentSelect from './components/menu/OpponentSelect.vue'
import RulesStub from './components/menu/RulesStub.vue'
import SettingsScreen from './components/menu/SettingsScreen.vue'
import ActionBar from './components/shell/ActionBar.vue'
import InfoBar from './components/shell/InfoBar.vue'
import PlayerPanel from './components/shell/PlayerPanel.vue'
import TableSlot from './components/shell/TableSlot.vue'
import StorageBanner from './components/overlays/StorageBanner.vue'
import { useIdentityStore } from './stores/identity'
import { useUiStore } from './stores/ui'

const { t } = useI18n()
const ui = useUiStore()
const identity = useIdentityStore()

// Пустое имя → «Без имени» (D-11, UI-SPEC empty E2).
const displayName = computed(() =>
  identity.name.trim() === '' ? t('player.noName') : identity.name,
)
</script>

<template>
  <div class="shell">
    <!-- Инфо-бар: всегда в первой строке, даже в меню (D-15). -->
    <InfoBar />

    <!-- Левая панель: игрок всегда слева (D-14). -->
    <PlayerPanel
      side="left"
      :name="displayName"
      :sub="identity.shortId"
      :tag="t('player.you')"
    />

    <!-- Центр: экраны меню (view-state, D-09) над боксом стола. -->
    <main class="center">
      <!-- Инлайн-баннер недоступности localStorage: только при флаге (D-08). -->
      <StorageBanner />

      <MainMenu v-if="ui.view === 'main'" />
      <ModeSelect v-else-if="ui.view === 'mode'" />
      <OpponentSelect v-else-if="ui.view === 'opponent'" />
      <SettingsScreen v-else-if="ui.view === 'settings'" />
      <RulesStub v-else />

      <!-- Бокс стола: aspect 2/1, центрирован, UI не перекрывает (TABLE-03). -->
      <TableSlot />
    </main>

    <!-- Правая панель: гость; в узком ландшафте скрывается (D-16). -->
    <PlayerPanel side="right" :name="t('player.guest')" />

    <!-- Панель действий 64px: слоты-заглушки под Фазу 3. -->
    <ActionBar />

    <!-- Портретный overlay: чистая CSS-дисциплина (задача 2 заменит
         на компонент RotateOverlay с автозакрытием при повороте). -->
    <div class="rotate-overlay" role="alert">
      <h2 class="rotate-title">{{ t('rotate.title') }}</h2>
      <p class="body-text">{{ t('rotate.body') }}</p>
    </div>
  </div>
</template>

<style scoped>
/* Портрет: полноэкранный overlay поверх всего — только альбомный режим. */
.rotate-overlay {
  display: none;
}

@media (orientation: portrait) {
  .rotate-overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-md);
    background: var(--bg);
    padding: var(--space-xl);
    text-align: center;
  }

  .rotate-title {
    font-size: var(--text-display);
    font-weight: var(--weight-semibold);
    line-height: 1.2;
    margin: 0;
  }
}
</style>
