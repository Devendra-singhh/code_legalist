// app/api/model-preference/route.ts
import { NextRequest } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8080";

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/get-model-preference`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error(`Backend ${response.status}`);
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("[model-preference] GET error:", error);
    // Return default preference on failure
    return Response.json({ model: "groq" }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.model || !["groq", "gemini"].includes(body.model)) {
      return Response.json(
        { error: "Invalid model. Must be 'groq' or 'gemini'" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/set-model-preference`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: body.model }),
    });

    if (!response.ok) throw new Error(`Backend ${response.status}`);
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("[model-preference] POST error:", error);
    return Response.json({ error: "Failed to set model preference" }, { status: 500 });
  }
}