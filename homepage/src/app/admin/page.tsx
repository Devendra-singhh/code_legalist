'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

export default function AdminDashboard() {
  const router = useRouter();
  const [cards, setCards] = useState<ContentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initLoading, setInitLoading] = useState(false);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await fetch('/api/cards');
      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }
      const data = await response.json();
      setCards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cards');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this card?')) {
      return;
    }

    try {
      const response = await fetch(`/api/cards/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete card');
      }

      setCards(cards.filter(card => card.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete card');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', {
        method: 'DELETE',
      });
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout');
    }
  };

  const handleInitialize = async () => {
    if (!confirm('Are you sure you want to initialize cards? This will overwrite all existing cards.')) {
      return;
    }

    setInitLoading(true);
    try {
      const response = await fetch('/api/cards/init', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to initialize cards');
      }

      await fetchCards();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize cards');
    } finally {
      setInitLoading(false);
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
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">
          Admin Dashboard
        </h1>
        <div className="space-x-4">
          <Link
            href="/admin/cards/new"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add New Card
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.id} className="bg-white/5 backdrop-blur-sm rounded-lg p-6 hover:bg-white/10 transition-all duration-300 shadow-md">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-white">{card.title}</h3>
              <span className="text-sm text-indigo-300">{card.category}</span>
            </div>
            <p className="text-gray-300 mb-4">{card.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-indigo-200">{card.type}</span>
              {card.actionText && card.actionLink && (
                <Link
                  href={card.actionLink}
                  className={`px-4 py-2 rounded mt-2 font-medium transition-colors duration-200 ${getButtonClass(card.actionText)}`}
                >
                  {card.actionText}
                </Link>
              )}
            </div>
            {(card.duration || card.stats) && (
              <div className="mt-4 text-sm text-gray-400">
                {card.duration && <span className="mr-4">{card.duration}</span>}
                {card.stats && <span>{card.stats}</span>}
              </div>
            )}
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => handleDelete(card.id)}
                className="text-red-400 hover:text-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 