<script setup lang="ts">
// Заглушка экрана правил (view 'rules'): наполнение — в фазах режимов.
// Путь из меню в Фазе 1 — disabled + «Скоро»; экран доступен через ui.go('rules', …).
import { useI18n } from 'vue-i18n'
import { useUiStore } from '../../stores/ui'
import MenuHeader from './MenuHeader.vue'

const { t } = useI18n()
const ui = useUiStore()
</script>

<template>
  <section class="menu" :aria-label="t('rules.title')">
    <MenuHeader :title="t('rules.title')" @back="ui.go('main')" />
    <div class="menu-scroll">
      <p class="body-text">{{ t('rules.stub') }}</p>
    </div>
  </section>
</template>
