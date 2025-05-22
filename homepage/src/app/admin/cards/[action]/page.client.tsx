'use client';

import { useState, useEffect } from 'react';
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

export default function CardForm({ params }: { params: { action: string } }) {
  const router = useRouter();
  const isEdit = params.action !== 'new';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<Partial<ContentCard>>({
    title: '',
    description: '',
    category: '',
    type: '',
    actionText: '',
    actionLink: '',
    duration: '',
    stats: '',
  });

  useEffect(() => {
    if (isEdit && params.action && params.action !== 'new') {
      fetchCard();
    }
  }, [isEdit, params.action]);

  const fetchCard = async () => {
    try {
      const response = await fetch(`/api/cards/${params.action}`);
      if (!response.ok) throw new Error('Failed to fetch card');
      const data = await response.json();
      setCard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch card');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/cards', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(card),
      });

      if (!response.ok) throw new Error('Failed to save card');
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save card');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {isEdit ? 'Edit Card' : 'Add New Card'}
        </h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={card.title}
                onChange={(e) => setCard({ ...card, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={card.description}
                onChange={(e) => setCard({ ...card, description: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  value={card.category}
                  onChange={(e) => setCard({ ...card, category: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <input
                  type="text"
                  id="type"
                  value={card.type}
                  onChange={(e) => setCard({ ...card, type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="actionText" className="block text-sm font-medium text-gray-700">
                  Action Text
                </label>
                <input
                  type="text"
                  id="actionText"
                  value={card.actionText}
                  onChange={(e) => setCard({ ...card, actionText: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="actionLink" className="block text-sm font-medium text-gray-700">
                  Action Link
                </label>
                <input
                  type="text"
                  id="actionLink"
                  value={card.actionLink}
                  onChange={(e) => setCard({ ...card, actionLink: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  Duration
                </label>
                <input
                  type="text"
                  id="duration"
                  value={card.duration}
                  onChange={(e) => setCard({ ...card, duration: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="stats" className="block text-sm font-medium text-gray-700">
                  Stats
                </label>
                <input
                  type="text"
                  id="stats"
                  value={card.stats}
                  onChange={(e) => setCard({ ...card, stats: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 