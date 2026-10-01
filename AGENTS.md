<!-- GSD:project-start source:PROJECT.md -->

## Project

**Billiards Together**

Веб-приложение «игра в бильярд» строго с видом сверху. Статическая страница без своего сервера, размещение на GitHub Pages. Три типа соперника: адаптивный компьютер, второй человек локально на одном экране, удалённый человек по WebRTC P2P. На старте два режима — аркада в духе Side Pocket (очки, лимит попыток, бонусы) и классическая восьмёрка; архитектура сразу закладывается под добавление новых режимов.

Референсы: Side Pocket (NES, Genesis), Virtual Pool 4, современные онлайн-бильярды.

**Core Value:** Удобная партия в бильярд на любом устройстве без сервера: открыл страницу, выбрал режим и соперника, ударил и получил честную физику и понятный результат.

### Constraints

- **Hosting**: Только статика, без сервера — GitHub Pages
- **Net**: WebRTC P2P без своего signaling — ручной обмен кодами/ссылками/QR
- **Layout**: Только альбомный вид, стол всегда целиком, UI не перекрывает стол
- **Scale**: Корректные пропорции стола, бортов, шаров и луз — проверить по реальным размерам
- **Compat**: Современные браузеры и API, древние не поддерживаем
- **Stack-pref**: Предпочтение Vue + TS при простом деплое, иначе vanilla — подтвердить исследованием

<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->

## Technology Stack

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vue 3 | `^3.5.34` (stable; 3.6 in beta — do NOT track beta) | UI shell: menus, lobby, HUD, dialogs, settings | Official standard for this kind of app; SFC + Composition API maps 1:1 onto screens (menu/lobby/game/final). User preference confirmed: deploy stays trivial with Vite. HIGH |
| TypeScript | `~5.9` (`^5.x` minimum) | Type safety for physics core, game rules, netcode | Physics constants, ball state vectors, WebRTC message protocol are exactly the code that rots without types. `vue-tsc` type-checks SFCs at build. MEDIUM (minor version not pinned from docs, `^5.x` is safe) |
| Vite | `^8.2.2` (requires Node 20.19+ / 22+) | Dev server + static production build | De-facto standard; `vite build` outputs pure static `dist/` that GitHub Pages serves as-is. Rolldown-based bundler in v8, instant HMR. HIGH |
| Node.js | 22 LTS | Build toolchain only (not shipped) | Vite 8 requires Node 20.19+; 22 LTS is the safe 2026 baseline for CI and contributors. MEDIUM |
| Canvas 2D (`<canvas>` + `requestAnimationFrame`) | Browser-native, zero dependency | Table, balls, cue, trajectory rendering | A billiards table is ~16 circles + rectangles. Native Canvas draws this at 60fps on any modern phone with full DPR control and pixel-exact table geometry. No engine overhead, no WebGL context-loss edge cases. HIGH |
| Custom fixed-timestep physics (own TS module, ~300–500 lines) | Own code, no dependency | Ball-ball collision, cushions, pockets, friction, spin/follow/draw/masse-jump | Billiards is circles-only. Matter.js approximates circles with 25-gons (official docs: "TODO: true circle bodies"), which causes contact jitter, poor spin support, and tunneling at high cue speeds — all fatal for "fair physics". A purpose-built circle solver (elastic collision impulse + rolling friction + fixed dt substeps) is simpler, deterministic (needed for P2P state sync and replays), and debuggable. HIGH |
| Native WebRTC (`RTCPeerConnection`, `RTCDataChannel`) + manual signaling | Browser-native, zero dependency | P2P remote play via copy-paste codes / link / QR | PROJECT.md mandates manual signaling with no signaling server. `trickle: false` produces a single SDP blob per side → base64/gzip → short code. No wrapper library needed: the handshake is ~60 lines. Eliminates third-party signaling infra (Trystero needs public Nostr/MQTT relays — an external dependency with availability/privacy implications) and keeps "no server" literally true. HIGH |
| Pinia | `^4.0.3` | App state: settings, lobby, match session, stats | Official Vue store, type-safe, ~1KB, devtools support. Game-loop state (ball positions) stays OUTSIDE Pinia in the physics module for 60fps performance — Pinia holds only UI/session-level state. HIGH |
| `idb` | `^8.0.3` (~1.2kB brotli) | IndexedDB wrapper for saves + statistics | Requirement: 1 local save + up to 3 network saves + match history — exceeds comfortable localStorage size and needs structured queries. `idb` is the minimal promise wrapper over native IndexedDB (10M+ weekly downloads). Settings (small, synchronous) stay in `localStorage`. HIGH |
| vue-i18n | `^11.4.5` | RU/EN localization | Standard Vue i18n solution; locale files are lazy-loaded static JSON — zero impact on Pages deploy. MEDIUM (version from npm listing, API stable since v9) |
| Web Audio API (native) | Browser-native, zero dependency | Click/impact sounds, background music | Ball clicks are short synthesized envelopes; no need for Howler (~30KB) or audio assets. Music = lightweight loop via `<audio>` or generated. Keeps bundle minimal. MEDIUM |
| `qrcode.vue` | `^3.10.0` (zero dependencies) | QR invite rendering in network lobby | Native Vue 3 component, canvas/SVG output, no deps. Only used on one screen — import lazily. HIGH |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@vitejs/plugin-vue` | latest matching Vite 8 (`^6.x`) | SFC compilation | Always (required by Vue + Vite). |
| `vue-tsc` | `^2.x` / `^3.x` matching Vue 3.5 | Type-check SFCs in `npm run build` | Always — catches template/prop type errors CI-side. |
| `vite-plugin-pwa` | `^1.3.0` (requires Vite 5+) | Offline play via Workbox service worker | Phase 2+: "opened page, plays without network" is a natural fit for a static game; defer to keep v1 scope tight. Optional, not MVP. |
| Vitest | `^3.x` | Unit tests for physics core + rules engine | From the start for `physics/` and `rules/` (deterministic, headless-testable). Canvas rendering tested via screenshots/UAT, not unit tests. MEDIUM |
| `gh-pages` (npm) or GitHub Actions + `actions/deploy-pages` | `gh-pages@^6.x` | Deploy `dist/` to GitHub Pages | Either works; Actions-based deploy is preferred (no local tokens, builds on push). Decide in setup phase. MEDIUM |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint (flat config) + `eslint-plugin-vue` | Lint `.ts` + `.vue` | Use the `create-vue`-generated baseline; strict on `physics/` (no `any` in solver code). |
| Prettier | Formatting | Single quotes / no semicolons only if team agrees — pick once, enforce via CI. |
| `vite.config.ts`: `base: '/<repo-name>/'` | Correct asset paths on Pages project sites | Critical gotcha: without `base`, built assets 404 on `username.github.io/repo/`. Only omit if using a custom domain or user site. |
| Hash-free routing via view-state (no vue-router) | Screen switching + invite links | Game has ~5 screens and no need for deep-link history; invite links work via query param (`?invite=<code>` read with `URLSearchParams`). Adding vue-router buys nothing in v1 — reintroduce only if deep-linkable routes are needed. |

## Installation

# Scaffold (then pin versions below)

# Choose: TypeScript YES, Router NO, Pinia YES, Vitest YES,

# ESLint YES, Prettier YES

# Core

# Dev dependencies

# Run / build / deploy

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Plain Canvas 2D | PixiJS v8 (`^8.19`, WebGL/WebGPU, 500k weekly dl) | If scenes grow to hundreds of sprites/particles with filters — not this game (16 balls). Pixi adds ~450KB and a GPU-context lifecycle to manage for zero visual gain on flat circles. |
| Plain Canvas 2D | Phaser 4 (stable 2026, full game framework) | If building a sprite-heavy arcade game with tilemaps, arcade physics, audio, scenes. Billiards needs none of that; Phaser (~1.2MB) would fight the Vue UI shell instead of helping it. |
| Plain Canvas 2D | Three.js | Never for this project — strict top-down 2D requirement, 3D adds nothing but bundle and complexity. |
| Custom circle physics | Matter.js `0.19.0` | If the game had boxes/polygons/constraints. For billiards: circles approximated as polygons + weak spin + tunneling risk + dormant maintenance = wrong tool. Only if the team refuses to own ~400 lines of solver code. |
| Custom circle physics | planck.js / p2.js | Same verdict as Matter.js — general rigid-body engines solve a harder problem worse for this specific case. |
| Native WebRTC + manual SDP | simple-peer `^9.5.0` | If manual signaling UX gets fiddly (trickle-ICE edge cases) — simple-peer wraps exactly this flow with a clean event API and its README documents the copy-paste use case. Reasonable fallback, not the default. |
| Native WebRTC + manual SDP | Trystero (serverless via Nostr/MQTT/BitTorrent) | If "paste a code" UX tests badly and auto-discovery is needed — but it trades the "no server, no third party" constraint for public relay infrastructure. Out of scope for v1 per PROJECT.md. |
| `idb` + localStorage split | localForage | If IndexedDB/WebSQL fallback matrix matters (ancient browsers) — explicitly out of scope. `idb` is smaller and promise-native. |
| `idb` + localStorage split | Dexie.js | If stats queries grow relational (indexes, complex filters) — start with `idb`, migrate only on proven need. |
| Scoped CSS + CSS variables | Tailwind CSS | If marketing/content pages appear. Game UI (side panels, power slider, cloth themes via CSS vars) is bespoke — utility classes add build weight without leverage. |
| No router (view-state + `?invite=`) | vue-router + history mode | Only if deep-linkable routes needed. Note: history mode on Pages needs `404.html` hacks; hash mode works but uglifies invite links. View-state avoids both. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Three.js / any 3D engine | Strict top-down 2D; 3D pipeline (camera, lights, materials) is pure overhead for flat circles | Canvas 2D |
| Phaser (full framework) | Brings its own scene/input/audio/physics stack that duplicates Vue's role and inflates bundle ~1.2MB; built for sprite games, not UI-shell + canvas hybrids | Vue 3 shell + Canvas 2D + own loop |
| Matter.js for ball physics | Circles faked as 25-gons (per official source TODO), jittery contacts, no real spin model, tunneling on break shots; last meaningful release stale | Custom fixed-substep circle solver |
| Trystero / any auto-signaling lib in v1 | Requires public third-party relays (Nostr/MQTT) — violates "no server, manual codes/links/QR" constraint and adds availability risk | Native `RTCPeerConnection` with `trickle: false` + base64 codes |
| Firebase/Supabase/any BaaS signaling | Introduces accounts, keys, quotas, and a network dependency into a game specced as fully static P2P | Manual signaling; link carries room params, code carries SDP |
| Nuxt / SSR framework | No SEO/dynamic-server need; SPA on Pages is the whole point; SSR doubles deploy complexity | Plain Vite SPA |
| vue-router in v1 | 5 screens, no deep links except `?invite=`; history mode breaks on Pages without hacks | Reactive view-state + `URLSearchParams` |
| Vuex | Deprecated in favor of Pinia (official succession); worse TS inference | Pinia 4 |
| Howler.js / Tone.js | Ball-click SFX synthesizable in ~20 lines of WebAudio; music is a simple loop | Native Web Audio API |
| Tailwind in v1 | Bespoke game HUD + theming via CSS custom properties (cloth color, trajectory style); utility framework adds weight, not speed, here | Scoped `<style>` + CSS vars |
| Vue 3.6 beta / Vite beta / nightly anything | Beta reactivity/compiler changes risk subtle breakage mid-milestone for zero v1 benefit | Pinned stable majors above |

## Stack Patterns by Variant

- Keep invite payload OUT of the URL (URLs get fetched/previewed, long SDP in URL breaks clients). URL carries only a short room hint; the SDP code travels via copy-paste/QR. Because QR capacity is limited (~3KB alphanumeric), gzip (CompressionStream API, native in modern browsers) the SDP before base64.
- Detect `RTCPeerConnection.connectionState === 'failed'` → show "direct connection impossible on this network" + one-click convert to local-vs-AI game (PROJECT.md already requires AI substitution). Do NOT add a TURN server — it violates the static-only constraint. Document as known limitation.
- Decouple sim from render: physics at fixed 240Hz substeps, render interpolation between states. Canvas 2D at this object count still holds; do not reach for WebGL.
- Lazy-load `qrcode.vue`, `vue-i18n` locales, and `vite-plugin-pwa` worker registration via dynamic `import()` per route/screen. Physics + netcode stay in the main chunk (needed immediately).

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `vue@3.5.x` | `@vitejs/plugin-vue@^5/6`, `vue-tsc@^2`, `pinia@^4`, `vue-i18n@^11` | When upgrading Vue 3.5 → 3.6 stable later, upgrade plugin-vue + vue-tsc in the same commit (official Vue upgrade guidance). |
| `vite@8.x` | `vite-plugin-pwa@^1.3`, Node 20.19+ / 22+ | vite-plugin-pwa < 0.17 requires older Vite — must use ^1.x with Vite 8. |
| `pinia@4.x` | `vue@^3.5` | Pinia 4 dropped Vue 2 support; correct for this project. |
| `qrcode.vue@3.x` | `vue@^3` | v1.x is Vue 2 — do not install v1. |
| `idb@8.x` | Any modern bundler, `target es2022` | Zero deps; safe. |
| `simple-peer@9.x` (fallback only) | Native WebRTC browsers | Needs no `wrtc` in browser; `wrtc` only for Node tests. |

## Sources

- npm `vue` — `3.5.34` latest stable, `3.6.0-beta.12` in beta (leave beta alone) — HIGH
- npm `vite` — `8.2.2` latest (Vite 8 blog: Mar 2026; 8.1: Jun 2026) — HIGH
- npm `pinia` — `4.0.3` latest — HIGH
- npm `vue-i18n` — `11.4.5` latest — MEDIUM
- npm `vite-plugin-pwa` — `1.3.0` latest, requires Vite 5+ — HIGH
- npm `idb` — `8.0.3`, ~1.2kB brotli, 10M+ weekly downloads — HIGH
- npm `qrcode.vue` — `3.10.0`, zero deps, Vue 3 — HIGH
- npm `simple-peer` — `9.5.0`, README documents manual copy-paste signaling — MEDIUM
- Trystero docs (`trystero.dev`) — serverless strategies rely on public Nostr/MQTT/BitTorrent relays; conflict with manual-signaling constraint — MEDIUM
- PixiJS blog Jun 2026 — v8.19.0, 500k weekly downloads, WebGPU + canvas fallback — HIGH
- Phaser vs PixiJS comparison 2026 — Phaser 4 stable full framework (~1.2MB) vs PixiJS renderer (~450KB) — MEDIUM
- Matter.js official docs (`brm.io/matter-js`, v0.20.0 API) — `Bodies.circle` "approximate circles with polygons… maxSides 25", source TODO "true circle bodies" — HIGH for the polygon fact; npm latest `0.19.0` signals low maintenance velocity — MEDIUM
- Dexie vs localForage vs idb 2026 comparison — `idb@8.0.3` smallest abstraction — MEDIUM

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
