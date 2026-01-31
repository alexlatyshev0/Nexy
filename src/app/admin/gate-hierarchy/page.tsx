'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Loader2, Lock, Unlock, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface SceneInGate {
  slug: string;
  title: { ru?: string; en?: string };
  image_url?: string;
  gates: string[];
  operator: string;
  level?: string;
  exists: boolean;
}

interface GateData {
  gate: string;
  scenes: SceneInGate[];
}

interface HierarchyData {
  gates: string[];
  hierarchy: Record<string, GateData>;
  ungated: Array<{
    slug: string;
    title: { ru?: string; en?: string };
    image_url?: string;
    category: string;
  }>;
  stats: {
    totalGated: number;
    totalUngated: number;
    totalActive: number;
  };
}

const GATE_LABELS: Record<string, string> = {
  oral: 'Оральный секс',
  anal: 'Анальный секс',
  group: 'Групповой секс',
  toys: 'Игрушки',
  roleplay: 'Ролевые игры',
  quickie: 'Быстрый секс',
  romantic: 'Романтика',
  power_dynamic: 'Власть/подчинение',
  rough: 'Жёсткий секс',
  public: 'Публичный секс',
  exhibitionism: 'Эксгибиционизм',
  recording: 'Съёмка',
  dirty_talk: 'Грязные разговоры',
  praise: 'Похвала',
  lingerie: 'Бельё',
  foot: 'Фут-фетиш',
  bondage: 'Бондаж',
  body_fluids: 'Жидкости тела',
  sexting: 'Секстинг',
  extreme: 'Экстрим',
};

const GATE_COLORS: Record<string, string> = {
  oral: 'bg-pink-900/30 border-pink-700',
  anal: 'bg-orange-900/30 border-orange-700',
  group: 'bg-purple-900/30 border-purple-700',
  toys: 'bg-cyan-900/30 border-cyan-700',
  roleplay: 'bg-indigo-900/30 border-indigo-700',
  quickie: 'bg-yellow-900/30 border-yellow-700',
  romantic: 'bg-rose-900/30 border-rose-700',
  power_dynamic: 'bg-red-900/30 border-red-700',
  rough: 'bg-amber-900/30 border-amber-700',
  public: 'bg-green-900/30 border-green-700',
  exhibitionism: 'bg-teal-900/30 border-teal-700',
  recording: 'bg-blue-900/30 border-blue-700',
  dirty_talk: 'bg-fuchsia-900/30 border-fuchsia-700',
  praise: 'bg-lime-900/30 border-lime-700',
  lingerie: 'bg-violet-900/30 border-violet-700',
  foot: 'bg-emerald-900/30 border-emerald-700',
  bondage: 'bg-slate-900/30 border-slate-700',
  body_fluids: 'bg-sky-900/30 border-sky-700',
  sexting: 'bg-pink-900/30 border-pink-700',
  extreme: 'bg-red-950/50 border-red-600',
};

export default function GateHierarchyPage() {
  const [data, setData] = useState<HierarchyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedGates, setExpandedGates] = useState<Set<string>>(new Set());
  const [showUngated, setShowUngated] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/gate-hierarchy');
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        setData(json);
        // Expand gates with scenes by default
        const withScenes = Object.entries(json.hierarchy)
          .filter(([, v]) => (v as GateData).scenes.length > 0)
          .map(([k]) => k);
        setExpandedGates(new Set(withScenes));
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleGate = (gate: string) => {
    setExpandedGates(prev => {
      const next = new Set(prev);
      if (next.has(gate)) {
        next.delete(gate);
      } else {
        next.add(gate);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-red-400">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Gate Hierarchy</h1>
            <p className="text-gray-400 text-sm mt-1">
              Сцены организованы по гейтам (что открывается каким выбором в онбординге)
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">
              <Lock className="size-4 inline mr-1" />
              {data.stats.totalGated} gated
            </span>
            <span className="text-gray-400">
              <Unlock className="size-4 inline mr-1" />
              {data.stats.totalUngated} ungated
            </span>
            <Link
              href="/admin/scene-structure"
              className="text-blue-400 hover:text-blue-300"
            >
              ← Scene Structure
            </Link>
          </div>
        </div>

        {/* Gate tree */}
        <div className="space-y-2">
          {data.gates.map(gate => {
            const gateData = data.hierarchy[gate];
            const isExpanded = expandedGates.has(gate);
            const sceneCount = gateData.scenes.length;

            if (sceneCount === 0) return null;

            return (
              <div
                key={gate}
                className={`border rounded-lg overflow-hidden ${GATE_COLORS[gate] || 'bg-gray-900/30 border-gray-700'}`}
              >
                {/* Gate header */}
                <button
                  onClick={() => toggleGate(gate)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="size-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="size-5 text-gray-400" />
                  )}
                  <span className="font-medium">{GATE_LABELS[gate] || gate}</span>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                    {sceneCount} scenes
                  </span>
                </button>

                {/* Scenes */}
                {isExpanded && (
                  <div className="border-t border-gray-700/50 p-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {gateData.scenes.map(scene => (
                        <div
                          key={scene.slug}
                          className={`bg-gray-900/50 rounded-lg p-2 ${!scene.exists ? 'opacity-50' : ''}`}
                        >
                          {/* Image */}
                          <div className="aspect-video rounded overflow-hidden bg-gray-800 mb-2">
                            {scene.image_url ? (
                              <Image
                                src={scene.image_url}
                                alt={scene.slug}
                                width={200}
                                height={112}
                                className="w-full h-full object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                                No image
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="text-sm font-medium truncate">
                            {scene.title?.ru || scene.title?.en || scene.slug}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {scene.slug}
                          </div>

                          {/* Requirements */}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {scene.gates.map((g, i) => (
                              <span key={g} className="text-xs">
                                {i > 0 && (
                                  <span className={scene.operator === 'AND' ? 'text-red-400' : 'text-green-400'}>
                                    {scene.operator === 'AND' ? ' & ' : ' | '}
                                  </span>
                                )}
                                <span className={g === gate ? 'text-white font-medium' : 'text-gray-400'}>
                                  {g}
                                </span>
                              </span>
                            ))}
                            {scene.level === 'very' && (
                              <span className="text-xs px-1 py-0.5 bg-red-900/50 text-red-300 rounded ml-1">
                                VERY
                              </span>
                            )}
                          </div>

                          {!scene.exists && (
                            <div className="flex items-center gap-1 text-xs text-amber-400 mt-1">
                              <AlertTriangle className="size-3" />
                              Not in DB
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Ungated scenes */}
        <div className="mt-6 border border-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowUngated(!showUngated)}
            className="w-full flex items-center gap-3 p-3 bg-gray-900/30 hover:bg-white/5 transition-colors"
          >
            {showUngated ? (
              <ChevronDown className="size-5 text-gray-400" />
            ) : (
              <ChevronRight className="size-5 text-gray-400" />
            )}
            <Unlock className="size-4 text-gray-400" />
            <span className="font-medium">Ungated Scenes</span>
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
              {data.ungated.length} scenes
            </span>
          </button>

          {showUngated && (
            <div className="border-t border-gray-700/50 p-3">
              <p className="text-xs text-gray-500 mb-3">
                Эти сцены не имеют гейтов в onboarding-gates.ts — доступны всем или фильтруются иначе
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {data.ungated.map(scene => (
                  <div key={scene.slug} className="bg-gray-900/50 rounded p-2">
                    <div className="aspect-video rounded overflow-hidden bg-gray-800 mb-1">
                      {scene.image_url ? (
                        <Image
                          src={scene.image_url}
                          alt={scene.slug}
                          width={120}
                          height={68}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                          -
                        </div>
                      )}
                    </div>
                    <div className="text-xs truncate">{scene.slug}</div>
                    <div className="text-xs text-gray-500">{scene.category}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
