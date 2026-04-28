# Claude Code skills для проекта

В проект подключаются marketing-скилы — наборы инструкций, которые Claude Code автоматически подтягивает в зависимости от задачи (копирайтинг, A/B-тесты, outbound, SEO и т.д.).

Когда вы просите Claude Code «напиши копию для лендинга», «составь план A/B-теста», «придумай outbound-последовательность» — Claude видит соответствующий SKILL.md и работает по экспертному фреймворку, а не из общих знаний.

## Что устанавливается

**ericosiu/ai-marketing-skills** — ops/agency-фокус: growth-engine, sales-pipeline, content-ops, outbound-engine, seo-ops, finance-ops, revenue-intelligence, conversion-ops, podcast-ops, team-ops, sales-playbook.

**coreyhaines31/marketingskills** — practitioner-фокус: ab-test-setup, ad-creative, ai-seo, analytics-tracking, aso-audit, churn-prevention, cold-email, community-marketing, competitor-alternatives, competitor-profiling, content-strategy, copy-editing, copywriting + tools registry (GA4, Stripe, Mailchimp, Google Ads, Resend, Zapier).

## Установка (одной командой)

```bash
bash scripts/install-skills.sh
```

Что произойдёт:

1. Создастся папка `.claude/skills/` (если её ещё нет)
2. Скрипт клонирует оба репо во временную папку `/tmp`
3. Скопирует скилы в `.claude/skills/`
4. Удалит временное

После — в Claude Code откройте проект и спросите: «Какие маркетинговые скилы у меня установлены?» — он прочитает папку и перечислит.

## Обновление

Скилы развиваются. Перезапустите тот же скрипт — старые перезапишутся свежими.

> Если правили SKILL.md руками под себя — сохраните копию отдельно, иначе перезатрётся.

## Кастомизация

Файлы `.claude/skills/<skill>/SKILL.md` можно править. Они версионируются вместе с проектом (видны в git), так что правки попадут на все ваши машины через `git push`/`pull`.

## Важное про области применения

- Скилы работают **только в Claude Code** (CLI-агенте, который правит код проекта). Когда Claude в терминале делает вам копирайт или анализ — он подхватит нужный скил.
- На **AI-ассистент внутри самого приложения** (`/ai` страница) скилы автоматически не влияют — там отдельный код. Если хотите, чтобы пресеты в приложении тоже использовали эти скилы — попросите меня сделать интеграцию: код будет читать выбранный SKILL.md и подмешивать в системный промпт `/api/ai/generate`.

## Источники

- https://github.com/ericosiu/ai-marketing-skills
- https://github.com/coreyhaines31/marketingskills
