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
import MenuDialog from './components/dialogs/MenuDialog.vue'
import InfoBar from './components/shell/InfoBar.vue'
import PlayerPanel from './components/shell/PlayerPanel.vue'
import TableSlot from './components/shell/TableSlot.vue'
import RotateOverlay from './components/overlays/RotateOverlay.vue'
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

    <!-- Центр: игровой слой. Стол всегда отрендерен; меню живёт
         в showModal-<dialog> поверх всего экрана (UAT Фазы 1).
         showModal сам делает игровой слой inert (модальность). -->
    <main class="center">
      <!-- Бокс стола: aspect 2/1, центрирован, виден за блюром диалога. -->
      <TableSlot />
    </main>

    <!-- Правая панель: гость; в узком ландшафте скрывается (D-16). -->
    <PlayerPanel side="right" :name="t('player.guest')" />

    <!-- Панель действий 64px: слоты-заглушки под Фазу 3. -->
    <ActionBar />

    <!-- Слой диалога: меню/лобби поверх всего экрана (немодальный <dialog>). -->
    <MenuDialog>
      <MainMenu v-if="ui.view === 'main'" />
      <ModeSelect v-else-if="ui.view === 'mode'" />
      <OpponentSelect v-else-if="ui.view === 'opponent'" />
      <SettingsScreen v-else-if="ui.view === 'settings'" />
      <RulesStub v-else />
    </MenuDialog>

    <!-- Портретный overlay: fixed z-50 поверх диалога (диалог не в top-layer). -->
    <RotateOverlay />
  </div>
</template>
