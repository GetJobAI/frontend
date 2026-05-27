import { Buffer } from "node:buffer";
import { NextResponse } from "next/server";
import { generatePdf } from "~/server/api/generated/pdf-generator/pdf-generator";
import type { ResumeData } from "~/server/api/generated/pdf-generator/schemas";

async function toPdfArrayBuffer(data: unknown): Promise<ArrayBuffer> {
  if (Buffer.isBuffer(data)) {
    return data.buffer.slice(
      data.byteOffset,
      data.byteOffset + data.byteLength,
    ) as ArrayBuffer;
  }
  if (data instanceof ArrayBuffer) return data;
  if (data instanceof Uint8Array) {
    return data.buffer.slice(
      data.byteOffset,
      data.byteOffset + data.byteLength,
    ) as ArrayBuffer;
  }
  if (data instanceof Blob) return data.arrayBuffer();
  throw new TypeError("Unexpected PDF response format");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ResumeData;
    const pdfBytes = await generatePdf(body, {
      responseType: "arraybuffer",
      headers: {
        Accept: "application/pdf",
      },
    });
    return new Response(await toPdfArrayBuffer(pdfBytes), {
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
