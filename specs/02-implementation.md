# Portfolio Hub — ТЗ на реалізацію

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Один Next.js-додаток, який показує всі vibe-coding проєкти Юри в трьох режимах: публічна вітрина, приватна бібліотека фіч із живими демо, і CRM-дошка етапів із таймером обліку часу.

**Architecture:** Три режими над одним набором статичних JSON-файлів у git — розсинхрону між ними не може бути за побудовою. Бази даних немає. Запис (drag-and-drop статусів, таймер) працює тільки на localhost через API-роути, які пишуть у ті самі JSON; на Vercel вони повертають 403 і додаток read-only. Фічі зберігаються як самодостатні HTML-файли, які рендеряться в iframe і одночасно показуються як код — одне джерело, розсинхрон неможливий.

**Tech Stack:** Next.js 16.2.2 (App Router), React 19.2.4, TypeScript 5, Tailwind CSS 4, Vitest (юніт-тести чистої логіки), Playwright (скріншоти, devDependency). Drag-and-drop — нативний HTML5, без бібліотек.

---

## Global Constraints

- Node 20+. Пакетний менеджер — npm.
- Next.js `16.2.2`, React `19.2.4`, Tailwind CSS `4` (через `@tailwindcss/postcss`), TypeScript `5`. Ці версії збігаються з іншими проєктами автора (`shader-app`, `spotlight-demo`) — не оновлювати без причини.
- **Жодних імпортів з інших проєктів автора.** Фічі фізично копіюються всередину репозиторію. Хаб має збиратись, навіть якщо всі інші папки видалити.
- **Жодної бази даних, CMS, real-time чи зовнішнього сховища.** Все — файли в git.
- Усі API-роути, що пишуть на диск, обовʼязково перевіряють `process.env.NODE_ENV !== 'production'` і повертають 403 інакше. Це не опція.
- Мова інтерфейсу — українська. Мова коду, назв файлів і слагів — англійська.
- Кожна задача завершується робочим комітом. Формат: `feat:`, `fix:`, `chore:`, `test:`.
- Тестами покривається **чиста логіка** (`lib/time.ts`, `lib/status.ts`, `lib/merge.mjs`). UI перевіряється вручну через браузер-превʼю кроками, описаними в задачах — юніт-тестів на JSX не пишемо.

---

## Контекст: що це і навіщо

Автор — Юра, робить сайти й лендінги через vibe coding. За рік накопичилось ~17 проєктів, розкиданих по папках. Три болі:

1. **Губиться.** Немає одного місця, де видно все зроблене.
2. **Фічі не перевикористовуються.** Щоб узяти раніше зроблений «замок на відео» чи анімацію проявлення знімка, доводиться згадувати, в якому проєкті вона була, відкривати живий сайт, лізти в код.
3. **Немає розуміння стану й ціни.** Який проєкт готовий, який зламався, скільки годин реально пішло — щоб адекватно рахувати вартість наступних замовлень.

Три режими закривають ці болі по одному. Публічна вітрина — ще й аргумент для клієнта, тому хаб сам має бути демонстрацією смаку: темний, кінематографічний, serif-заголовки, стримана анімація.

### Інваріанти, які не можна порушувати

- **Одне джерело для коду фічі.** Сторінка фічі читає `public/features/<slug>/index.html` двічі: віддає в iframe і показує як текст. Ніколи не дублювати код фічі в JSON чи в JSX.
- **Один запущений таймер.** Старт нового зупиняє попередній і записує його сесію. Двох паралельних лічильників не існує.
- **Скрипти не затирають рукописне.** `scan.mjs` оновлює тільки `lastTouched` і додає нові картки; `health.mjs` оновлює тільки `health`. Описи, теги, статуси, наступні кроки, написані людиною, недоторканні.
- **«Зламано» — прапорець, а не колонка.** Готовий проєкт теж може відвалитись і не перестає бути готовим.

---

## Структура файлів

```
portfolio/
  app/
    layout.tsx                    # оболонка, шрифти, курсор, шапка
    globals.css                   # токени дизайну + база Tailwind
    page.tsx                      # вітрина
    work/[slug]/page.tsx          # кейс проєкту
    lab/page.tsx                  # каталог фіч
    lab/[slug]/page.tsx           # фіча: демо + код + нотатки
    board/page.tsx                # CRM-дошка
    login/page.tsx                # форма пароля для /lab і /board
    api/login/route.ts            # ставить cookie
    api/board/route.ts            # PATCH статусу проєкту (dev-only)
    api/time/route.ts             # старт/стоп/правка сесій (dev-only)
  components/
    site-header.tsx               # навігація + TimerHud
    custom-cursor.tsx
    live-preview.tsx              # постер → iframe на hover
    project-card.tsx
    feature-card.tsx
    feature-search.tsx            # клієнтський пошук/фільтр
    code-panel.tsx                # підсвітка + копіювання
    board-column.tsx
    board-card.tsx
    timer-button.tsx
    timer-hud.tsx                 # глобальний індикатор запущеного таймера
    long-session-dialog.tsx
    time-summary.tsx
  lib/
    types.ts                      # єдине джерело типів
    data.ts                       # читання JSON на сервері
    time.ts                       # чиста логіка часу (тестується)
    status.ts                     # stale / колонки / фільтри (тестується)
    merge.mjs                     # злиття даних сканера (JS, бо його імпортує scan.mjs)
    write.ts                      # безпечний запис JSON + dev-only guard
  data/
    projects.json
    features.json
    time.json
  public/
    features/<slug>/index.html
    features/<slug>/notes.md
    shots/<slug>.webp
  scripts/
    scan.mjs
    health.mjs
    shots.mjs
  tests/
    time.test.ts
    status.test.ts
    scan.test.ts
  middleware.ts
  .env.local                      # LAB_PASSWORD (у git не потрапляє)
```

---

## Задача 1: Каркас проєкту

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `vitest.config.ts`, `.gitignore`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`

**Interfaces:**
- Consumes: нічого
- Produces: робочий Next.js-додаток на `localhost:3000`, команда `npm test`

- [ ] **Крок 1: Створити проєкт**

У щойно створеному репозиторії. Якщо GitHub уже поклав туди `README.md`, `.gitignore` чи `LICENSE`, `create-next-app` це переживе — але якщо він скаржиться на непорожню папку, тимчасово прибрати ці файли, створити проєкт і повернути їх.

```bash
npx create-next-app@16.2.2 . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

Якщо якийсь прапорець у цій версії не підтримується, запустити без нього й відповісти на питання вручну. Обовʼязкові відповіді: TypeScript — так, Tailwind — так, App Router — так, `src/` — ні, аліас — `@/*`.

- [ ] **Крок 2: Додати Vitest і Playwright**

```bash
npm install -D vitest @vitejs/plugin-react playwright
npx playwright install chromium
```

- [ ] **Крок 3: Створити `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
})
```

- [ ] **Крок 4: Додати скрипти в `package.json`**

```jsonc
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "test": "vitest run",
  "scan": "node scripts/scan.mjs",
  "health": "node scripts/health.mjs",
  "shots": "node scripts/shots.mjs"
}
```

- [ ] **Крок 5: Увімкнути `allowJs` у `tsconfig.json`**

У `compilerOptions` додати `"allowJs": true`. Це потрібно, щоб тест на TypeScript міг імпортувати `lib/merge.mjs` (Задача 5) — файл навмисно на чистому JS, бо його ділять тест і `scripts/scan.mjs`.

- [ ] **Крок 6: Дописати `.gitignore`**

Додати рядки:

```
.env.local
.vercel
```

**`public/shots/` НЕ додавати в `.gitignore`.** Vercel збирає з git — якщо скріншотів немає в репозиторії, вітрина на проді буде без жодного постера. Кілька webp по ~150 КБ у git нікому не заважають, а альтернативи немає: `shots.mjs` вимагає Playwright і живих сайтів, на Vercel він не запуститься.

- [ ] **Крок 7: Перевірити, що збирається**

Run: `npm run build && npm test`
Expected: build успішний; vitest пише `No test files found` і виходить з кодом 0.

- [ ] **Крок 8: Коміт**

```bash
git add -A
git commit -m "chore: scaffold Next.js 16 + Tailwind 4 + Vitest"
```

---

## Задача 2: Типи й дані

**Files:**
- Create: `lib/types.ts`, `lib/data.ts`, `data/projects.json`, `data/features.json`, `data/time.json`

**Interfaces:**
- Consumes: нічого
- Produces: `Project`, `Feature`, `TimeEntry`, `TimeData`, `ProjectStatus`, `ProjectKind`; функції `getProjects(): Project[]`, `getProject(slug: string): Project | undefined`, `getFeatures(): Feature[]`, `getFeature(slug: string): Feature | undefined`, `getTimeData(): TimeData`

- [ ] **Крок 1: Створити `lib/types.ts`**

```ts
export type ProjectStatus =
  | 'idea' | 'in-progress' | 'finishing' | 'needs-fix' | 'done' | 'archived'

/** web — можна показати в iframe. deck — презентація (PDF/PPTX). doc — звіт/документ. */
export type ProjectKind = 'web' | 'deck' | 'doc'

export type Health = 'ok' | 'broken' | 'unknown'

export interface Project {
  slug: string
  title: string
  tagline: string
  story: string
  kind: ProjectKind
  stack: string[]
  liveUrl: string | null
  localPath: string
  tags: string[]
  status: ProjectStatus
  featureSlugs: string[]
  nextStep: string
  blocker: string
  lastTouched: string   // YYYY-MM-DD, автогенерується
  health: Health        // автогенерується; unknown = немає liveUrl
}

export interface Feature {
  slug: string
  title: string
  summary: string
  tags: string[]
  fromProject: string
  deps: string[]        // порожньо = ванільний JS
}

export interface TimeEntry {
  id: string
  projectSlug: string
  startedAt: string     // ISO
  endedAt: string       // ISO
  minutes: number       // зберігається явно, не рахується з дат
  note: string
  source: 'timer' | 'manual'
}

export interface RunningTimer {
  projectSlug: string
  startedAt: string     // ISO
}

export interface TimeData {
  running: RunningTimer | null
  entries: TimeEntry[]
}
```

- [ ] **Крок 2: Створити `lib/data.ts`**

```ts
import fs from 'node:fs'
import path from 'node:path'
import type { Project, Feature, TimeData } from './types'

const DATA_DIR = path.join(process.cwd(), 'data')

function read<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8')) as T
}

export function getProjects(): Project[] {
  return read<Project[]>('projects.json')
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug)
}

export function getFeatures(): Feature[] {
  return read<Feature[]>('features.json')
}

export function getFeature(slug: string): Feature | undefined {
  return getFeatures().find((f) => f.slug === slug)
}

export function getTimeData(): TimeData {
  return read<TimeData>('time.json')
}
```

Читання синхронне й без кешу навмисно: після запису через API-роут наступний рендер має бачити свіжі дані.

- [ ] **Крок 3: Створити `data/time.json`**

```json
{ "running": null, "entries": [] }
```

- [ ] **Крок 4: Створити `data/features.json`**

```json
[]
```

Заповниться в Задачі 14.

- [ ] **Крок 5: Створити `data/projects.json`**

Реальні дані, зібрані з файлової системи автора. Поля `story` і `tags` — короткі, автор уточнить пізніше; `nextStep` і `blocker` порожні до першого проходу по дошці.

```json
[
  {
    "slug": "artpro",
    "title": "ARTPRO",
    "tagline": "Платформа тренувальних програм",
    "story": "Готове демо преміум-сайту, зроблене щоб продати його тренеру, який досі торгував програмами через слабкий weblium і Instagram Direct. Модель доступу «замок на відео»: структура програми відкрита всім, відео замкнені до оплати.",
    "kind": "web",
    "stack": [
      "vanilla JS",
      "Vercel"
    ],
    "liveUrl": "https://artpro-one.vercel.app",
    "localPath": "~/Claude/artpro",
    "tags": [
      "landing",
      "fitness",
      "demo"
    ],
    "status": "done",
    "featureSlugs": [],
    "nextStep": "",
    "blocker": "",
    "lastTouched": "2026-06-15",
    "health": "unknown"
  },
  {
    "slug": "altus-store",
    "title": "ALTUS",
    "tagline": "Магазин столів із регулюванням висоти",
    "story": "Завдання TETR «Shopify & Brand Guidelines», виконане без Shopify — власний статичний магазин англійською. Весь сайт генерується з build/data.js, правки в .html затираються наступним білдом. Товари — реальні фото з Pexels.",
    "kind": "web",
    "stack": [
      "vanilla JS",
      "власний білд",
      "Vercel"
    ],
    "liveUrl": "https://altus-store.vercel.app",
    "localPath": "~/Claude/altus-store",
    "tags": [
      "ecommerce",
      "TETR"
    ],
    "status": "done",
    "featureSlugs": [],
    "nextStep": "",
    "blocker": "",
    "lastTouched": "2026-07-22",
    "health": "unknown"
  },
  {
    "slug": "revela-store",
    "title": "REVELA",
    "tagline": "Миттєві та плівкові камери",
    "story": "Другий комплект того самого завдання TETR, зроблений для однокурсника Алі Хаджіза. Темна тема фотолабораторії, щоб не виглядав перефарбованим ALTUS. Модель «бритва і леза»: камера разова, плівка — витратник за підпискою.",
    "kind": "web",
    "stack": [
      "vanilla JS",
      "власний білд",
      "Vercel"
    ],
    "liveUrl": "https://revela-store.vercel.app",
    "localPath": "~/Claude/revela-store",
    "tags": [
      "ecommerce",
      "dark",
      "TETR"
    ],
    "status": "done",
    "featureSlugs": [],
    "nextStep": "",
    "blocker": "",
    "lastTouched": "2026-07-22",
    "health": "unknown"
  },
  {
    "slug": "aquastar",
    "title": "Аква Стар",
    "tagline": "Доставка води, Мелітополь",
    "story": "Сайт-візитка компанії доставки води. Темний кінематографічний стиль, палітра графіт плюс мʼята — світлий «аква-люкс» відхилений як дешевий, синій заборонений. Підводне відео в герої, кошик, заявки в Telegram.",
    "kind": "web",
    "stack": [
      "Next.js 14",
      "Tailwind",
      "framer-motion"
    ],
    "liveUrl": "https://aquastar-plum.vercel.app",
    "localPath": "~/Claude/aquastar",
    "tags": [
      "landing",
      "delivery"
    ],
    "status": "finishing",
    "featureSlugs": [],
    "nextStep": "Проставити TELEGRAM_BOT_TOKEN і CHAT_ID на Vercel",
    "blocker": "",
    "lastTouched": "2026-06-30",
    "health": "unknown"
  },
  {
    "slug": "medcentar",
    "title": "ATLAS PROTOCOL",
    "tagline": "Превентивний скринінг для боснійської діаспори",
    "story": "Переупаковка діючої поліклініки Medical Centar (Сараєво, Травник) у дводенний резидентський протокол: МРТ усього тіла, лабораторія, інтерніст, дентальний скрин і висновок німецькою. Ставка на діаспору в DACH, яку не бачить жоден гравець ринку.",
    "kind": "web",
    "stack": [
      "vanilla HTML"
    ],
    "liveUrl": null,
    "localPath": "~/Claude/medcentar",
    "tags": [
      "landing",
      "medical",
      "positioning"
    ],
    "status": "in-progress",
    "featureSlugs": [],
    "nextStep": "",
    "blocker": "",
    "lastTouched": "2026-07-29",
    "health": "unknown"
  },
  {
    "slug": "brownhill-offer",
    "title": "BrownHill",
    "tagline": "Комерційна пропозиція «Черга покупців»",
    "story": "Оффер клієнту з повним циклом і фінмоделлю на три місяці. Розрахунки лежать окремими xlsx поруч із сайтом.",
    "kind": "web",
    "stack": [
      "vanilla HTML",
      "Vercel"
    ],
    "liveUrl": "https://brownhill-offer.vercel.app",
    "localPath": "~/Claude/brownhill-offer",
    "tags": [
      "offer",
      "client"
    ],
    "status": "done",
    "featureSlugs": [],
    "nextStep": "",
    "blocker": "",
    "lastTouched": "2026-07-05",
    "health": "unknown"
  },
  {
    "slug": "linco-offers",
    "title": "LINCO Автопілот",
    "tagline": "Серія комерційних пропозицій з автоматизації",
    "story": "Чотири HTML-документи під різні сегменти й мови: оффер «Автопілот» українською та російською, каталог автоматизацій і окрема версія без прив'язки до 1С.",
    "kind": "web",
    "stack": [
      "vanilla HTML"
    ],
    "liveUrl": null,
    "localPath": "~/Claude/LINCO-Оффер-RU.html",
    "tags": [
      "offer",
      "client",
      "automation"
    ],
    "status": "done",
    "featureSlugs": [],
    "nextStep": "",
    "blocker": "",
    "lastTouched": "2026-07-05",
    "health": "unknown"
  },
  {
    "slug": "agency-crm",
    "title": "AgencyCRM",
    "tagline": "Лендінг CRM для агенцій",
    "story": "Односторінковий сайт продукту — CRM під агентський воркфлоу.",
    "kind": "web",
    "stack": [
      "vanilla HTML"
    ],
    "liveUrl": null,
    "localPath": "~/Claude/crm-agency.html",
    "tags": [
      "landing",
      "b2b",
      "saas"
    ],
    "status": "done",
    "featureSlugs": [],
    "nextStep": "",
    "blocker": "",
    "lastTouched": "2026-07-05",
    "health": "unknown"
  },
  {
    "slug": "ofm-automation",
    "title": "OFM Automation",
    "tagline": "AI-автоматизація для OFM-агенцій",
    "story": "Англомовний лендінг послуги: десять AI-моделей за тридцять днів. Лежить у корені як index.html.",
    "kind": "web",
    "stack": [
      "vanilla HTML"
    ],
    "liveUrl": null,
    "localPath": "~/Claude/index.html",
    "tags": [
      "landing",
      "ai",
      "b2b"
    ],
    "status": "done",
    "featureSlugs": [],
    "nextStep": "",
    "blocker": "",
    "lastTouched": "2026-07-05",
    "health": "unknown"
  },
  {
    "slug": "bodnar-ortho",
    "title": "Ортодонтія Боднара",
    "tagline": "Практика Андрія Богдановича, Івано-Франківськ",
    "story": "Сайт ортодонтичної практики батька — ортодонта з сорокарічним стажем. Той самий кабінет має стати першим клієнтом стартапу OrthoAI.",
    "kind": "web",
    "stack": [
      "vanilla HTML"
    ],
    "liveUrl": null,
    "localPath": "~/Claude/bodnar-landing.html",
    "tags": [
      "landing",
      "medical",
      "family"
    ],
    "status": "done",
    "featureSlugs": [],
    "nextStep": "",
    "blocker": "",
    "lastTouched": "2026-07-05",
    "health": "unknown"
  },
  {
    "slug": "booking-clone",
    "title": "Booking Clone",
    "tagline": "Клон інтерфейсу бронювання",
    "story": "Навчальний клон Booking.com українською — відпрацювання складного пошуку з фільтрами.",
    "kind": "web",
    "stack": [
      "vanilla HTML"
    ],
    "liveUrl": null,
    "localPath": "~/Claude/booking-clone",
    "tags": [
      "clone",
      "practice"
    ],
    "status": "archived",
    "featureSlugs": [],
    "nextStep": "",
    "blocker": "",
    "lastTouched": "2026-06-17",
    "health": "unknown"
  },
  {
    "slug": "shader-app",
    "title": "Shader App",
    "tagline": "Пісочниця WebGL-шейдерів",
    "story": "Експерименти з шейдерами на Three.js із інтерфейсом на shadcn.",
    "kind": "web",
    "stack": [
      "Next.js",
      "three",
      "shadcn"
    ],
    "liveUrl": null,
    "localPath": "~/Claude/shader-app",
    "tags": [
      "3d",
      "experiment"
    ],
    "status": "archived",
    "featureSlugs": [],
    "nextStep": "",
    "blocker": "",
    "lastTouched": "2026-04-09",
    "health": "unknown"
  },
  {
    "slug": "spotlight-demo",
    "title": "Spotlight Demo",
    "tagline": "Проба Spline у Next.js",
    "story": "Перевірка інтеграції 3D-сцени Spline у Next.js.",
    "kind": "web",
    "stack": [
      "Next.js",
      "Spline"
    ],
    "liveUrl": null,
    "localPath": "~/Claude/spotlight-demo",
    "tags": [
      "3d",
      "experiment"
    ],
    "status": "archived",
    "featureSlugs": [],
    "nextStep": "",
    "blocker": "",
    "lastTouched": "2026-04-09",
    "health": "unknown"
  },
  {
    "slug": "altus-pitch",
    "title": "ALTUS Pitch",
    "tagline": "Pitch deck на 10 слайдів",
    "story": "Індивідуальне завдання TETR по ALTUS. Ключова легенда, яку треба тримати в усіх наступних матеріалах: asset-light consignment — стік на балансі постачальника, title переходить у момент продажу.",
    "kind": "deck",
    "stack": [
      "pptxgenjs",
      "docx"
    ],
    "liveUrl": null,
    "localPath": "~/Claude/altus-pitch",
    "tags": [
      "deck",
      "TETR"
    ],
    "status": "done",
    "featureSlugs": [],
    "nextStep": "",
    "blocker": "",
    "lastTouched": "2026-07-21",
    "health": "unknown"
  },
  {
    "slug": "revela-pitch",
    "title": "REVELA Pitch",
    "tagline": "Pitch deck, рефлексія і план виступу",
    "story": "Другий Business Pitch, для Алі. Фінмодель навмисно інша, ніж в ALTUS: гроші не в камері, а в повторних замовленнях плівки.",
    "kind": "deck",
    "stack": [
      "pptxgenjs",
      "docx"
    ],
    "liveUrl": null,
    "localPath": "~/Claude/revela-pitch",
    "tags": [
      "deck",
      "TETR"
    ],
    "status": "done",
    "featureSlugs": [],
    "nextStep": "",
    "blocker": "",
    "lastTouched": "2026-07-22",
    "health": "unknown"
  },
  {
    "slug": "revela-gtm",
    "title": "REVELA GTM Turnaround",
    "tagline": "Shark Tank Rescue: 15 слайдів і скрипт відео",
    "story": "Третє завдання по REVELA. Легенда: чотирнадцять місяців після раунду, камери продались, плівка ні. Рішення — переpositioning у photography membership, не новий продукт.",
    "kind": "deck",
    "stack": [
      "pptxgenjs",
      "docx"
    ],
    "liveUrl": null,
    "localPath": "~/Claude/revela-gtm",
    "tags": [
      "deck",
      "strategy",
      "TETR"
    ],
    "status": "done",
    "featureSlugs": [],
    "nextStep": "",
    "blocker": "",
    "lastTouched": "2026-07-22",
    "health": "unknown"
  },
  {
    "slug": "tmc-report",
    "title": "TMC D2C Report",
    "tagline": "Звіт по реальному бізнесу семестру в Індії",
    "story": "The Masala Chimney — їжа, три півоти за семестр, нуль виручки. Написано від імені Юри як чесний founder's report без вигаданих KPI. Плюс два суміжні завдання: consumer discovery і CRO-аудит реального сайту.",
    "kind": "doc",
    "stack": [
      "docx"
    ],
    "liveUrl": null,
    "localPath": "~/Claude/tmc-report",
    "tags": [
      "report",
      "TETR"
    ],
    "status": "done",
    "featureSlugs": [],
    "nextStep": "",
    "blocker": "",
    "lastTouched": "2026-07-25",
    "health": "unknown"
  }
]
```

`aquastar-backup` навмисно не включений — це резервна копія, а не проєкт.

Три записи вказують на окремі HTML-файли в корені, а не на папки (`linco-offers`, `agency-crm`, `ofm-automation`, `bodnar-ortho`). `scan.mjs` обходить тільки папки, тому він їх не перевідкриє — але й не видалить, бо merge нічого не видаляє.

- [ ] **Крок 6: Перевірити, що JSON валідний і типізується**

Run: `npx tsc --noEmit`
Expected: без помилок.

Run: `node -e "const p=require('./data/projects.json'); console.log(p.length)"`
Expected: `17`

- [ ] **Крок 7: Коміт**

```bash
git add lib/types.ts lib/data.ts data/
git commit -m "feat: add data model and seed project data"
```

---

## Задача 3: Логіка статусів

**Files:**
- Create: `lib/status.ts`, `tests/status.test.ts`

**Interfaces:**
- Consumes: `Project`, `ProjectStatus` з `lib/types`
- Produces: `BOARD_COLUMNS: { id: ProjectStatus; label: string }[]`, `isStale(project: Project, now: Date): boolean`, `visibleOnShowcase(projects: Project[]): Project[]`, `groupByColumn(projects: Project[]): Record<ProjectStatus, Project[]>`

- [ ] **Крок 1: Написати падаючі тести**

Create `tests/status.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { BOARD_COLUMNS, isStale, visibleOnShowcase, groupByColumn } from '@/lib/status'
import type { Project } from '@/lib/types'

const base: Project = {
  slug: 'x', title: 'X', tagline: '', story: '', kind: 'web', stack: [],
  liveUrl: null, localPath: '', tags: [], status: 'in-progress',
  featureSlugs: [], nextStep: '', blocker: '', lastTouched: '2026-01-01',
  health: 'unknown',
}

const NOW = new Date('2026-07-31T00:00:00Z')

describe('BOARD_COLUMNS', () => {
  it('має шість колонок у правильному порядку', () => {
    expect(BOARD_COLUMNS.map((c) => c.id)).toEqual([
      'idea', 'in-progress', 'finishing', 'needs-fix', 'done', 'archived',
    ])
  })
})

describe('isStale', () => {
  it('позначає проєкт без дотику понад 60 днів', () => {
    expect(isStale({ ...base, lastTouched: '2026-05-01' }, NOW)).toBe(true)
  })

  it('не позначає свіжий проєкт', () => {
    expect(isStale({ ...base, lastTouched: '2026-07-20' }, NOW)).toBe(false)
  })

  it('рівно 60 днів ще не stale', () => {
    expect(isStale({ ...base, lastTouched: '2026-06-01' }, NOW)).toBe(false)
  })

  it('не позначає готові проєкти', () => {
    expect(isStale({ ...base, status: 'done', lastTouched: '2025-01-01' }, NOW)).toBe(false)
  })

  it('не позначає архівні проєкти', () => {
    expect(isStale({ ...base, status: 'archived', lastTouched: '2025-01-01' }, NOW)).toBe(false)
  })
})

describe('visibleOnShowcase', () => {
  it('прибирає архівні', () => {
    const result = visibleOnShowcase([
      { ...base, slug: 'a', status: 'done' },
      { ...base, slug: 'b', status: 'archived' },
    ])
    expect(result.map((p) => p.slug)).toEqual(['a'])
  })

  it('сортує від найсвіжішого', () => {
    const result = visibleOnShowcase([
      { ...base, slug: 'old', lastTouched: '2026-01-01' },
      { ...base, slug: 'new', lastTouched: '2026-07-01' },
    ])
    expect(result.map((p) => p.slug)).toEqual(['new', 'old'])
  })
})

describe('groupByColumn', () => {
  it('розкладає по колонках і не губить порожні', () => {
    const grouped = groupByColumn([{ ...base, status: 'done' }])
    expect(grouped.done).toHaveLength(1)
    expect(grouped.idea).toEqual([])
  })
})
```

- [ ] **Крок 2: Запустити тести, переконатись що падають**

Run: `npm test`
Expected: FAIL — `Cannot find module '@/lib/status'`

- [ ] **Крок 3: Реалізувати `lib/status.ts`**

```ts
import type { Project, ProjectStatus } from './types'

export const BOARD_COLUMNS: { id: ProjectStatus; label: string }[] = [
  { id: 'idea', label: 'Ідея' },
  { id: 'in-progress', label: 'В роботі' },
  { id: 'finishing', label: 'Фініш' },
  { id: 'needs-fix', label: 'Треба фікс' },
  { id: 'done', label: 'Готово' },
  { id: 'archived', label: 'Архів' },
]

const STALE_DAYS = 60
const DAY_MS = 86_400_000

export function isStale(project: Project, now: Date): boolean {
  if (project.status === 'done' || project.status === 'archived') return false
  const touched = new Date(`${project.lastTouched}T00:00:00Z`).getTime()
  return (now.getTime() - touched) / DAY_MS > STALE_DAYS
}

export function visibleOnShowcase(projects: Project[]): Project[] {
  return projects
    .filter((p) => p.status !== 'archived')
    .sort((a, b) => b.lastTouched.localeCompare(a.lastTouched))
}

export function groupByColumn(projects: Project[]): Record<ProjectStatus, Project[]> {
  const grouped = Object.fromEntries(
    BOARD_COLUMNS.map((c) => [c.id, [] as Project[]]),
  ) as Record<ProjectStatus, Project[]>
  for (const project of projects) grouped[project.status].push(project)
  return grouped
}
```

- [ ] **Крок 4: Запустити тести**

Run: `npm test`
Expected: PASS, 9 тестів.

- [ ] **Крок 5: Коміт**

```bash
git add lib/status.ts tests/status.test.ts
git commit -m "feat: add project status logic with stale detection"
```

---

## Задача 4: Логіка часу

**Files:**
- Create: `lib/time.ts`, `tests/time.test.ts`

**Interfaces:**
- Consumes: `TimeData`, `TimeEntry`, `RunningTimer` з `lib/types`
- Produces: `LONG_SESSION_MINUTES: number`, `minutesBetween(startIso: string, endIso: string): number`, `formatDuration(minutes: number): string`, `totalMinutes(entries: TimeEntry[], projectSlug: string): number`, `isLongSession(minutes: number): boolean`, `startTimer(data: TimeData, projectSlug: string, nowIso: string): TimeData`, `stopTimer(data: TimeData, nowIso: string, overrideMinutes?: number): TimeData`, `newEntryId(entries: TimeEntry[]): string`

- [ ] **Крок 1: Написати падаючі тести**

Create `tests/time.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  LONG_SESSION_MINUTES, minutesBetween, formatDuration, totalMinutes,
  isLongSession, startTimer, stopTimer, newEntryId,
} from '@/lib/time'
import type { TimeData, TimeEntry } from '@/lib/types'

const entry = (over: Partial<TimeEntry> = {}): TimeEntry => ({
  id: 'e_0001', projectSlug: 'a',
  startedAt: '2026-07-30T09:00:00.000Z', endedAt: '2026-07-30T10:00:00.000Z',
  minutes: 60, note: '', source: 'timer', ...over,
})

describe('minutesBetween', () => {
  it('рахує хвилини між ISO-мітками', () => {
    expect(minutesBetween('2026-07-30T09:15:00.000Z', '2026-07-30T11:40:00.000Z')).toBe(145)
  })

  it('округлює до цілої хвилини', () => {
    expect(minutesBetween('2026-07-30T09:00:00.000Z', '2026-07-30T09:00:40.000Z')).toBe(1)
  })

  it('ніколи не повертає відʼємне', () => {
    expect(minutesBetween('2026-07-30T11:00:00.000Z', '2026-07-30T09:00:00.000Z')).toBe(0)
  })
})

describe('formatDuration', () => {
  it('форматує години й хвилини', () => {
    expect(formatDuration(860)).toBe('14 год 20 хв')
  })

  it('пропускає години, коли їх немає', () => {
    expect(formatDuration(45)).toBe('45 хв')
  })

  it('пропускає хвилини, коли рівно години', () => {
    expect(formatDuration(120)).toBe('2 год')
  })

  it('нуль показує явно', () => {
    expect(formatDuration(0)).toBe('0 хв')
  })
})

describe('totalMinutes', () => {
  it('сумує тільки сесії потрібного проєкту', () => {
    const entries = [entry(), entry({ id: 'e_0002', projectSlug: 'b', minutes: 30 })]
    expect(totalMinutes(entries, 'a')).toBe(60)
  })

  it('порожній список дає нуль', () => {
    expect(totalMinutes([], 'a')).toBe(0)
  })
})

describe('isLongSession', () => {
  it('шість годин ще не довга', () => {
    expect(isLongSession(LONG_SESSION_MINUTES)).toBe(false)
  })

  it('понад шість годин — довга', () => {
    expect(isLongSession(LONG_SESSION_MINUTES + 1)).toBe(true)
  })
})

describe('newEntryId', () => {
  it('нумерує послідовно', () => {
    expect(newEntryId([entry({ id: 'e_0007' })])).toBe('e_0008')
  })

  it('на порожньому списку починає з першого', () => {
    expect(newEntryId([])).toBe('e_0001')
  })
})

describe('startTimer', () => {
  it('запускає таймер на порожньому стані', () => {
    const result = startTimer({ running: null, entries: [] }, 'a', '2026-07-31T10:00:00.000Z')
    expect(result.running).toEqual({ projectSlug: 'a', startedAt: '2026-07-31T10:00:00.000Z' })
  })

  it('зупиняє попередній таймер і записує його сесію', () => {
    const before: TimeData = {
      running: { projectSlug: 'a', startedAt: '2026-07-31T09:00:00.000Z' },
      entries: [],
    }
    const after = startTimer(before, 'b', '2026-07-31T10:00:00.000Z')
    expect(after.running?.projectSlug).toBe('b')
    expect(after.entries).toHaveLength(1)
    expect(after.entries[0].projectSlug).toBe('a')
    expect(after.entries[0].minutes).toBe(60)
  })

  it('не мутує вхідні дані', () => {
    const before: TimeData = { running: null, entries: [] }
    startTimer(before, 'a', '2026-07-31T10:00:00.000Z')
    expect(before.running).toBeNull()
  })
})

describe('stopTimer', () => {
  it('записує сесію й обнуляє running', () => {
    const before: TimeData = {
      running: { projectSlug: 'a', startedAt: '2026-07-31T09:00:00.000Z' },
      entries: [],
    }
    const after = stopTimer(before, '2026-07-31T11:30:00.000Z')
    expect(after.running).toBeNull()
    expect(after.entries[0].minutes).toBe(150)
    expect(after.entries[0].source).toBe('timer')
  })

  it('поважає ручне виправлення тривалості', () => {
    const before: TimeData = {
      running: { projectSlug: 'a', startedAt: '2026-07-30T09:00:00.000Z' },
      entries: [],
    }
    const after = stopTimer(before, '2026-07-31T09:00:00.000Z', 90)
    expect(after.entries[0].minutes).toBe(90)
    expect(after.entries[0].source).toBe('manual')
  })

  it('без запущеного таймера нічого не змінює', () => {
    const before: TimeData = { running: null, entries: [] }
    expect(stopTimer(before, '2026-07-31T11:00:00.000Z')).toEqual(before)
  })
})
```

- [ ] **Крок 2: Запустити тести, переконатись що падають**

Run: `npm test`
Expected: FAIL — `Cannot find module '@/lib/time'`

- [ ] **Крок 3: Реалізувати `lib/time.ts`**

```ts
import type { TimeData, TimeEntry } from './types'

export const LONG_SESSION_MINUTES = 360 // 6 годин

export function minutesBetween(startIso: string, endIso: string): number {
  const diff = new Date(endIso).getTime() - new Date(startIso).getTime()
  if (diff <= 0) return 0
  return Math.round(diff / 60_000)
}

export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '0 хв'
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} хв`
  if (rest === 0) return `${hours} год`
  return `${hours} год ${rest} хв`
}

export function totalMinutes(entries: TimeEntry[], projectSlug: string): number {
  return entries
    .filter((e) => e.projectSlug === projectSlug)
    .reduce((sum, e) => sum + e.minutes, 0)
}

export function isLongSession(minutes: number): boolean {
  return minutes > LONG_SESSION_MINUTES
}

export function newEntryId(entries: TimeEntry[]): string {
  const max = entries.reduce((acc, e) => {
    const n = Number(e.id.replace('e_', ''))
    return Number.isFinite(n) && n > acc ? n : acc
  }, 0)
  return `e_${String(max + 1).padStart(4, '0')}`
}

export function stopTimer(
  data: TimeData,
  nowIso: string,
  overrideMinutes?: number,
): TimeData {
  if (!data.running) return data
  const measured = minutesBetween(data.running.startedAt, nowIso)
  const entry: TimeEntry = {
    id: newEntryId(data.entries),
    projectSlug: data.running.projectSlug,
    startedAt: data.running.startedAt,
    endedAt: nowIso,
    minutes: overrideMinutes ?? measured,
    note: '',
    source: overrideMinutes === undefined ? 'timer' : 'manual',
  }
  return { running: null, entries: [...data.entries, entry] }
}

export function startTimer(
  data: TimeData,
  projectSlug: string,
  nowIso: string,
): TimeData {
  const stopped = stopTimer(data, nowIso)
  return { running: { projectSlug, startedAt: nowIso }, entries: stopped.entries }
}
```

Інваріант «один таймер» тримається тим, що `startTimer` завжди спершу викликає `stopTimer`. Це неможливо обійти з боку UI.

- [ ] **Крок 4: Запустити тести**

Run: `npm test`
Expected: PASS, усі тести часу й статусів.

- [ ] **Крок 5: Коміт**

```bash
git add lib/time.ts tests/time.test.ts
git commit -m "feat: add time tracking logic with single-timer invariant"
```

---

## Задача 5: Скрипт scan.mjs

**Files:**
- Create: `scripts/scan.mjs`, `lib/merge.mjs`, `tests/scan.test.ts`

**Interfaces:**
- Consumes: `Project` з `lib/types` (тільки в тесті, для типізації фікстур)
- Produces: `mergeProjects(existing, discovered)` — **чистий JS у `.mjs`**, щоб той самий файл імпортували і `scan.mjs`, і тести. Дублювати цю логіку заборонено.

- [ ] **Крок 1: Написати падаючий тест на merge-логіку**

Це серце скрипта: він не має права затерти те, що написала людина.

Create `tests/scan.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { mergeProjects } from '@/lib/merge.mjs'
import type { Project } from '@/lib/types'

const existing: Project = {
  slug: 'aquastar', title: 'Аквастар', tagline: 'Лендінг доставки води',
  story: 'Написано людиною', kind: 'web', stack: ['Next.js'],
  liveUrl: null, localPath: '~/Claude/aquastar', tags: ['landing'],
  status: 'finishing', featureSlugs: [], nextStep: 'Дожати форму',
  blocker: '', lastTouched: '2026-06-30', health: 'unknown',
}

describe('mergeProjects', () => {
  it('оновлює автополя', () => {
    const result = mergeProjects([existing], [
      { slug: 'aquastar', lastTouched: '2026-07-31' },
    ])
    expect(result[0].lastTouched).toBe('2026-07-31')
  })

  it('не затирає рукописні поля', () => {
    const result = mergeProjects([existing], [
      { slug: 'aquastar', title: 'aquastar', story: '', status: 'idea', nextStep: '' },
    ])
    expect(result[0].title).toBe('Аквастар')
    expect(result[0].story).toBe('Написано людиною')
    expect(result[0].status).toBe('finishing')
    expect(result[0].nextStep).toBe('Дожати форму')
  })

  it('додає нові проєкти з дефолтами', () => {
    const result = mergeProjects([existing], [
      { slug: 'new-thing', title: 'new-thing', lastTouched: '2026-07-31' },
    ])
    const added = result.find((p) => p.slug === 'new-thing')!
    expect(added.status).toBe('idea')
    expect(added.kind).toBe('web')
    expect(added.health).toBe('unknown')
    expect(added.tagline).toBe('')
  })

  it('не видаляє проєкти, яких більше немає на диску', () => {
    const result = mergeProjects([existing], [])
    expect(result).toHaveLength(1)
  })
})
```

Останній тест важливий: проєкт міг переїхати чи бути видалений з диска, але має лишитись у портфоліо.

- [ ] **Крок 2: Запустити тест, переконатись що падає**

Run: `npm test`
Expected: FAIL — `Cannot find module '@/lib/merge.mjs'`

- [ ] **Крок 3: Реалізувати `lib/merge.mjs`**

Файл навмисно на чистому JS, а не на TypeScript: його імпортує і `scripts/scan.mjs` (який не проходить через збірку), і тест. Одна реалізація — одне джерело правди.

```js
/** Поля, які скрипт має право перезаписувати. Решта — недоторканна. */
const AUTO_FIELDS = ['lastTouched']

export function mergeProjects(existing, discovered) {
  const byslug = new Map(existing.map((p) => [p.slug, p]))

  for (const found of discovered) {
    if (!found.slug) continue
    const current = byslug.get(found.slug)

    if (current) {
      const updated = { ...current }
      for (const field of AUTO_FIELDS) {
        if (found[field]) updated[field] = found[field]
      }
      byslug.set(found.slug, updated)
      continue
    }

    byslug.set(found.slug, {
      slug: found.slug,
      title: found.title ?? found.slug,
      tagline: '',
      story: '',
      kind: found.kind ?? 'web',
      stack: found.stack ?? [],
      liveUrl: found.liveUrl ?? null,
      localPath: found.localPath ?? '',
      tags: [],
      status: 'idea',
      featureSlugs: [],
      nextStep: '',
      blocker: '',
      lastTouched: found.lastTouched ?? '',
      health: 'unknown',
    })
  }

  return [...byslug.values()]
}
```

- [ ] **Крок 4: Запустити тести**

Run: `npm test`
Expected: PASS.

- [ ] **Крок 5: Написати `scripts/scan.mjs`**

```js
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { mergeProjects } from '../lib/merge.mjs'

const ROOT = process.env.SCAN_ROOT ?? path.join(os.homedir(), 'Claude')
const DATA = path.join(process.cwd(), 'data', 'projects.json')
const SKIP = new Set(['docs', 'portfolio', 'node_modules', 'aquastar-backup'])

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return null }
}

function isoDate(value) {
  return new Date(value).toISOString().slice(0, 10)
}

function discover() {
  const found = []
  for (const name of fs.readdirSync(ROOT)) {
    if (name.startsWith('.') || SKIP.has(name)) continue
    const full = path.join(ROOT, name)
    if (!fs.statSync(full).isDirectory()) continue

    const pkg = readJson(path.join(full, 'package.json'))
    const vercel = readJson(path.join(full, '.vercel', 'project.json'))
    const handoff = readJson(path.join(full, '.planning', 'HANDOFF.json'))

    const touched = handoff?.timestamp
      ? isoDate(handoff.timestamp)
      : isoDate(fs.statSync(full).mtime)

    found.push({
      slug: name,
      title: name,
      localPath: `~/Claude/${name}`,
      stack: pkg ? Object.keys(pkg.dependencies ?? {}).slice(0, 5) : [],
      liveUrl: vercel?.projectName ? `https://${vercel.projectName}.vercel.app` : null,
      lastTouched: touched,
    })
  }
  return found
}

const existing = readJson(DATA) ?? []
const merged = mergeProjects(existing, discover())

fs.writeFileSync(DATA, JSON.stringify(merged, null, 2) + '\n')

const added = merged.length - existing.length
console.log(`Проєктів: ${merged.length} (нових: ${added})`)
```

- [ ] **Крок 6: Прогнати скрипт і перевірити, що рукописне вціліло**

Run: `npm run scan`
Expected: виводить `Проєктів: 16 (нових: 0)` або більше, якщо на диску зʼявилось нове.

Run: `node -e "const p=require('./data/projects.json'); const a=p.find(x=>x.slug==='aquastar'); console.log(a.title, '|', a.status)"`
Expected: `Аква Стар | finishing` — тобто скрипт не затер рукописне.

- [ ] **Крок 7: Коміт**

```bash
git add scripts/scan.mjs lib/merge.mjs tests/scan.test.ts data/projects.json
git commit -m "feat: add project scanner that preserves hand-written fields"
```

---

## Задача 6: Скрипти health і shots

**Files:**
- Create: `scripts/health.mjs`, `scripts/shots.mjs`

**Interfaces:**
- Consumes: `data/projects.json`
- Produces: оновлене поле `health`; файли `public/shots/<slug>.webp`

- [ ] **Крок 1: Написати `scripts/health.mjs`**

```js
import fs from 'node:fs'
import path from 'node:path'

const DATA = path.join(process.cwd(), 'data', 'projects.json')
const TIMEOUT_MS = 10_000

const projects = JSON.parse(fs.readFileSync(DATA, 'utf8'))

async function check(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow' })
    return res.ok ? 'ok' : 'broken'
  } catch {
    return 'broken'
  } finally {
    clearTimeout(timer)
  }
}

for (const project of projects) {
  if (!project.liveUrl) {
    project.health = 'unknown'
    continue
  }
  project.health = await check(project.liveUrl)
  const mark = project.health === 'ok' ? '✓' : '✗'
  console.log(`${mark} ${project.slug} — ${project.liveUrl}`)
}

fs.writeFileSync(DATA, JSON.stringify(projects, null, 2) + '\n')

const broken = projects.filter((p) => p.health === 'broken')
console.log(broken.length ? `\nЗламано: ${broken.map((p) => p.slug).join(', ')}` : '\nВсе живе.')
```

- [ ] **Крок 2: Прогнати health**

Run: `npm run health`
Expected: список з галочками; проєкти без `liveUrl` пропускаються без помилок.

- [ ] **Крок 3: Написати `scripts/shots.mjs`**

Знімати тільки живі URL недостатньо: з 17 проєктів лише пʼять задеплоєні, а решта вебпроєктів — локальні HTML, які теж треба показати на вітрині. Тому скрипт має два джерела: `liveUrl`, а якщо його немає — локальний файл через `file://`.

```js
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright'

const DATA = path.join(process.cwd(), 'data', 'projects.json')
const OUT = path.join(process.cwd(), 'public', 'shots')

fs.mkdirSync(OUT, { recursive: true })

/** Розгортає ~ і знаходить HTML: сам файл, або index.html усередині папки. */
function localTarget(localPath) {
  if (!localPath) return null
  const full = localPath.replace(/^~/, os.homedir())
  if (!fs.existsSync(full)) return null
  if (full.endsWith('.html')) return full
  const index = path.join(full, 'index.html')
  return fs.existsSync(index) ? index : null
}

function resolveUrl(project) {
  if (project.kind !== 'web') return null
  if (project.liveUrl && project.health !== 'broken') return project.liveUrl
  const local = localTarget(project.localPath)
  return local ? pathToFileURL(local).href : null
}

const projects = JSON.parse(fs.readFileSync(DATA, 'utf8'))

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

let taken = 0
for (const project of projects) {
  const url = resolveUrl(project)
  if (!url) {
    console.log(`— ${project.slug} — нема що знімати`)
    continue
  }
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 })
    await page.waitForTimeout(1500) // дати анімаціям появи відпрацювати
    await page.screenshot({
      path: path.join(OUT, `${project.slug}.webp`),
      type: 'webp',
      quality: 80,
    })
    taken++
    console.log(`✓ ${project.slug} — ${url.startsWith('file:') ? 'локально' : 'live'}`)
  } catch (error) {
    console.log(`✗ ${project.slug} — ${error.message}`)
  }
}

await browser.close()
console.log(`\nЗнято: ${taken}`)
```

Два свідомі пропуски: зламані сайти (знімати сторінку помилки немає сенсу — але для них береться локальна копія, якщо вона є) і проєкти типу `deck` та `doc`, бо для них вітрина малює типографічну заглушку.

Локальні знімки виглядатимуть біднішими там, де сайт тягне шрифти чи картинки з мережі — це нормально, постер потрібен для впізнавання, а не для точності.

- [ ] **Крок 4: Прогнати shots**

Run: `npm run shots`
Expected: `Знято:` щонайменше 10 — пʼять live плюс локальні HTML (`medcentar`, `linco-offers`, `agency-crm`, `ofm-automation`, `bodnar-ortho`, `booking-clone`). Проєкти `deck` і `doc` у виводі позначені як «нема що знімати».

Run: `ls public/shots/ | wc -l`
Expected: збігається з числом «Знято».

- [ ] **Крок 5: Коміт**

```bash
git add scripts/health.mjs scripts/shots.mjs data/projects.json
git commit -m "feat: add health check and screenshot scripts"
```

---

## Задача 7: Оболонка й дизайн-система

**Files:**
- Create: `components/site-header.tsx`, `components/custom-cursor.tsx`
- Modify: `app/layout.tsx`, `app/globals.css`

**Interfaces:**
- Consumes: нічого
- Produces: `<SiteHeader />`, `<CustomCursor />`; CSS-змінні дизайн-токенів

**Дизайн — обовʼязково прочитати перед цією задачею.** Викликати skill `anthropic-skills:frontend-design`. Планка: editorial, а не шаблонний AI-сайт. Темна кінематографічна база, serif-заголовки, широкі поля, стримана анімація появи. Конкретні відтінки, шрифти й ритм — на розсуд виконавця в межах цих рамок; нижче зафіксовано тільки структурні вимоги.

- [ ] **Крок 1: Задати токени в `app/globals.css`**

Оголосити CSS-змінні для: фону, підвищеного фону (картки), основного тексту, приглушеного тексту, акценту, рамки. Плюс змінні для кольорів прапорців дошки — вони використовуються в Задачі 15:

```css
:root {
  --flag-broken: oklch(0.62 0.21 25);
  --flag-stale: oklch(0.78 0.15 85);
}
```

- [ ] **Крок 2: Підключити шрифти**

У `app/layout.tsx` через `next/font/google`: один serif для заголовків, один sans для інтерфейсу. Прокинути як CSS-змінні на `<html>`.

- [ ] **Крок 3: Створити `components/custom-cursor.tsx`**

Клієнтський компонент. Вимоги:
- Вимикається на дотикових пристроях: не рендерити, якщо `window.matchMedia('(pointer: coarse)').matches`.
- Поважає `prefers-reduced-motion` — без згладжування позиції.
- Розтягується/змінює стан над елементами з `data-cursor="hover"`.

- [ ] **Крок 4: Створити `components/site-header.tsx`**

Три посилання: `Роботи` (`/`), `Lab` (`/lab`), `Дошка` (`/board`). Праворуч — слот під `<TimerHud />`, який зʼявиться в Задачі 17. Поки що слот порожній.

- [ ] **Крок 5: Зібрати `app/layout.tsx`**

`lang="uk"`, метадані (`title`, `description`), `<CustomCursor />` і `<SiteHeader />` навколо `{children}`.

- [ ] **Крок 6: Перевірити в браузері**

Запустити дев-сервер через `preview_start`, відкрити `/`. Перевірити: шапка на місці, курсор працює, темна тема застосована. Зняти скріншот.

- [ ] **Крок 7: Коміт**

```bash
git add app/layout.tsx app/globals.css components/
git commit -m "feat: add app shell with design tokens and custom cursor"
```

---

## Задача 8: Вітрина

**Files:**
- Create: `components/live-preview.tsx`, `components/project-card.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `getProjects` з `lib/data`, `visibleOnShowcase` з `lib/status`, тип `Project`
- Produces: `hasShot(slug: string): boolean` у `lib/data.ts`; `<LivePreview project={project} hasShot={boolean} />`, `<ProjectCard project={project} />`

**Головна пастка задачі.** Скріншот є не в кожного проєкту: `deck` і `doc` не знімаються взагалі, а вебпроєкт міг не знятись через помилку. Якщо просто підставити `<img src="/shots/…">`, у цих карток буде бита картинка. Тому наявність файлу перевіряється на сервері, а картка без знімка малює типографічну заглушку.

- [ ] **Крок 1: Додати `hasShot` у `lib/data.ts`**

```ts
export function hasShot(slug: string): boolean {
  return fs.existsSync(path.join(process.cwd(), 'public', 'shots', `${slug}.webp`))
}
```

- [ ] **Крок 2: Створити `components/live-preview.tsx`**

Клієнтський компонент. Логіка:

```tsx
'use client'
import { useState } from 'react'
import type { Project } from '@/lib/types'

export function LivePreview({ project, hasShot }: { project: Project; hasShot: boolean }) {
  const [live, setLive] = useState(false)
  const canGoLive = project.kind === 'web' && !!project.liveUrl && project.health !== 'broken'

  return (
    <div
      className="relative aspect-[16/10] overflow-hidden"
      onMouseEnter={() => canGoLive && setLive(true)}
      onMouseLeave={() => setLive(false)}
    >
      {hasShot ? (
        <img
          src={`/shots/${project.slug}.webp`}
          alt={project.title}
          className="h-full w-full object-cover object-top"
          loading="lazy"
        />
      ) : (
        <Placeholder project={project} />
      )}
      {live && (
        <iframe
          src={project.liveUrl!}
          title={project.title}
          className="absolute inset-0 h-full w-full border-0"
          sandbox="allow-scripts allow-same-origin"
          loading="lazy"
        />
      )}
    </div>
  )
}

const KIND_LABEL = { web: 'Сайт', deck: 'Презентація', doc: 'Документ' } as const

function Placeholder({ project }: { project: Project }) {
  return (
    <div className="flex h-full w-full flex-col justify-between p-6">
      <span className="text-xs uppercase tracking-widest opacity-60">
        {KIND_LABEL[project.kind]}
      </span>
      <span className="text-2xl">{project.title}</span>
    </div>
  )
}
```

Ключове: iframe монтується тільки на hover. Інакше сторінка тягнула б 14 сайтів одночасно.

- [ ] **Крок 3: Створити `components/project-card.tsx`**

Серверний компонент. Показує `<LivePreview project={project} hasShot={hasShot(project.slug)} />`, `title`, `tagline`, теги, рік із `lastTouched`. Уся картка — посилання на `/work/[slug]`.

- [ ] **Крок 4: Зібрати `app/page.tsx`**

```tsx
import { getProjects } from '@/lib/data'
import { visibleOnShowcase } from '@/lib/status'
import { ProjectCard } from '@/components/project-card'

export default function Home() {
  const projects = visibleOnShowcase(getProjects())
  return (
    <main>
      {/* герой: імʼя, рід занять, кількість робіт */}
      <section>
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </section>
    </main>
  )
}
```

- [ ] **Крок 5: Перевірити в браузері**

Відкрити `/`. Перевірити:
- 14 карток (17 мінус 3 архівні).
- Скріншоти вантажаться; **жодної битої картинки** — на місці відсутнього знімка типографічна заглушка.
- На hover над `artpro`, `altus-store`, `revela-store`, `aquastar`, `brownhill-offer` зʼявляється живий iframe.
- `altus-pitch`, `revela-pitch`, `revela-gtm` показують заглушку «Презентація», `tmc-report` — «Документ», і на hover нічого не підвантажують.

Зняти скріншот.

- [ ] **Крок 6: Коміт**

```bash
git add app/page.tsx lib/data.ts components/live-preview.tsx components/project-card.tsx
git commit -m "feat: add showcase page with hover-activated live previews"
```

---

## Задача 9: Сторінка кейсу

**Files:**
- Create: `app/work/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getProject`, `getProjects`, `getFeatures`, `getTimeData` з `lib/data`; `totalMinutes`, `formatDuration` з `lib/time`
- Produces: маршрут `/work/[slug]`

- [ ] **Крок 1: Реалізувати сторінку**

```tsx
import { notFound } from 'next/navigation'
import { getProject, getProjects, getFeatures, getTimeData } from '@/lib/data'
import { totalMinutes, formatDuration } from '@/lib/time'

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }))
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) notFound()

  const features = getFeatures().filter((f) => f.fromProject === slug)
  const { entries } = getTimeData()
  const spent = totalMinutes(entries, slug)
  const sessions = entries.filter((e) => e.projectSlug === slug)

  return (
    <main>
      {/* title, tagline, story, stack, lastTouched, кнопка на liveUrl */}
      {/* «Витрачено: {formatDuration(spent)}» + список sessions з датами й нотатками */}
      {/* «Фічі звідси» — features з посиланнями на /lab/[slug] */}
    </main>
  )
}
```

У Next 16 `params` — Promise, його треба чекати. Це не помилка.

- [ ] **Крок 2: Перевірити в браузері**

Відкрити `/work/revela-store`. Перевірити: дані на місці, кнопка веде на живий сайт, час показує `0 хв` (сесій ще немає). Відкрити `/work/не-існує` — має бути 404.

- [ ] **Крок 3: Коміт**

```bash
git add app/work
git commit -m "feat: add project case page with time breakdown"
```

---

## Задача 10: Пароль на приватні режими

**Files:**
- Create: `middleware.ts`, `app/login/page.tsx`, `app/api/login/route.ts`, `.env.local`

**Interfaces:**
- Consumes: `process.env.LAB_PASSWORD`
- Produces: захищені маршрути `/lab/*` і `/board`

**Обсяг захисту.** Це бар'єр від випадкового відвідувача, а не автентифікація. Чутливі дані (ціни клієнтів, внутрішні легенди) у нотатки не пишемо — це записано і в спеці.

- [ ] **Крок 1: Створити `.env.local`**

```
LAB_PASSWORD=постав-свій-пароль
```

Переконатись, що файл у `.gitignore` (додано в Задачі 1).

- [ ] **Крок 2: Створити `app/api/login/route.ts`**

```ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const expected = process.env.LAB_PASSWORD
  if (!expected) {
    // Без цього незаданий env дає вічний 401 без жодного пояснення.
    return NextResponse.json(
      { ok: false, error: 'LAB_PASSWORD не заданий' },
      { status: 500 },
    )
  }

  const { password } = await request.json()
  if (password !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const response = NextResponse.json({ ok: true })
  response.cookies.set('lab', '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  return response
}
```

- [ ] **Крок 3: Створити `middleware.ts`**

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.cookies.get('lab')?.value === '1') return NextResponse.next()
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  url.searchParams.set('from', request.nextUrl.pathname)
  return NextResponse.redirect(url)
}

export const config = { matcher: ['/lab/:path*', '/board'] }
```

API-роути навмисно не в матчері: `/api/login` має бути доступним, щоб було де ввести пароль, а `/api/board` і `/api/time` і так закриті перевіркою на продакшн і працюють лише на localhost.

- [ ] **Крок 4: Створити `app/login/page.tsx`**

Клієнтський компонент: поле пароля, кнопка, `POST /api/login`, при успіху `router.push` на `?from` (або `/lab`). Розрізняти дві помилки: **401** — «Невірний пароль»; **500** — показати текст із відповіді («LAB_PASSWORD не заданий»), бо це не помилка користувача, а незаповнений `.env.local`.

- [ ] **Крок 5: Перевірити в браузері**

Відкрити `/board` — має перекинути на `/login`. Ввести неправильний пароль — помилка. Ввести правильний — потрапляєш на `/board` (поки що 404, сторінка зʼявиться в Задачі 15). Перевірити, що `/` лишається відкритим без пароля.

- [ ] **Крок 6: Коміт**

```bash
git add middleware.ts app/login app/api/login
git commit -m "feat: gate lab and board behind password"
```

---

## Задача 11: Каталог фіч

**Files:**
- Create: `app/lab/page.tsx`, `components/feature-card.tsx`, `components/feature-search.tsx`

**Interfaces:**
- Consumes: `getFeatures` з `lib/data`, тип `Feature`
- Produces: маршрут `/lab`, `<FeatureSearch features={features} />`

- [ ] **Крок 1: Створити `components/feature-search.tsx`**

Клієнтський компонент, тримає весь список у памʼяті й фільтрує локально — 5-50 фіч не потребують серверного пошуку.

```tsx
'use client'
import { useMemo, useState } from 'react'
import type { Feature } from '@/lib/types'
import { FeatureCard } from './feature-card'

export function FeatureSearch({ features }: { features: Feature[] }) {
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState<string | null>(null)

  const tags = useMemo(
    () => [...new Set(features.flatMap((f) => f.tags))].sort(),
    [features],
  )

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return features.filter((f) => {
      if (tag && !f.tags.includes(tag)) return false
      if (!q) return true
      return (
        f.title.toLowerCase().includes(q) ||
        f.summary.toLowerCase().includes(q) ||
        f.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [features, query, tag])

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Пошук фічі…"
        aria-label="Пошук фічі"
      />
      <div role="group" aria-label="Фільтр за тегом">
        <button onClick={() => setTag(null)} aria-pressed={tag === null}>Усі</button>
        {tags.map((t) => (
          <button key={t} onClick={() => setTag(t)} aria-pressed={tag === t}>{t}</button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p>Нічого не знайшлось.</p>
      ) : (
        shown.map((f) => <FeatureCard key={f.slug} feature={f} />)
      )}
    </div>
  )
}
```

- [ ] **Крок 2: Створити `components/feature-card.tsx`**

Картка: назва, `summary`, теги, звідки прийшла (`fromProject`). Уся картка — посилання на `/lab/[slug]`.

- [ ] **Крок 3: Створити `app/lab/page.tsx`**

Серверний компонент: `getFeatures()` → `<FeatureSearch features={features} />`.

- [ ] **Крок 4: Перевірити в браузері**

Відкрити `/lab` (ввівши пароль). Список порожній — це очікувано, фічі зʼявляться в Задачі 14. Перевірити, що показується «Нічого не знайшлось» замість помилки.

- [ ] **Крок 5: Коміт**

```bash
git add app/lab/page.tsx components/feature-card.tsx components/feature-search.tsx
git commit -m "feat: add feature catalog with client-side search"
```

---

## Задача 12: Сторінка фічі

**Files:**
- Create: `app/lab/[slug]/page.tsx`, `components/code-panel.tsx`

**Interfaces:**
- Consumes: `getFeature`, `getFeatures` з `lib/data`
- Produces: маршрут `/lab/[slug]`, `<CodePanel code={code} />`

- [ ] **Крок 1: Створити `components/code-panel.tsx`**

```tsx
'use client'
import { useState } from 'react'

export function CodePanel({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <button onClick={copy}>{copied ? 'Скопійовано' : 'Копіювати код'}</button>
      <pre><code>{code}</code></pre>
    </div>
  )
}
```

Без бібліотеки підсвітки — вона тягне вагу заради косметики. Моноширинний шрифт і читабельні відступи достатні.

- [ ] **Крок 2: Створити `app/lab/[slug]/page.tsx`**

```tsx
import fs from 'node:fs'
import path from 'node:path'
import { notFound } from 'next/navigation'
import { getFeature, getFeatures } from '@/lib/data'
import { CodePanel } from '@/components/code-panel'

export function generateStaticParams() {
  return getFeatures().map((f) => ({ slug: f.slug }))
}

export default async function FeaturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const feature = getFeature(slug)
  if (!feature) notFound()

  const dir = path.join(process.cwd(), 'public', 'features', slug)
  const code = fs.readFileSync(path.join(dir, 'index.html'), 'utf8')
  const notesPath = path.join(dir, 'notes.md')
  const notes = fs.existsSync(notesPath) ? fs.readFileSync(notesPath, 'utf8') : ''

  return (
    <main>
      <h1>{feature.title}</h1>
      <p>{feature.summary}</p>
      <iframe
        src={`/features/${slug}/index.html`}
        title={`Демо: ${feature.title}`}
        className="h-[60vh] w-full border-0"
        sandbox="allow-scripts"
      />
      <CodePanel code={code} />
      <section>{notes}</section>
    </main>
  )
}
```

`sandbox="allow-scripts"` без `allow-same-origin` — демо не має доступу до батьківської сторінки.

Той самий файл читається двічі: браузером через `src` і сервером через `readFileSync`. Це і є інваріант «одне джерело».

- [ ] **Крок 3: Перевірити після Задачі 14**

Сторінку неможливо перевірити без жодної фічі. Перевірка виконується першим кроком Задачі 14.

- [ ] **Крок 4: Коміт**

```bash
git add app/lab/[slug] components/code-panel.tsx
git commit -m "feat: add feature page with live demo and copyable source"
```

---

## Задача 13: Витягти першу фічу

**Files:**
- Create: `public/features/video-lock/index.html`, `public/features/video-lock/notes.md`
- Modify: `data/features.json`, `data/projects.json`

**Interfaces:**
- Consumes: структуру `Feature` з `lib/types`
- Produces: перший запис у `features.json`; підтверджений робочий шлях витягування

**Що таке «витягнути фічу».** Взяти з проєкту-джерела код фічі й зібрати з нього **самодостатній** `index.html`: увесь CSS і JS всередині файлу, без збірки, без імпортів, без CDN там, де можна обійтись. Критерій готовності жорсткий: **файл відкривається подвійним кліком у браузері й працює.**

Першою йде найпростіша фіча — чистий HTML і CSS без стороннього коду. Мета задачі не в самій фічі, а в тому, щоб пройти весь шлях від джерела до сторінки в `/lab` і переконатись, що ланцюг працює.

- [ ] **Крок 1: Знайти джерело**

Прочитати `~/Claude/artpro/program.html`. Шукати блок із класом `thumb locked` — це замкнена картка відео плюс банер доступу під нею. Джерело перевірене: клас існує в цьому файлі, підпис `title="Відкрийте доступ, щоб переглянути відео"`.

- [ ] **Крок 2: Зібрати самодостатній файл**

Створити `public/features/video-lock/index.html`: сітка з чотирьох карток відео, де перша відкрита (превʼю грає), решта замкнені — затемнення, іконка замка, підпис. Під сіткою банер із кнопкою «Відкрити доступ». Прибрати все, що стосується конкретно ARTPRO: шрифти Unbounded/Manrope, лаймовий акцент `#c5f82a`, назви програм. Замість реального відео — CSS-градієнт-заглушка, щоб файл не тягнув мегабайти.

- [ ] **Крок 3: Перевірити автономність**

Run: `open public/features/video-lock/index.html`
Expected: сторінка відкривається з файлової системи, замки на місці, у консолі порожньо.

Це найважливіша перевірка задачі. Якщо файл не працює автономно — він не працюватиме і в iframe.

- [ ] **Крок 4: Написати `notes.md`**

Три розділи: **Що робить**, **Як вбудувати в новий проєкт**, **На що звернути увагу**. В останній обовʼязково записати те, що вже відоме з ARTPRO: **замок у CSS — це вітрина, а не захист.** Платні відео не можна класти простими файлами, бо будь-хто з URL їх скачає. Реальний доступ — приватний відеохостинг (Vimeo, Bunny, Mux) плюс перевірка на боці сервера.

- [ ] **Крок 5: Додати запис у `data/features.json`**

```json
[
  {
    "slug": "video-lock",
    "title": "Замок на відео",
    "summary": "Структура контенту відкрита всім, самі відео замкнені до оплати",
    "tags": ["access", "video", "paywall"],
    "fromProject": "artpro",
    "deps": []
  }
]
```

Додати `"video-lock"` у `featureSlugs` проєкту `artpro` в `data/projects.json`.

- [ ] **Крок 6: Перевірити наскрізний шлях**

Відкрити `/lab` — картка на місці, пошук по слову «замок» її знаходить. Відкрити `/lab/video-lock` — демо крутиться в iframe, код показано, кнопка копіювання працює, нотатки видно. Відкрити `/work/artpro` — фіча зʼявилась у секції «Фічі звідси». Зняти скріншот.

- [ ] **Крок 7: Коміт**

```bash
git add public/features data/features.json data/projects.json
git commit -m "feat: extract video lock as first library feature"
```

---

## Задача 14: Витягти решту стартових фіч

**Files:**
- Create: `public/features/<slug>/index.html` і `notes.md` для чотирьох фіч
- Modify: `data/features.json`, `data/projects.json`

**Interfaces:**
- Consumes: шлях витягування, підтверджений у Задачі 13
- Produces: пʼять фіч у каталозі

Для кожної фічі повторити повний цикл Задачі 13: знайти джерело → зібрати самодостатній HTML → перевірити подвійним кліком → написати нотатки → додати запис → перевірити в `/lab`.

**Усі чотири джерела перевірені — файли існують і містять названий код.** Якщо якесь усе ж не знайдеться, не вигадувати фічу: взяти сусідній компонент із того самого проєкту й записати заміну в коміт.

Дві останні фічі живуть у React-компонентах (`.tsx`). Їх треба **переписати на ванільний JS** — обидві тонкі обгортки над подіями миші й `IntersectionObserver`, тому це десятки рядків, а не порт застосунку. Тягнути React у демо заборонено: файл має відкриватись подвійним кліком.

- [ ] **Крок 1: `film-develop` — знімок, що проявляється**

Джерело: `~/Claude/revela-store/assets/js/store.js`, шукати рядок із `DEVELOPING`. Кнопка затвора запускає CSS-анімацію `filter` від чорного до нормального за 5.2 с, з лічильником секунд і відліком кадрів 8→0 та перезарядкою пачки. Найефектніша фіча в бібліотеці. Теги: `["animation", "css-filter", "interaction"]`, `fromProject: "revela-store"`, `deps: []`.

- [ ] **Крок 2: `desk-height-demo` — інтерактивне креслення за розміром**

Джерело: `~/Claude/altus-store/build/svg.js`, функція `desk(o = {})` (є також копія в `assets/js/store.js`). Повзунок висоти в сантиметрах перемальовує SVG-стіл. Узагальнити підпис у нотатках: це шаблон «параметр → перемальоване SVG-креслення», придатний не лише для столів. Теги: `["svg", "interaction", "configurator"]`, `fromProject: "altus-store"`, `deps: []`.

- [ ] **Крок 3: `scroll-reveal` — поява секцій при скролі**

Джерело: `~/Claude/aquastar/components/Reveal.tsx`. Переписати на ванільний `IntersectionObserver`. У нотатках обовʼязково: поважати `prefers-reduced-motion` і не ховати контент назавжди, якщо JS не виконався — початковий стан має бути видимим, а анімація додаватись класом. Теги: `["scroll", "animation"]`, `fromProject: "aquastar"`, `deps: []`.

- [ ] **Крок 4: `magnetic-hover` — магнітне притягання елемента до курсора**

Джерело: `~/Claude/aquastar/components/Magnetic.tsx`. Кнопка зміщується до курсора в межах свого радіуса й пружно повертається. Переписати на ванільний JS через `mousemove` і `transform`. У нотатках: вимикати на `pointer: coarse`, бо на дотику ефекту немає, а обробник висить. Теги: `["cursor", "animation", "micro-interaction"]`, `fromProject: "aquastar"`, `deps: []`.

- [ ] **Крок 5: Перевірити всі пʼять**

Відкрити `/lab`. Очікується пʼять карток. Перевірити кожну сторінку фічі: демо крутиться в iframe, код копіюється, нотатки на місці. Окремо перевірити, що жодна не тягне зовнішніх запитів — вкладка «Мережа» в дев-тулзах має бути порожньою після завантаження самого файлу.

Прописати `featureSlugs` у відповідних проєктах: `revela-store` → `film-develop`, `altus-store` → `desk-height-demo`, `aquastar` → `scroll-reveal`, `magnetic-hover`.

- [ ] **Крок 6: Коміт**

```bash
git add public/features data/features.json data/projects.json
git commit -m "feat: extract four more features into the library"
```

---

## Задача 15: Дошка (тільки читання)

**Files:**
- Create: `app/board/page.tsx`, `components/board-column.tsx`, `components/board-card.tsx`

**Interfaces:**
- Consumes: `getProjects`, `getTimeData` з `lib/data`; `BOARD_COLUMNS`, `groupByColumn`, `isStale` з `lib/status`; `totalMinutes`, `formatDuration` з `lib/time`
- Produces: маршрут `/board`; `<BoardColumn column={{ id, label }} items={{ project, spent, stale }[]} editable={boolean} />`, `<BoardCard project={project} spent={number} stale={boolean} editable={boolean} />`

Проп `editable` додається в Задачі 16; до того передається як `false`.

- [ ] **Крок 1: Створити `components/board-card.tsx`**

Показує: назву, `formatDuration(spent)`, `lastTouched`, `nextStep` (якщо не порожній), прапорці. Прапорці:

- 🔴 `health === 'broken'` — колір `var(--flag-broken)`, підказка «Сайт не відповідає».
- 🟡 `stale` — колір `var(--flag-stale)`, підказка «Понад 60 днів без роботи».
- 🟡 `blocker !== ''` — показати текст блокера.

Прапорці — не тільки колір: додати іконку або текст, щоб інформація не залежала від розрізнення кольорів.

Картка — посилання на `/work/[slug]`.

- [ ] **Крок 2: Створити `components/board-column.tsx`**

Заголовок колонки з `label` і лічильником карток. Вертикальний список карток. Порожня колонка не зникає — показує приглушену заглушку.

- [ ] **Крок 3: Створити `app/board/page.tsx`**

```tsx
import { getProjects, getTimeData } from '@/lib/data'
import { BOARD_COLUMNS, groupByColumn, isStale } from '@/lib/status'
import { totalMinutes } from '@/lib/time'
import { BoardColumn } from '@/components/board-column'

export const dynamic = 'force-dynamic'

export default function BoardPage() {
  const projects = getProjects()
  const { entries } = getTimeData()
  const now = new Date()
  const grouped = groupByColumn(projects)

  const enriched = Object.fromEntries(
    BOARD_COLUMNS.map((column) => [
      column.id,
      grouped[column.id].map((project) => ({
        project,
        spent: totalMinutes(entries, project.slug),
        stale: isStale(project, now),
      })),
    ]),
  )

  return (
    <main className="flex gap-4 overflow-x-auto">
      {BOARD_COLUMNS.map((column) => (
        <BoardColumn key={column.id} column={column} items={enriched[column.id]} editable={false} />
      ))}
    </main>
  )
}
```

`force-dynamic` обовʼязково: після запису в JSON дошка має показувати свіжий стан без перезбірки.

- [ ] **Крок 4: Перевірити в браузері**

Відкрити `/board`. Перевірити: шість колонок, усі 17 карток розкладені за статусами (архівні три — в «Архів», `aquastar` — у «Фініш», `medcentar` — у «В роботі», решта — у «Готово»), дошка гортається горизонтально. Зняти скріншот.

- [ ] **Крок 5: Коміт**

```bash
git add app/board components/board-column.tsx components/board-card.tsx
git commit -m "feat: add read-only kanban board with health and stale flags"
```

---

## Задача 16: Перетягування карток

**Files:**
- Create: `lib/write.ts`, `app/api/board/route.ts`
- Modify: `components/board-card.tsx`, `components/board-column.tsx`, `app/board/page.tsx`

**Interfaces:**
- Consumes: `lib/data`, `ProjectStatus`
- Produces: `assertWritable(): void`, `writeProjects(projects: Project[]): void`, `writeTime(data: TimeData): void`; ендпоінт `PATCH /api/board`

- [ ] **Крок 1: Створити `lib/write.ts`**

```ts
import fs from 'node:fs'
import path from 'node:path'
import type { Project, TimeData } from './types'

const DATA_DIR = path.join(process.cwd(), 'data')

export function assertWritable(): void {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('read-only')
  }
}

function write(file: string, value: unknown): void {
  assertWritable()
  const full = path.join(DATA_DIR, file)
  const tmp = `${full}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2) + '\n')
  fs.renameSync(tmp, full)
}

export function writeProjects(projects: Project[]): void {
  write('projects.json', projects)
}

export function writeTime(data: TimeData): void {
  write('time.json', data)
}
```

Запис через тимчасовий файл і `rename` — щоб перерваний запис не лишив покалічений JSON.

- [ ] **Крок 2: Створити `app/api/board/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { getProjects } from '@/lib/data'
import { writeProjects } from '@/lib/write'
import { BOARD_COLUMNS } from '@/lib/status'
import type { ProjectStatus } from '@/lib/types'

export async function PATCH(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'read-only' }, { status: 403 })
  }

  const { slug, status } = (await request.json()) as { slug: string; status: ProjectStatus }

  if (!BOARD_COLUMNS.some((c) => c.id === status)) {
    return NextResponse.json({ error: 'unknown status' }, { status: 400 })
  }

  const projects = getProjects()
  const target = projects.find((p) => p.slug === slug)
  if (!target) return NextResponse.json({ error: 'unknown project' }, { status: 404 })

  target.status = status
  writeProjects(projects)
  return NextResponse.json({ ok: true })
}
```

- [ ] **Крок 3: Додати перетягування**

Нативний HTML5, без бібліотек. На картці: `draggable`, `onDragStart` кладе `slug` у `dataTransfer`. На колонці: `onDragOver` з `preventDefault()`, `onDrop` читає `slug`, шле `PATCH /api/board`, потім `router.refresh()`.

Кнопка таймера й посилання всередині картки мають гасити подію перетягування, щоб клік не перетворювався на драг.

Перетягування вмикається тільки коли запис доступний. Прокинути прапорець із серверного компонента:

```tsx
const editable = process.env.NODE_ENV !== 'production'
```

і передати в `<BoardColumn editable={editable} …/>`. На Vercel картки не перетягуються — це очікувана поведінка, а не баг.

- [ ] **Крок 4: Перевірити в браузері**

Перетягнути `medcentar` з «В роботі» в «Фініш». Перевірити: картка лишилась у новій колонці після оновлення сторінки.

Run: `node -e "const p=require('./data/projects.json'); console.log(p.find(x=>x.slug==='medcentar').status)"`
Expected: `finishing`

Повернути назад перетягуванням і перевірити, що знову `in-progress`.

- [ ] **Крок 5: Коміт**

```bash
git add lib/write.ts app/api/board components/ app/board
git commit -m "feat: add drag-and-drop status editing in dev mode"
```

---

## Задача 17: Таймер

**Files:**
- Create: `app/api/time/route.ts`, `components/timer-button.tsx`, `components/timer-hud.tsx`, `components/long-session-dialog.tsx`
- Modify: `components/board-card.tsx`, `components/site-header.tsx`, `app/layout.tsx`

**Interfaces:**
- Consumes: `startTimer`, `stopTimer`, `minutesBetween`, `isLongSession`, `formatDuration` з `lib/time`; `getTimeData` з `lib/data`; `writeTime` з `lib/write`
- Produces: ендпоінт `POST /api/time`, `<TimerButton projectSlug running editable />`, `<TimerHud />`

- [ ] **Крок 1: Створити `app/api/time/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { getTimeData } from '@/lib/data'
import { writeTime } from '@/lib/write'
import { startTimer, stopTimer } from '@/lib/time'

type Body =
  | { action: 'start'; projectSlug: string }
  | { action: 'stop'; overrideMinutes?: number }

export async function GET() {
  return NextResponse.json(getTimeData())
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'read-only' }, { status: 403 })
  }

  const body = (await request.json()) as Body
  const now = new Date().toISOString()
  const data = getTimeData()

  const next =
    body.action === 'start'
      ? startTimer(data, body.projectSlug, now)
      : stopTimer(data, now, body.overrideMinutes)

  writeTime(next)
  return NextResponse.json(next)
}
```

Уся логіка живе в `lib/time.ts` і вже протестована. Роут тільки читає, викликає й пише.

- [ ] **Крок 2: Створити `components/timer-button.tsx`**

Клієнтський компонент. Поведінка:
- Не запущено → кнопка «Старт».
- Запущено на цьому проєкті → кнопка «Стоп» + лічильник, що цокає (`setInterval` раз на секунду, тільки для показу — джерело правди на сервері).
- Запущено на **іншому** проєкті → кнопка «Старт» з підказкою «Зупинить таймер по {інший проєкт}».
- `editable === false` → кнопка не рендериться взагалі.

Перед зупинкою рахує `minutesBetween(startedAt, now)`. Якщо `isLongSession(...)` — не шле запит, а відкриває `<LongSessionDialog />`.

- [ ] **Крок 3: Створити `components/long-session-dialog.tsx`**

Модалка з підставленим фактичним часом у хвилинах, яке можна виправити. Дві дії:
- **Записати** → `POST /api/time` з `{ action: 'stop', overrideMinutes }`.
- **Скасувати** → закриває модалку, таймер лишається запущеним, нічого не записано.

Текст: «Таймер по {проєкт} іде з {дата, час}. Скільки з цього справді робота?»

- [ ] **Крок 4: Створити `components/timer-hud.tsx`**

Клієнтський компонент у шапці. При монтуванні `GET /api/time`. Якщо є `running` — показує назву проєкту й лічильник, що цокає, з посиланням на `/work/[slug]`. Якщо `running` немає — не рендерить нічого.

Якщо `running.startedAt` — попередній календарний день, одразу відкриває `<LongSessionDialog />`. Це і є перевірка забутого таймера з попереднього дня.

- [ ] **Крок 5: Підключити**

`<TimerButton />` у `board-card.tsx` (з гасінням події перетягування). `<TimerHud />` у слот `site-header.tsx`.

- [ ] **Крок 6: Перевірити в браузері**

1. Стартувати таймер на `aquastar`. Перевірити: кнопка стала «Стоп», у шапці зʼявився HUD із лічильником.
2. Перейти на `/lab` — HUD видно й там.
3. Стартувати таймер на `medcentar`. Перевірити: таймер `aquastar` зупинився сам, у `time.json` зʼявилась одна сесія.

Run: `node -e "const t=require('./data/time.json'); console.log(t.running.projectSlug, '|', t.entries.length)"`
Expected: `medcentar | 1`

4. Зупинити таймер. Перевірити, що `running` став `null`, а сесій дві.
5. Перевірити довгу сесію: вручну виставити в `time.json` `running.startedAt` на 8 годин раніше, оновити сторінку, натиснути «Стоп» — має відкритись модалка з ~480 хв. Вписати `120`, записати.

Run: `node -e "const t=require('./data/time.json'); const e=t.entries.at(-1); console.log(e.minutes, e.source)"`
Expected: `120 manual`

- [ ] **Крок 7: Коміт**

```bash
git add app/api/time components/timer-button.tsx components/timer-hud.tsx components/long-session-dialog.tsx components/board-card.tsx components/site-header.tsx
git commit -m "feat: add project timer with long-session guard"
```

---

## Задача 18: Зведення годин

**Files:**
- Create: `components/time-summary.tsx`
- Modify: `app/board/page.tsx`

**Interfaces:**
- Consumes: `Project`, `TimeEntry`; `totalMinutes`, `formatDuration` з `lib/time`
- Produces: `<TimeSummary projects={projects} entries={entries} />`

Мета — відповісти на питання «скільки просити за наступний лендінг». Не гроші, а години: ціну автор рахує сам.

- [ ] **Крок 1: Створити `components/time-summary.tsx`**

Серверний компонент. Дві частини:

**Загальна таблиця** — проєкти з ненульовим часом, від найбільшого. Колонки: назва, тип (перший тег), витрачено.

**Вилки за типом** — групування за першим тегом проєкту; для кожної групи мінімум, максимум і медіана в годинах. Рядок читається як «магазин — 18–26 год, медіана 21».

Групи з однією роботою показувати з підписом «одна робота» замість вилки: діапазон з одного значення вводив би в оману.

Якщо жодної сесії немає — показати рядок «Ще немає записаного часу» замість порожньої таблиці.

- [ ] **Крок 2: Підключити на `/board`**

Вставити `<TimeSummary />` над колонками, згорнутим за замовчуванням (`<details>`), щоб не тіснити дошку.

- [ ] **Крок 3: Перевірити в браузері**

Відкрити `/board`. Розгорнути зведення. Перевірити: проєкти з часом із Задачі 17 на місці, суми збігаються з `time.json`, групи з однією роботою не показують фальшивої вилки.

- [ ] **Крок 4: Коміт**

```bash
git add components/time-summary.tsx app/board/page.tsx
git commit -m "feat: add hours rollup for pricing reference"
```

---

## Задача 19: Деплой

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: увесь готовий додаток
- Produces: живий URL

- [ ] **Крок 1: Перевірити продакшн-збірку локально**

Run: `npm run build && npm test`
Expected: обидві команди зелені.

Run: `NODE_ENV=production npm start`, потім у другому терміналі:

```bash
curl -s -o /dev/null -w "%{http_code}" -X PATCH localhost:3000/api/board -H 'content-type: application/json' -d '{"slug":"aquastar","status":"done"}'
```

Expected: `403`. Якщо не 403 — зупинитись і полагодити, це головний запобіжник продакшена.

- [ ] **Крок 2: Задеплоїти**

```bash
npx vercel --prod
```

У налаштуваннях проєкту на Vercel додати змінну `LAB_PASSWORD`.

- [ ] **Крок 3: Перевірити живу версію**

Відкрити продакшн-URL. Перевірити:
- `/` відкривається без пароля, картки й превʼю працюють.
- `/board` просить пароль; після входу дошка видна, але картки **не перетягуються**, кнопок таймера **немає**.
- `/lab/video-lock` — демо крутиться, код копіюється.

- [ ] **Крок 4: Написати `README.md`**

Розділи: що це, три режими, як запустити локально, що вміють три скрипти, чому запис працює тільки локально, як додати новий проєкт (`npm run scan` → дописати опис → `npm run shots`), як витягти нову фічу (критерій: файл працює при відкритті подвійним кліком).

- [ ] **Крок 5: Коміт**

```bash
git add README.md
git commit -m "docs: add README with local workflow"
```

---

## Порядок і залежності

Задачі 1-6 — фундамент, суворо послідовно. Далі:

- **7 → 8 → 9** — публічна частина.
- **10 → 11 → 12 → 13 → 14** — Lab. Задача 12 перевіряється всередині 13.
- **15 → 16 → 17 → 18** — дошка. Задача 17 залежить від `lib/write.ts` із задачі 16.
- **19** — останньою.

Задача 7 має бути завершена до 8, 11 і 15 — всі три використовують оболонку й токени.

## Що свідомо не входить

База даних, CMS, real-time, аналітика, багатокористувацький доступ, drag-and-drop і таймер у продакшені, автоматичне визначення етапу проєкту, ставки й рахунки в грошах, автотрекінг часу через git-коміти чи активність редактора, підсвітка синтаксису бібліотекою.

## Відкриті питання

- Назва в шапці вітрини — поки `Portfolio`. Змінюється в `components/site-header.tsx` і метаданих `app/layout.tsx`.
