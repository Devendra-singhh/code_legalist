// app/api/chat/route.ts
import { NextRequest } from "next/server";
import { Message } from "ai";

// Get the backend URL from environment variables or use localhost as fallback
const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:3005';

export const runtime = 'edge';

// Helper function to clean response text
function formatResponse(text: string): string {
  // Remove excessive whitespace while preserving paragraph breaks
  return text
    .replace(/\n{3,}/g, '\n\n')  // Replace 3+ consecutive newlines with just 2
    .trim();  // Remove leading/trailing whitespace
}

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();

    if (!body.messages) {
      return Response.json({ error: "No messages provided" }, { status: 400 });
    }

    // Get the last user message and history
    const messages = body.messages || [];
    const lastUserMessage = messages[messages.length - 1];
    const query = lastUserMessage.content;
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role,
      content: m.content
    }));

    const backendResponse = await fetch(`${BACKEND_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, history }),
    });

    // Get the raw backend data
    if (!backendResponse.ok) {
      throw new Error(`Backend responded with status: ${backendResponse.status}`);
    }
    const backendData = await backendResponse.json();

    // Format response for display
    let responseText = "";

    if (backendData.response) {
      const lawyerResponse = backendData.response.lawyer_response;
      const entities = backendData.response.extracted_legal_entities || [];

      if (lawyerResponse) {
        responseText = formatResponse(lawyerResponse);
      } else {
        responseText = `### 🔍 Analysis of "${query}"\n\nNo specific legal advice was generated for this query. However, I found some relevant information from the legal database:\n\n*   **Extracted Entities**: ${entities.length > 0 ? entities.join(', ') : "None identified"}\n*   **Database Search**: Completed successfully.\n\nPlease try rephrasing your question with more specific legal details.`;
      }
    } else {
      responseText = "I'm sorry, I encountered an issue processing your request. Please try again or rephrase your question.";
    }

    // Return plain text for the frontend useChat hook (v2 compatible)
    return new Response(responseText, {
      headers: { 'Content-Type': 'text/plain' }
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response("Error processing request", { status: 500 });
  }
}

// Add OPTIONS handler for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}