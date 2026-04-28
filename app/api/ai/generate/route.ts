import { NextRequest, NextResponse } from "next/server";
import { loadSkill } from "@/lib/skills";

export const runtime = "nodejs";

interface Body {
  preset?: string;
  systemHint?: string;
  topic?: string;
  extra?: string;
  brand?: string;
  tone?: string;
  audience?: string;
  skillId?: string;
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

  const { systemHint, topic, extra, brand, tone, audience, skillId } = body;
  if (!topic) {
    return NextResponse.json({ error: "Тема обязательна" }, { status: 400 });
  }

  // Подмешиваем скил, если выбран
  let skillBlock = "";
  let skillNameUsed: string | null = null;
  if (skillId) {
    const skill = loadSkill(skillId);
    if (skill) {
      skillNameUsed = skill.name;
      skillBlock = `# Применяемая методика: ${skill.name}\n\nИспользуй приведённый ниже SKILL как обязательную методику работы. Если он содержит шаги — следуй им. Если содержит фреймворки/чек-листы — применяй их к запросу пользователя.\n\n---\n\n${skill.body}`;
    }
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
    skillBlock,
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

    return NextResponse.json({ text, skillUsed: skillNameUsed });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
