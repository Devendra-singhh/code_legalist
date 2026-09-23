import { NextResponse } from 'next/server';
import { findRelevantBNSContent } from '@/lib/ai/embedding';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === 'string' ? error : 'Unknown error';
}

export async function POST(req: Request) {
  console.log('[bns-search] API called');

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
      console.error('[bns-search] Invalid or missing query:', query);
      return NextResponse.json(
        { error: 'Query is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const trimmedQuery = query.trim();
    console.log('[bns-search] Searching for:', trimmedQuery.slice(0, 80));

    const results = await findRelevantBNSContent(trimmedQuery);
    console.log(`[bns-search] Found ${results.length} results`);

    return NextResponse.json({ results, count: results.length });

  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error('[bns-search] Error:', errorMessage, '\nFull:', error);

    return NextResponse.json(
      {
        error: 'Failed to search BNS dataset',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        results: [],
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
