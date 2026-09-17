import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  Film,
  Calendar,
  Layers,
  HardHat,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Command,
  Clock,
  CheckCircle2,
  Tv,
  Radio,
  Sliders,
  Volume2,
  Tag,
  Eye,
  ChevronRight,
  LayoutDashboard,
  FileText,
  MessageSquare,
  Share2,
  Settings,
  Download,
  BookOpen,
  CornerDownLeft
} from 'lucide-react';
import { ContentAsset, ScheduleItem, ResourceAsset, ConflictAlert } from '../types';
import { useLanguage } from '../i18n';

export interface GlobalSearchBarProps {
  assets: ContentAsset[];
  schedules: ScheduleItem[];
  resources: ResourceAsset[];
  alerts?: ConflictAlert[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSelectAsset?: (asset: ContentAsset) => void;
  onSelectSchedule?: (schedule: ScheduleItem) => void;
  onSelectResource?: (resource: ResourceAsset) => void;
  onOpenTour?: () => void;
}

type SearchCategory = 'all' | 'assets' | 'schedule' | 'resources' | 'tools' | 'alerts';

interface ToolItem {
  id: string;
  tabId: string;
  title: string;
  category: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const WORKSPACE_TOOLS: ToolItem[] = [
  { id: 'tool-dash', tabId: 'dashboard', title: 'Master Control Station', category: 'Live Ops', description: 'Linear playout automation, stream telemetry & channel health', icon: LayoutDashboard },
  { id: 'tool-sched', tabId: 'scheduler', title: 'AI Scheduling Grid', category: 'Automation', description: 'Gemini-assisted 24/7 lineup builder & conflict resolution', icon: Calendar },
  { id: 'tool-play', tabId: 'playout', title: 'Playout Controller & SCTE-35', category: 'Transmission', description: 'Real-time program queue, ad cue triggers & failover', icon: Tv },
  { id: 'tool-mam', tabId: 'mam', title: 'Media Library (MAM)', category: 'Assets', description: 'AI deep metadata tagging, loudness QC & asset catalog', icon: Film },
  { id: 'tool-promp', tabId: 'prompter', title: 'Show Scripts & Teleprompter', category: 'Studio', description: 'Real-time speech-sync prompter & field tally companion', icon: FileText },
  { id: 'tool-eng', tabId: 'engagement', title: 'Audience Overlays & Live Chat', category: 'Interactivity', description: 'Multi-platform chat curation, polls, ticker & lower-thirds', icon: MessageSquare },
  { id: 'tool-multicam', tabId: 'multicam', title: 'Multi-Cam NDI & PTZ Ingestion', category: 'Production', description: '8-grid studio multiview, robotic PTZ & instant replay', icon: Radio },
  { id: 'tool-res', tabId: 'resources', title: 'Resource & Studio Allocator', category: 'Logistics', description: 'Studio facilities, camera crews & talent scheduling', icon: HardHat },
  { id: 'tool-synd', tabId: 'syndication', title: 'Streaming & VOD Syndication', category: 'Distribution', description: 'RTMP destinations, FAST feeds & VOD publishing', icon: Share2 },
  { id: 'tool-setup', tabId: 'setup', title: 'Channel Setup & Credentials', category: 'System', description: 'SCTE-35 parameters, storage configuration & API keys', icon: Settings },
  { id: 'tool-export', tabId: 'export', title: 'Native Apps & Desktop Hub', category: 'Deployment', description: 'Electron desktop runtime, PWA and mobile companion', icon: Download },
  { id: 'tool-tour', tabId: 'tour', title: 'Interactive Broadcast Tutorial & Academy', category: 'Training', description: 'Step-by-step masterclass on linear playout, audio QC & live transmission', icon: Sparkles },
  { id: 'tool-man', tabId: 'manual', title: 'User Manual & Academy', category: 'Documentation', description: 'Complete operating documentation & workflow guides', icon: BookOpen },
];

const SUGGESTED_SEARCHES = [
  'Tutorial',
  'News 24',
  'Studio A',
  'Commercial',
  '4K Camera',
  'Primetime',
  'Documentary',
  'EBU R128',
  'SCTE-35'
];

export default function GlobalSearchBar({
  assets = [],
  schedules = [],
  resources = [],
  alerts = [],
  setActiveTab,
  onSelectAsset,
  onSelectSchedule,
  onSelectResource,
  onOpenTour,
}: GlobalSearchBarProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Global keyboard shortcut (Cmd+K / Ctrl+K / /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is already typing in an input/textarea (unless pressing Cmd+K)
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      } else if (e.key === '/' && !isInput) {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter Assets
  const filteredAssets = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return assets.filter(a =>
      a.title?.toLowerCase().includes(q) ||
      a.category?.toLowerCase().includes(q) ||
      a.type?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q) ||
      a.genre?.toLowerCase().includes(q) ||
      a.aiCluster?.toLowerCase().includes(q) ||
      a.optimalSlot?.toLowerCase().includes(q) ||
      a.tags?.some(tag => tag.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [assets, query]);

  // Filter Schedule Items
  const filteredSchedules = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return schedules.filter(s =>
      s.title?.toLowerCase().includes(q) ||
      s.channelName?.toLowerCase().includes(q) ||
      s.type?.toLowerCase().includes(q) ||
      s.status?.toLowerCase().includes(q) ||
      s.targetAudience?.toLowerCase().includes(q) ||
      s.aiRationale?.toLowerCase().includes(q) ||
      s.startTime?.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [schedules, query]);

  // Filter Resources
  const filteredResources = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return resources.filter(r =>
      r.name?.toLowerCase().includes(q) ||
      r.type?.toLowerCase().includes(q) ||
      r.status?.toLowerCase().includes(q) ||
      r.allocationDetails?.toLowerCase().includes(q) ||
      r.currentBooking?.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [resources, query]);

  // Filter Workspaces / Tools
  const filteredTools = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return WORKSPACE_TOOLS.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [query]);

  // Filter Alerts
  const filteredAlerts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return alerts.filter(a =>
      a.title?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q) ||
      a.recommendation?.toLowerCase().includes(q) ||
      a.type?.toLowerCase().includes(q)
    ).slice(0, 4);
  }, [alerts, query]);

  // Combined flat list for keyboard navigation
  const flatResults = useMemo(() => {
    const list: Array<{
      type: 'asset' | 'schedule' | 'resource' | 'tool' | 'alert';
      item: any;
    }> = [];

    if (activeCategory === 'all' || activeCategory === 'assets') {
      filteredAssets.forEach(item => list.push({ type: 'asset', item }));
    }
    if (activeCategory === 'all' || activeCategory === 'schedule') {
      filteredSchedules.forEach(item => list.push({ type: 'schedule', item }));
    }
    if (activeCategory === 'all' || activeCategory === 'resources') {
      filteredResources.forEach(item => list.push({ type: 'resource', item }));
    }
    if (activeCategory === 'all' || activeCategory === 'tools') {
      filteredTools.forEach(item => list.push({ type: 'tool', item }));
    }
    if (activeCategory === 'all' || activeCategory === 'alerts') {
      filteredAlerts.forEach(item => list.push({ type: 'alert', item }));
    }

    return list;
  }, [activeCategory, filteredAssets, filteredSchedules, filteredResources, filteredTools, filteredAlerts]);

  const totalResultsCount = filteredAssets.length + filteredSchedules.length + filteredResources.length + filteredTools.length + filteredAlerts.length;

  // Handle keyboard navigation inside search results
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < flatResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : flatResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatResults[selectedIndex]) {
        handleSelectResult(flatResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSelectResult = (result: { type: string; item: any }) => {
    setIsOpen(false);
    if (result.type === 'asset') {
      setActiveTab('mam');
      if (onSelectAsset) onSelectAsset(result.item);
      window.dispatchEvent(new CustomEvent('global-search-select-asset', { detail: result.item }));
    } else if (result.type === 'schedule') {
      setActiveTab('scheduler');
      if (onSelectSchedule) onSelectSchedule(result.item);
      window.dispatchEvent(new CustomEvent('global-search-select-schedule', { detail: result.item }));
    } else if (result.type === 'resource') {
      setActiveTab('resources');
      if (onSelectResource) onSelectResource(result.item);
      window.dispatchEvent(new CustomEvent('global-search-select-resource', { detail: result.item }));
    } else if (result.type === 'tool') {
      if (result.item.tabId === 'tour' && onOpenTour) {
        onOpenTour();
      } else {
        setActiveTab(result.item.tabId);
      }
    } else if (result.type === 'alert') {
      setActiveTab('scheduler');
    }
  };

  return (
    <div className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl" ref={containerRef}>
      {/* Search Input Bar */}
      <div
        className={`flex items-center gap-2 rounded-xl bg-slate-900/90 border px-3 py-1.5 transition-all duration-200 shadow-inner ${
          isOpen
            ? 'border-sky-500/80 ring-2 ring-sky-500/20 bg-slate-900 shadow-lg shadow-sky-950/40'
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <Search className={`h-4 w-4 shrink-0 transition-colors ${isOpen ? 'text-sky-400' : 'text-slate-400'}`} />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(0);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Quick search assets, schedule blocks, resources..."
          className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none font-medium"
          id="global-search-input"
        />

        {query ? (
          <button
            onClick={() => {
              setQuery('');
              setSelectedIndex(0);
              inputRef.current?.focus();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Clear search query"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <div className="flex items-center gap-1 shrink-0">
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-slate-700 bg-slate-800/80 px-1.5 py-0.5 font-mono text-[10px] text-slate-400 shadow-sm">
              <Command className="h-2.5 w-2.5" />
              <span>K</span>
            </kbd>
          </div>
        )}
      </div>

      {/* Global Search Results Flyout Palette */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-slate-950/98 border border-slate-800 shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-fadeIn">
          {/* Filter Pills Bar */}
          <div className="flex items-center gap-1.5 p-2.5 border-b border-slate-800/80 bg-slate-900/60 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All', count: totalResultsCount },
              { id: 'assets', label: 'Assets', count: filteredAssets.length },
              { id: 'schedule', label: 'Schedule', count: filteredSchedules.length },
              { id: 'resources', label: 'Resources', count: filteredResources.length },
              { id: 'tools', label: 'Workspaces', count: filteredTools.length },
              { id: 'alerts', label: 'Alerts', count: filteredAlerts.length },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id as SearchCategory);
                  setSelectedIndex(0);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-sky-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{cat.label}</span>
                {query.trim() && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      activeCategory === cat.id ? 'bg-slate-950/30 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Results Container */}
          <div ref={listRef} className="max-h-[65vh] overflow-y-auto p-2 space-y-3 divide-y divide-slate-800/50">
            {/* Empty State / Suggestions */}
            {!query.trim() && (
              <div className="py-4 px-3 space-y-3">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <span>Suggested Quick Searches</span>
                  <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_SEARCHES.map(item => (
                    <button
                      key={item}
                      onClick={() => {
                        setQuery(item);
                        inputRef.current?.focus();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-sky-300 transition flex items-center gap-1.5"
                    >
                      <Search className="h-3 w-3 text-slate-500" />
                      <span>{item}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800/60">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Quick Studio Workspaces
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {WORKSPACE_TOOLS.slice(0, 6).map(tool => {
                      const IconComp = tool.icon;
                      return (
                        <button
                          key={tool.id}
                          onClick={() => {
                            setActiveTab(tool.tabId);
                            setIsOpen(false);
                          }}
                          className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-900/40 hover:bg-slate-800/80 border border-slate-800/60 hover:border-sky-500/40 text-left transition group"
                        >
                          <div className="p-1.5 rounded-lg bg-slate-800 text-sky-400 group-hover:bg-sky-500/10 transition">
                            <IconComp className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                              {tool.title}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">{tool.category}</div>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-sky-400 transition" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* No Results state */}
            {query.trim() && flatResults.length === 0 && (
              <div className="py-8 text-center space-y-2">
                <Search className="h-8 w-8 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No matching results found</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  No assets, schedule blocks, or resources match "<span className="text-sky-400">{query}</span>"
                </p>
              </div>
            )}

            {/* Section: Assets (MAM) */}
            {(activeCategory === 'all' || activeCategory === 'assets') && filteredAssets.length > 0 && (
              <div className="pt-2">
                <div className="flex items-center justify-between px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Film className="h-3 w-3" /> Media Library Assets ({filteredAssets.length})
                  </span>
                  <span className="text-[9px] text-slate-500 font-normal">MAM Catalog</span>
                </div>
                <div className="space-y-1 mt-1">
                  {filteredAssets.map(asset => {
                    const isSelected = flatResults[selectedIndex]?.item?.id === asset.id;
                    return (
                      <div
                        key={asset.id}
                        onClick={() => handleSelectResult({ type: 'asset', item: asset })}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition ${
                          isSelected
                            ? 'bg-sky-500/15 border border-sky-500/40 text-white'
                            : 'hover:bg-slate-900 border border-transparent text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-950 text-sky-400 border border-sky-800/60 shrink-0">
                            <Film className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-semibold text-slate-100 truncate">{asset.title}</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-sky-300 border border-slate-700">
                                {asset.type.toUpperCase()}
                              </span>
                              {asset.isQCed ? (
                                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                                  QC PASS
                                </span>
                              ) : (
                                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800">
                                  QC PENDING
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-slate-500" /> {asset.duration}m
                              </span>
                              <span>•</span>
                              <span>{asset.category}</span>
                              {asset.optimalSlot && (
                                <>
                                  <span>•</span>
                                  <span className="text-amber-400/90">{asset.optimalSlot}</span>
                                </>
                              )}
                              {asset.tags && asset.tags.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-slate-500 truncate max-w-[120px]">
                                    #{asset.tags.slice(0, 2).join(' #')}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">{asset.loudnessDb} LUFS</span>
                          <button className="p-1 rounded bg-slate-800/80 hover:bg-sky-500 hover:text-slate-950 text-slate-400 transition text-[10px] flex items-center gap-1 px-2 py-1 font-semibold">
                            <span>Open MAM</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section: Schedule Blocks */}
            {(activeCategory === 'all' || activeCategory === 'schedule') && filteredSchedules.length > 0 && (
              <div className="pt-2">
                <div className="flex items-center justify-between px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" /> Schedule Blocks ({filteredSchedules.length})
                  </span>
                  <span className="text-[9px] text-slate-500 font-normal">Grid Lineup</span>
                </div>
                <div className="space-y-1 mt-1">
                  {filteredSchedules.map(sched => {
                    const isSelected = flatResults[selectedIndex]?.item?.id === sched.id;
                    return (
                      <div
                        key={sched.id}
                        onClick={() => handleSelectResult({ type: 'schedule', item: sched })}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition ${
                          isSelected
                            ? 'bg-emerald-500/15 border border-emerald-500/40 text-white'
                            : 'hover:bg-slate-900 border border-transparent text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/60 shrink-0">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-semibold text-slate-100 truncate">{sched.title}</span>
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                                  sched.status === 'playing'
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                                    : sched.status === 'queued'
                                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}
                              >
                                {sched.status.toUpperCase()}
                              </span>
                              <span className="text-[9px] font-mono text-slate-400 bg-slate-900 px-1 py-0.2 rounded border border-slate-800">
                                {sched.channelName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span className="font-mono text-emerald-400">{sched.startTime}</span>
                              <span>•</span>
                              <span>{sched.duration} min</span>
                              {sched.targetAudience && (
                                <>
                                  <span>•</span>
                                  <span className="text-slate-400 truncate max-w-[140px]">{sched.targetAudience}</span>
                                </>
                              )}
                              {sched.demandScore > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-amber-400 font-mono">Score: {sched.demandScore}%</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <button className="p-1 rounded bg-slate-800/80 hover:bg-emerald-500 hover:text-slate-950 text-slate-400 transition text-[10px] flex items-center gap-1 px-2 py-1 font-semibold shrink-0">
                          <span>View Grid</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section: Studio Resources */}
            {(activeCategory === 'all' || activeCategory === 'resources') && filteredResources.length > 0 && (
              <div className="pt-2">
                <div className="flex items-center justify-between px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <HardHat className="h-3 w-3" /> Studio Resources & Facilities ({filteredResources.length})
                  </span>
                  <span className="text-[9px] text-slate-500 font-normal">Allocations</span>
                </div>
                <div className="space-y-1 mt-1">
                  {filteredResources.map(res => {
                    const isSelected = flatResults[selectedIndex]?.item?.id === res.id;
                    return (
                      <div
                        key={res.id}
                        onClick={() => handleSelectResult({ type: 'resource', item: res })}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition ${
                          isSelected
                            ? 'bg-purple-500/15 border border-purple-500/40 text-white'
                            : 'hover:bg-slate-900 border border-transparent text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-950 text-purple-400 border border-purple-800/60 shrink-0">
                            <HardHat className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-semibold text-slate-100 truncate">{res.name}</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-purple-300 border border-slate-700">
                                {res.type.toUpperCase()}
                              </span>
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                                  res.status === 'active'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : res.status === 'booked'
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                {res.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                              <span className="truncate max-w-[200px]">{res.allocationDetails}</span>
                              {res.currentBooking && (
                                <>
                                  <span>•</span>
                                  <span className="text-purple-300 truncate max-w-[140px]">
                                    Booked: {res.currentBooking}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <button className="p-1 rounded bg-slate-800/80 hover:bg-purple-500 hover:text-slate-950 text-slate-400 transition text-[10px] flex items-center gap-1 px-2 py-1 font-semibold shrink-0">
                          <span>Allocator</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section: Workspaces / Tools */}
            {(activeCategory === 'all' || activeCategory === 'tools') && filteredTools.length > 0 && (
              <div className="pt-2">
                <div className="flex items-center justify-between px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Sliders className="h-3 w-3" /> Studio Workspaces ({filteredTools.length})
                  </span>
                  <span className="text-[9px] text-slate-500 font-normal">Navigation</span>
                </div>
                <div className="space-y-1 mt-1">
                  {filteredTools.map(tool => {
                    const isSelected = flatResults[selectedIndex]?.item?.id === tool.id;
                    const IconComp = tool.icon;
                    return (
                      <div
                        key={tool.id}
                        onClick={() => handleSelectResult({ type: 'tool', item: tool })}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition ${
                          isSelected
                            ? 'bg-amber-500/15 border border-amber-500/40 text-white'
                            : 'hover:bg-slate-900 border border-transparent text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-950 text-amber-400 border border-amber-800/60 shrink-0">
                            <IconComp className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-slate-100 truncate">{tool.title}</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 border border-slate-700">
                                {tool.category}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{tool.description}</p>
                          </div>
                        </div>
                        <button className="p-1 rounded bg-slate-800/80 hover:bg-amber-500 hover:text-slate-950 text-slate-400 transition text-[10px] flex items-center gap-1 px-2 py-1 font-semibold shrink-0">
                          <span>Jump Tab</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section: Alerts & Conflicts */}
            {(activeCategory === 'all' || activeCategory === 'alerts') && filteredAlerts.length > 0 && (
              <div className="pt-2">
                <div className="flex items-center justify-between px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3 w-3" /> Broadcast Safety Alerts ({filteredAlerts.length})
                  </span>
                  <span className="text-[9px] text-slate-500 font-normal">Diagnostic</span>
                </div>
                <div className="space-y-1 mt-1">
                  {filteredAlerts.map(alert => {
                    const isSelected = flatResults[selectedIndex]?.item?.id === alert.id;
                    return (
                      <div
                        key={alert.id}
                        onClick={() => handleSelectResult({ type: 'alert', item: alert })}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition ${
                          isSelected
                            ? 'bg-rose-500/15 border border-rose-500/40 text-white'
                            : 'hover:bg-slate-900 border border-transparent text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-950 text-rose-400 border border-rose-800/60 shrink-0">
                            <AlertTriangle className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-slate-100 truncate">{alert.title}</span>
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                                  alert.severity === 'high'
                                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                }`}
                              >
                                {alert.severity.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{alert.description}</p>
                          </div>
                        </div>
                        <button className="p-1 rounded bg-slate-800/80 hover:bg-rose-500 hover:text-slate-950 text-slate-400 transition text-[10px] flex items-center gap-1 px-2 py-1 font-semibold shrink-0">
                          <span>Inspect</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Shortcuts Navigation Bar */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-slate-800 bg-slate-900/80 text-[10px] text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[9px]">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[9px]">↓</kbd>
                <span>to navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[9px] flex items-center">
                  <CornerDownLeft className="h-2.5 w-2.5" />
                </kbd>
                <span>to select</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[9px]">esc</kbd>
                <span>to close</span>
              </span>
            </div>
            {query.trim() && (
              <span className="font-mono text-slate-500 text-[10px]">
                {totalResultsCount} match{totalResultsCount === 1 ? '' : 'es'} found
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
