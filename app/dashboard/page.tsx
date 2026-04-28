"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { storage, newId } from "@/lib/storage";
import {
  CHANNEL_TYPE_LABELS,
  Channel,
  Metric,
} from "@/lib/types";

const PERIODS = [
  { value: 7, label: "7 дней" },
  { value: 30, label: "30 дней" },
  { value: 90, label: "90 дней" },
  { value: 0, label: "Всё время" },
] as const;

function fmt(num: number | undefined, suffix = "") {
  if (num === undefined || Number.isNaN(num)) return "—";
  return num.toLocaleString("ru-RU") + suffix;
}

export default function DashboardPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [period, setPeriod] = useState<number>(30);
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setChannels(storage.getChannels());
    setMetrics(storage.getMetrics());
    setHydrated(true);
  }, []);

  const filtered = useMemo(() => {
    const cutoff = period
      ? new Date(Date.now() - period * 86_400_000)
      : null;
    return metrics.filter((m) => {
      if (channelFilter !== "all" && m.channelId !== channelFilter)
        return false;
      if (cutoff && new Date(m.date) < cutoff) return false;
      return true;
    });
  }, [metrics, period, channelFilter]);

  const totals = useMemo(() => {
    const sum = (k: keyof Metric) =>
      filtered.reduce(
        (acc, m) => acc + (typeof m[k] === "number" ? (m[k] as number) : 0),
        0,
      );
    const impressions = sum("impressions");
    const clicks = sum("clicks");
    const spend = sum("spend");
    const conversions = sum("conversions");
    const reach = sum("reach");
    const engagement = sum("engagement");
    return {
      impressions,
      clicks,
      spend,
      conversions,
      reach,
      engagement,
      ctr: impressions ? (clicks / impressions) * 100 : undefined,
      cpc: clicks ? spend / clicks : undefined,
      cpl: conversions ? spend / conversions : undefined,
    };
  }, [filtered]);

  const addQuickRow = () => {
    if (channels.length === 0) {
      alert("Сначала добавьте канал в Настройках.");
      return;
    }
    const m: Metric = {
      id: newId(),
      channelId: channels[0].id,
      date: new Date().toISOString().slice(0, 10),
      impressions: 0,
      clicks: 0,
      spend: 0,
    };
    const next = [m, ...metrics];
    setMetrics(next);
    storage.setMetrics(next);
  };

  const updateMetric = (id: string, patch: Partial<Metric>) => {
    const next = metrics.map((m) => (m.id === id ? { ...m, ...patch } : m));
    setMetrics(next);
    storage.setMetrics(next);
  };

  const deleteMetric = (id: string) => {
    const next = metrics.filter((m) => m.id !== id);
    setMetrics(next);
    storage.setMetrics(next);
  };

  return (
    <>
      <PageHeader
        title="Дашборд"
        description="Сводные метрики по каналам. Импорт CSV в следующей итерации — пока ручной ввод."
        actions={
          <button
            onClick={addQuickRow}
            className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            + Запись
          </button>
        }
      />

      <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 rounded-md border border-foreground/10 p-0.5 text-sm">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`rounded px-3 py-1.5 transition-colors ${
                  period === p.value
                    ? "bg-foreground text-background"
                    : "text-foreground/70 hover:bg-foreground/5"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="rounded-md border border-foreground/10 bg-background px-3 py-1.5 text-sm"
          >
            <option value="all">Все каналы</option>
            {channels.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Kpi label="Расход, ₽" value={fmt(totals.spend)} />
          <Kpi label="Показы" value={fmt(totals.impressions)} />
          <Kpi label="Клики" value={fmt(totals.clicks)} />
          <Kpi
            label="CTR"
            value={totals.ctr !== undefined ? totals.ctr.toFixed(2) + "%" : "—"}
          />
          <Kpi
            label="CPC, ₽"
            value={totals.cpc !== undefined ? totals.cpc.toFixed(2) : "—"}
          />
          <Kpi label="Конверсии" value={fmt(totals.conversions)} />
        </div>

        <div className="rounded-lg border border-foreground/10">
          <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-3">
            <h2 className="text-sm font-medium">Записи метрик</h2>
            <span className="text-xs text-foreground/50">
              {filtered.length} строк
            </span>
          </div>
          {!hydrated ? (
            <div className="p-8 text-center text-sm text-foreground/50">
              Загрузка…
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-foreground/50">
              Пока нет данных. Нажмите «+ Запись» или добавьте каналы в
              Настройках.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-foreground/[0.03] text-left text-xs uppercase tracking-wider text-foreground/50">
                  <tr>
                    <Th>Дата</Th>
                    <Th>Канал</Th>
                    <Th right>Показы</Th>
                    <Th right>Клики</Th>
                    <Th right>Расход, ₽</Th>
                    <Th right>Конверсии</Th>
                    <Th right>Охват</Th>
                    <Th right>Engagement</Th>
                    <Th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => {
                    const ch = channels.find((c) => c.id === m.channelId);
                    return (
                      <tr
                        key={m.id}
                        className="border-t border-foreground/5 hover:bg-foreground/[0.02]"
                      >
                        <Td>
                          <input
                            type="date"
                            value={m.date}
                            onChange={(e) =>
                              updateMetric(m.id, { date: e.target.value })
                            }
                            className="bg-transparent outline-none"
                          />
                        </Td>
                        <Td>
                          <select
                            value={m.channelId}
                            onChange={(e) =>
                              updateMetric(m.id, { channelId: e.target.value })
                            }
                            className="bg-transparent outline-none"
                          >
                            {channels.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          {ch ? (
                            <span className="ml-1 text-xs text-foreground/40">
                              · {CHANNEL_TYPE_LABELS[ch.type]}
                            </span>
                          ) : null}
                        </Td>
                        <NumCell
                          v={m.impressions}
                          on={(n) => updateMetric(m.id, { impressions: n })}
                        />
                        <NumCell
                          v={m.clicks}
                          on={(n) => updateMetric(m.id, { clicks: n })}
                        />
                        <NumCell
                          v={m.spend}
                          on={(n) => updateMetric(m.id, { spend: n })}
                        />
                        <NumCell
                          v={m.conversions}
                          on={(n) => updateMetric(m.id, { conversions: n })}
                        />
                        <NumCell
                          v={m.reach}
                          on={(n) => updateMetric(m.id, { reach: n })}
                        />
                        <NumCell
                          v={m.engagement}
                          on={(n) => updateMetric(m.id, { engagement: n })}
                        />
                        <Td right>
                          <button
                            onClick={() => deleteMetric(m.id)}
                            className="text-xs text-foreground/40 hover:text-red-500"
                          >
                            ✕
                          </button>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-foreground/10 bg-foreground/[0.02] p-4">
      <div className="text-xs uppercase tracking-wider text-foreground/50">
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function Th({
  children,
  right,
}: {
  children?: React.ReactNode;
  right?: boolean;
}) {
  return (
    <th
      className={`px-4 py-2 font-medium ${right ? "text-right" : "text-left"}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  right,
}: {
  children?: React.ReactNode;
  right?: boolean;
}) {
  return (
    <td
      className={`px-4 py-2 ${right ? "text-right" : "text-left"} tabular-nums`}
    >
      {children}
    </td>
  );
}

function NumCell({
  v,
  on,
}: {
  v: number | undefined;
  on: (n: number | undefined) => void;
}) {
  return (
    <Td right>
      <input
        type="number"
        value={v ?? ""}
        onChange={(e) =>
          on(e.target.value === "" ? undefined : Number(e.target.value))
        }
        className="w-24 bg-transparent text-right outline-none focus:bg-foreground/[0.04]"
      />
    </Td>
  );
}
