// Server-only. Читает скилы из .claude/skills/ при каждом вызове.
// Не импортировать в клиентские компоненты.

import fs from "node:fs";
import path from "node:path";

export interface SkillMeta {
  id: string;
  name: string;
  description?: string;
}

export interface Skill extends SkillMeta {
  body: string;
}

const SKILLS_ROOT = path.join(process.cwd(), ".claude", "skills");

const SKILL_ID_RE = /^[a-z0-9_-]+$/i;

function parseFrontmatter(raw: string): {
  meta: Record<string, string>;
  body: string;
} {
  if (!raw.startsWith("---")) return { meta: {}, body: raw };
  // конец frontmatter — следующая строка "---"
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!m) return { meta: {}, body: raw };
  const fm = m[1];
  const body = raw.slice(m[0].length);
  const meta: Record<string, string> = {};
  for (const line of fm.split("\n")) {
    const kv = line.match(/^([A-Za-z][\w-]*)\s*:\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    meta[kv[1]] = v;
  }
  return { meta, body };
}

function safeRead(p: string): string | null {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

export function listSkills(): SkillMeta[] {
  if (!fs.existsSync(SKILLS_ROOT)) return [];
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(SKILLS_ROOT, { withFileTypes: true });
  } catch {
    return [];
  }

  const out: SkillMeta[] = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    if (!SKILL_ID_RE.test(e.name)) continue;

    const skillPath = path.join(SKILLS_ROOT, e.name, "SKILL.md");
    const raw = safeRead(skillPath);
    if (!raw) continue;

    const { meta } = parseFrontmatter(raw);
    out.push({
      id: e.name,
      name: meta.name || e.name,
      description: meta.description,
    });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name, "ru"));
}

export function loadSkill(id: string): Skill | null {
  if (!SKILL_ID_RE.test(id)) return null;
  const skillPath = path.join(SKILLS_ROOT, id, "SKILL.md");
  const raw = safeRead(skillPath);
  if (!raw) return null;
  const { meta, body } = parseFrontmatter(raw);
  return {
    id,
    name: meta.name || id,
    description: meta.description,
    body: body.trim(),
  };
}
