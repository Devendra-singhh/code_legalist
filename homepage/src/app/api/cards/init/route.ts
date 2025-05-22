import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'cards.json');

const initialCards = [
  {
    id: '1',
    title: 'Legal Templates',
    description: 'Access our collection of free legal document templates and guides for startups and small businesses.',
    category: 'Business Law',
    type: 'Free Resources',
    actionText: 'Download',
    actionLink: '#',
    stats: '12 templates'
  },
  {
    id: '2',
    title: 'Tech Summit',
    description: 'Join us for the biggest legal technology conference of the year. Network with industry leaders and explore the future of law.',
    category: 'Upcoming Event',
    type: 'Conference',
    actionText: 'Register Now',
    actionLink: '#',
    duration: 'June 15-17',
    stats: 'San Francisco'
  },
  {
    id: '3',
    title: 'AI in Law',
    description: 'New study reveals how artificial intelligence is transforming legal services and improving client outcomes.',
    category: 'Technology',
    type: 'Research',
    actionText: 'Read More',
    actionLink: '#',
    duration: '8 min read'
  },
  {
    id: '4',
    title: 'Legal Podcast',
    description: 'Listen to our latest episode: \'Navigating Corporate Law in the Digital Age\'',
    category: 'Corporate Law',
    type: 'Podcast',
    actionText: 'Listen Now',
    actionLink: '#',
    duration: '45 min'
  },
  {
    id: '5',
    title: 'Supreme Court Ruling',
    description: 'Landmark decision on digital privacy rights sets new precedent for tech companies and user data protection.',
    category: 'Breaking News',
    type: 'Legal Update'
  },
  {
    id: '6',
    title: 'Legal Tech Stats',
    description: '78% of law firms now use AI tools for document review, up from 45% last year.',
    category: 'Industry Update',
    type: 'Statistics'
  },
  {
    id: '7',
    title: 'Global Legal Trends',
    description: 'Remote legal services market projected to reach $25B by 2025, growing at 15% annually.',
    category: 'Market Insight',
    type: 'Trend Analysis'
  }
];

export async function POST() {
  try {
    await fs.writeFile(dataFilePath, JSON.stringify(initialCards, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to initialize cards' },
      { status: 500 }
    );
  }
} 