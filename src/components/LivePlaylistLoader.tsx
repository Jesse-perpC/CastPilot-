import React, { useState } from 'react';
import { 
  ArrowUp, 
  ArrowDown, 
  Play, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  Tv, 
  Film, 
  Compass, 
  Radio, 
  PlusCircle, 
  ListOrdered, 
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Headphones
} from 'lucide-react';
import { ScheduleItem, ContentAsset } from '../types';

interface LivePlaylistLoaderProps {
  schedules: ScheduleItem[];
  setSchedules: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
  assets: ContentAsset[];
  channelName: string;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onCueMedia?: (item: any) => void;
}

export default function LivePlaylistLoader({ 
  schedules, 
  setSchedules, 
  assets, 
  channelName, 
  addToast,
  onCueMedia
}: LivePlaylistLoaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('all');

  // Filter assets based on search query and type filter
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (asset.category && asset.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = activeTypeFilter === 'all' || asset.type === activeTypeFilter;
    return matchesSearch && matchesType;
  });

  // Extract currently playing and queued sequence
  const currentlyPlaying = schedules.find((s) => s.status === 'playing');
  const upcomingQueue = schedules.filter((s) => s.status === 'queued');

  // Reorder items: Move up in queue
  const moveUp = (indexInQueue: number) => {
    if (indexInQueue === 0) return; // already at top of queue
    
    // Find absolute indices in full schedules array
    const queuedItems = schedules.filter(s => s.status === 'queued');
    const targetItem = queuedItems[indexInQueue];
    const prevItem = queuedItems[indexInQueue - 1];

    const targetIdx = schedules.findIndex(s => s.id === targetItem.id);
    const prevIdx = schedules.findIndex(s => s.id === prevItem.id);

    if (targetIdx !== -1 && prevIdx !== -1) {
      const updated = [...schedules];
      // Swap positions
      updated[targetIdx] = prevItem;
      updated[prevIdx] = targetItem;
      setSchedules(updated);
      addToast(`Moved "${targetItem.title}" up in the live playout queue.`, "info");
    }
  };

  // Reorder items: Move down in queue
  const moveDown = (indexInQueue: number) => {
    const queuedItems = schedules.filter(s => s.status === 'queued');
    if (indexInQueue === queuedItems.length - 1) return; // already at bottom

    const targetItem = queuedItems[indexInQueue];
    const nextItem = queuedItems[indexInQueue + 1];

    const targetIdx = schedules.findIndex(s => s.id === targetItem.id);
    const nextIdx = schedules.findIndex(s => s.id === nextItem.id);

    if (targetIdx !== -1 && nextIdx !== -1) {
      const updated = [...schedules];
      // Swap positions
      updated[targetIdx] = nextItem;
      updated[nextIdx] = targetItem;
      setSchedules(updated);
      addToast(`Moved "${targetItem.title}" down in the live playout queue.`, "info");
    }
  };

  // Remove item from live schedule list
  const removeItem = (id: string, title: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
    addToast(`Removed "${title}" from the live playout queue.`, "info");
  };

  // Force play item immediately (Load on player)
  const forcePlayNow = (id: string, title: string) => {
    setSchedules(prev => {
      return prev.map(s => {
        if (s.status === 'playing') {
          return { ...s, status: 'completed' as const };
        }
        if (s.id === id) {
          return { ...s, status: 'playing' as const };
        }
        return s;
      });
    });
    addToast(`Force playout triggered: Now streaming "${title}" live!`, "success");
  };

  // Create schedule item from asset definition
  const createScheduleItem = (asset: ContentAsset, status: 'playing' | 'queued'): ScheduleItem => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return {
      id: `sch-dyn-${asset.id}-${Date.now()}`,
      channelName: channelName,
      startTime: timeString,
      title: asset.title,
      type: asset.type,
      duration: asset.duration,
      status: status,
      demandScore: 95,
      targetAudience: asset.optimalSlot || "General Rotation",
      aiRationale: "Manually injected live media block from dashboard console."
    };
  };

  // Load asset as Play Now (Interrupt current stream)
  const handleLoadAssetNow = (asset: ContentAsset) => {
    const newItem = createScheduleItem(asset, 'playing');
    setSchedules(prev => {
      // Set current playing to completed
      const updated = prev.map(s => s.status === 'playing' ? { ...s, status: 'completed' as const } : s);
      // Place the new playing item at the top of the queue list, right before the first queued item
      const firstQueuedIdx = updated.findIndex(s => s.status === 'queued');
      if (firstQueuedIdx === -1) {
        return [...updated, newItem];
      } else {
        const result = [...updated];
        result.splice(firstQueuedIdx, 0, newItem);
        return result;
      }
    });
    addToast(`Loaded "${asset.title}" directly onto the player. Streaming active.`, "success");
  };

  // Load asset as Queue Next
  const handleLoadAssetNext = (asset: ContentAsset) => {
    const newItem = createScheduleItem(asset, 'queued');
    setSchedules(prev => {
      // Find the first index of any queued item or append to playing
      const firstQueuedIdx = prev.findIndex(s => s.status === 'queued');
      if (firstQueuedIdx === -1) {
        return [...prev, newItem];
      } else {
        const result = [...prev];
        result.splice(firstQueuedIdx, 0, newItem);
        return result;
      }
    });
    addToast(`Queued "${asset.title}" as the very next scheduled broadcast.`, "success");
  };

  // Load asset as Append to Queue
  const handleAppendAsset = (asset: ContentAsset) => {
    const newItem = createScheduleItem(asset, 'queued');
    setSchedules(prev => [...prev, newItem]);
    addToast(`Appended "${asset.title}" to the end of the linear playlist sequence.`, "success");
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'program': return 'bg-sky-500/10 text-sky-400 border-sky-500/25';
      case 'commercial': return 'bg-rose-500/10 text-rose-400 border-rose-500/25';
      case 'promo': return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      default: return 'bg-slate-800 text-slate-400 border-slate-700/60';
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 shadow-xl space-y-6" id="dashboard-live-playlist-manager">
      
      {/* Header title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ListOrdered className="h-4.5 w-4.5 text-sky-400" />
            Live Playlist Compiler & Media Loader
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            See active playout status, re-order upcoming clips dynamically, and load media instantly from the asset vault onto the player.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] bg-sky-950/40 text-sky-400 border border-sky-900/40 px-2.5 py-1 rounded-lg">
          <Sparkles className="h-3 w-3 animate-pulse" />
          <span>ON-AIR CORRELATOR</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Playout List Compiler (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Active Playout Sequence</h4>
            <span className="text-[10px] text-slate-500 font-mono">
              {upcomingQueue.length} segments queued
            </span>
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto no-scrollbar pr-1">
            {/* Display Currently Playing item if active */}
            {currentlyPlaying ? (
              <div className="p-3.5 rounded-xl bg-sky-500/[0.03] border border-sky-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-[0_0_15px_rgba(14,165,233,0.05)]">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20 shrink-0">
                    <Radio className="h-4 w-4 animate-pulse" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-sky-500 text-slate-950 px-1.5 py-0.5 rounded font-mono shrink-0">
                        Now Streaming
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{currentlyPlaying.startTime}</span>
                    </div>
                    <h5 className="text-xs font-bold text-white mt-1 leading-snug truncate" title={currentlyPlaying.title}>{currentlyPlaying.title}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Duration: {currentlyPlaying.duration}m • {currentlyPlaying.targetAudience}</p>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-900/40 self-start sm:self-auto shrink-0">
                  LIVE OUT
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-900/20 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                Playout player is currently idle or on static test pattern.
              </div>
            )}

            {/* Playout Queued Items */}
            {upcomingQueue.length === 0 ? (
              <div className="py-12 border border-dashed border-slate-800 rounded-xl text-center flex flex-col items-center justify-center gap-2.5 text-slate-500 text-xs">
                <span>No media queued in playlist.</span>
                <p className="text-[10px] text-slate-600 max-w-xs">
                  Browse the catalog on the right and click "Queue Next" or "Add to Playlist" to build a linear playout program!
                </p>
              </div>
            ) : (
              upcomingQueue.map((item, index) => (
                <div 
                  key={item.id} 
                  className="p-3 bg-slate-900/50 hover:bg-slate-900 border border-slate-850 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition group"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0 w-full sm:w-auto">
                    <div className="font-mono text-xs text-slate-500 w-4 text-center shrink-0 pt-0.5 sm:pt-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${getTypeColor(item.type)}`}>
                          {item.type}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{item.startTime}</span>
                      </div>
                      <h5 className="text-xs font-bold text-white mt-1 truncate group-hover:text-sky-400 transition" title={item.title}>{item.title}</h5>
                      <p className="text-[10px] text-slate-500 mt-0.5">{item.duration}m • {item.targetAudience}</p>
                    </div>
                  </div>

                  {/* Reorder & Action Controls */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                    {/* Reordering buttons */}
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="p-1.5 bg-slate-950 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-800 rounded border border-slate-800 transition"
                      title="Move Up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === upcomingQueue.length - 1}
                      className="p-1.5 bg-slate-950 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-800 rounded border border-slate-800 transition"
                      title="Move Down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>

                    {/* Instant Load on Player button */}
                    <button
                      onClick={() => forcePlayNow(item.id, item.title)}
                      className="p-1.5 bg-sky-600/10 text-sky-400 hover:bg-sky-500 hover:text-white rounded border border-sky-500/20 hover:border-sky-500 transition"
                      title="Load and Play Now"
                    >
                      <Play className="h-3.5 w-3.5" />
                    </button>

                    {/* Pre-Fade Listen Cue button */}
                    <button
                      onClick={() => onCueMedia && onCueMedia({
                        id: item.id,
                        title: item.title,
                        type: item.type,
                        duration: item.duration,
                        safetyRating: item.targetAudience === 'Children' ? 'G' : item.targetAudience === 'All Ages' ? 'PG' : 'PG-13',
                        category: 'Queue Block'
                      })}
                      className="p-1.5 bg-sky-500/10 text-sky-400 hover:bg-sky-500 hover:text-slate-950 rounded border border-sky-500/20 transition"
                      title="Cue in PFL Headphones Monitor"
                    >
                      <Headphones className="h-3.5 w-3.5" />
                    </button>

                    {/* Remove from queue */}
                    <button
                      onClick={() => removeItem(item.id, item.title)}
                      className="p-1.5 bg-slate-950 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20 rounded border border-slate-800 hover:border-rose-500/20 transition"
                      title="Remove Block"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Media Asset Browser & Loader (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-slate-900 pt-6 lg:pt-0 lg:pl-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Compass className="h-4 w-4 text-emerald-400" />
            Media Catalog Vault
          </h4>

          {/* Search & Filter Inputs */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search clips, category, tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Quick Type Filter Bar */}
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All' },
                { id: 'program', label: 'Programs' },
                { id: 'promo', label: 'Promos' },
                { id: 'commercial', label: 'Ads' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveTypeFilter(filter.id)}
                  className={`px-2.5 py-1 rounded text-[10px] font-semibold transition whitespace-nowrap ${
                    activeTypeFilter === filter.id
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'bg-slate-900/60 text-slate-400 border border-transparent hover:bg-slate-900'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog list */}
          <div className="space-y-2 max-h-[360px] overflow-y-auto no-scrollbar pr-1 flex-1">
            {filteredAssets.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-600">
                No matching media found in MAM catalog.
              </div>
            ) : (
              filteredAssets.map((asset) => (
                <div 
                  key={asset.id} 
                  className="p-2.5 bg-slate-900/30 hover:bg-slate-900 border border-slate-850/60 rounded-lg flex flex-col gap-2 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-slate-200 truncate">{asset.title}</h5>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {asset.duration}m • {asset.category} • QC: {asset.isQCed ? 'Pass' : 'Pending'}
                      </p>
                    </div>
                    <span className={`text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border shrink-0 ${getTypeColor(asset.type)}`}>
                      {asset.type}
                    </span>
                  </div>

                  {/* Quick-loader action tray */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1.5 border-t border-slate-900">
                    <button
                      onClick={() => handleLoadAssetNow(asset)}
                      className="px-1.5 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 hover:text-white rounded text-[9px] font-bold tracking-wide transition flex items-center justify-center gap-1"
                      title="Load instantly and disrupt playout player"
                    >
                      <Play className="h-2.5 w-2.5" />
                      PLAY NOW
                    </button>
                    <button
                      onClick={() => handleLoadAssetNext(asset)}
                      className="px-1.5 py-1 bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 rounded text-[9px] font-bold tracking-wide transition flex items-center justify-center gap-1"
                      title="Inject at top of playout queue"
                    >
                      <PlusCircle className="h-2.5 w-2.5" />
                      NEXT
                    </button>
                    <button
                      onClick={() => handleAppendAsset(asset)}
                      className="px-1.5 py-1 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 rounded text-[9px] font-bold tracking-wide transition flex items-center justify-center gap-1"
                      title="Add to bottom of schedule playlist"
                    >
                      <Plus className="h-2.5 w-2.5" />
                      APPEND
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="rounded-lg bg-emerald-500/[0.02] border border-emerald-500/15 p-3 flex items-start gap-2.5 text-xs">
            <span className="text-emerald-400 shrink-0 mt-0.5">💡</span>
            <p className="text-[10px] text-slate-400 leading-normal">
              <strong>MAM Hot-Loading:</strong> Playing media instantly sets the currently active stream index to the selected clip and smoothly transitions client-side.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
