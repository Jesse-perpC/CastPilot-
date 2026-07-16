import React, { useState } from 'react';
import { Calendar, Cpu, Sparkles, Plus, RefreshCw, Layers, Clock, AlertTriangle, Users, Trash2, ShieldAlert } from 'lucide-react';
import { ScheduleItem, ContentAsset } from '../types';

interface ScheduleManagerProps {
  schedules: ScheduleItem[];
  assets: ContentAsset[];
  channelName: string;
  setChannelName: (name: string) => void;
  onGenerateAI: (customPrompt: string, blocks: number) => Promise<void>;
  loadingAI: boolean;
  onManualAdd: (newItem: Omit<ScheduleItem, 'id' | 'status'>) => void;
  onDeleteScheduleItem: (id: string) => void;
  onFillGaps: () => void;
  schedulingMode?: 'auto' | 'manual';
  setSchedulingMode?: (mode: 'auto' | 'manual') => void;
  addToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function ScheduleManager({
  schedules,
  assets,
  channelName,
  setChannelName,
  onGenerateAI,
  loadingAI,
  onManualAdd,
  onDeleteScheduleItem,
  onFillGaps,
  schedulingMode = 'auto',
  setSchedulingMode,
  addToast
}: ScheduleManagerProps) {
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [blocks, setBlocks] = useState<number>(6);
  const [showManualForm, setShowManualForm] = useState<boolean>(false);

  // Manual Form States
  const [manualTitle, setManualTitle] = useState<string>('');
  const [manualType, setManualType] = useState<'program' | 'commercial' | 'promo' | 'filler'>('program');
  const [manualTime, setManualTime] = useState<string>('12:00 PM');
  const [manualDuration, setManualDuration] = useState<number>(30);
  const [manualAudience, setManualAudience] = useState<string>('General Audience');

  const filteredSchedules = schedules.filter((s) => s.channelName === channelName);

  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle) return;

    onManualAdd({
      channelName,
      startTime: manualTime,
      title: manualTitle,
      type: manualType,
      duration: Number(manualDuration),
      demandScore: 80,
      targetAudience: manualAudience,
      aiRationale: "Manually scheduled by broadcast operator."
    });

    if (setSchedulingMode) {
      setSchedulingMode('manual');
    }

    // Reset Form
    setManualTitle('');
    setShowManualForm(false);
  };

  const handleAiClick = async () => {
    if (setSchedulingMode) {
      setSchedulingMode('auto');
    }
    await onGenerateAI(customPrompt, blocks);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Left controls sidebar (4 Cols) */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Channel Selector */}
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-5 shadow-lg">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Active Broadcast Feed
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['FAST Entertainment', 'Linear Primetime'].map((name) => (
              <button
                key={name}
                onClick={() => setChannelName(name)}
                className={`py-2 px-3 rounded-lg text-xs font-semibold tracking-wide border transition-all ${
                  channelName === name
                    ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-300'
                }`}
              >
                {name === 'FAST Entertainment' ? '📺 FAST Ent' : '🛰️ Linear Prime'}
              </button>
            ))}
          </div>
        </div>

        {/* Synced Scheduling Mode Preference Selector */}
        {setSchedulingMode && (
          <div className="rounded-xl bg-slate-950 border border-slate-800 p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className={`h-4.5 w-4.5 ${schedulingMode === 'auto' ? 'text-sky-400' : 'text-amber-400'}`} />
              <h3 className="font-display text-sm font-semibold text-white">Lineup Scheduling Mode</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Configure how your TV channel lineup is timed and sequenced. Opt for AI automation or manage every block yourself.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setSchedulingMode('auto');
                  if (addToast) addToast("Switched to Auto AI Lineup Scheduling", "success");
                }}
                className={`p-3 rounded-lg text-left border transition-all flex flex-col gap-1.5 ${
                  schedulingMode === 'auto'
                    ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                    : 'bg-slate-900/60 text-slate-400 border-slate-850 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                  <span className="text-[11px] font-bold tracking-wide">Auto AI</span>
                </div>
                <span className="text-[9px] text-slate-400 leading-normal">Gemini auto-schedules playout and ad breaks.</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSchedulingMode('manual');
                  if (addToast) addToast("Switched to Manual Broadcast Scheduling", "success");
                }}
                className={`p-3 rounded-lg text-left border transition-all flex flex-col gap-1.5 ${
                  schedulingMode === 'manual'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-slate-900/60 text-slate-400 border-slate-850 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-[11px] font-bold tracking-wide">Manual</span>
                </div>
                <span className="text-[9px] text-slate-400 leading-normal">Manually allocate, time, and order every block.</span>
              </button>
            </div>
          </div>
        )}

        {/* AI Generator Controls */}
        <div className={`rounded-xl bg-slate-950 border p-5 shadow-lg transition-all duration-300 ${
          schedulingMode === 'auto'
            ? 'border-sky-500/30 shadow-sky-500/5'
            : 'border-slate-800 opacity-75'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Cpu className={`h-4.5 w-4.5 ${schedulingMode === 'auto' ? 'text-sky-400' : 'text-slate-400'}`} />
              <h3 className="font-display text-sm font-semibold text-white">CastPilot AI Scheduler</h3>
            </div>
            {schedulingMode === 'auto' ? (
              <span className="bg-sky-500/25 border border-sky-400/30 rounded px-1.5 py-0.5 text-[8px] font-bold tracking-wide text-sky-400 uppercase">
                ACTIVE
              </span>
            ) : (
              <span className="bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-[8px] font-semibold text-slate-500 uppercase">
                PAUSED
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Harness Gemini AI's reasoning capabilities to assemble a conflict-free, highly engaging, monetized block of programming and ad breaks.
          </p>

          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 font-medium mb-1">AI Prompt / Target Objective</label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. Create a balanced evening nature lineup with commercials. Prioritize EcoQuest."
                className="w-full h-20 bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 font-medium mb-1">Lineup Sequence Length</label>
              <select
                value={blocks}
                onChange={(e) => setBlocks(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value={4}>4 Blocks (~2 Hours)</option>
                <option value={6}>6 Blocks (~3 Hours)</option>
                <option value={8}>8 Blocks (~4 Hours)</option>
              </select>
            </div>

            <button
              onClick={handleAiClick}
              disabled={loadingAI}
              className={`w-full py-2.5 rounded-lg font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all ${
                loadingAI
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg hover:shadow-sky-500/10 border border-sky-400/20'
              }`}
              id="ai-generate-schedule-btn"
            >
              {loadingAI ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Analyzing Content Pool...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Auto-Generate AI Schedule
                </>
              )}
            </button>
            {schedulingMode === 'manual' && (
              <p className="text-[10px] text-amber-400 leading-normal italic text-center mt-1">
                Note: Generating via AI switches mode to Auto-AI.
              </p>
            )}
          </div>
        </div>

        {/* Quick Operations */}
        <div className={`rounded-xl bg-slate-950 border p-5 shadow-lg flex flex-col gap-2 transition-all duration-300 ${
          schedulingMode === 'manual'
            ? 'border-amber-500/30 shadow-amber-500/5'
            : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Bulk Utilities</h4>
            {schedulingMode === 'manual' && (
              <span className="bg-amber-500/20 border border-amber-400/30 rounded px-1.5 py-0.5 text-[8px] font-bold tracking-wide text-amber-400 uppercase">
                OPERATOR ACTIVE
              </span>
            )}
          </div>
          <button
            onClick={onFillGaps}
            className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-800 transition text-left px-3 flex items-center justify-between"
          >
            <span>Fill Schedule Gaps with Promos</span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">AI Quick Fill</span>
          </button>
          <button
            onClick={() => setShowManualForm(!showManualForm)}
            className={`w-full py-2 rounded-lg font-semibold text-xs transition text-left px-3 flex items-center justify-between ${
              showManualForm
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <span>Manual Block Scheduler</span>
            <Plus className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Main Schedule Listing (8 Cols) */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Manual Addition Form modal-like overlay (in-line) */}
        {showManualForm && (
          <form onSubmit={handleSubmitManual} className="rounded-xl bg-slate-950 border-2 border-sky-500/30 p-5 shadow-xl animate-fadeIn">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-sky-400" />
              Manual Schedule Block Allocation
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 mb-4">
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1">Asset Reference Title</label>
                <input
                  type="text"
                  required
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="e.g. Late Night Retro Hour"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1">Block Type</label>
                <select
                  value={manualType}
                  onChange={(e) => setManualType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="program">Program Feature</option>
                  <option value="commercial">Commercial Spot</option>
                  <option value="promo">Promo / Segment Teaser</option>
                  <option value="filler">Filler Interstitial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1">Target Air Time</label>
                <input
                  type="text"
                  required
                  value={manualTime}
                  onChange={(e) => setManualTime(e.target.value)}
                  placeholder="e.g. 10:30 PM"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  required
                  value={manualDuration}
                  onChange={(e) => setManualDuration(Number(e.target.value))}
                  placeholder="30"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowManualForm(false)}
                className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-400 border border-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-xs font-semibold text-white shadow-md shadow-sky-500/10 transition"
                id="submit-manual-schedule-btn"
              >
                Confirm Allocation
              </button>
            </div>
          </form>
        )}

        {/* Schedule Listing View */}
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-6 shadow-lg flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-base font-bold text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-sky-400" />
                Lineup Sequence Matrix
              </h2>
              <p className="text-xs text-slate-400">Chronological playout blocks on {channelName}</p>
            </div>
            <span className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-[10px] font-mono text-slate-400 uppercase">
              {filteredSchedules.length} Items Scheduled
            </span>
          </div>

          {loadingAI ? (
            /* AI Generation loading state / skeletons */
            <div className="space-y-4 animate-pulse">
              <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-16 bg-slate-800 rounded"></div>
                  <div className="space-y-1">
                    <div className="h-4 w-48 bg-slate-800 rounded"></div>
                    <div className="h-3 w-32 bg-slate-800 rounded"></div>
                  </div>
                </div>
                <div className="h-5 w-24 bg-slate-800 rounded"></div>
              </div>
              <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-16 bg-slate-800 rounded"></div>
                  <div className="space-y-1">
                    <div className="h-4 w-36 bg-slate-800 rounded"></div>
                    <div className="h-3 w-24 bg-slate-800 rounded"></div>
                  </div>
                </div>
                <div className="h-5 w-24 bg-slate-800 rounded"></div>
              </div>
              <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-16 bg-slate-800 rounded"></div>
                  <div className="space-y-1">
                    <div className="h-4 w-56 bg-slate-800 rounded"></div>
                    <div className="h-3 w-40 bg-slate-800 rounded"></div>
                  </div>
                </div>
                <div className="h-5 w-24 bg-slate-800 rounded"></div>
              </div>
              <div className="text-center py-6 text-slate-500 text-xs flex flex-col items-center gap-2">
                <Sparkles className="h-5 w-5 text-sky-400 animate-bounce" />
                <span>Gemini API analyzing content pool demands, ad yields, and regulatory rules...</span>
              </div>
            </div>
          ) : filteredSchedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Calendar className="h-10 w-10 text-slate-700 mb-3" />
              <h4 className="text-sm font-semibold text-slate-300">No Content Scheduled</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                This feed's sequence matrix is empty. Utilize CastPilot AI to auto-generate a schedule instantly.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSchedules.map((item, index) => {
                // Color mapping for type badge
                const typeColors = {
                  program: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
                  commercial: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                  promo: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                  filler: 'bg-slate-800 text-slate-400 border-slate-700'
                };

                return (
                  <div
                    key={item.id}
                    className={`group relative rounded-xl border p-4 transition-all hover:bg-slate-900/60 flex flex-col md:flex-row md:items-start md:justify-between gap-4 ${
                      item.status === 'playing'
                        ? 'bg-slate-900 border-sky-500/40 glowing-border'
                        : 'bg-slate-950/40 border-slate-850'
                    }`}
                  >
                    {/* Time & Title info block */}
                    <div className="flex items-start gap-3.5">
                      {/* Left time block */}
                      <div className="flex flex-col items-center justify-center font-mono text-[10px] font-bold text-slate-400 bg-slate-900 rounded-lg border border-slate-800 py-1.5 px-2.5 min-w-[70px] text-center">
                        <Clock className="h-3 w-3 mb-1 text-slate-500" />
                        {item.startTime}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-white tracking-wide">{item.title}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase border ${typeColors[item.type]}`}>
                            {item.type}
                          </span>
                          {item.status === 'playing' && (
                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded px-1.5 py-0.5 text-[8px] font-bold tracking-widest uppercase animate-pulse">
                              ON-AIR
                            </span>
                          )}
                        </div>

                        {/* Audience and metadata tags */}
                        <div className="flex items-center gap-4 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-slate-500" />
                            Audience: <strong className="text-slate-300">{item.targetAudience}</strong>
                          </span>
                          <span>•</span>
                          <span>Duration: <strong className="text-slate-300">{item.duration}m</strong></span>
                          <span>•</span>
                          <span>Demand Score: <strong className="text-sky-400">{item.demandScore}%</strong></span>
                        </div>

                        {/* AI Rationale dropdown indicator */}
                        {item.aiRationale && (
                          <p className="text-[10px] text-slate-500 italic leading-relaxed mt-1.5 pt-1.5 border-t border-slate-900">
                            <strong>AI:</strong> {item.aiRationale}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Delete action button */}
                    <div className="flex items-center justify-end self-end md:self-start opacity-60 group-hover:opacity-100 transition">
                      <button
                        onClick={() => onDeleteScheduleItem(item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                        title="Delete scheduling block"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
