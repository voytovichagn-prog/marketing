"use client";

import {
  AppData,
  Channel,
  Metric,
  Post,
  Settings,
} from "./types";

const KEYS = {
  channels: "marketing.channels",
  metrics: "marketing.metrics",
  posts: "marketing.posts",
  settings: "marketing.settings",
} as const;

const isBrowser = () => typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getChannels: (): Channel[] => read<Channel[]>(KEYS.channels, []),
  setChannels: (v: Channel[]) => write(KEYS.channels, v),

  getMetrics: (): Metric[] => read<Metric[]>(KEYS.metrics, []),
  setMetrics: (v: Metric[]) => write(KEYS.metrics, v),

  getPosts: (): Post[] => read<Post[]>(KEYS.posts, []),
  setPosts: (v: Post[]) => write(KEYS.posts, v),

  getSettings: (): Settings => read<Settings>(KEYS.settings, {}),
  setSettings: (v: Settings) => write(KEYS.settings, v),

  exportAll: (): AppData => ({
    channels: storage.getChannels(),
    metrics: storage.getMetrics(),
    posts: storage.getPosts(),
    settings: storage.getSettings(),
  }),

  importAll: (data: AppData) => {
    if (data.channels) storage.setChannels(data.channels);
    if (data.metrics) storage.setMetrics(data.metrics);
    if (data.posts) storage.setPosts(data.posts);
    if (data.settings) storage.setSettings(data.settings);
  },

  reset: () => {
    if (!isBrowser()) return;
    Object.values(KEYS).forEach((k) => window.localStorage.removeItem(k));
  },
};

export const newId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
