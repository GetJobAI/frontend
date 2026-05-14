import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "AI features are not enabled in this build." },
    { status: 501 },
  );
}
