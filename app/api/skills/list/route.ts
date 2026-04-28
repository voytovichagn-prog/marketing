import { NextResponse } from "next/server";
import { listSkills } from "@/lib/skills";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // пере-сканировать папку при каждом запросе

export async function GET() {
  try {
    const skills = listSkills();
    return NextResponse.json({ skills });
  } catch (e) {
    return NextResponse.json(
      { skills: [], error: e instanceof Error ? e.message : String(e) },
      { status: 200 },
    );
  }
}
