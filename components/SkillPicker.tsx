"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export interface SkillMeta {
  id: string;
  name: string;
  description?: string;
}

// Короткие русские подсказки для популярных скилов — чтобы было сразу понятно,
// что внутри. Английские описания из frontmatter тоже показываются.
const RU_HINTS: Record<string, string> = {
  copywriting: "Заголовки, CTA, hero, value prop — переписать или с нуля",
  "copy-editing": "Отредактировать готовую копию: убрать воду, усилить",
  "content-strategy": "Контент-стратегия: темы, форматы, частота",
  "marketing-ideas": "Сгенерировать идеи маркетинговых активностей",
  "marketing-psychology": "Психотриггеры: FOMO, social proof, anchoring",
  "social-content": "Посты для соцсетей: хуки, форматы",
  video: "Сценарии и стратегии видеоконтента",
  image: "Брифы на изображения и визуал",
  "email-sequence": "Welcome / nurture / onboarding email-цепочки",
  "cold-email": "Холодные outbound-письма",
  "paid-ads": "Стратегия и оптимизация платных кампаний",
  "ad-creative": "Креативы для объявлений: сценарии, баннеры",
  "seo-audit": "Аудит сайта на SEO-ошибки",
  "ai-seo": "Оптимизация под ChatGPT/Perplexity/Google AI",
  "programmatic-seo": "Массовая генерация SEO-страниц по шаблону",
  "schema-markup": "Структурированная разметка schema.org",
  "site-architecture": "Архитектура сайта для SEO",
  "directory-submissions": "Добавление в каталоги и агрегаторы",
  "page-cro": "Оптимизация конверсии любой страницы",
  "form-cro": "Оптимизация форм: заявка, регистрация",
  "onboarding-cro": "Оптимизация онбординга после регистрации",
  "signup-flow-cro": "Оптимизация флоу регистрации",
  "popup-cro": "Попапы: exit-intent, скролл-триггеры",
  "paywall-upgrade-cro": "Paywall и апгрейд на платный план",
  "ab-test-setup": "Постановка A/B-теста: гипотеза, метрики",
  "lead-magnets": "Лид-магниты: чек-листы, гайды, шаблоны",
  "free-tool-strategy": "Бесплатный инструмент как канал привлечения",
  "launch-strategy": "Стратегия запуска продукта или фичи",
  "referral-program": "Реферальная программа",
  "customer-research": "Интервью, опросы, Voice of Customer",
  "competitor-profiling": "Глубокий профиль конкурента",
  "competitor-alternatives": "Страницы «X альтернативы»",
  "product-marketing-context": "Собирает базовый контекст продукта",
  "churn-prevention": "Предотвращение оттока",
  "pricing-strategy": "Ценообразование и упаковка тарифов",
  revops: "Revenue ops: воронка, метрики, автоматизация",
  "sales-enablement": "Pitch deck, battle cards для продаж",
  "analytics-tracking": "Настройка событий и UTM в аналитике",
  "aso-audit": "App Store Optimization для мобильных",
  "community-marketing": "Построение и активация комьюнити",
  "growth-engine": "Автономные growth-эксперименты",
  "sales-pipeline": "От посетителя к pipeline — автоматизация",
  "content-ops": "Quality scoring и продакшн контента",
  "outbound-engine": "Холодный outbound: автоматизация",
  "seo-ops": "SEO intelligence и операционка",
  "finance-ops": "Финансовый анализ, P&L",
  "revenue-intelligence": "Инсайты из звонков продаж",
  "conversion-ops": "CRO + лид-магниты как процесс",
  "podcast-ops": "Подкаст-операционка",
  "team-ops": "Управление маркетинг-командой",
  "sales-playbook": "Плейбук продаж",
};

function shortDesc(skill: SkillMeta): string {
  const ru = RU_HINTS[skill.id];
  if (ru) return ru;
  if (!skill.description) return "";
  // Обрезаем английский — берём до первой точки или 120 символов
  const firstSentence = skill.description.split(". ")[0];
  return firstSentence.length > 140
    ? firstSentence.slice(0, 137) + "…"
    : firstSentence;
}

export default function SkillPicker({
  skills,
  value,
  onChange,
  loading,
}: {
  skills: SkillMeta[];
  value: string;
  onChange: (id: string) => void;
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const selected = skills.find((s) => s.id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return skills;
    return skills.filter((s) => {
      const hay = `${s.id} ${s.name} ${s.description ?? ""} ${
        RU_HINTS[s.id] ?? ""
      }`.toLowerCase();
      return hay.includes(q);
    });
  }, [skills, query]);

  if (loading) {
    return (
      <div className="h-10 animate-pulse rounded-md bg-foreground/[0.04]" />
    );
  }

  if (skills.length === 0) {
    return (
      <div className="rounded-md border border-foreground/10 bg-foreground/[0.02] p-3 text-xs text-foreground/60">
        Скилы не установлены. Запустите{" "}
        <code className="rounded bg-foreground/10 px-1 py-0.5">
          bash scripts/install-skills.sh
        </code>{" "}
        — появится ~40 методик. См. SKILLS.md.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-md border border-foreground/10 bg-background px-3 py-2 text-left text-sm hover:border-foreground/30"
      >
        <span className="flex min-w-0 flex-col">
          <span className="font-medium">
            {selected ? selected.name : "— Без скила —"}
          </span>
          {selected ? (
            <span className="line-clamp-1 text-xs text-foreground/50">
              {shortDesc(selected)}
            </span>
          ) : (
            <span className="text-xs text-foreground/40">
              {skills.length} установлено · нажмите, чтобы выбрать
            </span>
          )}
        </span>
        <span className="text-foreground/40">{open ? "▲" : "▼"}</span>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-[420px] overflow-hidden rounded-md border border-foreground/15 bg-background shadow-lg">
          <div className="border-b border-foreground/10 p-2">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск: copywriting, seo, конверсия…"
              className="w-full rounded-md bg-foreground/[0.04] px-3 py-2 text-sm outline-none focus:bg-foreground/[0.08]"
            />
          </div>
          <div className="max-h-[360px] overflow-y-auto py-1">
            <Item
              active={value === ""}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              title="— Без скила —"
              hint="Использовать только пресет, без подмешивания методики"
            />
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-foreground/40">
                Ничего не найдено
              </div>
            ) : (
              filtered.map((s) => (
                <Item
                  key={s.id}
                  active={value === s.id}
                  onClick={() => {
                    onChange(s.id);
                    setOpen(false);
                    setQuery("");
                  }}
                  title={s.name}
                  hint={shortDesc(s)}
                />
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Item({
  active,
  onClick,
  title,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full flex-col gap-0.5 px-3 py-2 text-left transition-colors hover:bg-foreground/5 ${
        active ? "bg-foreground/[0.06]" : ""
      }`}
    >
      <span className="flex items-center gap-2 text-sm">
        <span className="font-medium">{title}</span>
        {active ? <span className="text-xs text-foreground/40">✓</span> : null}
      </span>
      {hint ? (
        <span className="line-clamp-2 text-xs text-foreground/55">{hint}</span>
      ) : null}
    </button>
  );
}
