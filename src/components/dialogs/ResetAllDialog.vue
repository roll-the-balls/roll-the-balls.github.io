<script setup lang="ts">
// Модалка «Сбросить все данные» (D-12, T-03-03): wipe имени, ID, настроек
// и (в будущих фазах) статистики — только после явного подтверждения.
// Две кнопки [Отмена / Сбросить], деструктивный цвет #E5484D.
import { useI18n } from 'vue-i18n'
import { useIdentityStore } from '../../stores/identity'
import { useSettingsStore } from '../../stores/settings'

const emit = defineEmits<{ close: [] }>()
const { t } = useI18n()
const identity = useIdentityStore()
const settings = useSettingsStore()

// Подтверждение сброса: очищает оба ключа bt.*.v1, выдаёт новый UUID,
// настройки возвращаются к дефолтам и немедленно применяются к UI.
function confirmReset(): void {
  identity.wipeAll()
  settings.$reset()
  // Тема/локаль после $reset — дефолтные: применяем без ожидания подписок.
  document.documentElement.dataset['theme'] = settings.theme
  emit('close')
}
</script>

<template>
  <!-- Клик по подложке = отмена; сам wipe — только кнопкой «Сбросить». -->
  <div class="backdrop" @click.self="emit('close')">
    <div class="dialog" role="dialog" aria-modal="true" :aria-label="t('reset.title')">
      <h2 class="heading">{{ t('reset.title') }}</h2>
      <p class="body-text">{{ t('reset.body') }}</p>
      <div class="actions">
        <button class="dialog-btn" type="button" @click="emit('close')">
          {{ t('reset.cancel') }}
        </button>
        <button class="dialog-btn is-destructive" type="button" @click="confirmReset">
          {{ t('reset.confirm') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Токены --* наследуются от .shell (App.vue). */
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.dialog {
  width: 100%;
  max-width: 420px;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.dialog-btn {
  min-height: 44px;
  min-width: 44px;
  padding: 0 16px;
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: var(--text-body);
  cursor: pointer;
}

/* Деструктивное подтверждение — единственный носитель #E5484D (UI-SPEC Color). */
.dialog-btn.is-destructive {
  background: var(--danger);
  border-color: var(--danger);
  color: #fff;
  font-weight: 600;
}

.dialog-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
</style>
