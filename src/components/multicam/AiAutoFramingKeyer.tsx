import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Cpu,
  Eye,
  Sliders,
  Scissors,
  Layers,
  Volume2,
  CheckCircle2,
  Maximize2,
  RefreshCw,
  Zap,
  Radio,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Video,
  Monitor
} from 'lucide-react';
import { VideoFeed } from '../MultiCamNdiIngestion';
import { AiTrackingConfig } from './types';

interface AiAutoFramingKeyerProps {
  feeds: VideoFeed[];
  onToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
  onAutoSwitchCamera?: (feedId: string) => void;
}

const BACKGROUND_PLATES = [
  { id: 'virtual-newsroom', name: '3D Virtual Newsroom', url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80', description: 'Curved LED screen wall with broadcast lighting' },
  { id: 'cyber-studio', name: 'Cyber Glass Tech Studio', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80', description: 'Deep blue neon cybernetic grid atmosphere' },
  { id: 'skyline-penthouse', name: 'Sunset Skyline Penthouse', url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80', description: 'Golden hour city overview with warm glass reflections' },
  { id: 'gradient', name: 'Minimalist Broadcast Dark', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80', description: 'Clean slate studio backdrop' },
  { id: 'transparent', name: 'Transparent Alpha Channel', url: '', description: 'Direct WebRTC alpha pass-through for downstream DVE' },
];

export default function AiAutoFramingKeyer({ feeds, onToast, onAutoSwitchCamera }: AiAutoFramingKeyerProps) {
  const [selectedFeedId, setSelectedFeedId] = useState<string>(feeds[0]?.id || 'feed-1');
  const [activeSpeakerFeedId, setActiveSpeakerFeedId] = useState<string>('feed-1');
  const [matteViewMode, setMatteViewMode] = useState<'composite' | 'matte' | 'background'>('composite');

  const [config, setConfig] = useState<AiTrackingConfig>({
    activeSpeakerTracking: true,
    speakerThresholdDbfs: -18,
    switchHoldoffSec: 2.0,
    autoFramingMode: 'headroom',
    trackingSpeed: 3,
    smoothDamping: true,
    chromaKeyEnabled: true,
    chromaColor: 'green',
    customHexColor: '#00FF00',
    similarity: 42,
    smoothness: 28,
    spillSuppression: 65,
    backgroundPlate: 'virtual-newsroom'
  });

  const activeFeed = feeds.find(f => f.id === selectedFeedId) || feeds[0];
  const activePlate = BACKGROUND_PLATES.find(p => p.id === config.backgroundPlate) || BACKGROUND_PLATES[0];

  // Active speaker simulation loop
  useEffect(() => {
    if (!config.activeSpeakerTracking) return;

    const timer = setInterval(() => {
      // Find feed with highest audio peak or randomly switch amongst active feeds
      const candidateFeeds = feeds.filter(f => !f.isAudioMuted);
      if (candidateFeeds.length > 0) {
        const randomFeed = candidateFeeds[Math.floor(Math.random() * candidateFeeds.length)];
        setActiveSpeakerFeedId(randomFeed.id);
        if (onAutoSwitchCamera && randomFeed.tallyState !== 'pgm') {
          // Soft notify
        }
      }
    }, config.switchHoldoffSec * 1500);

    return () => clearInterval(timer);
  }, [config.activeSpeakerTracking, config.switchHoldoffSec, feeds, onAutoSwitchCamera]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                AI VISION AUTO-FRAMING & CHROMA KEYER
              </span>
              <span className="px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono text-[10px]">
                ON-DEVICE NEURAL ACCELERATION
              </span>
            </div>
            <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
              Speaker Tracking & Virtual Studio Compositor
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl">
              Real-time voice activity speaker detection, AI facial framing with rule-of-thirds centering, and broadcast-grade green/blue chroma keying with virtual 3D studio background plates.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2.5 shrink-0">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-400" />
              <div>
                <div className="text-xs font-semibold text-white">AI Auto-Director</div>
                <div className="text-[10px] text-slate-400">Voice-cued camera switching</div>
              </div>
            </div>
            <button
              onClick={() => {
                setConfig(prev => ({ ...prev, activeSpeakerTracking: !prev.activeSpeakerTracking }));
                onToast(`AI Speaker Auto-Director ${!config.activeSpeakerTracking ? 'Activated' : 'Paused'}`, 'info');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition ${
                config.activeSpeakerTracking
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {config.activeSpeakerTracking ? 'ACTIVE' : 'MANUAL'}
            </button>
          </div>
        </div>
      </div>

      {/* Camera Selection Strip */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {feeds.map((feed) => {
          const isSelected = feed.id === selectedFeedId;
          const isSpeaking = feed.id === activeSpeakerFeedId && config.activeSpeakerTracking;
          return (
            <button
              key={feed.id}
              onClick={() => setSelectedFeedId(feed.id)}
              className={`px-3.5 py-2.5 rounded-xl border text-left transition shrink-0 flex items-center gap-3 min-w-[170px] ${
                isSelected
                  ? 'bg-purple-500/15 border-purple-500 text-white shadow-lg shadow-purple-500/10'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="relative">
                <img
                  src={feed.avatarUrl}
                  alt={feed.name}
                  className="h-9 w-9 rounded-lg object-cover border border-slate-700"
                />
                {isSpeaking && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate text-white">{feed.name}</div>
                <div className="text-[10px] font-mono flex items-center gap-1">
                  {isSpeaking ? (
                    <span className="text-purple-400 font-bold flex items-center gap-0.5">
                      <Volume2 className="h-2.5 w-2.5" /> SPEAKING
                    </span>
                  ) : (
                    <span className="text-slate-400">Idle / Silence</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Studio Viewport (Composite / Keyed Canvas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live AI Viewport & Matte Inspector (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl group">
            {/* Background Plate if enabled */}
            {config.chromaKeyEnabled && activePlate.url && matteViewMode !== 'matte' && (
              <img
                src={activePlate.url}
                alt="Virtual Studio Background"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}

            {/* Foreground Feed */}
            {matteViewMode === 'matte' ? (
              <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
                {/* Simulated High-Contrast Silhouette Matte */}
                <img
                  src={activeFeed.avatarUrl}
                  alt="Alpha Matte Silhouette"
                  className="w-full h-full object-cover filter grayscale contrast-200 invert"
                />
              </div>
            ) : (
              <img
                src={activeFeed.avatarUrl}
                alt={activeFeed.name}
                className={`relative w-full h-full object-cover transition-all duration-300 ${
                  config.chromaKeyEnabled ? 'mix-blend-luminosity opacity-90' : ''
                }`}
              />
            )}

            {/* AI Facial Bounding Box & Headroom Reticle Overlay */}
            {config.autoFramingMode && (
              <div className="absolute inset-0 pointer-events-none">
                {/* Rule of thirds grid lines */}
                <div className="absolute inset-x-0 top-1/3 border-b border-purple-500/20" />
                <div className="absolute inset-x-0 top-2/3 border-b border-purple-500/20" />
                <div className="absolute inset-y-0 left-1/3 border-r border-purple-500/20" />
                <div className="absolute inset-y-0 right-1/3 border-r border-purple-500/20" />

                {/* Simulated Target Tracking Box */}
                <div className="absolute top-[20%] left-[32%] w-[36%] h-[55%] border-2 border-dashed border-purple-400/80 rounded-2xl flex flex-col justify-between p-2">
                  <div className="flex items-center justify-between text-[9px] font-mono font-bold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded backdrop-blur self-start">
                    <span>AI EYE-TRACK 99.4%</span>
                  </div>
                  <div className="text-[9px] font-mono text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded backdrop-blur self-end">
                    <span>HEADROOM: OPTIMAL</span>
                  </div>
                </div>
              </div>
            )}

            {/* Viewport Top HUD */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold">
                {config.chromaKeyEnabled ? 'CHROMA KEYED' : 'DIRECT PASS'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-900/90 text-white text-xs font-mono border border-slate-700">
                {activeFeed.name}
              </span>
            </div>

            {/* Matte Mode Selector Pill */}
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-950/90 p-1 rounded-lg border border-slate-800 backdrop-blur">
              {(['composite', 'matte', 'background'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setMatteViewMode(mode)}
                  className={`px-2 py-1 rounded text-[10px] font-mono uppercase font-bold transition ${
                    matteViewMode === mode
                      ? 'bg-purple-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Speaking Status Banner */}
            {activeSpeakerFeedId === activeFeed.id && config.activeSpeakerTracking && (
              <div className="absolute bottom-3 left-3 bg-purple-950/90 border border-purple-500 text-purple-200 px-3 py-1.5 rounded-xl font-mono text-xs flex items-center gap-2 backdrop-blur shadow-2xl">
                <span className="h-2 w-2 rounded-full bg-purple-400 animate-ping" />
                <span>ACTIVE SPEAKER IDENTIFIED (PRIORITY 1)</span>
              </div>
            )}
          </div>

          {/* Virtual Background Plate Selection Grid */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-sky-400" />
                <span>Virtual Studio Background Plates</span>
              </span>
              <span className="text-slate-400 font-normal">Select 3D environment</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {BACKGROUND_PLATES.map((plate) => {
                const isCurrent = config.backgroundPlate === plate.id;
                return (
                  <button
                    key={plate.id}
                    onClick={() => {
                      setConfig(prev => ({ ...prev, backgroundPlate: plate.id as any }));
                      onToast(`Virtual Studio background set to "${plate.name}"`, 'success');
                    }}
                    className={`rounded-xl border p-2.5 text-left transition flex flex-col justify-between space-y-1.5 ${
                      isCurrent
                        ? 'bg-purple-500/20 border-purple-500 text-white shadow-md shadow-purple-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-white truncate">{plate.name}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{plate.description}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: AI Auto-Director & Chroma Key Sliders (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* AI Auto-Framing Settings */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-purple-400" />
                <h4 className="text-sm font-bold text-white">AI Framing & Eyeline Tracker</h4>
              </div>
              <span className="text-[10px] font-mono text-purple-300">NEURAL ENGINE</span>
            </div>

            {/* Framing Mode Buttons */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400">FRAMING TARGET MODE:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'headroom', label: 'Headroom & Eyeline' },
                  { id: 'rule-of-thirds', label: 'Rule of Thirds' },
                  { id: 'tight-bust', label: 'Tight Bust Shot' },
                  { id: 'wide-group', label: 'Multi-Person Wide' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setConfig(prev => ({ ...prev, autoFramingMode: mode.id as any }))}
                    className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition border ${
                      config.autoFramingMode === mode.id
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Speaker Sensitivity Threshold */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>SPEAKER VAD THRESHOLD:</span>
                <span className="text-purple-400 font-bold">{config.speakerThresholdDbfs} dBFS</span>
              </div>
              <input
                type="range"
                min={-45}
                max={-10}
                value={config.speakerThresholdDbfs}
                onChange={(e) => setConfig(prev => ({ ...prev, speakerThresholdDbfs: Number(e.target.value) }))}
                className="w-full accent-purple-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Switch Holdoff Seconds */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>CUT HOLDOFF (HYSTERESIS):</span>
                <span className="text-sky-400 font-bold">{config.switchHoldoffSec.toFixed(1)}s</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={5.0}
                step={0.5}
                value={config.switchHoldoffSec}
                onChange={(e) => setConfig(prev => ({ ...prev, switchHoldoffSec: Number(e.target.value) }))}
                className="w-full accent-sky-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Chroma Key Engine Calibration */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Scissors className="h-4 w-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white">Chroma Key Calibration</h4>
              </div>
              <button
                onClick={() => setConfig(prev => ({ ...prev, chromaKeyEnabled: !prev.chromaKeyEnabled }))}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                  config.chromaKeyEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {config.chromaKeyEnabled ? 'KEYER ON' : 'BYPASS'}
              </button>
            </div>

            {/* Key Color Choice */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-400">CHROMA SCREEN HUE:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'green', label: 'Studio Green', color: 'bg-green-500' },
                  { id: 'blue', label: 'Broadcast Blue', color: 'bg-blue-500' },
                  { id: 'custom', label: 'Custom Hex', color: 'bg-slate-700' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setConfig(prev => ({ ...prev, chromaColor: item.id as any }))}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border ${
                      config.chromaColor === item.id
                        ? 'bg-slate-800 text-white border-emerald-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Similarity */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>SIMILARITY TOLERANCE:</span>
                <span className="text-emerald-400 font-bold">{config.similarity}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={config.similarity}
                onChange={(e) => setConfig(prev => ({ ...prev, similarity: Number(e.target.value) }))}
                className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Smoothness */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>EDGE SMOOTHNESS:</span>
                <span className="text-cyan-400 font-bold">{config.smoothness}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={config.smoothness}
                onChange={(e) => setConfig(prev => ({ ...prev, smoothness: Number(e.target.value) }))}
                className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Spill Suppression */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>SPILL SUPPRESSION:</span>
                <span className="text-amber-400 font-bold">{config.spillSuppression}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={config.spillSuppression}
                onChange={(e) => setConfig(prev => ({ ...prev, spillSuppression: Number(e.target.value) }))}
                className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
