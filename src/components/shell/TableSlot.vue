<script setup lang="ts">
// Бокс стола (D-13, TABLE-02/03): зарезервированная всегда целая область
// aspect-ratio 2/1, fit-contain letterbox, центрирован в своём сегменте.
// UI никогда не перекрывает стол: никаких absolutely/fixed-слоёв поверх —
// только обычный поток внутри grid-трека (Layout Contract UI-SPEC).
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="table-wrap">
    <div class="table-box">
      <!-- Фаза 2 заменит подпись canvas-рендером сукна и шаров. -->
      <span class="table-label">{{ t('table.title') }}</span>
    </div>
  </div>
</template>

<style scoped>
/* Обёртка занимает остаток центрального сегмента и центрирует бокс. */
.table-wrap {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Соотношение 2/1: ширина следует из ограниченной высоты (letterbox). */
.table-box {
  aspect-ratio: 2 / 1;
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  margin: auto;
  background: #0a6c03;
  border: 8px solid #4a2f1b;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-label {
  font-size: var(--text-label);
  color: rgba(255, 255, 255, 0.75);
}
</style>
