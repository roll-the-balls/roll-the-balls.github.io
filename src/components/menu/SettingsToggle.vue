<script setup lang="ts">
// Тогл-переключатель (UAT Фазы 1): кнопка с role="switch" вместо чекбокса.
// Один tab-стоп на строку, Space/Enter из коробки кнопки, состояние видно
// и с клавиатуры (aria-checked + визуальный трек). Нативного
// input[type=checkbox][switch] избегаем: поддержка атрибута switch
// в браузерах частичная, а кнопка работает везде.
defineProps<{
  /** Текущее состояние (v-model). */
  modelValue: boolean
  /** Доступное имя (обычно текст строки настройки). */
  label: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
</script>

<template>
  <button
    class="switch"
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="label"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span class="knob" aria-hidden="true" />
  </button>
</template>
