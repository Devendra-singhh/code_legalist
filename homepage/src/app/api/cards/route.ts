import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'cards.json');

// Ensure the data directory exists
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir);
  }
}

// Read cards from file
async function readCards() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Write cards to file
async function writeCards(cards: any[]) {
  await ensureDataDirectory();
  await fs.writeFile(dataFilePath, JSON.stringify(cards, null, 2));
}

export async function GET() {
  const cards = await readCards();
  return NextResponse.json(cards);
}

export async function POST(request: Request) {
  const card = await request.json();
  const cards = await readCards();
  
  const newCard = {
    id: Date.now().toString(),
    ...card,
  };
  
  cards.push(newCard);
  await writeCards(cards);
  
  return NextResponse.json(newCard);
}

export async function PUT(request: Request) {
  const updatedCard = await request.json();
  const cards = await readCards();
  
  const index = cards.findIndex((card: any) => card.id === updatedCard.id);
  if (index === -1) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 });
  }
  
  cards[index] = updatedCard;
  await writeCards(cards);
  
  return NextResponse.json(updatedCard);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  const cards = await readCards();
  
  const filteredCards = cards.filter((card: any) => card.id !== id);
  await writeCards(filteredCards);
  
  return NextResponse.json({ success: true });
} 