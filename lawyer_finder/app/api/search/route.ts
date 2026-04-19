import { NextResponse } from 'next/server';
import { findRelevantContent } from '@/lib/ai/embedding';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === 'string' ? error : 'Unknown error';
}

export async function POST(req: Request) {
  console.log('[search] API called');

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const query = (body as Record<string, unknown>)?.query;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      console.error('[search] Invalid or missing query:', query);
      return NextResponse.json(
        { error: 'Query is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const trimmedQuery = query.trim();
    console.log('[search] Searching for:', trimmedQuery.slice(0, 80));

    const results = await findRelevantContent(trimmedQuery);
    console.log(`[search] Found ${results.length} results`);

    if (results.length > 0) {
      console.log('[search] Sample result:', {
        id: results[0].id,
        similarity: results[0].similarity,
        preview: typeof results[0].content === 'string'
          ? results[0].content.slice(0, 80) + '...'
          : '(object content)',
      });
    } else {
      console.log('[search] No results found — mock fallback may have returned empty array');
    }

    return NextResponse.json({ results, count: results.length });

  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error('[search] Error:', errorMessage, '\nFull:', error);

    return NextResponse.json(
      {
        error: 'Failed to search lawyers',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        results: [], // Always return array so callers don't crash
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}