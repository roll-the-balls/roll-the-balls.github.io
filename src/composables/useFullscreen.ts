// Полноэкранный режим + landscape-lock (Pattern 5, D-15, T-04-02).
// Правило: lock ВСЕГДА в try/catch и в паре с overlay-фолбэком —
// на iOS Safari / multi-scene iPad lock недоступен, там overlay
// является основным путём, а не исключением. Попытки — только по
// пользовательскому жесту (иначе браузеры отклоняют запрос).

/** Результат попытки: 'locked' — полноэкранный + альбомная ориентация
 *  заблокированы; 'overlay' — полагаемся на rotate-overlay. */
export type LandscapeResult = 'locked' | 'overlay'

// Feature-detect: requestFullscreen отсутствует в старых Safari (webkit-префикс).
function requestFullscreenSafe(): Promise<void> | null {
  const el = document.documentElement
  const req =
    el.requestFullscreen ??
    (el as unknown as { webkitRequestFullscreen?: () => Promise<void> | void })
      .webkitRequestFullscreen
  if (typeof req !== 'function') return null
  return Promise.resolve(req.call(el))
}

function exitFullscreenSafe(): Promise<void> | null {
  const exit =
    document.exitFullscreen ??
    (document as unknown as { webkitExitFullscreen?: () => Promise<void> | void })
      .webkitExitFullscreen
  if (typeof exit !== 'function') return null
  return Promise.resolve(exit.call(document))
}

/** Запросить полноэкранный режим и landscape-lock; отказ = 'overlay'.
 *  Вызывать только из обработчика пользовательского жеста. */
export async function ensureLandscape(): Promise<LandscapeResult> {
  try {
    // 1. Полноэкранный режим: тихий игнор отказа платформы.
    if (!document.fullscreenElement) {
      const req = requestFullscreenSafe()
      if (req) await req
    }
    // 2. Lock всегда в try/catch: недоступен на iOS → фолбэк overlay.
    if (
      typeof screen !== 'undefined' &&
      screen.orientation &&
      typeof screen.orientation.lock === 'function'
    ) {
      await screen.orientation.lock('landscape')
      return 'locked'
    }
    return 'overlay'
  } catch {
    // Отказ пользователя, iOS Safari, multi-scene iPad (T-04-02).
    return 'overlay'
  }
}

/** Toggle для кнопки инфо-бара: выход из полноэкранного или вход+lock. */
export async function toggleFullscreen(): Promise<LandscapeResult | 'windowed'> {
  try {
    if (document.fullscreenElement) {
      const exit = exitFullscreenSafe()
      if (exit) await exit
      return 'windowed'
    }
    return await ensureLandscape()
  } catch {
    return 'overlay'
  }
}
