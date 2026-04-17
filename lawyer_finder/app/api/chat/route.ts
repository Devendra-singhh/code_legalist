import Groq from 'groq-sdk';
import { performResearch } from '@/lib/ai/research';

interface SearchResult {
  content: string;
  similarity: number;
  metadata?: Record<string, unknown>;
}

// Initialize the Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const runtime = 'nodejs';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return typeof error === 'string' ? error : 'Unknown error';
}

export async function POST(req: Request) {
  console.log('Chat API called');

  try {
    const { messages } = await req.json();
    console.log('Received messages:', JSON.stringify(messages, null, 2));

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage?.content) {
      throw new Error('No message content provided');
    }

    console.log('Searching for lawyers with query:', lastMessage.content);

    // Search for relevant lawyers
    const searchUrl = new URL('/api/search', process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:3000');
    const searchResponse = await fetch(searchUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: lastMessage.content }),
    });

    console.log('Search response status:', searchResponse.status);

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('Search API error:', errorText);
      throw new Error(`Search API returned ${searchResponse.status}: ${errorText}`);
    }

    const searchData = await searchResponse.json() as { results?: SearchResult[] };
    console.log('Search results count:', searchData.results?.length || 0);

    const relevantContent = searchData.results || [];

    // Build the prompt content
    let promptContent: string;
    let researchResults: any[] = [];

    // Check if the user is asking for research/case studies, legal advice, or sections
    const isResearchRequest = /case study|similar case|precedent|research|landmark|section|ipc|law|advice|legal help/i.test(lastMessage.content);

    if (isResearchRequest) {
      console.log('Research request detected, initiating deep research...');
      researchResults = await performResearch(lastMessage.content);
    }

    if (relevantContent.length === 0 && researchResults.length === 0) {
      console.log('No relevant content found for query:', lastMessage.content);
      promptContent = 'No lawyers found matching the user\'s criteria. Politely let them know and suggest they try a different search query.';
    } else {
      // Format lawyer information
      const lawyerInfo = relevantContent.map(result => {
        try {
          const lawyer = typeof result.content === 'string' ? JSON.parse(result.content) : result.content;
          return `
Name: ${lawyer.Name || 'N/A'}
Location: ${lawyer.Location || 'N/A'}
Experience: ${lawyer.Experience || 'N/A'} years
Languages: ${lawyer.Languages || 'N/A'}
Practice Areas: ${lawyer['Practice Areas'] || lawyer.practiceAreas || 'N/A'}
About: ${lawyer.About || lawyer.about || 'N/A'}
Court: ${lawyer.Court || lawyer.court || 'N/A'}
Profile: ${lawyer['Profile Link'] || lawyer.profileLink || 'N/A'}
-------------------`;
        } catch (e) {
          console.error('Error parsing lawyer data:', e);
          return 'Error: Could not parse lawyer information';
        }
      }).join('\n\n');

      console.log('Generated lawyer info:', lawyerInfo.substring(0, 500) + '...');

      // Format research results if any
      const researchInfo = researchResults.length > 0
        ? researchResults.map(r => `#### 🏛️ [${r.title}](${r.sourceUrl}) (${r.year})\n- **Jurisdiction:** ${r.jurisdiction}\n- **Summary:** ${r.summary}\n- **Relevance:** ${r.relevance}\n---`).join('\n\n')
        : '';

      promptContent = `Based on the following information, provide a helpful response to: "${lastMessage.content}"

${lawyerInfo ? `Lawyer Information:\n${lawyerInfo}\n` : ''}
${researchInfo ? `Related Case Studies:\n${researchInfo}\n` : ''}

Format the response in a clear, structured way. If case studies are provided, highlight them as separate "Case Study" sections.`;
    }

    console.log('Sending prompt to Groq...');

    // Stream the response from Groq
    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a professional legal research assistant. Your primary goal is to provide accurate legal information and help users find relevant lawyers. When legal case studies are provided in the context, you MUST preserve their premium Markdown formatting EXACTLY as provided (e.g., `#### 🏛️ [Title](URL) (Year)` lists). Do not strip out the markdown headers or emojis. Be authoritative yet helpful.',
        },
        {
          role: 'user',
          content: promptContent,
        },
      ],
      stream: true,
      temperature: 0.6,
      max_tokens: 1024,
    });

    console.log('Received stream from Groq');

    // Convert Groq stream to a ReadableStream for the Response
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || '';
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    const errorMessage = getErrorMessage(error);

    // Return a fallback streamed error message via Groq
    try {
      const stream = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: `I'm sorry, but I encountered an error: ${errorMessage}. Please try again or rephrase your question.`,
          },
        ],
        stream: true,
        max_tokens: 256,
      });

      const readableStream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          try {
            for await (const chunk of stream) {
              const text = chunk.choices[0]?.delta?.content || '';
              if (text) {
                controller.enqueue(encoder.encode(text));
              }
            }
          } catch (err) {
            controller.error(err);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        },
      });
    } catch (fallbackError) {
      console.error('Fallback error handler failed:', fallbackError);
      return new Response(
        JSON.stringify({ error: 'An unexpected error occurred', details: errorMessage }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
}