# Roll the Balls

Веб-приложение «игра в бильярд» строго с видом сверху. Статическая страница без своего сервера:
открыл страницу, выбрал режим и соперника, ударил и получил честную физику и понятный результат.

- Сайт: https://roll-the-balls.github.io/
- Рабочее название репозитория: `billiards-together`

Три типа соперника: адаптивный компьютер, второй человек локально на одном экране,
удалённый человек по WebRTC P2P (без своего signaling-сервера, обмен кодами вручную).
Два стартовых режима: аркада в духе Side Pocket и классическая восьмёрка.

## Стек

Vue 3 + TypeScript + Vite, Pinia (только UI/сессия), vue-i18n (RU/EN), Canvas 2D,
собственная физика на фиксированном шаге, PWA (офлайн с первого билда).

## Команды

```sh
npm install        # установка зависимостей
npm run dev        # dev-сервер с hot-reload
npm run build      # строгая сборка: vue-tsc type-check + vite build
npm run preview    # предпросмотр собранного dist/
npx vitest run     # юнит-тесты (в pwsh: именно так, флаги npm ломают парсинг)
npm run lint       # oxlint + eslint
```

Требуется Node 22+ (см. `engines` в package.json).

## Структура

- `src/stores/` — Pinia-сторы UI/сессии (settings, identity, ui)
- `src/i18n/` — словари RU/EN
- `src/components/` — menu, shell, dialogs, overlays
- `src/composables/`, `src/styles/` — ориентация/fullscreen, токены/темы
- `src/core|modes|game|render|input|net/` — заготовки слоёв будущих фаз
- `tests/` — юнит-тесты сторов, i18n-паритета, навигации

Деплой: GitHub Actions собирает `dist/` и публикует на GitHub Pages
(`.github/workflows/deploy.yml`, Source: GitHub Actions).
