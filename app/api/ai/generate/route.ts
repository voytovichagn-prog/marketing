import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface Body {
  preset?: string;
  systemHint?: string;
  topic?: string;
  extra?: string;
  brand?: string;
  tone?: string;
  audience?: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY не задан. Добавьте его в .env.local и перезапустите dev-сервер.",
      },
      { status: 400 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Bad JSON" }, { status: 400 });
  }

  const { systemHint, topic, extra, brand, tone, audience } = body;
  if (!topic) {
    return NextResponse.json({ error: "Тема обязательна" }, { status: 400 });
  }

  const brandBlock = [
    brand && `Бренд: ${brand}`,
    tone && `TOV: ${tone}`,
    audience && `Аудитория: ${audience}`,
  ]
    .filter(Boolean)
    .join("\n");

  const system = [
    "Ты опытный маркетолог-копирайтер. Пиши на русском, без штампов и канцелярита.",
    systemHint,
    brandBlock ? `Контекст бренда:\n${brandBlock}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const userMsg = [`Тема: ${topic}`, extra ? `Уточнения: ${extra}` : ""]
    .filter(Boolean)
    .join("\n");

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        system,
        messages: [{ role: "user", content: userMsg }],
      }),
    });

    if (!r.ok) {
      const errText = await r.text();
      return NextResponse.json(
        { error: `Anthropic API ${r.status}: ${errText}` },
        { status: 500 },
      );
    }

    const data = (await r.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const text =
      data.content
        ?.filter((c) => c.type === "text")
        .map((c) => c.text ?? "")
        .join("\n") ?? "";

    return NextResponse.json({ text });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
