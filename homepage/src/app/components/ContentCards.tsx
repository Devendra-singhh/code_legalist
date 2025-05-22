'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface ContentCard {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  actionText?: string;
  actionLink?: string;
  duration?: string;
  stats?: string;
}

const ContentCardsComponent = () => {
  const [cards, setCards] = useState<ContentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await fetch('/api/cards');
      if (!response.ok) throw new Error('Failed to fetch cards');
      const data = await response.json();
      setCards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Helper to get button color based on actionText
  const getButtonClass = (actionText: string) => {
    switch (actionText.toLowerCase()) {
      case 'download':
        return 'bg-green-700 hover:bg-green-800 text-white';
      case 'register now':
        return 'bg-green-700 hover:bg-green-800 text-white';
      case 'listen now':
        return 'bg-purple-700 hover:bg-purple-800 text-white';
      case 'read more':
        return 'bg-purple-700 hover:bg-purple-800 text-white';
      default:
        return 'bg-indigo-700 hover:bg-indigo-800 text-white';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white/5 rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-white/10 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
            <div className="h-4 bg-white/10 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        Failed to load content cards. Please try again later.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div
          key={card.id}
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 shadow-xl"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white drop-shadow-md flex items-center gap-2">
              {card.title}
            </h3>
            <span className="text-xs px-2 py-1 rounded-full bg-indigo-900 text-indigo-200 font-semibold shadow-sm">
              {card.category}
            </span>
          </div>
          <p className="text-gray-300 mb-4 text-base leading-relaxed min-h-[48px]">{card.description}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs font-medium text-indigo-200 uppercase tracking-wide">
              {card.type}
            </span>
            {card.actionText && card.actionLink && (
              <Link
                href={card.actionLink}
                className={`px-4 py-2 rounded-lg mt-2 font-semibold shadow-md transition-colors duration-200 ${getButtonClass(card.actionText)}`}
              >
                {card.actionText}
              </Link>
            )}
          </div>
          {(card.duration || card.stats) && (
            <div className="mt-4 text-xs text-gray-400 flex gap-4">
              {card.duration && <span>{card.duration}</span>}
              {card.stats && <span>{card.stats}</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default React.memo(ContentCardsComponent); 