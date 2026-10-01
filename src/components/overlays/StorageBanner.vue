<script setup lang="ts">
// Инлайн-баннер недоступного хранилища (D-08, Pitfall 7): рендерится
// только при выставленном флаге storageUnavailable (private mode/квота).
// Приложение продолжает работать in-memory.
import { useI18n } from 'vue-i18n'
import { storageUnavailable } from '../../stores/persist'

const { t } = useI18n()
</script>

<template>
  <p v-if="storageUnavailable" class="storage-banner" role="status">
    <!-- Иконка предупреждения: inline SVG. -->
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 3 2.5 16.5h15L10 3Zm0 4.5v4.2m0 2.3v.5"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    {{ t('storage.unavailable') }}
  </p>
</template>

<style scoped>
.storage-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--panel);
  color: var(--text);
  border: 1px solid var(--danger);
  border-radius: 8px;
  padding: 8px 16px;
  font-size: var(--text-label);
  margin: 0;
  flex-shrink: 0;
}
</style>
