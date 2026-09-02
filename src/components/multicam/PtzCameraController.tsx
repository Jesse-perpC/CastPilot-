import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Crosshair,
  Camera,
  Move,
  ZoomIn,
  ZoomOut,
  Focus,
  Eye,
  Sliders,
  Shield,
  ShieldAlert,
  Save,
  RotateCcw,
  Check,
  Zap,
  Play,
  Layers,
  ChevronRight,
  Info,
  Radio,
  Tv,
  Edit2
} from 'lucide-react';
import { VideoFeed } from '../MultiCamNdiIngestion';
import { CameraPtzState, PtzPreset } from './types';

interface PtzCameraControllerProps {
  feeds: VideoFeed[];
  onToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const DEFAULT_PRESETS: Record<string, PtzPreset[]> = {
  'feed-1': [
    { id: 'p1', slotNumber: 1, name: 'Anchor Desk Wide', pan: 0, tilt: 0, zoom: 1.0, focus: 85, iris: 2.8, thumbnailUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80' },
    { id: 'p2', slotNumber: 2, name: 'Lead Anchor Close-Up', pan: -4.5, tilt: 1.2, zoom: 3.2, focus: 92, iris: 2.0, thumbnailUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80' },
    { id: 'p3', slotNumber: 3, name: 'Over The Shoulder (OTS)', pan: 18.0, tilt: -2.4, zoom: 2.1, focus: 78, iris: 2.8, thumbnailUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80' },
    { id: 'p4', slotNumber: 4, name: 'Guest Dual Two-Shot', pan: 12.0, tilt: -0.8, zoom: 1.6, focus: 80, iris: 2.8, thumbnailUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80' },
    { id: 'p5', slotNumber: 5, name: 'Studio Jib Overhead', pan: -32.0, tilt: -22.0, zoom: 1.0, focus: 70, iris: 4.0, thumbnailUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80' },
    { id: 'p6', slotNumber: 6, name: 'Weather / Screen Wall', pan: 45.0, tilt: 4.0, zoom: 1.8, focus: 88, iris: 2.8, thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
  ]
};

export default function PtzCameraController({ feeds, onToast }: PtzCameraControllerProps) {
  const [selectedFeedId, setSelectedFeedId] = useState<string>(feeds[0]?.id || 'feed-1');
  const [isMoving, setIsMoving] = useState<string | null>(null);
  const [isPresetTransitioning, setIsPresetTransitioning] = useState<boolean>(false);
  const [transitionProgress, setTransitionProgress] = useState<number>(0);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editedPresetName, setEditedPresetName] = useState<string>('');

  // PTZ states per camera
  const [ptzStates, setPtzStates] = useState<Record<string, CameraPtzState>>(() => {
    const initial: Record<string, CameraPtzState> = {};
    feeds.forEach((feed, idx) => {
      initial[feed.id] = {
        camId: feed.id,
        pan: idx === 0 ? 0 : (idx * 6) - 18,
        tilt: 0,
        zoom: 1.0,
        focus: 85,
        iris: 2.8,
        autoFocus: true,
        autoExposure: true,
        panSpeed: 5,
        tallyLockEnabled: true,
        presets: DEFAULT_PRESETS[feed.id] || [
          { id: `p1-${feed.id}`, slotNumber: 1, name: 'Main Position', pan: 0, tilt: 0, zoom: 1.0, focus: 85, iris: 2.8, thumbnailUrl: feed.avatarUrl },
          { id: `p2-${feed.id}`, slotNumber: 2, name: 'Close-Up', pan: -5, tilt: 2, zoom: 2.5, focus: 90, iris: 2.0, thumbnailUrl: feed.avatarUrl },
          { id: `p3-${feed.id}`, slotNumber: 3, name: 'Wide Stage', pan: 15, tilt: -3, zoom: 1.2, focus: 75, iris: 2.8, thumbnailUrl: feed.avatarUrl },
          { id: `p4-${feed.id}`, slotNumber: 4, name: 'Podium Focus', pan: -20, tilt: -1, zoom: 2.0, focus: 85, iris: 2.8, thumbnailUrl: feed.avatarUrl },
          { id: `p5-${feed.id}`, slotNumber: 5, name: 'Crowd Pan', pan: 35, tilt: -8, zoom: 1.0, focus: 70, iris: 4.0, thumbnailUrl: feed.avatarUrl },
          { id: `p6-${feed.id}`, slotNumber: 6, name: 'Safety Wide', pan: 0, tilt: -5, zoom: 1.0, focus: 80, iris: 3.5, thumbnailUrl: feed.avatarUrl },
        ]
      };
    });
    return initial;
  });

  const activeFeed = feeds.find(f => f.id === selectedFeedId) || feeds[0];
  const activePtz = ptzStates[selectedFeedId] || {
    camId: selectedFeedId,
    pan: 0,
    tilt: 0,
    zoom: 1.0,
    focus: 85,
    iris: 2.8,
    autoFocus: true,
    autoExposure: true,
    panSpeed: 5,
    tallyLockEnabled: true,
    presets: []
  };

  // Is camera on PGM tally and locked?
  const isPgmLocked = activeFeed.tallyState === 'pgm' && activePtz.tallyLockEnabled;

  // Joystick move handler
  const handlePanTilt = (deltaPan: number, deltaTilt: number, dirLabel: string) => {
    if (isPgmLocked) {
      onToast(`PTZ Movement blocked: ${activeFeed.name} is currently LIVE on PGM (Tally Safety Lock active).`, 'error');
      return;
    }

    const stepMultiplier = activePtz.panSpeed * 0.4;
    setPtzStates(prev => {
      const current = prev[selectedFeedId];
      if (!current) return prev;
      const newPan = Math.max(-180, Math.min(180, +(current.pan + deltaPan * stepMultiplier).toFixed(1)));
      const newTilt = Math.max(-90, Math.min(90, +(current.tilt + deltaTilt * stepMultiplier).toFixed(1)));
      return {
        ...prev,
        [selectedFeedId]: {
          ...current,
          pan: newPan,
          tilt: newTilt
        }
      };
    });
    setIsMoving(dirLabel);
    setTimeout(() => setIsMoving(null), 150);
  };

  // Zoom handler
  const handleZoom = (delta: number) => {
    if (isPgmLocked) {
      onToast(`PTZ Zoom blocked: ${activeFeed.name} is LIVE on PGM.`, 'error');
      return;
    }
    setPtzStates(prev => {
      const current = prev[selectedFeedId];
      if (!current) return prev;
      const newZoom = Math.max(1.0, Math.min(30.0, +(current.zoom + delta).toFixed(1)));
      return {
        ...prev,
        [selectedFeedId]: {
          ...current,
          zoom: newZoom
        }
      };
    });
  };

  // Home camera (center 0,0 1x)
  const handleHomePosition = () => {
    if (isPgmLocked) {
      onToast('Cannot recall Home: Camera is currently LIVE on Program.', 'error');
      return;
    }
    setPtzStates(prev => ({
      ...prev,
      [selectedFeedId]: {
        ...prev[selectedFeedId],
        pan: 0,
        tilt: 0,
        zoom: 1.0
      }
    }));
    onToast(`Recalled Home position for ${activeFeed.name}`, 'info');
  };

  // Preset recall with animated ramp
  const handleRecallPreset = (preset: PtzPreset) => {
    if (isPgmLocked) {
      onToast(`Preset recall blocked: ${activeFeed.name} is LIVE on PGM tally. Disarm Tally Lock if intentional.`, 'error');
      return;
    }

    setIsPresetTransitioning(true);
    setTransitionProgress(0);

    const interval = setInterval(() => {
      setTransitionProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsPresetTransitioning(false);
          setPtzStates(currentStates => ({
            ...currentStates,
            [selectedFeedId]: {
              ...currentStates[selectedFeedId],
              pan: preset.pan,
              tilt: preset.tilt,
              zoom: preset.zoom,
              focus: preset.focus,
              iris: preset.iris
            }
          }));
          onToast(`Recalled preset "${preset.name}" on ${activeFeed.name}`, 'success');
          return 100;
        }
        return prev + 20;
      });
    }, 60);
  };

  // Save current position to preset slot
  const handleStorePreset = (slotNumber: number) => {
    setPtzStates(prev => {
      const current = prev[selectedFeedId];
      if (!current) return prev;

      const updatedPresets = current.presets.map(p => {
        if (p.slotNumber === slotNumber) {
          return {
            ...p,
            pan: current.pan,
            tilt: current.tilt,
            zoom: current.zoom,
            focus: current.focus,
            iris: current.iris,
            thumbnailUrl: activeFeed.avatarUrl
          };
        }
        return p;
      });

      return {
        ...prev,
        [selectedFeedId]: {
          ...current,
          presets: updatedPresets
        }
      };
    });
    onToast(`Stored current PTZ position to Slot #${slotNumber}`, 'success');
  };

  // Save renamed preset
  const handleSavePresetName = (presetId: string) => {
    const trimmed = editedPresetName.trim();
    if (!trimmed) {
      setEditingPresetId(null);
      return;
    }

    setPtzStates(prev => {
      const current = prev[selectedFeedId];
      if (!current) return prev;
      return {
        ...prev,
        [selectedFeedId]: {
          ...current,
          presets: current.presets.map(p => p.id === presetId ? { ...p, name: trimmed } : p)
        }
      };
    });
    setEditingPresetId(null);
    onToast(`Preset renamed to "${trimmed}"`, 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header Info & Tally Safety Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono text-xs font-bold uppercase tracking-wider">
                <Compass className="h-3.5 w-3.5 text-sky-400" />
                VISCA OVER IP / NDI PTZ CONTROLLER
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px]">
                PORT 52381 UDP • 2.4ms LATENCY
              </span>
            </div>
            <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
              Robotic PTZ Remote Operator & Preset Matrix
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl">
              Precision Pan, Tilt, Optical Zoom, Focus & Iris calibration with tally-aware on-air safety locks and 6-slot high-speed salvo preset positioning.
            </p>
          </div>

          {/* Tally Protection Switch */}
          <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-xl px-3.5 py-2.5 shrink-0">
            <div className="flex items-center gap-2">
              {activePtz.tallyLockEnabled ? (
                <Shield className="h-4 w-4 text-emerald-400" />
              ) : (
                <ShieldAlert className="h-4 w-4 text-amber-400" />
              )}
              <div>
                <div className="text-xs font-semibold text-white">Tally On-Air Lock</div>
                <div className="text-[10px] text-slate-400">Lock PTZ if camera is on PGM</div>
              </div>
            </div>
            <button
              onClick={() => {
                setPtzStates(prev => ({
                  ...prev,
                  [selectedFeedId]: {
                    ...prev[selectedFeedId],
                    tallyLockEnabled: !prev[selectedFeedId]?.tallyLockEnabled
                  }
                }));
                onToast(`Tally safety lock ${!activePtz.tallyLockEnabled ? 'Armed' : 'Disarmed'} for ${activeFeed.name}`, 'info');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition font-mono ${
                activePtz.tallyLockEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {activePtz.tallyLockEnabled ? 'ARMED' : 'BYPASS'}
            </button>
          </div>
        </div>
      </div>

      {/* Camera Selection Strip */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {feeds.map((feed) => {
          const isSelected = feed.id === selectedFeedId;
          const ptz = ptzStates[feed.id];
          return (
            <button
              key={feed.id}
              onClick={() => setSelectedFeedId(feed.id)}
              className={`px-3.5 py-2.5 rounded-xl border text-left transition shrink-0 flex items-center gap-3 min-w-[170px] ${
                isSelected
                  ? 'bg-sky-500/15 border-sky-500 text-white shadow-lg shadow-sky-500/10'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="relative">
                <img
                  src={feed.avatarUrl}
                  alt={feed.name}
                  className="h-9 w-9 rounded-lg object-cover border border-slate-700"
                />
                <span className={`absolute -top-1 -right-1 px-1 rounded text-[8px] font-mono font-bold uppercase ${
                  feed.tallyState === 'pgm' ? 'bg-red-600 text-white animate-pulse' :
                  feed.tallyState === 'pvw' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {feed.tallyState}
                </span>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate text-white">{feed.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">
                  P:{ptz?.pan ?? 0}° T:{ptz?.tilt ?? 0}° Z:{ptz?.zoom ?? 1}x
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main PTZ Workspace: 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Viewfinder & Joystick Deck (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Live Viewfinder Simulator with PTZ Reticle */}
          <div className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl group">
            <img
              src={activeFeed.avatarUrl}
              alt={activeFeed.name}
              className="w-full h-full object-cover transition-transform duration-300"
              style={{
                transform: `scale(${activePtz.zoom}) translate(${-activePtz.pan * 0.15}%, ${activePtz.tilt * 0.15}%)`
              }}
            />

            {/* Overlays */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />

            {/* Crosshair Reticle */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-16 h-16 border border-white/20 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-sky-400/70 rounded-full animate-ping" />
              </div>
              <div className="absolute w-24 h-0.5 bg-white/20" />
              <div className="absolute h-24 w-0.5 bg-white/20" />
            </div>

            {/* Tally & Live Warning Overlay */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold uppercase shadow-lg ${
                activeFeed.tallyState === 'pgm' ? 'bg-red-600 text-white animate-pulse' :
                activeFeed.tallyState === 'pvw' ? 'bg-emerald-600 text-white' : 'bg-slate-900/90 text-slate-300'
              }`}>
                {activeFeed.tallyState.toUpperCase()}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur text-white font-mono text-xs border border-slate-700">
                {activeFeed.name}
              </span>
            </div>

            {/* Telemetry HUD (Pan, Tilt, Zoom, Iris) */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 font-mono text-[10px] text-white bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded-lg border border-slate-800">
              <span className="text-sky-400">PAN:</span> {activePtz.pan > 0 ? `+${activePtz.pan}` : activePtz.pan}°
              <span className="text-slate-600">|</span>
              <span className="text-sky-400">TILT:</span> {activePtz.tilt > 0 ? `+${activePtz.tilt}` : activePtz.tilt}°
              <span className="text-slate-600">|</span>
              <span className="text-amber-400">ZOOM:</span> {activePtz.zoom.toFixed(1)}x
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400">IRIS:</span> f/{activePtz.iris}
            </div>

            {/* Tally Lock Warning Overlay if Active on PGM */}
            {isPgmLocked && (
              <div className="absolute inset-0 bg-red-950/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                <div className="bg-red-900/90 border border-red-500 rounded-xl px-4 py-2 text-center text-white shadow-2xl">
                  <div className="flex items-center justify-center gap-2 font-bold text-xs">
                    <ShieldAlert className="h-4 w-4 text-red-300 animate-bounce" />
                    <span>ON-AIR PTZ LOCKOUT ACTIVE</span>
                  </div>
                  <p className="text-[10px] text-red-200 mt-0.5">Disarm Tally Lock in header to override during live program</p>
                </div>
              </div>
            )}

            {/* Transitioning Banner */}
            {isPresetTransitioning && (
              <div className="absolute bottom-3 inset-x-3 bg-slate-900/90 border border-sky-500/40 rounded-xl p-2.5 backdrop-blur shadow-2xl">
                <div className="flex items-center justify-between text-xs text-sky-300 font-mono mb-1">
                  <span className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 animate-spin" />
                    SMOOTH ROBOTIC PRESET SLEW IN PROGRESS...
                  </span>
                  <span>{transitionProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-400 h-full transition-all duration-75"
                    style={{ width: `${transitionProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Directional Pad / Virtual Joystick Control Surface */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 8-Way D-Pad Deck */}
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 flex flex-col items-center justify-center space-y-3">
              <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Crosshair className="h-3.5 w-3.5 text-sky-400" />
                <span>Pan / Tilt Crossbar Control</span>
              </div>

              {/* 3x3 Control Matrix */}
              <div className="grid grid-cols-3 gap-2 w-48 h-48">
                {/* NW */}
                <button
                  onClick={() => handlePanTilt(-1, 1, 'NW')}
                  disabled={isPgmLocked}
                  className="rounded-xl bg-slate-800 hover:bg-sky-600 active:bg-sky-500 text-slate-300 hover:text-white flex items-center justify-center transition disabled:opacity-40 disabled:hover:bg-slate-800 text-xs font-bold"
                >
                  ↖
                </button>
                {/* UP / TILT UP */}
                <button
                  onClick={() => handlePanTilt(0, 1, 'UP')}
                  disabled={isPgmLocked}
                  className="rounded-xl bg-slate-800 hover:bg-sky-600 active:bg-sky-500 text-slate-300 hover:text-white flex items-center justify-center transition disabled:opacity-40 disabled:hover:bg-slate-800 text-sm font-bold"
                >
                  ▲
                </button>
                {/* NE */}
                <button
                  onClick={() => handlePanTilt(1, 1, 'NE')}
                  disabled={isPgmLocked}
                  className="rounded-xl bg-slate-800 hover:bg-sky-600 active:bg-sky-500 text-slate-300 hover:text-white flex items-center justify-center transition disabled:opacity-40 disabled:hover:bg-slate-800 text-xs font-bold"
                >
                  ↗
                </button>

                {/* LEFT / PAN LEFT */}
                <button
                  onClick={() => handlePanTilt(-1, 0, 'LEFT')}
                  disabled={isPgmLocked}
                  className="rounded-xl bg-slate-800 hover:bg-sky-600 active:bg-sky-500 text-slate-300 hover:text-white flex items-center justify-center transition disabled:opacity-40 disabled:hover:bg-slate-800 text-sm font-bold"
                >
                  ◀
                </button>
                {/* CENTER HOME */}
                <button
                  onClick={handleHomePosition}
                  disabled={isPgmLocked}
                  title="Return to Home 0°, 0°"
                  className="rounded-xl bg-slate-950 border border-sky-500/40 hover:border-sky-400 text-sky-400 hover:bg-sky-500 hover:text-slate-950 flex flex-col items-center justify-center transition disabled:opacity-40"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="text-[9px] font-mono mt-0.5">HOME</span>
                </button>
                {/* RIGHT / PAN RIGHT */}
                <button
                  onClick={() => handlePanTilt(1, 0, 'RIGHT')}
                  disabled={isPgmLocked}
                  className="rounded-xl bg-slate-800 hover:bg-sky-600 active:bg-sky-500 text-slate-300 hover:text-white flex items-center justify-center transition disabled:opacity-40 disabled:hover:bg-slate-800 text-sm font-bold"
                >
                  ▶
                </button>

                {/* SW */}
                <button
                  onClick={() => handlePanTilt(-1, -1, 'SW')}
                  disabled={isPgmLocked}
                  className="rounded-xl bg-slate-800 hover:bg-sky-600 active:bg-sky-500 text-slate-300 hover:text-white flex items-center justify-center transition disabled:opacity-40 disabled:hover:bg-slate-800 text-xs font-bold"
                >
                  ↙
                </button>
                {/* DOWN / TILT DOWN */}
                <button
                  onClick={() => handlePanTilt(0, -1, 'DOWN')}
                  disabled={isPgmLocked}
                  className="rounded-xl bg-slate-800 hover:bg-sky-600 active:bg-sky-500 text-slate-300 hover:text-white flex items-center justify-center transition disabled:opacity-40 disabled:hover:bg-slate-800 text-sm font-bold"
                >
                  ▼
                </button>
                {/* SE */}
                <button
                  onClick={() => handlePanTilt(1, -1, 'SE')}
                  disabled={isPgmLocked}
                  className="rounded-xl bg-slate-800 hover:bg-sky-600 active:bg-sky-500 text-slate-300 hover:text-white flex items-center justify-center transition disabled:opacity-40 disabled:hover:bg-slate-800 text-xs font-bold"
                >
                  ↘
                </button>
              </div>

              {/* Speed Ramp Slider */}
              <div className="w-full space-y-1 pt-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>VELOCITY DAMPING:</span>
                  <span className="text-sky-400 font-bold">Speed {activePtz.panSpeed}/10</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={activePtz.panSpeed}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setPtzStates(prev => ({
                      ...prev,
                      [selectedFeedId]: { ...prev[selectedFeedId], panSpeed: val }
                    }));
                  }}
                  className="w-full accent-sky-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Zoom, Focus & Optical Iris Engine */}
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-4 flex flex-col justify-between">
              {/* Zoom Controls */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <ZoomIn className="h-3.5 w-3.5 text-amber-400" />
                    <span>Optical Zoom</span>
                  </span>
                  <span className="text-amber-400">{activePtz.zoom.toFixed(1)}x / 30.0x</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleZoom(-0.5)}
                    disabled={isPgmLocked || activePtz.zoom <= 1.0}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-40 transition shrink-0"
                    title="Zoom Out (Wide)"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <input
                    type="range"
                    min={1.0}
                    max={30.0}
                    step={0.1}
                    value={activePtz.zoom}
                    disabled={isPgmLocked}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setPtzStates(prev => ({
                        ...prev,
                        [selectedFeedId]: { ...prev[selectedFeedId], zoom: val }
                      }));
                    }}
                    className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer disabled:opacity-40"
                  />
                  <button
                    onClick={() => handleZoom(0.5)}
                    disabled={isPgmLocked || activePtz.zoom >= 30.0}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-40 transition shrink-0"
                    title="Zoom In (Telephoto)"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Optical Focus Controls */}
              <div className="space-y-2 border-t border-slate-800 pt-3">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Focus className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Focus Plane</span>
                  </span>
                  <button
                    onClick={() => {
                      setPtzStates(prev => ({
                        ...prev,
                        [selectedFeedId]: { ...prev[selectedFeedId], autoFocus: !prev[selectedFeedId]?.autoFocus }
                      }));
                      onToast(`Auto-Focus ${!activePtz.autoFocus ? 'Enabled' : 'Set to Manual'}`, 'info');
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      activePtz.autoFocus ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {activePtz.autoFocus ? 'AUTO AF' : 'MANUAL'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    disabled={activePtz.autoFocus || isPgmLocked}
                    onClick={() => {
                      setPtzStates(prev => ({
                        ...prev,
                        [selectedFeedId]: { ...prev[selectedFeedId], focus: Math.max(0, prev[selectedFeedId].focus - 5) }
                      }));
                    }}
                    className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold disabled:opacity-40"
                  >
                    Focus Near
                  </button>
                  <button
                    disabled={activePtz.autoFocus || isPgmLocked}
                    onClick={() => {
                      setPtzStates(prev => ({
                        ...prev,
                        [selectedFeedId]: { ...prev[selectedFeedId], focus: Math.min(100, prev[selectedFeedId].focus + 5) }
                      }));
                    }}
                    className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold disabled:opacity-40"
                  >
                    Focus Far
                  </button>
                </div>
              </div>

              {/* Iris / Aperture */}
              <div className="space-y-2 border-t border-slate-800 pt-3">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Aperture (Iris)</span>
                  </span>
                  <span className="text-emerald-400 font-mono">f/{activePtz.iris}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[1.8, 2.0, 2.8, 4.0, 5.6, 8.0].map((fStop) => (
                    <button
                      key={fStop}
                      onClick={() => {
                        setPtzStates(prev => ({
                          ...prev,
                          [selectedFeedId]: { ...prev[selectedFeedId], iris: fStop }
                        }));
                      }}
                      className={`flex-1 py-1 rounded text-[10px] font-mono font-bold transition ${
                        activePtz.iris === fStop
                          ? 'bg-emerald-500 text-slate-950 font-extrabold'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      f/{fStop}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 6 Preset Memory Slots & VISCA Config (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-sky-400" />
                <h4 className="text-sm font-bold text-white">Camera Presets (6 Slots)</h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400">1-Click Fast Slew</span>
            </div>

            {/* 6 Preset Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activePtz.presets.map((preset) => {
                const isEditing = editingPresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    className="group relative rounded-xl bg-slate-950 border border-slate-800 p-2.5 hover:border-sky-500/50 transition-all flex flex-col justify-between space-y-2 shadow-md"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-400 font-mono font-bold text-[10px]">
                        #{preset.slotNumber}
                      </span>
                      {isEditing ? (
                        <div className="flex items-center gap-1 flex-1 min-w-0">
                          <input
                            type="text"
                            value={editedPresetName}
                            onChange={(e) => setEditedPresetName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSavePresetName(preset.id)}
                            autoFocus
                            className="w-full bg-slate-900 border border-sky-500 rounded px-1.5 py-0.5 text-xs text-white"
                          />
                          <button
                            onClick={() => handleSavePresetName(preset.id)}
                            className="p-1 rounded bg-sky-500 text-slate-950"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between flex-1 min-w-0 pl-1">
                          <span className="text-xs font-semibold text-white truncate">{preset.name}</span>
                          <button
                            onClick={() => {
                              setEditingPresetId(preset.id);
                              setEditedPresetName(preset.name);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-sky-400 transition"
                            title="Rename Preset"
                          >
                            <Edit2 className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                      <span>P:{preset.pan}° T:{preset.tilt}°</span>
                      <span>Z:{preset.zoom}x</span>
                    </div>

                    {/* Action Buttons: Recall & Store */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button
                        onClick={() => handleRecallPreset(preset)}
                        disabled={isPgmLocked || isPresetTransitioning}
                        className="py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 transition shadow-sm disabled:opacity-40"
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span>Recall</span>
                      </button>
                      <button
                        onClick={() => handleStorePreset(preset.slotNumber)}
                        disabled={isPgmLocked}
                        className="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1 transition disabled:opacity-40"
                        title="Overwrite slot with current position"
                      >
                        <Save className="h-3 w-3" />
                        <span>Store</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* VISCA Protocol & NDI Network Status */}
          <div className="rounded-xl bg-slate-950 border border-slate-800 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-mono font-bold">
              <span className="flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 text-emerald-400" />
                <span>NDI PTZ Interface Status</span>
              </span>
              <span className="text-emerald-400">READY (ONLINE)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400">
              <div className="bg-slate-900/90 rounded p-2 border border-slate-800/80">
                <span className="text-slate-500 block">DEVICE IP:</span>
                <span className="text-slate-200">{activeFeed.ipAddress}</span>
              </div>
              <div className="bg-slate-900/90 rounded p-2 border border-slate-800/80">
                <span className="text-slate-500 block">VISCA PROTOCOL:</span>
                <span className="text-slate-200">UDP / Sony Standard</span>
              </div>
              <div className="bg-slate-900/90 rounded p-2 border border-slate-800/80">
                <span className="text-slate-500 block">COMMAND RTT:</span>
                <span className="text-emerald-400">2.4 ms (Instant)</span>
              </div>
              <div className="bg-slate-900/90 rounded p-2 border border-slate-800/80">
                <span className="text-slate-500 block">MOTOR ACCEL:</span>
                <span className="text-sky-400">S-Curve Smooth</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
