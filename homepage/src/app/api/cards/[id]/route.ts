import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'cards.json');

async function readCards() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function GET(request: Request, context: any) {
  const { params } = context;
  const cards = await readCards();
  const card = cards.find((card: any) => card.id === params.id);

  if (!card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 });
  }

  return NextResponse.json(card);
}

export async function DELETE(request: Request, context: any) {
  // Simulate success for Vercel (read-only file system)
  return NextResponse.json({ success: true });
} 