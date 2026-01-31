'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Copy, Check, AlertTriangle, RefreshCw, Combine, Trash2 } from 'lucide-react';

interface SceneData {
  id: string;
  slug: string;
  role_direction: string;
  user_description: { ru: string; en: string };
  image_url: string | null;
  image_variants: Array<{ url: string; prompt: string }> | null;
  sharedFrom?: boolean;
}

interface PairData {
  baseSlug: string;
  give: SceneData;
  receive: SceneData;
  sameImage: boolean;
}

export default function ImagePairsPage() {
  const [pairs, setPairs] = useState<PairData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'mismatched' | 'matched'>('mismatched');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPairs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/swap-images');
      const data = await res.json();
      setPairs(data.pairs || []);
    } catch (error) {
      console.error('Failed to fetch pairs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPairs();
  }, []);

  const handleAction = async (action: string, sceneIdA: string, sceneIdB: string, baseSlug: string) => {
    setActionLoading(baseSlug);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/swap-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, sceneIdA, sceneIdB }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: `${action}: ${baseSlug}` });
        await fetchPairs();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredPairs = pairs.filter(p => {
    if (filter === 'mismatched') return !p.sameImage;
    if (filter === 'matched') return p.sameImage;
    return true;
  });

  const mismatchedCount = pairs.filter(p => !p.sameImage).length;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Image Pairs Manager</h1>
            <p className="text-gray-400 mt-1">
              Manage images between give/receive scene pairs
            </p>
          </div>
          <button
            onClick={fetchPairs}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg ${
              message.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('mismatched')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'mismatched'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            Mismatched ({mismatchedCount})
          </button>
          <button
            onClick={() => setFilter('matched')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'matched'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <Check className="w-4 h-4 inline mr-2" />
            Matched ({pairs.length - mismatchedCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            All ({pairs.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : (
          <div className="space-y-6">
            {filteredPairs.map((pair) => (
              <div
                key={pair.baseSlug}
                className={`p-4 rounded-lg border ${
                  pair.sameImage
                    ? 'bg-gray-900 border-gray-800'
                    : 'bg-yellow-950/30 border-yellow-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{pair.baseSlug}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        pair.sameImage
                          ? 'bg-green-900/50 text-green-300'
                          : 'bg-yellow-900/50 text-yellow-300'
                      }`}
                    >
                      {pair.sameImage ? 'Same image' : 'Different images'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction('swap', pair.give.id, pair.receive.id, pair.baseSlug)}
                      disabled={actionLoading === pair.baseSlug}
                      className="flex items-center gap-2 px-3 py-1.5 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 rounded text-sm"
                    >
                      <ArrowLeftRight className="w-4 h-4" />
                      Swap
                    </button>
                    <button
                      onClick={() => handleAction('copy_a_to_b', pair.give.id, pair.receive.id, pair.baseSlug)}
                      disabled={actionLoading === pair.baseSlug}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 rounded text-sm"
                    >
                      <Copy className="w-4 h-4" />
                      Give → Receive
                    </button>
                    <button
                      onClick={() => handleAction('copy_b_to_a', pair.give.id, pair.receive.id, pair.baseSlug)}
                      disabled={actionLoading === pair.baseSlug}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 rounded text-sm"
                    >
                      <Copy className="w-4 h-4" />
                      Receive → Give
                    </button>
                    <button
                      onClick={() => handleAction('merge', pair.give.id, pair.receive.id, pair.baseSlug)}
                      disabled={actionLoading === pair.baseSlug}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-700 hover:bg-green-600 disabled:opacity-50 rounded text-sm"
                    >
                      <Combine className="w-4 h-4" />
                      Merge All
                    </button>
                                      </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* GIVE side */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-gray-800 px-2 py-0.5 rounded">
                        {pair.give.slug}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        pair.give.role_direction === 'm_to_f'
                          ? 'bg-blue-900/50 text-blue-300'
                          : 'bg-pink-900/50 text-pink-300'
                      }`}>
                        {pair.give.role_direction === 'm_to_f' ? 'HIM' : 'HER'}
                      </span>
                    </div>
                    <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                      {pair.give.image_url ? (
                        <img
                          src={pair.give.image_url}
                          alt={pair.give.slug}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          No image
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {pair.give.user_description?.ru || 'No description'}
                    </p>
                    <div className="flex gap-1 flex-wrap items-center">
                      <span className="text-xs text-gray-500 mr-1">
                        Variants: {pair.give.image_variants?.length || 0}
                        {pair.give.sharedFrom && <span className="text-purple-400 ml-1">(shared)</span>}
                      </span>
                      {pair.give.image_variants && pair.give.image_variants.slice(0, 4).map((v, i) => (
                        <img
                          key={i}
                          src={v.url}
                          alt={`Variant ${i}`}
                          className="w-12 h-12 object-cover rounded border border-gray-700"
                        />
                      ))}
                      {pair.give.image_variants && pair.give.image_variants.length > 4 && (
                        <span className="text-xs text-gray-500">
                          +{pair.give.image_variants.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* RECEIVE side */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-gray-800 px-2 py-0.5 rounded">
                        {pair.receive.slug}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        pair.receive.role_direction === 'm_to_f'
                          ? 'bg-blue-900/50 text-blue-300'
                          : 'bg-pink-900/50 text-pink-300'
                      }`}>
                        {pair.receive.role_direction === 'm_to_f' ? 'HIM' : 'HER'}
                      </span>
                    </div>
                    <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                      {pair.receive.image_url ? (
                        <img
                          src={pair.receive.image_url}
                          alt={pair.receive.slug}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          No image
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {pair.receive.user_description?.ru || 'No description'}
                    </p>
                    <div className="flex gap-1 flex-wrap items-center">
                      <span className="text-xs text-gray-500 mr-1">
                        Variants: {pair.receive.image_variants?.length || 0}
                        {pair.receive.sharedFrom && <span className="text-purple-400 ml-1">(shared)</span>}
                      </span>
                      {pair.receive.image_variants && pair.receive.image_variants.slice(0, 4).map((v, i) => (
                        <img
                          key={i}
                          src={v.url}
                          alt={`Variant ${i}`}
                          className="w-12 h-12 object-cover rounded border border-gray-700"
                        />
                      ))}
                      {pair.receive.image_variants && pair.receive.image_variants.length > 4 && (
                        <span className="text-xs text-gray-500">
                          +{pair.receive.image_variants.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
