import Groq from 'groq-sdk';

interface SearchResult {
  content: string;
  similarity: number;
  metadata?: Record<string, unknown>;
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage?.content) {
      throw new Error('No message content provided');
    }

    // ─── Phase 1: Pure Lawyer Search ────────────────────────────────────────
    // We focus strictly on finding human advocates for the user's matter.
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001/lawyers';
    const searchUrl = new URL('/lawyers/api/search', 'http://localhost:3001');
    
    const searchResponse = await fetch(searchUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: lastMessage.content }),
    });

    const searchData = await searchResponse.json() as { results?: SearchResult[] };
    const relevantContent = searchData.results || [];

    let promptContent: string;
    if (relevantContent.length === 0) {
      promptContent = `I could not find a direct match for this specific request. 
      Please ask the user to clarify the location or the specific legal specialty they need 
      so I can find a verified advocate for them.`;
    } else {
      // ─── Format Professional Profiles ─────────────────────────────────────
      const lawyerInfo = relevantContent.map(result => {
        try {
          const lawyer = typeof result.content === 'string' ? JSON.parse(result.content) : result.content;
          return `
#### ⚖️ ${lawyer.Name}
- **Location:** ${lawyer.Location}
- **Experience:** ${lawyer.Experience} Years
- **Specialties:** ${lawyer['Practice Areas'] || 'General Practice'}
- **Court:** ${lawyer.Court || 'Multiple Courts'}
- **Contact:** [Connect with Advocate](${lawyer['Profile Link'] || '#'})
- **Expertise Note:** ${lawyer.About || 'Experienced legal professional.'}
---`;
        } catch (e) {
          return 'Error parsing profile';
        }
      }).join('\n\n');

      promptContent = `Help the user by matching them with these legal professionals. 

### 👤 Recommended Advocates for your Matter
${lawyerInfo}

Briefly explain why these specific advocates are a good fit based on their experience and your query. 
Do NOT provide general legal advice or explain IPC sections. Focus solely on the profiles.`;
    }

    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are the specialized Lawyer Matchmaker for Code Legalist. 
          Your role is to connect users with human advocates. 
          
          RULES:
          1. NEVER provide general legal advice or definitions.
          2. ALWAYS focus solely on the lawyer profiles provided in the context.
          3. STRICT LOCATION MATCHING: If the user specified a city (e.g., "Jaipur"), prioritize lawyers from that city. 
          4. NO HALLUCINATIONS: If the user mentions a city, do NOT say "no specific location was mentioned." Instead, if you find no local matches, say "While I search for specialized advocates specifically in [City], here are top-tier regional experts who can handle your matter across state lines:"
          5. Present results as professional "Advocate Cards" using the Markdown format provided.


          4. If the user asks for legal advice, politely redirect them: "To provide the best counsel on this matter, I recommend consulting one of these verified advocates specializing in this field:"`,
        },
        { role: 'user', content: promptContent },
      ],
      stream: true,
      temperature: 0.1, // Very low temperature for strict adherence to profiles
      max_tokens: 1000,
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || '';
            if (text) controller.enqueue(encoder.encode(text));
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error) {
    console.error('Lawyer Search API error:', error);
    return new Response('Search system temporarily offline.', { status: 500 });
  }
}