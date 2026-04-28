"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { storage, newId } from "@/lib/storage";
import {
  Channel,
  POST_FORMAT_LABELS,
  POST_STATUS_LABELS,
  POST_STATUS_ORDER,
  Post,
  PostFormat,
  PostStatus,
} from "@/lib/types";

export default function ContentPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);

  useEffect(() => {
    setChannels(storage.getChannels());
    setPosts(storage.getPosts());
    setHydrated(true);
  }, []);

  const grouped = useMemo(() => {
    const map: Record<PostStatus, Post[]> = {
      idea: [],
      draft: [],
      approved: [],
      published: [],
      analyzed: [],
    };
    for (const p of posts) map[p.status]?.push(p);
    return map;
  }, [posts]);

  const persist = (next: Post[]) => {
    setPosts(next);
    storage.setPosts(next);
  };

  const createPost = (status: PostStatus) => {
    if (channels.length === 0) {
      alert("Сначала добавьте канал в Настройках.");
      return;
    }
    const now = new Date().toISOString();
    const p: Post = {
      id: newId(),
      channelId: channels[0].id,
      status,
      format: "post",
      title: "Новый пост",
      createdAt: now,
      updatedAt: now,
    };
    persist([p, ...posts]);
    setEditing(p);
  };

  const updatePost = (id: string, patch: Partial<Post>) => {
    const next = posts.map((p) =>
      p.id === id
        ? { ...p, ...patch, updatedAt: new Date().toISOString() }
        : p,
    );
    persist(next);
    if (editing?.id === id) setEditing({ ...editing, ...patch });
  };

  const movePost = (id: string, dir: -1 | 1) => {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    const idx = POST_STATUS_ORDER.indexOf(post.status);
    const next = POST_STATUS_ORDER[idx + dir];
    if (!next) return;
    updatePost(id, { status: next });
  };

  const deletePost = (id: string) => {
    persist(posts.filter((p) => p.id !== id));
    if (editing?.id === id) setEditing(null);
  };

  return (
    <>
      <PageHeader
        title="Контент-план"
        description="Канбан по статусам. Двигайте посты стрелками или меняйте статус в карточке."
      />

      <div className="p-6">
        {!hydrated ? (
          <div className="text-sm text-foreground/50">Загрузка…</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
            {POST_STATUS_ORDER.map((status) => (
              <Column
                key={status}
                status={status}
                posts={grouped[status]}
                channels={channels}
                onAdd={() => createPost(status)}
                onSelect={(p) => setEditing(p)}
                onMove={movePost}
              />
            ))}
          </div>
        )}
      </div>

      {editing ? (
        <PostDrawer
          post={editing}
          channels={channels}
          onChange={(patch) => updatePost(editing.id, patch)}
          onDelete={() => deletePost(editing.id)}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </>
  );
}

function Column({
  status,
  posts,
  channels,
  onAdd,
  onSelect,
  onMove,
}: {
  status: PostStatus;
  posts: Post[];
  channels: Channel[];
  onAdd: () => void;
  onSelect: (p: Post) => void;
  onMove: (id: string, dir: -1 | 1) => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-foreground/10 bg-foreground/[0.02] p-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          {POST_STATUS_LABELS[status]}
          <span className="ml-1 text-xs text-foreground/40">
            {posts.length}
          </span>
        </h3>
        <button
          onClick={onAdd}
          className="text-foreground/50 hover:text-foreground"
          title="Добавить"
        >
          +
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {posts.length === 0 ? (
          <div className="rounded-md border border-dashed border-foreground/15 px-3 py-6 text-center text-xs text-foreground/40">
            Пусто
          </div>
        ) : (
          posts.map((p) => {
            const ch = channels.find((c) => c.id === p.channelId);
            return (
              <article
                key={p.id}
                onClick={() => onSelect(p)}
                className="cursor-pointer rounded-md border border-foreground/10 bg-background p-3 text-sm transition-colors hover:border-foreground/30"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="line-clamp-1 font-medium">
                    {p.title || "Без названия"}
                  </span>
                  <div
                    className="flex shrink-0 gap-1 text-xs text-foreground/40"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onMove(p.id, -1)}
                      disabled={POST_STATUS_ORDER.indexOf(status) === 0}
                      className="hover:text-foreground disabled:opacity-30"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => onMove(p.id, 1)}
                      disabled={
                        POST_STATUS_ORDER.indexOf(status) ===
                        POST_STATUS_ORDER.length - 1
                      }
                      className="hover:text-foreground disabled:opacity-30"
                    >
                      →
                    </button>
                  </div>
                </div>
                <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-foreground/50">
                  {ch ? <Tag>{ch.name}</Tag> : null}
                  <Tag>{POST_FORMAT_LABELS[p.format]}</Tag>
                  {p.scheduledAt ? (
                    <Tag>
                      {new Date(p.scheduledAt).toLocaleDateString("ru-RU")}
                    </Tag>
                  ) : null}
                </div>
                {p.body ? (
                  <p className="mt-2 line-clamp-2 text-xs text-foreground/60">
                    {p.body}
                  </p>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-foreground/10 px-1.5 py-0.5">{children}</span>
  );
}

function PostDrawer({
  post,
  channels,
  onChange,
  onDelete,
  onClose,
}: {
  post: Post;
  channels: Channel[];
  onChange: (patch: Partial<Post>) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-30 flex justify-end bg-black/30"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-md flex-col gap-4 overflow-y-auto bg-background p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Карточка поста</h2>
          <button
            onClick={onClose}
            className="text-foreground/50 hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <Field label="Заголовок">
          <input
            value={post.title}
            onChange={(e) => onChange({ title: e.target.value })}
            className="w-full rounded-md border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Канал">
            <select
              value={post.channelId}
              onChange={(e) => onChange({ channelId: e.target.value })}
              className="w-full rounded-md border border-foreground/10 bg-background px-3 py-2 text-sm outline-none"
            >
              {channels.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Формат">
            <select
              value={post.format}
              onChange={(e) =>
                onChange({ format: e.target.value as PostFormat })
              }
              className="w-full rounded-md border border-foreground/10 bg-background px-3 py-2 text-sm outline-none"
            >
              {(Object.keys(POST_FORMAT_LABELS) as PostFormat[]).map((f) => (
                <option key={f} value={f}>
                  {POST_FORMAT_LABELS[f]}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Статус">
            <select
              value={post.status}
              onChange={(e) =>
                onChange({ status: e.target.value as PostStatus })
              }
              className="w-full rounded-md border border-foreground/10 bg-background px-3 py-2 text-sm outline-none"
            >
              {POST_STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {POST_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Дата публикации">
            <input
              type="date"
              value={post.scheduledAt?.slice(0, 10) ?? ""}
              onChange={(e) =>
                onChange({
                  scheduledAt: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : undefined,
                })
              }
              className="w-full rounded-md border border-foreground/10 bg-background px-3 py-2 text-sm outline-none"
            />
          </Field>
        </div>

        <Field label="Бриф / задача">
          <textarea
            value={post.brief ?? ""}
            onChange={(e) => onChange({ brief: e.target.value })}
            rows={3}
            className="w-full rounded-md border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
            placeholder="Что делаем, цель, ключевые тезисы…"
          />
        </Field>

        <Field label="Тело поста">
          <textarea
            value={post.body ?? ""}
            onChange={(e) => onChange({ body: e.target.value })}
            rows={8}
            className="w-full rounded-md border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
            placeholder="Текст поста или сценарий…"
          />
        </Field>

        <Field label="Хэштеги">
          <input
            value={(post.hashtags ?? []).join(" ")}
            onChange={(e) =>
              onChange({
                hashtags: e.target.value
                  .split(/\s+/)
                  .map((h) => h.trim())
                  .filter(Boolean),
              })
            }
            className="w-full rounded-md border border-foreground/10 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/30"
            placeholder="#маркетинг #контент"
          />
        </Field>

        {(post.status === "published" || post.status === "analyzed") && (
          <div className="rounded-md border border-foreground/10 p-3">
            <h3 className="mb-2 text-xs uppercase tracking-wider text-foreground/50">
              Факт
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Num label="Охват" v={post.reach} on={(n) => onChange({ reach: n })} />
              <Num
                label="Реакции"
                v={post.reactions}
                on={(n) => onChange({ reactions: n })}
              />
              <Num
                label="Комменты"
                v={post.comments}
                on={(n) => onChange({ comments: n })}
              />
              <Num
                label="Репосты"
                v={post.shares}
                on={(n) => onChange({ shares: n })}
              />
              <Num
                label="Сохранения"
                v={post.saves}
                on={(n) => onChange({ saves: n })}
              />
            </div>
          </div>
        )}

        <div className="mt-auto flex justify-between border-t border-foreground/10 pt-4">
          <button
            onClick={() => {
              if (confirm("Удалить пост?")) onDelete();
            }}
            className="text-sm text-red-500/80 hover:text-red-500"
          >
            Удалить
          </button>
          <button
            onClick={onClose}
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
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

function Num({
  label,
  v,
  on,
}: {
  label: string;
  v: number | undefined;
  on: (n: number | undefined) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-2">
      <span className="text-xs text-foreground/60">{label}</span>
      <input
        type="number"
        value={v ?? ""}
        onChange={(e) =>
          on(e.target.value === "" ? undefined : Number(e.target.value))
        }
        className="w-20 rounded border border-foreground/10 bg-background px-2 py-1 text-right text-sm outline-none"
      />
    </label>
  );
}
