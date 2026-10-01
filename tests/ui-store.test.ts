// Тесты view-state навигации (MENU-01, D-09): 5 экранов без роутера,
// rulesFor выставляется и сбрасывается, Soon-пункты не меняют view напрямую.
import { beforeEach, describe, expect, test } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUiStore, type View } from '../src/stores/ui'

describe('ui store (view-state)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  test('стартовый экран — main, rulesFor пуст', () => {
    const ui = useUiStore()
    expect(ui.view).toBe('main')
    expect(ui.rulesFor).toBeNull()
  })

  test('go() проходит все 5 экранов main/mode/opponent/settings/rules', () => {
    const ui = useUiStore()
    const views: View[] = ['mode', 'opponent', 'settings', 'rules', 'main']
    for (const v of views) {
      ui.go(v)
      expect(ui.view).toBe(v)
    }
  })

  test('rulesFor выставляется для экрана правил и сбрасывается при уходе', () => {
    const ui = useUiStore()
    ui.go('rules', 'arcade')
    expect(ui.view).toBe('rules')
    expect(ui.rulesFor).toBe('arcade')

    // Переход на другой экран без rulesFor сбрасывает параметр.
    ui.go('settings')
    expect(ui.rulesFor).toBeNull()

    // Переход на rules без параметра тоже не оставляет старое значение.
    ui.go('rules', 'eight')
    ui.go('rules')
    expect(ui.rulesFor).toBeNull()
  })

  test('Soon-пункты не меняют view напрямую: go() — единственное действие навигации', () => {
    const ui = useUiStore()
    ui.go('mode')
    // Неготовые пункты (правила/ИИ/сеть) — disabled + бейдж «Скоро» (D-10):
    // у них нет собственного навигационного действия, единственная мутация — go().
    const publicActions = Object.keys(ui).filter(
      (k) => !k.startsWith('$') && !k.startsWith('_') && typeof ui[k] === 'function',
    )
    expect(publicActions).toEqual(['go'])
    // Пока go() не вызван, view остаётся прежним — мёртвых кликов с сайд-эффектом нет.
    expect(ui.view).toBe('mode')
  })
})
