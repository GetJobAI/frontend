import { NextResponse } from "next/server";
import { generatePdf } from "~/server/api/generated/pdf/pdf-generator";
import type { ResumeData } from "~/server/api/generated/pdf/schemas";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ResumeData;
    const pdfBytes = await generatePdf(body, {
      responseType: "arraybuffer",
      headers: {
        Accept: "application/pdf",
      },
    });
    const buffer =
      pdfBytes instanceof ArrayBuffer ? pdfBytes : await pdfBytes.arrayBuffer();
    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "PDF generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
