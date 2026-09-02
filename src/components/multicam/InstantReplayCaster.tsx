import React, { useState, useEffect } from 'react';
import {
  Film,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Rewind,
  Scissors,
  Bookmark,
  Sparkles,
  Tv,
  Check,
  Zap,
  Radio,
  Clock,
  Tag,
  Trash2,
  Share2,
  Sliders,
  Volume2
} from 'lucide-react';
import { VideoFeed } from '../MultiCamNdiIngestion';
import { ReplayClip } from './types';

interface InstantReplayCasterProps {
  feeds: VideoFeed[];
  onToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const DEFAULT_CLIPS: ReplayClip[] = [
  {
    id: 'clip-1',
    title: 'Lead Anchor Opening Commentary',
    camId: 'feed-1',
    camName: 'CAM 1 • Main Anchor Desk',
    inTimestamp: 35,
    outTimestamp: 48,
    durationSec: 13.0,
    speed: 1.0,
    tag: 'HIGHLIGHT',
    createdAt: '12:04:15',
    thumbnailUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80'
  },
  {
    id: 'clip-2',
    title: 'Breaking Guest Reaction to Poll Data',
    camId: 'feed-4',
    camName: 'CAM 4 • Remote Guest WebRTC',
    inTimestamp: 20,
    outTimestamp: 29,
    durationSec: 9.0,
    speed: 0.5,
    tag: 'REACTION',
    createdAt: '12:06:40',
    thumbnailUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&q=80'
  },
  {
    id: 'clip-3',
    title: 'Stage Jib Studio Pan & Screen Reveal',
    camId: 'feed-5',
    camName: 'CAM 5 • Jib Overhead Crane',
    inTimestamp: 12,
    outTimestamp: 24,
    durationSec: 12.0,
    speed: 0.75,
    tag: 'HIGHLIGHT',
    createdAt: '12:08:10',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80'
  }
];

export default function InstantReplayCaster({ feeds, onToast }: InstantReplayCasterProps) {
  const [selectedFeedId, setSelectedFeedId] = useState<string>(feeds[0]?.id || 'feed-1');
  const [bufferSec, setBufferSec] = useState<number>(60); // 60s ring buffer
  const [playheadPos, setPlayheadPos] = useState<number>(54); // seconds into buffer
  const [inPoint, setInPoint] = useState<number | null>(42);
  const [outPoint, setOutPoint] = useState<number | null>(56);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.5); // 50% slow-mo default
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isCastingToPgm, setIsCastingToPgm] = useState<boolean>(false);
  const [stingerActive, setStingerActive] = useState<boolean>(false);

  const [clips, setClips] = useState<ReplayClip[]>(DEFAULT_CLIPS);
  const [newClipTitle, setNewClipTitle] = useState<string>('');
  const [newClipTag, setNewClipTag] = useState<ReplayClip['tag']>('HIGHLIGHT');

  const activeFeed = feeds.find(f => f.id === selectedFeedId) || feeds[0];

  // Playhead scrubber loop
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlayheadPos(prev => {
          const step = (0.2 * playbackSpeed);
          const next = prev + step;
          if (outPoint !== null && next >= outPoint) {
            return inPoint !== null ? inPoint : 0;
          }
          if (next >= bufferSec) return 0;
          if (next < 0) return bufferSec;
          return +next.toFixed(1);
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, inPoint, outPoint, bufferSec]);

  // Mark In
  const handleMarkIn = () => {
    setInPoint(playheadPos);
    onToast(`Marked REPLAY IN at ${playheadPos.toFixed(1)}s`, 'info');
  };

  // Mark Out
  const handleMarkOut = () => {
    if (inPoint !== null && playheadPos <= inPoint) {
      onToast('OUT point must be greater than IN point.', 'error');
      return;
    }
    setOutPoint(playheadPos);
    onToast(`Marked REPLAY OUT at ${playheadPos.toFixed(1)}s`, 'info');
  };

  // Quick cue: Last 5s, 10s, 15s
  const handleQuickCue = (secondsAgo: number) => {
    const end = 60;
    const start = Math.max(0, end - secondsAgo);
    setInPoint(start);
    setOutPoint(end);
    setPlayheadPos(start);
    setIsPlaying(true);
    onToast(`Cued last ${secondsAgo}s instant replay loop!`, 'success');
  };

  // Save clip to vault
  const handleSaveClip = () => {
    const start = inPoint ?? Math.max(0, playheadPos - 10);
    const end = outPoint ?? playheadPos;
    const duration = +(end - start).toFixed(1);

    const newClip: ReplayClip = {
      id: `clip-${Date.now()}`,
      title: newClipTitle.trim() || `${activeFeed.name} Highlight (${duration}s)`,
      camId: activeFeed.id,
      camName: activeFeed.name,
      inTimestamp: start,
      outTimestamp: end,
      durationSec: Math.max(1, duration),
      speed: playbackSpeed,
      tag: newClipTag,
      createdAt: new Date().toLocaleTimeString(),
      thumbnailUrl: activeFeed.avatarUrl
    };

    setClips(prev => [newClip, ...prev]);
    setNewClipTitle('');
    onToast(`Saved replay clip "${newClip.title}" to Replay Vault!`, 'success');
  };

  // Cast Replay to Live PGM with Stinger Wipe
  const handleCastToPgm = (clip?: ReplayClip) => {
    setStingerActive(true);
    setIsCastingToPgm(true);
    onToast('★ STINGER WIPE TRIGGERED: Replay Live on PGM Broadcast!', 'success');

    setTimeout(() => {
      setStingerActive(false);
    }, 900);

    // Auto return after clip duration
    const dur = clip ? clip.durationSec * 1000 : 8000;
    setTimeout(() => {
      setIsCastingToPgm(false);
      onToast('Replay concluded. Returned PGM to Live Master Camera.', 'info');
    }, dur);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono text-xs font-bold uppercase tracking-wider">
                <Film className="h-3.5 w-3.5 text-rose-400" />
                60S ISO ROLLING DVR & SLOW-MOTION REPLAY CASTER
              </span>
              <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono text-[10px]">
                ZERO-FRAME LATENCY STAGING
              </span>
            </div>
            <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
              Instant Replay & Slow-Motion Clip Caster
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl">
              Continuous 60-second multi-angle ring buffer capture. Mark in/out cue points, trigger broadcast slow-motion speeds (100%, 75%, 50%, 25%, -50%), and push replays live to air with stinger wipes.
            </p>
          </div>

          {/* Quick Cast Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleCastToPgm()}
              disabled={isCastingToPgm}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-lg ${
                isCastingToPgm
                  ? 'bg-red-600 text-white animate-pulse shadow-red-500/40 cursor-wait'
                  : 'bg-rose-500 hover:bg-rose-400 text-slate-950 shadow-rose-500/20'
              }`}
            >
              <Zap className="h-4 w-4" />
              <span>{isCastingToPgm ? 'REPLAY LIVE ON PGM' : 'TAKE REPLAY TO PGM (STINGER)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Camera ISO Selection Strip */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {feeds.map((feed) => {
          const isSelected = feed.id === selectedFeedId;
          return (
            <button
              key={feed.id}
              onClick={() => setSelectedFeedId(feed.id)}
              className={`px-3.5 py-2.5 rounded-xl border text-left transition shrink-0 flex items-center gap-3 min-w-[170px] ${
                isSelected
                  ? 'bg-rose-500/15 border-rose-500 text-white shadow-lg shadow-rose-500/10'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="relative">
                <img
                  src={feed.avatarUrl}
                  alt={feed.name}
                  className="h-9 w-9 rounded-lg object-cover border border-slate-700"
                />
                <span className="absolute -top-1 -right-1 px-1 rounded text-[8px] font-mono font-bold bg-rose-600 text-white">
                  ISO
                </span>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate text-white">{feed.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">60s Ring Buffer</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Replay Surface: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Video Scrubber & Playback Deck (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl group">
            <img
              src={activeFeed.avatarUrl}
              alt={activeFeed.name}
              className="w-full h-full object-cover"
            />

            {/* Stinger Wipe Animation Overlay */}
            {stingerActive && (
              <div className="absolute inset-0 z-50 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 animate-pulse flex items-center justify-center">
                <div className="text-white font-extrabold font-display text-2xl tracking-widest uppercase drop-shadow-2xl">
                  ⚡ FAST BROADCAST REPLAY ⚡
                </div>
              </div>
            )}

            {/* Live Replay Watermark Bug */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase shadow-xl flex items-center gap-1.5 ${
                isCastingToPgm ? 'bg-red-600 text-white animate-pulse border border-red-400' : 'bg-rose-950/80 text-rose-300 border border-rose-500/40 backdrop-blur'
              }`}>
                <Film className="h-3 w-3" />
                {isCastingToPgm ? 'PGM ON-AIR REPLAY' : 'REPLAY CUE BUS'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-900/90 text-white text-xs font-mono border border-slate-700">
                {playbackSpeed * 100}% SPEED
              </span>
            </div>

            {/* Current Buffer Time Code */}
            <div className="absolute top-3 right-3 font-mono text-xs text-white bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-800">
              <span className="text-rose-400 font-bold">TC:</span> 00:00:{(playheadPos < 10 ? '0' : '') + playheadPos.toFixed(1)} / 00:01:00.0
            </div>

            {/* In / Out Visual Tags */}
            <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none">
              <span className="bg-slate-950/90 border border-emerald-500 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                IN: {inPoint !== null ? `${inPoint.toFixed(1)}s` : 'NOT SET'}
              </span>
              <span className="bg-slate-950/90 border border-rose-500 text-rose-300 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                OUT: {outPoint !== null ? `${outPoint.toFixed(1)}s` : 'NOT SET'}
              </span>
            </div>
          </div>

          {/* Scrubber & Timeline Bar */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">ISO DVR RING BUFFER (60s HISTORY)</span>
              <span className="text-rose-400 font-bold">
                CLIP DURATION: {inPoint !== null && outPoint !== null ? `${(outPoint - inPoint).toFixed(1)}s` : '--'}
              </span>
            </div>

            {/* Interactive Timeline Track */}
            <div className="relative w-full h-8 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center">
              {/* In-Out Region Highlight */}
              {inPoint !== null && outPoint !== null && (
                <div
                  className="absolute h-full bg-rose-500/25 border-x-2 border-rose-400"
                  style={{
                    left: `${(inPoint / bufferSec) * 100}%`,
                    width: `${((outPoint - inPoint) / bufferSec) * 100}%`
                  }}
                />
              )}

              {/* Scrubber Input */}
              <input
                type="range"
                min={0}
                max={bufferSec}
                step={0.1}
                value={playheadPos}
                onChange={(e) => setPlayheadPos(Number(e.target.value))}
                className="w-full accent-rose-500 bg-transparent h-full appearance-none cursor-pointer z-10"
              />
            </div>

            {/* Quick Cue Buttons & In/Out Markers */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleMarkIn}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm"
                >
                  <Scissors className="h-3 w-3" />
                  <span>Mark IN</span>
                </button>
                <button
                  onClick={handleMarkOut}
                  className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm"
                >
                  <Scissors className="h-3 w-3" />
                  <span>Mark OUT</span>
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1"
                >
                  {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 fill-current" />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
              </div>

              {/* Quick Cues (Last 5s, 10s, 15s) */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-mono text-slate-500 mr-1 hidden sm:inline">QUICK:</span>
                {[5, 10, 15].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => handleQuickCue(sec)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white font-mono text-xs font-bold transition"
                  >
                    -{sec}s
                  </button>
                ))}
              </div>
            </div>

            {/* Playback Speed Toggles */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs">
              <span className="font-mono text-slate-400">PLAYBACK SPEED:</span>
              <div className="flex items-center gap-1">
                {[
                  { speed: 1.0, label: '100%' },
                  { speed: 0.75, label: '75%' },
                  { speed: 0.5, label: '50% Slow' },
                  { speed: 0.25, label: '25% Super' },
                  { speed: -0.5, label: 'REV -50%' },
                ].map((item) => (
                  <button
                    key={item.speed}
                    onClick={() => setPlaybackSpeed(item.speed)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition ${
                      playbackSpeed === item.speed
                        ? 'bg-rose-500 text-slate-950 font-extrabold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Replay Clips Vault & Staging (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Clip Staging & Save */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-rose-400" />
                <h4 className="text-sm font-bold text-white">Stage & Save Highlight Clip</h4>
              </div>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="Clip title (e.g., Critical Debate Rebuttal, Big Play)..."
                value={newClipTitle}
                onChange={(e) => setNewClipTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />

              <div className="flex items-center justify-between gap-2">
                <select
                  value={newClipTag}
                  onChange={(e) => setNewClipTag(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 font-mono focus:outline-none"
                >
                  <option value="HIGHLIGHT">HIGHLIGHT</option>
                  <option value="REACTION">REACTION</option>
                  <option value="CONTROVERSY">CONTROVERSY</option>
                  <option value="BREAKAWAY">BREAKAWAY</option>
                  <option value="GOAL">GOAL</option>
                </select>

                <button
                  onClick={handleSaveClip}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  <span>Save to Vault</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stored Replay Clips Vault */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4 text-sky-400" />
                <h4 className="text-sm font-bold text-white">Replay Vault ({clips.length} Clips)</h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400">1-Click Air Playout</span>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {clips.map((clip) => (
                <div
                  key={clip.id}
                  className="rounded-xl bg-slate-950 border border-slate-800 p-3 hover:border-rose-500/50 transition-all flex items-center justify-between gap-3 shadow-md"
                >
                  <img
                    src={clip.thumbnailUrl}
                    alt={clip.title}
                    className="h-12 w-16 rounded-lg object-cover border border-slate-700 shrink-0"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-rose-500/20 text-rose-300">
                        {clip.tag}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{clip.durationSec}s</span>
                      <span className="text-[10px] font-mono text-slate-500">{clip.speed * 100}%</span>
                    </div>
                    <div className="text-xs font-bold text-white truncate">{clip.title}</div>
                    <div className="text-[10px] text-slate-400 truncate">{clip.camName} • {clip.createdAt}</div>
                  </div>

                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      onClick={() => handleCastToPgm(clip)}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-[10px] flex items-center gap-1 transition"
                      title="Air this replay to live PGM"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>AIR</span>
                    </button>
                    <button
                      onClick={() => setClips(prev => prev.filter(c => c.id !== clip.id))}
                      className="p-1 text-slate-500 hover:text-rose-400 transition text-center"
                      title="Delete Clip"
                    >
                      <Trash2 className="h-3 w-3 mx-auto" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
