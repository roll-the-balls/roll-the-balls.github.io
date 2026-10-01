<script setup lang="ts">
// Tracer-каркас shell: grid + view-state + инфо-бар + бокс стола (D-13, D-16).
// Все пользовательские строки — только из словарей; имя — текстовой
// интерполяцией, никогда v-html (T-02-01).
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useIdentityStore } from './stores/identity'
import { storageUnavailable } from './stores/persist'
import { useSettingsStore } from './stores/settings'
import { useUiStore } from './stores/ui'

const { t } = useI18n()
const ui = useUiStore()
const settings = useSettingsStore()
const identity = useIdentityStore()

// Пустое имя → «Без имени» + подсказка про ID (D-11, UI-SPEC empty E2).
const displayName = computed(() =>
  identity.name.trim() === '' ? t('player.noName') : identity.name,
)

// Штамп версии справа внизу меню: детектор корректного base (D-16, D-02).
const versionStamp = `v${__APP_VERSION__} · ${__BUILD_DATE__}`

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

    <!-- Центр: меню-экраны (view-state) или бокс стола. -->
    <main class="center">
      <!-- Инлайн-баннер недоступности localStorage (D-08, UI-SPEC error E6). -->
      <p v-if="storageUnavailable" class="storage-banner">{{ $t('storage.unavailable') }}</p>

      <nav v-if="ui.view === 'main'" class="menu" :aria-label="$t('app.title')">
        <h1 class="app-title">{{ $t('app.title') }}</h1>
        <button class="cta" type="button" @click="ui.go('mode')">{{ $t('menu.play') }}</button>
        <button class="menu-btn" type="button" @click="ui.go('mode')">{{ $t('menu.mode') }}</button>
        <button class="menu-btn" type="button" @click="ui.go('opponent')">
          {{ $t('menu.opponent') }}
        </button>
        <button class="menu-btn" type="button" @click="ui.go('settings')">
          {{ $t('menu.settings') }}
        </button>
        <button class="menu-btn" type="button" @click="ui.go('rules', 'main')">
          {{ $t('menu.rules') }}
        </button>
        <span class="version-stamp">{{ versionStamp }}</span>
      </nav>

      <section v-else-if="ui.view === 'mode'" class="menu">
        <h2 class="heading">{{ $t('mode.title') }}</h2>
        <button class="menu-btn is-disabled" type="button" disabled>
          {{ $t('mode.arcade') }} <span class="soon">{{ $t('menu.soon') }}</span>
        </button>
        <button class="menu-btn is-disabled" type="button" disabled>
          {{ $t('mode.eight') }} <span class="soon">{{ $t('menu.soon') }}</span>
        </button>
        <button class="menu-btn" type="button" @click="ui.go('main')">
          {{ $t('menu.back') }}
        </button>
      </section>

      <section v-else-if="ui.view === 'opponent'" class="menu">
        <h2 class="heading">{{ $t('opponent.title') }}</h2>
        <button class="menu-btn is-disabled" type="button" disabled>
          {{ $t('opponent.ai') }} <span class="soon">{{ $t('menu.soon') }}</span>
        </button>
        <button class="menu-btn is-disabled" type="button" disabled>
          {{ $t('opponent.local') }} <span class="soon">{{ $t('menu.soon') }}</span>
        </button>
        <button class="menu-btn is-disabled" type="button" disabled>
          {{ $t('opponent.remote') }} <span class="soon">{{ $t('menu.soon') }}</span>
        </button>
        <button class="menu-btn" type="button" @click="ui.go('main')">
          {{ $t('menu.back') }}
        </button>
      </section>

      <section v-else-if="ui.view === 'settings'" class="menu">
        <h2 class="heading">{{ $t('settings.title') }}</h2>
        <label class="settings-row">
          <span class="label">{{ $t('player.nameLabel') }}</span>
          <input
            v-model="identity.name"
            class="text-input"
            type="text"
            maxlength="24"
            :placeholder="$t('player.noName')"
          />
        </label>
        <p class="hint">{{ $t('player.nameHint') }} {{ identity.shortId }}</p>
        <label class="settings-row">
          <span class="label">{{ $t('settings.music') }}</span>
          <input v-model="settings.music" class="check" type="checkbox" />
        </label>
        <label class="settings-row">
          <span class="label">{{ $t('settings.sounds') }}</span>
          <input v-model="settings.sounds" class="check" type="checkbox" />
        </label>
        <div class="settings-row">
          <span class="label">{{ $t('settings.language') }}</span>
          <div class="segment" role="group" :aria-label="$t('settings.language')">
            <button
              class="segment-btn"
              type="button"
              :class="{ 'is-active': settings.locale === 'ru' }"
              @click="settings.locale = 'ru'"
            >
              RU
            </button>
            <button
              class="segment-btn"
              type="button"
              :class="{ 'is-active': settings.locale === 'en' }"
              @click="settings.locale = 'en'"
            >
              EN
            </button>
          </div>
        </div>
        <div class="settings-row">
          <span class="label">{{ $t('settings.theme') }}</span>
          <div class="segment" role="group" :aria-label="$t('settings.theme')">
            <button
              class="segment-btn"
              type="button"
              :class="{ 'is-active': settings.theme === 'dark' }"
              @click="settings.theme = 'dark'"
            >
              {{ $t('settings.themeDark') }}
            </button>
            <button
              class="segment-btn"
              type="button"
              :class="{ 'is-active': settings.theme === 'felt' }"
              @click="settings.theme = 'felt'"
            >
              {{ $t('settings.themeFelt') }}
            </button>
          </div>
        </div>
        <button class="menu-btn" type="button" @click="ui.go('main')">
          {{ $t('menu.back') }}
        </button>
      </section>

      <section v-else class="menu">
        <h2 class="heading">{{ $t('rules.title') }}</h2>
        <p class="body-text">{{ $t('rules.stub') }}</p>
        <button class="menu-btn" type="button" @click="ui.go('main')">
          {{ $t('menu.back') }}
        </button>
      </section>

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
/* Палитра и 4 текстовых размера строго из UI-SPEC (scoped CSS + CSS-переменные). */
.shell {
  --bg: #0e1113;
  --panel: #1b2126;
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

.menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 560px;
  width: 100%;
  margin: 0 auto;
  /* Меню-колонка скроллится внутри; стол и бары не сжимаются. */
  overflow-y: auto;
  flex-shrink: 0;
  max-height: 55%;
}

.app-title {
  font-size: var(--text-display);
  font-weight: 600;
  line-height: 1.2;
  margin: 0;
}

.heading {
  font-size: var(--text-heading);
  font-weight: 600;
  line-height: 1.2;
  margin: 0;
}

.body-text {
  font-size: var(--text-body);
  line-height: 1.5;
  margin: 0;
}

.cta {
  min-height: 44px;
  background: var(--accent);
  color: #0e1113;
  border: none;
  border-radius: 8px;
  font-size: var(--text-body);
  font-weight: 600;
  cursor: pointer;
}

.menu-btn {
  min-height: 44px;
  background: var(--panel);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: var(--text-body);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.menu-btn:focus-visible,
.cta:focus-visible,
.icon-btn:focus-visible,
.segment-btn:focus-visible,
.check:focus-visible,
.text-input:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.menu-btn.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.soon {
  font-size: var(--text-label);
  color: var(--accent);
  border: 1px solid var(--accent);
  border-radius: 4px;
  padding: 0 4px;
}

.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 44px;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 16px;
}

.label {
  font-size: var(--text-label);
}

.hint {
  font-size: var(--text-label);
  color: var(--text-dim);
  margin: 0;
}

.text-input {
  min-height: 44px;
  max-width: 200px;
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0 8px;
  font-size: var(--text-body);
  overflow: hidden;
  text-overflow: ellipsis;
}

.check {
  width: 24px;
  height: 24px;
  accent-color: var(--accent);
}

.segment {
  display: flex;
  gap: 4px;
}

.segment-btn {
  min-height: 44px;
  min-width: 44px;
  padding: 0 16px;
  background: var(--bg);
  color: var(--text-dim);
  border: 1px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
}

.segment-btn.is-active {
  color: #0e1113;
  background: var(--accent);
  border-color: var(--accent);
  font-weight: 600;
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

.storage-banner {
  background: var(--panel);
  border: 1px solid var(--danger);
  border-radius: 8px;
  padding: 8px 16px;
  font-size: var(--text-label);
  margin: 0;
  flex-shrink: 0;
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

.version-stamp {
  align-self: flex-end;
  font-size: var(--text-label);
  color: var(--text-dim);
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
