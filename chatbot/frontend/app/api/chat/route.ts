// app/api/chat/route.ts
import { NextRequest } from "next/server";

// Backend URL — must match the Python server port
const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8080';
const BACKEND_TIMEOUT_MS = 15000; // 15 seconds

function formatResponse(text: string): string {
  return text.replace(/\n{3,}/g, '\n\n').trim();
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json();

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      console.error('[chat/route] No messages provided');
      return Response.json({ error: "No messages provided" }, { status: 400 });
    }

    const messages = body.messages;
    const lastUserMessage = messages[messages.length - 1];
    const query: string =
      typeof lastUserMessage.content === 'string'
        ? lastUserMessage.content
        : (lastUserMessage.content?.[0]?.text ?? '');

    const history = messages.slice(0, -1).map((m: { role: string; content: unknown }) => ({
      role: m.role,
      content: typeof m.content === 'string' ? m.content : String(m.content),
    }));

    console.log(`[chat/route] Query: "${query.slice(0, 80)}..." | History: ${history.length} msgs`);

    // Timeout-aware fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);

    let backendResponse: Response;
    try {
      backendResponse = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, history }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!backendResponse.ok) {
      const errText = await backendResponse.text().catch(() => '');
      console.error(`[chat/route] Backend error ${backendResponse.status}: ${errText}`);
      throw new Error(`Backend responded with status ${backendResponse.status}`);
    }

    const backendData = await backendResponse.json();
    const elapsed = Date.now() - startTime;
    console.log(`[chat/route] Backend responded in ${elapsed}ms`);

    let responseText = '';
    if (backendData?.response?.lawyer_response) {
      responseText = formatResponse(backendData.response.lawyer_response);
    } else if (backendData?.response) {
      const entities: string[] = backendData.response.extracted_legal_entities ?? [];
      responseText = [
        '### 🔍 Analysis',
        '',
        'I processed your query but could not generate a detailed response. Please try rephrasing.',
        entities.length > 0 ? `\n**Identified Entities:** ${entities.join(', ')}` : '',
      ].join('\n').trim();
    } else {
      responseText = "I'm sorry, I encountered an issue processing your request. Please try again.";
    }

    return new Response(responseText, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error: unknown) {
    const elapsed = Date.now() - startTime;
    const isTimeout = error instanceof Error && error.name === 'AbortError';

    if (isTimeout) {
      console.error(`[chat/route] Timed out after ${elapsed}ms`);
    } else {
      console.error(`[chat/route] Error after ${elapsed}ms:`, error);
    }

    const fallbackMessage = isTimeout
      ? '### ⏱️ Request Timed Out\n\nThe Legal AI engine is taking longer than expected. Please try again.\n\n**Tips:**\n*   Try a shorter, more specific question.\n*   Check that the backend server is running.'
      : '### 🛡️ AI Engine Temporarily Unavailable\n\nThe Legal AI engine is currently unavailable.\n\n**What you can do:**\n*   Visit the [Lawyer Finder](/lawyers) to connect with verified professionals.\n*   Browse the [Legal Forum](/forum) for community insights.\n*   Try again in a few minutes.';

    return new Response(fallbackMessage, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}