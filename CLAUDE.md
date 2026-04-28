# Project context for Claude Code

Этот файл читается Claude Code при работе в этом репозитории. Если вы открываете проект через Claude Code CLI — Claude автоматически подхватит контекст ниже.

## О проекте

Marketing — личное приложение маркетолога. Single-user, локальное хранение (localStorage), без бэкенда и БД.

Стек: Next.js 14 (App Router) · TypeScript · Tailwind · Anthropic Claude API для AI-ассистента.

Подробная спецификация — `SPEC.md` в корне.

## Установленные skills

Проект использует marketing-skills из двух источников. Скилы лежат в `.claude/skills/` и автоматически активируются Claude Code в зависимости от задачи (см. описания в SKILL.md каждого скила).

### ericosiu/ai-marketing-skills

Ops/agency-фокус: growth-engine, sales-pipeline, content-ops, outbound-engine, seo-ops, finance-ops, revenue-intelligence, conversion-ops, podcast-ops, team-ops, sales-playbook.

Репо: https://github.com/ericosiu/ai-marketing-skills

### coreyhaines31/marketingskills

Practitioner-фокус: ab-test-setup, ad-creative, ai-seo, analytics-tracking, aso-audit, churn-prevention, cold-email, community-marketing, competitor-alternatives, competitor-profiling, content-strategy, copy-editing, copywriting + tools registry (GA4, Stripe, Mailchimp, Google Ads, Resend, Zapier).

Репо: https://github.com/coreyhaines31/marketingskills

## Установка skills

См. `.claude/skills/README.md` — там пошаговые команды для git-clone и опциональной установки через skillkit.

## Конвенции проекта

- Каналы (`Channel`), метрики (`Metric`), посты (`Post`) хранятся в localStorage через `lib/storage.ts`. Не плодить новых стораджей — расширять существующий.
- Все клиентские страницы используют `"use client"`. AI-генерация идёт через серверный route `app/api/ai/generate/route.ts` — ключ Anthropic читается оттуда из `process.env.ANTHROPIC_API_KEY` и никогда не утекает в клиент.
- Контекст бренда (`Settings.brandName`, `tone`, `audience`) подставляется автоматически в системный промпт AI. Скилы из `.claude/skills/` — отдельный слой, активируется Claude Code, не самим приложением.
- Тон UI — лаконичный, монохромный (CSS-переменные `--background` / `--foreground` в `app/globals.css`), без эмодзи в ядре. Иконки в навигации — единственное исключение.
- Ru-локаль во всём UI и копирайтах.

## Что улучшать в первую очередь (roadmap)

1. CSV-импорт на Дашборде с маппингом колонок
2. Графики (recharts) — динамика метрик по неделям
3. Связь карточки поста с AI-ассистентом («Сгенерить текст» прямо из карточки)
4. Медиаплан (бюджеты + ROI) — отдельный модуль
5. Интеграция выбранных skills в системный промпт `/api/ai/generate` (загружать SKILL.md, когда пользователь явно выбирает соответствующий пресет)
