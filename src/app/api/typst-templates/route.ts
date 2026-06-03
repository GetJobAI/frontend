import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const templatePath = path.join(
      process.cwd(),
      ".agents",
      "resumes",
      "template.typ",
    );
    const templateContent = await fs.readFile(templatePath, "utf-8");
    return NextResponse.json({ template: templateContent });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load template";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
