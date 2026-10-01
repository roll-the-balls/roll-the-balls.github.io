<script setup lang="ts">
// Панель игрока (D-13, D-14): имя + аватар-заглушка. Левый экземпляр —
// всегда локальный игрок; правый — слот гостя (в узком ландшафте скрыт).
// Имя рендерится только текстовой интерполяцией, никогда v-html (T-03-01).
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Отображаемое имя (пустое → «Без имени» на стороне родителя). */
    name: string
    /** Подпись под именем: короткий ID или подсказка гостя. */
    sub?: string
    /** Маркер «Вы» для локального игрока. */
    tag?: string
    /** Сторона shell-grid: left — локальный игрок, right — гость. */
    side?: 'left' | 'right'
  }>(),
  { sub: '', tag: '', side: 'left' },
)

// Аватар-заглушка: первая буква имени; для пустого/гостевого — «?».
const initial = computed(() => {
  const trimmed = props.name.trim()
  return trimmed === '' ? '?' : trimmed.slice(0, 1).toUpperCase()
})
</script>

<template>
  <aside class="panel" :class="side === 'right' ? 'panel-right' : 'panel-left'">
    <div class="avatar" aria-hidden="true">{{ initial }}</div>
    <div class="player-meta">
      <span class="player-name allow-select">{{ name }}</span>
      <span v-if="sub !== ''" class="player-id allow-select">{{ sub }}</span>
    </div>
    <span v-if="tag !== ''" class="player-tag">{{ tag }}</span>
  </aside>
</template>

<style scoped>
.panel {
  background: var(--panel);
  border-right: 1px solid var(--border);
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  align-items: center;
  min-height: 0;
}

.panel-left {
  grid-area: left;
}

.panel-right {
  grid-area: right;
  border-right: none;
  border-left: 1px solid var(--border);
}

.avatar {
  width: var(--space-2xl);
  height: var(--space-2xl);
  border-radius: 50%;
  background: var(--bg);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-heading);
  font-weight: var(--weight-semibold);
}

.player-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  max-width: 100%;
}

/* Длинное имя — однострочный ellipsis (D-11, long-text E2). */
.player-name {
  font-weight: var(--weight-semibold);
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
</style>
