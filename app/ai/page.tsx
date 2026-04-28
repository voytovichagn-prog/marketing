"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { storage } from "@/lib/storage";
import { Settings } from "@/lib/types";

type Preset = {
  id: string;
  label: string;
  hint: string;
  systemHint: string;
};

const PRESETS: Preset[] = [
  {
    id: "tg_post",
    label: "Пост в Telegram",
    hint: "Заголовок-крючок, тело, CTA. До 800 символов.",
    systemHint:
      "Сгенерируй пост в Telegram: цепляющий заголовок-крючок, короткое тело без воды, явный CTA. До 800 символов. Без хэштегов в начале, можно 2-3 в конце.",
  },
  {
    id: "vk_post",
    label: "Пост в VK",
    hint: "Длинный формат с подзаголовками и списком.",
    systemHint:
      "Сгенерируй пост для ВКонтакте: дружелюбный заголовок, разбивка на смысловые блоки, можно использовать списки. Длина 1500-2500 символов. Внизу 3-5 хэштегов.",
  },
  {
    id: "reels",
    label: "Сценарий рилса/видео",
    hint: "Хук — основа — CTA + описание для публикации.",
    systemHint:
      "Сгенерируй сценарий короткого вертикального видео (15-45 сек): хук в первые 2 секунды, основная часть с конкретикой, явный CTA. После сценария — описание под пост (caption) до 200 символов.",
  },
  {
    id: "rubrics",
    label: "Идеи рубрик",
    hint: "10 рубрик под аудиторию и канал.",
    systemHint:
      "Предложи 10 рубрик/тем для контента. Для каждой: название, кому полезно, формат (пост/видео/сторис), пример заголовка.",
  },
  {
    id: "brief",
    label: "Бриф для подрядчика",
    hint: "Структурированный бриф под задачу.",
    systemHint:
      "Сгенерируй бриф для подрядчика по структуре: задача, контекст, целевая аудитория, ключевые тезисы, форматы и размеры, тональность, дедлайн, KPI. Лаконично, без воды.",
  },
  {
    id: "hashtags",
    label: "Хэштеги",
    hint: "15-20 релевантных под тему.",
    systemHint:
      "Подбери 15-20 хэштегов под указанную тему и площадку: смесь высокочастотных, среднечастотных и нишевых. Без пробелов, через пробел в одну строку.",
  },
];

export default function AiPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [presetId, setPresetId] = useState<string>(PRESETS[0].id);
  const [topic, setTopic] = useState("");
  const [extra, setExtra] = useState("");
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setSettings(storage.getSettings());
  }, []);

  const preset = PRESETS.find((p) => p.id === presetId)!;

  const generate = async () => {
    setError("");
    setOutput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preset: preset.id,
          systemHint: preset.systemHint,
          topic,
          extra,
          brand: settings.brandName,
          tone: settings.tone,
          audience: settings.audience,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ошибка запроса");
      } else {
        setOutput(data.text ?? "");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (output) navigator.clipboard.writeText(output);
  };

  return (
    <>
      <PageHeader
        title="AI-ассистент"
        description="Генерация постов, идей и брифов. Контекст бренда подставляется из Настроек."
      />

      <div className="grid gap-6 p-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <span className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">
              Пресет
            </span>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPresetId(p.id)}
                  className={`rounded-md border p-3 text-left text-sm transition-colors ${
                    presetId === p.id
                      ? "border-foreground bg-foreground/5"
                      : "border-foreground/10 hover:border-foreground/30"
                  }`}
                >
                  <div className="font-medium">{p.label}</div>
                  <div className="mt-1 text-xs text-foreground/50">
                    {p.hint}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wider text-foreground/50">
              Тема / контекст
            </span>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              placeholder="О чём пост? Цель, ключевые тезисы, продукт."
              className="w-full rounded-md border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs uppercase tracking-wider text-foreground/50">
              Ограничения / уточнения (опционально)
            </span>
            <textarea
              value={extra}
              onChange={(e) => setExtra(e.target.value)}
              rows={2}
              placeholder="Не упоминать конкурентов, длина до 500 символов, добавить кейс…"
              className="w-full rounded-md border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
            />
          </label>

          {!settings.brandName && !settings.tone && !settings.audience && (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-600 dark:text-amber-400">
              Заполните бренд / TOV / аудиторию в Настройках — генерация будет
              точнее.
            </div>
          )}

          <button
            onClick={generate}
            disabled={loading || !topic.trim()}
            className="w-full rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {loading ? "Генерирую…" : "Сгенерировать"}
          </button>

          {error ? (
            <div className="rounded-md border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-500">
              {error}
            </div>
          ) : null}
        </div>

        <div className="rounded-lg border border-foreground/10">
          <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-3">
            <h2 className="text-sm font-medium">Результат</h2>
            <button
              onClick={copy}
              disabled={!output}
              className="text-xs text-foreground/50 hover:text-foreground disabled:opacity-30"
            >
              Скопировать
            </button>
          </div>
          <div className="min-h-[300px] whitespace-pre-wrap p-4 text-sm">
            {output || (
              <span className="text-foreground/40">
                Здесь появится результат генерации.
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
