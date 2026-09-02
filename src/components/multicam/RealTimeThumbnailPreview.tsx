import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  Download,
  Eye,
  Crosshair,
  Radio,
  Clock,
  Tv,
  Zap,
  RefreshCw,
  Sliders,
  Check,
  Film
} from 'lucide-react';
import { VideoFeed } from '../MultiCamNdiIngestion';

interface RealTimeThumbnailPreviewProps {
  currentFeed: VideoFeed;
  selectedCameraId: string;
  selectedFeed?: VideoFeed;
  allFeeds: VideoFeed[];
  onSelectCameraId: (camId: string) => void;
  onToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export default function RealTimeThumbnailPreview({
  currentFeed,
  selectedCameraId,
  selectedFeed,
  allFeeds,
  onSelectCameraId,
  onToast
}: RealTimeThumbnailPreviewProps) {
  // Preview mode: 'selected' (follows global selected camera), 'self' (this feed), 'pgm' (active program), 'pvw' (active preview)
  const [previewSourceMode, setPreviewSourceMode] = useState<'selected' | 'self' | 'pgm' | 'pvw'>('selected');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isPiPOverlay, setIsPiPOverlay] = useState<boolean>(false);
  const [capturedSnapshot, setCapturedSnapshot] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [frameTick, setFrameTick] = useState<number>(0);
  const [timecodeStr, setTimecodeStr] = useState<string>('00:00:00:00');
  const [isLiveActive, setIsLiveActive] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Resolve target feed to display in the thumbnail preview
  const activeSnapshotFeed: VideoFeed = (() => {
    if (previewSourceMode === 'self') return currentFeed;
    if (previewSourceMode === 'pgm') {
      return allFeeds.find(f => f.tallyState === 'pgm') || currentFeed;
    }
    if (previewSourceMode === 'pvw') {
      return allFeeds.find(f => f.tallyState === 'pvw') || currentFeed;
    }
    // Default: 'selected'
    return selectedFeed || allFeeds.find(f => f.id === selectedCameraId) || currentFeed;
  })();

  // Real-time animation loop for SMPTE timecode & simulated frame rasterization
  useEffect(() => {
    if (!isLiveActive) return;

    const interval = setInterval(() => {
      setFrameTick(prev => (prev + 1) % 60);

      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      const ff = String(Math.floor((now.getMilliseconds() / 1000) * 60)).padStart(2, '0');
      setTimecodeStr(`${hh}:${mm}:${ss}:${ff}`);
    }, 1000 / 30); // 30 FPS update

    return () => clearInterval(interval);
  }, [isLiveActive]);

  // Draw real-time dynamic canvas snapshot simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const renderSnapshotCanvas = () => {
      const w = canvas.width;
      const h = canvas.height;

      // Dark background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      if (activeSnapshotFeed.tallyState === 'pgm') {
        bgGrad.addColorStop(0, '#2b0707');
        bgGrad.addColorStop(1, '#090d16');
      } else if (activeSnapshotFeed.tallyState === 'pvw') {
        bgGrad.addColorStop(0, '#241a04');
        bgGrad.addColorStop(1, '#090d16');
      } else {
        bgGrad.addColorStop(0, '#0f172a');
        bgGrad.addColorStop(1, '#020617');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle scanline raster
      ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
      for (let y = 0; y < h; y += 4) {
        ctx.fillRect(0, y, w, 1);
      }

      // Safe area boundary rectangle
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(w * 0.05, h * 0.05, w * 0.9, h * 0.9);

      // Center reticle
      const cx = w / 2;
      const cy = h / 2;
      ctx.strokeStyle = activeSnapshotFeed.tallyState === 'pgm' ? 'rgba(239, 68, 68, 0.6)' : 'rgba(56, 189, 248, 0.5)';
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy);
      ctx.lineTo(cx + 8, cy);
      ctx.moveTo(cx, cy - 8);
      ctx.lineTo(cx, cy + 8);
      ctx.stroke();

      // Camera ID specific simulated graphics
      const camNum = activeSnapshotFeed.camNumber;
      if (camNum === 1) {
        // Anchor Desk Teleprompter Line
        ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('PROMPTER: LIVE LEAD STORY > 00:45', 10, h - 22);
      } else if (camNum === 2) {
        // Facial Tracking Box
        const pulse = Math.sin(Date.now() / 200) * 3;
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(cx - 24 + pulse / 2, cy - 20, 48 - pulse, 40);
        ctx.fillStyle = '#38bdf8';
        ctx.font = '8px monospace';
        ctx.fillText('FACE LOCK 99.4%', cx - 22, cy - 24);
      } else if (camNum === 4) {
        // Wall St Market Ticker
        ctx.fillStyle = 'rgba(16, 185, 129, 0.85)';
        ctx.font = 'bold 8px monospace';
        ctx.fillText('▲ DOW +1.1%  ▲ S&P +0.9%  ▼ NASDAQ -0.2%', 10, h - 14);
      } else if (camNum === 7) {
        // Drone Horizon Level
        const tilt = Math.sin(Date.now() / 800) * 12;
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.8)';
        ctx.beginPath();
        ctx.moveTo(cx - 30, cy + tilt);
        ctx.lineTo(cx + 30, cy - tilt);
        ctx.stroke();
        ctx.fillStyle = 'rgba(234, 179, 8, 0.9)';
        ctx.font = '8px monospace';
        ctx.fillText('ALT: 184m • GPS 3D FIX', 10, h - 14);
      } else if (camNum === 8) {
        // Chroma Key Grid Lines
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
        ctx.strokeRect(cx - 36, cy - 24, 72, 48);
        ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
        ctx.font = '8px monospace';
        ctx.fillText('CHROMA MATTE: KEYED', 10, h - 14);
      }

      // Audio waveform mini-sweep on bottom edge
      const waveY = h - 6;
      ctx.fillStyle = activeSnapshotFeed.isAudioMuted ? 'rgba(244, 63, 94, 0.6)' : 'rgba(16, 185, 129, 0.7)';
      for (let x = 8; x < w - 8; x += 4) {
        const height = Math.abs(Math.sin((x + frameTick * 2) * 0.15)) * (activeSnapshotFeed.isAudioMuted ? 1 : 6);
        ctx.fillRect(x, waveY - height, 2, height);
      }

      animationFrameId = requestAnimationFrame(renderSnapshotCanvas);
    };

    renderSnapshotCanvas();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [activeSnapshotFeed, frameTick]);

  // Capture instant freeze snapshot
  const handleCaptureSnapshot = () => {
    setIsFlashing(true);

    // Audio shutter click sound
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtxClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Ignore
    }

    setTimeout(() => {
      setIsFlashing(false);
      const snapshotKey = `snapshot_${activeSnapshotFeed.id}_${Date.now()}`;
      setCapturedSnapshot(snapshotKey);
      onToast?.(
        `Captured real-time snapshot frame from ${activeSnapshotFeed.name} at ${timecodeStr}!`,
        'success'
      );
    }, 200);
  };

  const isCurrentTargetActive = activeSnapshotFeed.id === currentFeed.id;

  return (
    <div
      className={`rounded-xl border transition-all duration-300 overflow-hidden ${
        activeSnapshotFeed.tallyState === 'pgm'
          ? 'bg-slate-950/95 border-red-500/50 shadow-md shadow-red-500/10'
          : activeSnapshotFeed.tallyState === 'pvw'
          ? 'bg-slate-950/95 border-amber-500/50 shadow-md shadow-amber-500/10'
          : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
      }`}
      id={`thumbnail-preview-container-${currentFeed.id}`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-900/80 border-b border-slate-800/80 gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className="relative flex h-2 w-2 shrink-0">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                activeSnapshotFeed.tallyState === 'pgm'
                  ? 'bg-red-400'
                  : activeSnapshotFeed.tallyState === 'pvw'
                  ? 'bg-amber-400'
                  : 'bg-sky-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                activeSnapshotFeed.tallyState === 'pgm'
                  ? 'bg-red-500'
                  : activeSnapshotFeed.tallyState === 'pvw'
                  ? 'bg-amber-500'
                  : 'bg-sky-500'
              }`}
            />
          </span>

          <span className="text-[10px] font-mono font-bold text-slate-200 uppercase truncate">
            Thumbnail Snapshot Preview
          </span>
        </div>

        {/* Source Mode Quick Selector */}
        <div className="flex items-center gap-1 shrink-0">
          <select
            value={previewSourceMode === 'selected' ? selectedCameraId : previewSourceMode}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'self' || val === 'pgm' || val === 'pvw') {
                setPreviewSourceMode(val);
              } else {
                setPreviewSourceMode('selected');
                onSelectCameraId(val);
              }
            }}
            title="Choose active camera snapshot target"
            className="bg-slate-950 border border-slate-700 text-slate-300 hover:text-white rounded px-1.5 py-0.5 text-[9px] font-mono font-semibold focus:ring-1 focus:ring-sky-500 cursor-pointer"
          >
            <optgroup label="Dynamic Bus Routing">
              <option value="selected">★ Selected Cam ({selectedFeed?.name.split('•')[0].trim() || 'CAM 1'})</option>
              <option value="self">Current Feed (CAM {currentFeed.camNumber})</option>
              <option value="pgm">Master PGM (On Air)</option>
              <option value="pvw">Master PVW (Preview)</option>
            </optgroup>
            <optgroup label="Specific Camera Sources">
              {allFeeds.map(f => (
                <option key={f.id} value={f.id}>
                  CAM {f.camNumber}: {f.name.split('•')[1]?.trim() || f.name}
                </option>
              ))}
            </optgroup>
          </select>

          <button
            onClick={() => setIsExpanded(prev => !prev)}
            title={isExpanded ? 'Collapse preview' : 'Expand thumbnail preview'}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            {isExpanded ? <Minimize2 className="h-2.5 w-2.5" /> : <Maximize2 className="h-2.5 w-2.5" />}
          </button>
        </div>
      </div>

      {/* Snapshot Preview Screen Container */}
      <div className="p-2 space-y-2">
        <div
          className={`relative ${
            isExpanded ? 'h-48' : 'h-28'
          } rounded-lg bg-slate-900/90 overflow-hidden border border-slate-800 flex items-center justify-center group/preview transition-all duration-200`}
        >
          {/* Real-time Simulated Video Canvas */}
          <canvas
            ref={canvasRef}
            width={320}
            height={180}
            className="w-full h-full object-cover"
          />

          {/* Background Snapshot Avatar with Dimmed Lighting */}
          <img
            src={activeSnapshotFeed.avatarUrl}
            alt={activeSnapshotFeed.talentName}
            className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-300 ${
              activeSnapshotFeed.isVideoFrozen ? 'filter grayscale opacity-30' : 'opacity-40 group-hover/preview:opacity-55'
            }`}
          />

          {/* Shutter Flash Animation Effect */}
          {isFlashing && (
            <div className="absolute inset-0 bg-white z-30 animate-ping opacity-90" />
          )}

          {/* TOP-LEFT: Active Snapshot Camera ID & Tally Pill */}
          <div className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1">
            <span
              className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-black uppercase tracking-wider border shadow-sm ${
                activeSnapshotFeed.tallyState === 'pgm'
                  ? 'bg-red-600 text-white border-red-400 animate-pulse'
                  : activeSnapshotFeed.tallyState === 'pvw'
                  ? 'bg-amber-500 text-slate-950 border-amber-300 font-bold'
                  : 'bg-sky-950/90 text-sky-300 border-sky-700/80'
              }`}
            >
              {activeSnapshotFeed.tallyState === 'pgm'
                ? '● PGM AIR'
                : activeSnapshotFeed.tallyState === 'pvw'
                ? '● PVW CUE'
                : `CAM ${activeSnapshotFeed.camNumber}`}
            </span>

            <span className="px-1.5 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-[8px] font-mono text-slate-300 backdrop-blur-sm truncate max-w-[120px]">
              {activeSnapshotFeed.name.split('•')[1]?.trim() || activeSnapshotFeed.name}
            </span>
          </div>

          {/* TOP-RIGHT: Live SMPTE Timecode & Resolution */}
          <div className="absolute top-1.5 right-1.5 z-10 flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded bg-black/80 border border-slate-800 text-[8px] font-mono text-emerald-400 font-bold backdrop-blur-sm">
              {timecodeStr}
            </span>
            <span className="px-1 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-[8px] font-mono text-slate-400 backdrop-blur-sm">
              {activeSnapshotFeed.fps}fps
            </span>
          </div>

          {/* CENTER HOVER QUICK ACTION OVERLAY */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs z-20">
            <button
              onClick={handleCaptureSnapshot}
              className="px-2 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-bold text-[9px] flex items-center gap-1 shadow-lg transition"
              title="Grab instant live frame snapshot"
            >
              <Camera className="h-3 w-3" />
              <span>GRAB FRAME</span>
            </button>

            <button
              onClick={() => {
                onSelectCameraId(activeSnapshotFeed.id);
                onToast?.(`Focused active studio camera to CAM ${activeSnapshotFeed.camNumber}`, 'info');
              }}
              className="px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-white font-mono font-bold text-[9px] flex items-center gap-1 border border-slate-700 shadow-lg transition"
              title="Set as global active selected camera"
            >
              <Crosshair className="h-3 w-3 text-sky-400" />
              <span>SELECT CAM</span>
            </button>
          </div>

          {/* BOTTOM-LEFT: Location Tag */}
          <div className="absolute bottom-1.5 left-1.5 z-10">
            <span className="px-1.5 py-0.5 rounded bg-slate-950/85 border border-slate-800 text-[8px] font-mono text-slate-300 backdrop-blur-sm flex items-center gap-1">
              <Tv className="h-2.5 w-2.5 text-sky-400" />
              <span>{activeSnapshotFeed.location}</span>
            </span>
          </div>

          {/* BOTTOM-RIGHT: Source Protocol & Latency */}
          <div className="absolute bottom-1.5 right-1.5 z-10 flex items-center gap-1">
            <span className="px-1.5 py-0.5 rounded bg-slate-950/85 border border-slate-800 text-[8px] font-mono text-cyan-300 font-bold backdrop-blur-sm">
              {activeSnapshotFeed.sourceType}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-950/85 border border-slate-800 text-[8px] font-mono text-slate-400 backdrop-blur-sm">
              {activeSnapshotFeed.latencyMs}ms
            </span>
          </div>
        </div>

        {/* Snapshot Metadata & Camera Selector Quick-Switch Bar */}
        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 bg-slate-900/60 p-1.5 rounded-lg border border-slate-850 gap-2">
          <div className="flex items-center gap-1 truncate">
            <span className="text-slate-500">FEED:</span>
            <strong className="text-slate-200 font-bold truncate">
              {activeSnapshotFeed.id === selectedCameraId ? '★ ACTIVE FOCUS' : activeSnapshotFeed.id}
            </strong>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleCaptureSnapshot}
              title="Grab live snapshot frame"
              className="px-1.5 py-0.5 rounded bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 flex items-center gap-1 transition"
            >
              <Camera className="h-2.5 w-2.5" />
              <span>Snap</span>
            </button>

            <button
              onClick={() => setIsLiveActive(prev => !prev)}
              title={isLiveActive ? 'Pause snapshot stream' : 'Resume live stream'}
              className={`px-1.5 py-0.5 rounded border transition flex items-center gap-1 ${
                isLiveActive
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}
            >
              <RefreshCw className={`h-2.5 w-2.5 ${isLiveActive ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
              <span>{isLiveActive ? 'Live' : 'Paused'}</span>
            </button>
          </div>
        </div>

        {/* Captured Snapshot Notification Toast Bar if captured */}
        {capturedSnapshot && (
          <div className="flex items-center justify-between px-2 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[9px] font-mono animate-fadeIn">
            <div className="flex items-center gap-1.5 truncate">
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="truncate">Snapshot stored @ {timecodeStr}</span>
            </div>
            <button
              onClick={() => setCapturedSnapshot(null)}
              className="text-slate-400 hover:text-white px-1"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
