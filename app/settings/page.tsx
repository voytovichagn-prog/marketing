"use client";

import { useEffect, useRef, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { storage, newId } from "@/lib/storage";
import {
  CHANNEL_TYPE_LABELS,
  Channel,
  ChannelType,
  Settings,
} from "@/lib/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [channels, setChannels] = useState<Channel[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSettings(storage.getSettings());
    setChannels(storage.getChannels());
    setHydrated(true);
  }, []);

  const saveSettings = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    storage.setSettings(next);
  };

  const addChannel = () => {
    const c: Channel = {
      id: newId(),
      name: "Новый канал",
      type: "vk",
    };
    const next = [...channels, c];
    setChannels(next);
    storage.setChannels(next);
  };

  const updateChannel = (id: string, patch: Partial<Channel>) => {
    const next = channels.map((c) => (c.id === id ? { ...c, ...patch } : c));
    setChannels(next);
    storage.setChannels(next);
  };

  const removeChannel = (id: string) => {
    if (!confirm("Удалить канал? Метрики и посты, привязанные к нему, останутся."))
      return;
    const next = channels.filter((c) => c.id !== id);
    setChannels(next);
    storage.setChannels(next);
  };

  const exportJson = () => {
    const data = storage.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `marketing-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (
        !confirm(
          "Импорт перезапишет ваши данные (каналы, метрики, посты, настройки). Продолжить?",
        )
      )
        return;
      storage.importAll(data);
      setSettings(storage.getSettings());
      setChannels(storage.getChannels());
      alert("Импорт выполнен. Перезагрузите страницу для применения везде.");
    } catch (err) {
      alert("Не удалось импортировать: " + (err instanceof Error ? err.message : err));
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const reset = () => {
    if (
      !confirm(
        "Удалить все локальные данные? Это действие нельзя отменить.",
      )
    )
      return;
    storage.reset();
    setSettings({});
    setChannels([]);
  };

  if (!hydrated) {
    return (
      <>
        <PageHeader title="Настройки" />
        <div className="p-6 text-sm text-foreground/50">Загрузка…</div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Настройки"
        description="Бренд, каналы, AI-ключ и резервная копия данных."
      />

      <div className="grid gap-6 p-6 lg:grid-cols-2">
        <Section title="Бренд">
          <Field label="Название бренда">
            <input
              value={settings.brandName ?? ""}
              onChange={(e) => saveSettings({ brandName: e.target.value })}
              placeholder="Иван-чай"
              className="w-full rounded-md border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
            />
          </Field>
          <Field label="Tone of voice">
            <textarea
              value={settings.tone ?? ""}
              onChange={(e) => saveSettings({ tone: e.target.value })}
              rows={3}
              placeholder="Дружелюбный, без канцелярита, на «ты», с лёгким юмором."
              className="w-full rounded-md border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
            />
          </Field>
          <Field label="Аудитория">
            <textarea
              value={settings.audience ?? ""}
              onChange={(e) => saveSettings({ audience: e.target.value })}
              rows={2}
              placeholder="Женщины 30-45, осознанное потребление, Москва/Питер."
              className="w-full rounded-md border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
            />
          </Field>
        </Section>

        <Section title="AI">
          <p className="text-sm text-foreground/60">
            Ключ Anthropic API хранится в файле{" "}
            <code className="rounded bg-foreground/10 px-1 py-0.5 text-xs">
              .env.local
            </code>{" "}
            (в репо не попадает).
          </p>
          <pre className="overflow-x-auto rounded-md border border-foreground/10 bg-foreground/[0.03] p-3 text-xs">
{`# .env.local в корне проекта
ANTHROPIC_API_KEY=sk-ant-api03-...`}
          </pre>
          <p className="text-xs text-foreground/50">
            Получить ключ: console.anthropic.com → Settings → API Keys. После
            изменения .env.local перезапустите dev-сервер.
          </p>
        </Section>

        <Section
          title="Каналы"
          actions={
            <button
              onClick={addChannel}
              className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background"
            >
              + Канал
            </button>
          }
        >
          {channels.length === 0 ? (
            <p className="text-sm text-foreground/50">
              Пока нет каналов. Добавьте VK, Telegram, Яндекс.Директ и т.д.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {channels.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-2 rounded-md border border-foreground/10 p-2"
                >
                  <input
                    value={c.name}
                    onChange={(e) =>
                      updateChannel(c.id, { name: e.target.value })
                    }
                    className="flex-1 rounded bg-transparent px-2 py-1 text-sm outline-none focus:bg-foreground/5"
                  />
                  <select
                    value={c.type}
                    onChange={(e) =>
                      updateChannel(c.id, {
                        type: e.target.value as ChannelType,
                      })
                    }
                    className="rounded border border-foreground/10 bg-background px-2 py-1 text-xs outline-none"
                  >
                    {(Object.keys(CHANNEL_TYPE_LABELS) as ChannelType[]).map(
                      (t) => (
                        <option key={t} value={t}>
                          {CHANNEL_TYPE_LABELS[t]}
                        </option>
                      ),
                    )}
                  </select>
                  <button
                    onClick={() => removeChannel(c.id)}
                    className="text-foreground/40 hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Резервная копия">
          <p className="text-sm text-foreground/60">
            Все данные хранятся локально (localStorage). Делайте экспорт время
            от времени.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportJson}
              className="rounded-md border border-foreground/15 px-3 py-2 text-sm hover:bg-foreground/5"
            >
              Скачать JSON
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-md border border-foreground/15 px-3 py-2 text-sm hover:bg-foreground/5"
            >
              Загрузить JSON
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              onChange={importJson}
              className="hidden"
            />
            <button
              onClick={reset}
              className="rounded-md border border-red-500/30 px-3 py-2 text-sm text-red-500 hover:bg-red-500/5"
            >
              Сбросить всё
            </button>
          </div>
        </Section>
      </div>
    </>
  );
}

function Section({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-foreground/10 p-5">
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/70">
          {title}
        </h2>
        {actions}
      </header>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wider text-foreground/50">
        {label}
      </span>
      {children}
    </label>
  );
}
