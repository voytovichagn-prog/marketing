export type ChannelType =
  | "vk"
  | "vk_ads"
  | "telegram"
  | "yandex_direct"
  | "yandex_metrika"
  | "other";

export const CHANNEL_TYPE_LABELS: Record<ChannelType, string> = {
  vk: "VK",
  vk_ads: "VK Ads",
  telegram: "Telegram",
  yandex_direct: "Яндекс.Директ",
  yandex_metrika: "Яндекс.Метрика",
  other: "Другое",
};

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  url?: string;
}

export interface Metric {
  id: string;
  channelId: string;
  date: string; // ISO yyyy-mm-dd
  impressions?: number;
  clicks?: number;
  spend?: number; // ₽
  conversions?: number;
  reach?: number;
  engagement?: number;
  notes?: string;
}

export type PostStatus =
  | "idea"
  | "draft"
  | "approved"
  | "published"
  | "analyzed";

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  idea: "Идея",
  draft: "Черновик",
  approved: "Согласовано",
  published: "Опубликовано",
  analyzed: "Проанализировано",
};

export const POST_STATUS_ORDER: PostStatus[] = [
  "idea",
  "draft",
  "approved",
  "published",
  "analyzed",
];

export type PostFormat = "post" | "story" | "reels" | "video" | "article";

export const POST_FORMAT_LABELS: Record<PostFormat, string> = {
  post: "Пост",
  story: "Сторис",
  reels: "Рилс",
  video: "Видео",
  article: "Статья",
};

export interface Post {
  id: string;
  channelId: string;
  status: PostStatus;
  format: PostFormat;
  scheduledAt?: string;
  publishedAt?: string;
  title: string;
  body?: string;
  hashtags?: string[];
  brief?: string;
  // факт после публикации
  reach?: number;
  reactions?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  brandName?: string;
  tone?: string;
  audience?: string;
  apiKeyConfigured?: boolean; // флаг, сам ключ не хранится в клиенте
}

export interface AppData {
  channels: Channel[];
  metrics: Metric[];
  posts: Post[];
  settings: Settings;
}
