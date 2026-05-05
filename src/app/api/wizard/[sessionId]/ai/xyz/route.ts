export async function POST() {
  return Response.json(
    { error: "AI features are not enabled in this build." },
    { status: 501 },
  );
}
