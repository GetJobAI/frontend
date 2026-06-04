import { type NextRequest, NextResponse } from "next/server";
import { RESUME_TEMPLATE } from "~/server/templates/resume-template";
import { COVER_LETTER_TEMPLATE } from "~/server/templates/cover-letter-template";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") ?? "resume";

    const templateContent =
      type === "cover-letter" ? COVER_LETTER_TEMPLATE : RESUME_TEMPLATE;
    return NextResponse.json({ template: templateContent });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load template";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
