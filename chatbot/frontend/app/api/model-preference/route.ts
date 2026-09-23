// app/api/model-preference/route.ts
// This endpoint is no longer used — model switching is handled client-side.
// Kept as a stub to avoid 404s from any cached clients.

export async function GET() {
  return Response.json({ model: "groq" }, { status: 200 });
}

export async function POST() {
  return Response.json({ message: "Model preference is managed client-side." }, { status: 200 });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}