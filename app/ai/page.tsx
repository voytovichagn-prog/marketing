"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import SkillPicker, { SkillMeta } from "@/components/SkillPicker";
import CopyButton from "@/components/CopyButton";
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

// Только методики, релевантные для написания постов и контента.
// Скил `image` исключён — он используется отдельно для генерации
// промпта картинки в нижней панели.
const POST_WRITING_SKILLS = new Set([
  "copywriting",
  "copy-editing",
  "content-strategy",
  "marketing-ideas",
  "marketing-psychology",
  "social-content",
  "video",
  "ad-creative",
]);

const IMAGE_PROMPT_SYSTEM_HINT =
  "Сгенерируй ОДИН готовый к использованию текстовый промпт для AI-генерации картинки (Midjourney / DALL-E / Flux / Ideogram). Промпт пиши на английском (модели работают точнее), 2-4 предложения, в одну строку без подзаголовков. Включи: тип сцены, ключевые объекты, стиль (photorealistic / illustration / 3D и т.д.), композицию, цветовую палитру под бренд, освещение, настроение. БЕЗ преамбулы и комментариев — только сам промпт. В конце через пробел добавь технические параметры: --ar 1:1 (или другое подходящее под платформу), --style raw для Midjourney если уместно.";

export default function AiPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [presetId, setPresetId] = useState<string>(PRESETS[0].id);
  const [allSkills, setAllSkills] = useState<SkillMeta[]>([]);
  const [skillId, setSkillId] = useState<string>("");
  const [skillsLoaded, setSkillsLoaded] = useState(false);
  const [topic, setTopic] = useState("");
  const [extra, setExtra] = useState("");

  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [skillUsed, setSkillUsed] = useState<string | null>(null);

  const [imagePrompt, setImagePrompt] = useState<string>("");
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string>("");

  useEffect(() => {
    setSettings(storage.getSettings());
    fetch("/api/skills/list")
      .then((r) => r.json())
      .then((d) => setAllSkills(d.skills ?? []))
      .catch(() => setAllSkills([]))
      .finally(() => setSkillsLoaded(true));
  }, []);

  // Показываем в селекторе только методики для написания постов.
  const skills = useMemo(
    () => allSkills.filter((s) => POST_WRITING_SKILLS.has(s.id)),
    [allSkills],
  );

  const hasImageSkill = useMemo(
    () => allSkills.some((s) => s.id === "image"),
    [allSkills],
  );

  const preset = PRESETS.find((p) => p.id === presetId)!;

  const generate = async () => {
    setError("");
    setOutput("");
    setSkillUsed(null);
    setImagePrompt("");
    setImageError("");
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
          skillId: skillId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ошибка запроса");
      } else {
        setOutput(data.text ?? "");
        setSkillUsed(data.skillUsed ?? null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const generateImagePrompt = async () => {
    setImageError("");
    setImagePrompt("");
    setImageLoading(true);
    try {
      const imageTopic = [
        `Тема поста: ${topic}`,
        output ? `Сгенерированный пост:\n${output}` : null,
      ]
        .filter(Boolean)
        .join("\n\n");

      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preset: "image_prompt",
          systemHint: IMAGE_PROMPT_SYSTEM_HINT,
          topic: imageTopic,
          extra: "Картинка-обложка к этому посту для соцсетей.",
          brand: settings.brandName,
          tone: settings.tone,
          audience: settings.audience,
          skillId: hasImageSkill ? "image" : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setImageError(data.error ?? "Ошибка запроса");
      } else {
        setImagePrompt((data.text ?? "").trim());
      }
    } catch (e) {
      setImageError(e instanceof Error ? e.message : String(e));
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="AI-ассистент"
        description="Пресет — формат, скил — методика, тема — о чём. Контекст бренда подставляется из Настроек."
      />

      <div className="grid gap-6 p-6 lg:grid-cols-2">
        {/* ЛЕВАЯ КОЛОНКА — НАСТРОЙКИ ГЕНЕРАЦИИ */}
        <div className="space-y-4">
          <div>
            <span className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">
              Формат (пресет)
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

          <div>
            <span className="mb-2 block text-xs uppercase tracking-wider text-foreground/50">
              Методика (скил)
            </span>
            <SkillPicker
              skills={skills}
              value={skillId}
              onChange={setSkillId}
              loading={!skillsLoaded}
            />
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

        {/* ПРАВАЯ КОЛОНКА — РЕЗУЛЬТАТЫ */}
        <div className="space-y-4">
          {/* ОКНО 1: ТЕКСТ ПОСТА */}
          <section className="rounded-lg border border-foreground/10">
            <header className="flex items-center justify-between gap-2 border-b border-foreground/10 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-medium">Текст поста</h2>
                {skillUsed ? (
                  <span className="rounded bg-foreground/10 px-2 py-0.5 text-[11px] text-foreground/60">
                    скил: {skillUsed}
                  </span>
                ) : null}
              </div>
              <CopyButton text={output} />
            </header>
            <div className="min-h-[260px] whitespace-pre-wrap p-4 text-sm">
              {output || (
                <span className="text-foreground/40">
                  Здесь появится сгенерированный пост.
                </span>
              )}
            </div>
          </section>

          {/* ОКНО 2: ПРОМПТ ДЛЯ КАРТИНКИ */}
          <section className="rounded-lg border border-foreground/10">
            <header className="flex items-center justify-between gap-2 border-b border-foreground/10 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-medium">Промпт для картинки</h2>
                {hasImageSkill ? (
                  <span className="rounded bg-foreground/10 px-2 py-0.5 text-[11px] text-foreground/60">
                    скил: image
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={generateImagePrompt}
                  disabled={imageLoading || !topic.trim()}
                  className="rounded-md border border-foreground/15 bg-background px-2.5 py-1 text-xs font-medium hover:bg-foreground/5 disabled:opacity-30"
                >
                  {imageLoading
                    ? "Генерирую…"
                    : imagePrompt
                      ? "Перегенерировать"
                      : "Сгенерировать"}
                </button>
                <CopyButton text={imagePrompt} />
              </div>
            </header>
            <div className="min-h-[120px] whitespace-pre-wrap p-4 font-mono text-sm">
              {imagePrompt ? (
                imagePrompt
              ) : imageError ? (
                <span className="text-red-500">{imageError}</span>
              ) : (
                <span className="font-sans text-foreground/40">
                  {output
                    ? "Жмите «Сгенерировать» — соберу промпт под этот пост (для Midjourney / DALL-E / Flux)."
                    : "Сначала сгенерируйте пост или хотя бы заполните «Тема / контекст»."}
                </span>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
