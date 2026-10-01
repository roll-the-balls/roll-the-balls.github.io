<script setup lang="ts">
// Tracer-каркас shell: grid + view-state + инфо-бар + бокс стола (D-13, D-16).
// Экраны меню вынесены в компоненты (план 01-03); переключение — только
// через ui-стор, без роутера (D-09). Все пользовательские строки — из
// словарей; имя — текстовая интерполяция, никогда v-html (T-03-01).
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import MainMenu from './components/menu/MainMenu.vue'
import ModeSelect from './components/menu/ModeSelect.vue'
import OpponentSelect from './components/menu/OpponentSelect.vue'
import RulesStub from './components/menu/RulesStub.vue'
import SettingsScreen from './components/menu/SettingsScreen.vue'
import StorageBanner from './components/overlays/StorageBanner.vue'
import { useIdentityStore } from './stores/identity'
import { useUiStore } from './stores/ui'

const { t } = useI18n()
const ui = useUiStore()
const identity = useIdentityStore()

// Пустое имя → «Без имени» + подсказка про ID (D-11, UI-SPEC empty E2).
const displayName = computed(() =>
  identity.name.trim() === '' ? t('player.noName') : identity.name,
)

// Кнопка полноэкранного режима на инфо-панели (D-15).
// Полный путь lock('landscape') + overlay-детект — в плане 01-04 (Pattern 5).
async function toggleFullscreen(): Promise<void> {
  try {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await document.documentElement.requestFullscreen()
  } catch {
    // Отказ пользователя/платформы: остаёмся в окне, overlay разберётся в 01-04.
  }
}
</script>

<template>
  <div class="shell">
    <!-- Инфо-бар: всегда видим, даже в меню (D-15). -->
    <header class="info-bar">
      <span class="info-status">{{ $t('info.menu') }} · {{ $t('info.statusReady') }}</span>
      <button
        class="icon-btn"
        type="button"
        :aria-label="$t('settings.title')"
        :title="$t('settings.title')"
        @click="toggleFullscreen"
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

    <!-- Левая панель: игрок всегда слева (D-14). -->
    <aside class="panel panel-left">
      <div class="avatar" aria-hidden="true">{{ displayName.slice(0, 1) }}</div>
      <div class="player-meta">
        <span class="player-name">{{ displayName }}</span>
        <span class="player-id">{{ identity.shortId }}</span>
      </div>
      <span class="player-tag">{{ $t('player.you') }}</span>
    </aside>

    <!-- Центр: экраны меню (view-state, D-09) над боксом стола. -->
    <main class="center">
      <!-- Инлайн-баннер недоступности localStorage: только при флаге (D-08). -->
      <StorageBanner />

      <MainMenu v-if="ui.view === 'main'" />
      <ModeSelect v-else-if="ui.view === 'mode'" />
      <OpponentSelect v-else-if="ui.view === 'opponent'" />
      <SettingsScreen v-else-if="ui.view === 'settings'" />
      <RulesStub v-else />

      <!-- Бокс стола: aspect 2/1, центрирован, UI не перекрывает (D-13, TABLE-03). -->
      <div class="table-wrap">
        <div class="table-box">
          <span class="table-label">{{ $t('table.title') }}</span>
        </div>
      </div>
    </main>

    <!-- Правая панель: гость; в узком ландшафте схлопывается в меню (D-16). -->
    <aside class="panel panel-right">
      <div class="avatar" aria-hidden="true">?</div>
      <div class="player-meta">
        <span class="player-name">{{ $t('player.guest') }}</span>
      </div>
    </aside>

    <!-- Панель действий 64px: слоты под Фазу 3. -->
    <footer class="action-bar">
      <button class="menu-btn is-disabled" type="button" disabled>
        {{ $t('actions.hit') }} <span class="soon">{{ $t('menu.soon') }}</span>
      </button>
    </footer>

    <!-- Портретный overlay: чистая CSS-дисциплина, автозакрытие при повороте (D-15). -->
    <div class="rotate-overlay" role="alert">
      <h2 class="rotate-title">{{ $t('rotate.title') }}</h2>
      <p class="body-text">{{ $t('rotate.body') }}</p>
    </div>
  </div>
</template>

<style scoped>
/* Палитра и 4 текстовых размера строго из UI-SPEC (scoped CSS + CSS-переменные).
   Общие примитивы меню (.menu/.cta/.menu-btn/...) — в assets/main.css:
   scoped-стили внутрь дочерних компонентов не проникают. */
.shell {
  --bg: #0e1113;
  --accent: #e8b34b;
  --danger: #e5484d;
  --text: #f2f4f5;
  --text-dim: #a7b0b7;
  --border: rgba(255, 255, 255, 0.08);
  --text-body: 16px;
  --text-label: 14px;
  --text-heading: 20px;
  --text-display: 28px;
  height: 100dvh;
  display: grid;
  /* Shell grid: боковые панели 240px, центр гибкий; ряды auto 1fr 64px. */
  grid-template-columns: 240px 1fr 240px;
  grid-template-rows: auto 1fr 64px;
  grid-template-areas:
    'info info info'
    'left center right'
    'actions actions actions';
  background: var(--bg);
  color: var(--text);
  font-size: var(--text-body);
}

.info-bar {
  grid-area: info;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 16px;
  background: var(--panel);
  border-bottom: 1px solid var(--border);
}

.info-status {
  font-size: var(--text-label);
  color: var(--text-dim);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.panel {
  background: var(--panel);
  border-right: 1px solid var(--border);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  min-height: 0;
}

.panel-right {
  grid-area: right;
  border-right: none;
  border-left: 1px solid var(--border);
}

.panel-left {
  grid-area: left;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--bg);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-heading);
  font-weight: 600;
}

.player-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  max-width: 100%;
}

.player-name {
  font-weight: 600;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-id,
.player-tag {
  font-size: var(--text-label);
  color: var(--text-dim);
}

.center {
  grid-area: center;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  padding: 16px;
  gap: 16px;
  overflow: hidden;
}

.icon-btn {
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

/* Бокс стола: соотношение 2/1, максимум места с letterbox, центр сегмента. */
.table-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-box {
  aspect-ratio: 2 / 1;
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  background: #0a6c03;
  border: 8px solid #4a2f1b;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Ширина следует из aspect-ratio при ограниченной высоте. */
  margin: auto;
}

.table-label {
  font-size: var(--text-label);
  color: rgba(255, 255, 255, 0.75);
}

.action-bar {
  grid-area: actions;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: var(--panel);
  border-top: 1px solid var(--border);
  padding: 0 16px;
}

.action-bar .menu-btn {
  min-width: 200px;
}

/* Портрет: полноэкранный overlay поверх всего, только альбомный режим. */
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
    gap: 16px;
    background: var(--bg);
    padding: 32px;
    text-align: center;
  }

  .rotate-title {
    font-size: var(--text-display);
    font-weight: 600;
    line-height: 1.2;
    margin: 0;
  }
}

/* Узкий ландшафт 700–1023px: правая панель схлопывается в меню (D-16). */
@media (min-width: 700px) and (max-width: 1023px) {
  .shell {
    grid-template-columns: 200px 1fr;
    grid-template-areas:
      'info info'
      'left center'
      'actions actions';
  }

  .panel-right {
    display: none;
  }
}
</style>
