# Marketing

Full-stack приложение на Next.js 14 (App Router) + TypeScript + Tailwind CSS.

## Стек

- [Next.js 14](https://nextjs.org/) — React-фреймворк с App Router и API routes
- [TypeScript](https://www.typescriptlang.org/) — типизация
- [Tailwind CSS](https://tailwindcss.com/) — utility-first стили
- ESLint (`next/core-web-vitals`)

## Запуск

Один раз установите зависимости:

```bash
npm install
```

Запустите dev-сервер:

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Полезные команды

| Команда | Что делает |
| --- | --- |
| `npm run dev` | dev-сервер с hot-reload |
| `npm run build` | продакшн-сборка |
| `npm run start` | запуск собранного приложения |
| `npm run lint` | проверка ESLint |
| `npm run type-check` | проверка типов TypeScript |

## Структура

```
marketing/
├── app/                # App Router: layout, страницы, API routes
│   ├── layout.tsx      # корневой layout
│   ├── page.tsx        # главная страница
│   └── globals.css     # глобальные стили + Tailwind директивы
├── public/             # статика (картинки, иконки)
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Дальнейшие шаги

- API routes класть в `app/api/<route>/route.ts`
- Серверные компоненты по умолчанию; добавляйте `"use client"` для клиентских
- Когда понадобится БД — Prisma + Postgres (например, через Neon или Supabase)
