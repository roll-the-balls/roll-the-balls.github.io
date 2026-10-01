// Детект портретной ориентации тройным способом (Pattern 5, T-04-02):
// matchMedia('(orientation: portrait)') + screen.orientation 'change' +
// visualViewport 'resize'. Все API feature-detect'ятся: на iOS Safari
// часть из них отсутствует, но комбинация источников даёт надёжный сигнал.
import { onScopeDispose, readonly, ref } from 'vue'

/** Текущее состояние: портрет ли (по всем доступным источникам). */
function computeIsPortrait(): boolean {
  try {
    // Источник 1: медиа-запрос — наиболее универсальный.
    if (typeof window.matchMedia === 'function') {
      return window.matchMedia('(orientation: portrait)').matches
    }
    // Источник 2: visualViewport (feature-detect).
    if (window.visualViewport) {
      return window.visualViewport.height > window.visualViewport.width
    }
    // Источник 3: размеры окна — последний фолбэк.
    return window.innerHeight > window.innerWidth
  } catch {
    // Недоступное окружение (например, тест без window): считаем ландшафтом.
    return false
  }
}

export function useOrientation() {
  const isPortrait = ref(computeIsPortrait())

  const update = (): void => {
    isPortrait.value = computeIsPortrait()
  }

  // Подписка 1: matchMedia change (feature-detect addEventListener).
  let mql: MediaQueryList | null = null
  if (typeof window.matchMedia === 'function') {
    mql = window.matchMedia('(orientation: portrait)')
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', update)
    }
  }

  // Подписка 2: screen.orientation change (недоступно на iOS Safari).
  const orientation =
    typeof screen !== 'undefined' && 'orientation' in screen ? screen.orientation : null
  if (orientation && typeof orientation.addEventListener === 'function') {
    orientation.addEventListener('change', update)
  }

  // Подписка 3: visualViewport resize (feature-detect).
  const viewport = typeof window !== 'undefined' ? window.visualViewport : null
  if (viewport && typeof viewport.addEventListener === 'function') {
    viewport.addEventListener('resize', update)
  }

  // Очистка при уничтожении области действия (HMR/тесты/пересборка).
  onScopeDispose(() => {
    if (mql && typeof mql.removeEventListener === 'function') {
      mql.removeEventListener('change', update)
    }
    if (orientation && typeof orientation.removeEventListener === 'function') {
      orientation.removeEventListener('change', update)
    }
    if (viewport && typeof viewport.removeEventListener === 'function') {
      viewport.removeEventListener('resize', update)
    }
  })

  return { isPortrait: readonly(isPortrait) }
}
