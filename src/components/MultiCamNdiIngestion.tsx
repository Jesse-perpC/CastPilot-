import React, { useState, useEffect } from 'react';
import {
  Tv,
  Activity,
  Sliders,
  RefreshCw,
  Mic,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  Zap,
  Maximize2,
  Shield,
  RotateCcw,
  Wifi,
  Settings,
  HardDrive
} from 'lucide-react';

export interface VideoFeed {
  id: string;
  camNumber: number;
  name: string;
  sourceType: 'NDI-HB' | 'NDI-HX3' | 'WebRTC-Cloud' | 'SRT-Bridge';
  ipAddress: string;
  ndiChannel: string;
  resolution: '4K UHD' | '1080p60' | '1080p30' | '720p60';
  fps: number;
  bitrateMbps: number;
  latencyMs: number;
  jitterMs: number;
  packetLoss: number;
  webrtcStatus: 'connected' | 'connecting' | 'reconnecting' | 'failed';
  iceState: 'completed' | 'checking' | 'connected';
  codec: 'H.264 / Opus' | 'H.265 / AAC' | 'VP9 / Opus' | 'AV1 / Opus';
  lipSyncOffsetMs: number; // e.g. -15ms to +25ms
  isCalibrating: boolean;
  tallyState: 'pgm' | 'pvw' | 'standby';
  isAudioMuted: boolean;
  isVideoFrozen: boolean;
  isoRecording: boolean;
  audioVolume: number; // 0 to 100 for VU simulation
  avatarUrl: string;
  talentName: string;
  location: string;
}

const INITIAL_FEEDS: VideoFeed[] = [
  {
    id: 'feed-1',
    camNumber: 1,
    name: 'CAM 1 • Main Anchor Desk',
    sourceType: 'NDI-HB',
    ipAddress: '192.168.10.41:5961',
    ndiChannel: 'STUDIO-A/DESK-WIDE',
    resolution: '1080p60',
    fps: 60,
    bitrateMbps: 14.6,
    latencyMs: 24,
    jitterMs: 0.6,
    packetLoss: 0.0,
    webrtcStatus: 'connected',
    iceState: 'completed',
    codec: 'H.264 / Opus',
    lipSyncOffsetMs: 0,
    isCalibrating: false,
    tallyState: 'pgm',
    isAudioMuted: false,
    isVideoFrozen: false,
    isoRecording: true,
    audioVolume: 68,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80',
    talentName: 'Dr. Sarah Lin (Lead Anchor)',
    location: 'Main Studio Desk A'
  },
  {
    id: 'feed-2',
    camNumber: 2,
    name: 'CAM 2 • Co-Anchor & Panel',
    sourceType: 'NDI-HB',
    ipAddress: '192.168.10.42:5961',
    ndiChannel: 'STUDIO-A/PANEL-CLOSE',
    resolution: '1080p60',
    fps: 60,
    bitrateMbps: 13.8,
    latencyMs: 28,
    jitterMs: 0.9,
    packetLoss: 0.0,
    webrtcStatus: 'connected',
    iceState: 'completed',
    codec: 'H.264 / Opus',
    lipSyncOffsetMs: 4,
    isCalibrating: false,
    tallyState: 'pvw',
    isAudioMuted: false,
    isVideoFrozen: false,
    isoRecording: true,
    audioVolume: 42,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80',
    talentName: 'Marcus Vance (Co-Host)',
    location: 'Main Studio Desk B'
  },
  {
    id: 'feed-3',
    camNumber: 3,
    name: 'CAM 3 • London Tech Bureau',
    sourceType: 'WebRTC-Cloud',
    ipAddress: '51.140.82.11:8443',
    ndiChannel: 'CLOUD-GW/LON-DESK',
    resolution: '1080p60',
    fps: 60,
    bitrateMbps: 10.2,
    latencyMs: 45,
    jitterMs: 1.8,
    packetLoss: 0.01,
    webrtcStatus: 'connected',
    iceState: 'completed',
    codec: 'VP9 / Opus',
    lipSyncOffsetMs: -12,
    isCalibrating: false,
    tallyState: 'standby',
    isAudioMuted: false,
    isVideoFrozen: false,
    isoRecording: true,
    audioVolume: 55,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
    talentName: 'Dianne K. (European Bureau)',
    location: 'London Studio 4'
  },
  {
    id: 'feed-4',
    camNumber: 4,
    name: 'CAM 4 • Wall Street Markets',
    sourceType: 'WebRTC-Cloud',
    ipAddress: '198.51.100.89:8443',
    ndiChannel: 'CLOUD-GW/NYC-NYSE',
    resolution: '1080p60',
    fps: 60,
    bitrateMbps: 11.5,
    latencyMs: 38,
    jitterMs: 1.2,
    packetLoss: 0.0,
    webrtcStatus: 'connected',
    iceState: 'completed',
    codec: 'H.264 / Opus',
    lipSyncOffsetMs: -5,
    isCalibrating: false,
    tallyState: 'standby',
    isAudioMuted: false,
    isVideoFrozen: false,
    isoRecording: true,
    audioVolume: 30,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80',
    talentName: 'Samira Patel (Financial Markets)',
    location: 'New York Remote Hub'
  },
  {
    id: 'feed-5',
    camNumber: 5,
    name: 'CAM 5 • Tokyo Field Bureau',
    sourceType: 'WebRTC-Cloud',
    ipAddress: '203.0.113.55:8443',
    ndiChannel: 'CLOUD-GW/TYO-LIVE',
    resolution: '4K UHD',
    fps: 30,
    bitrateMbps: 22.4,
    latencyMs: 72,
    jitterMs: 2.9,
    packetLoss: 0.04,
    webrtcStatus: 'connected',
    iceState: 'completed',
    codec: 'AV1 / Opus',
    lipSyncOffsetMs: 18,
    isCalibrating: false,
    tallyState: 'standby',
    isAudioMuted: false,
    isVideoFrozen: false,
    isoRecording: false,
    audioVolume: 20,
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&q=80',
    talentName: 'Kenji Takahashi (APAC Analyst)',
    location: 'Tokyo Bureau Floor'
  },
  {
    id: 'feed-6',
    camNumber: 6,
    name: 'CAM 6 • Paris Cultural Desk',
    sourceType: 'NDI-HX3',
    ipAddress: '192.168.10.46:5961',
    ndiChannel: 'PARIS-HUB/STAGE-01',
    resolution: '1080p60',
    fps: 60,
    bitrateMbps: 9.8,
    latencyMs: 58,
    jitterMs: 2.1,
    packetLoss: 0.02,
    webrtcStatus: 'connected',
    iceState: 'completed',
    codec: 'H.265 / AAC',
    lipSyncOffsetMs: 8,
    isCalibrating: false,
    tallyState: 'standby',
    isAudioMuted: false,
    isVideoFrozen: false,
    isoRecording: true,
    audioVolume: 48,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&q=80',
    talentName: 'Elena Rostova (International Desk)',
    location: 'Paris Satellite Desk'
  },
  {
    id: 'feed-7',
    camNumber: 7,
    name: 'CAM 7 • 4K Skyline Drone Cam',
    sourceType: 'SRT-Bridge',
    ipAddress: '192.168.20.104:9000',
    ndiChannel: 'SRT-BRIDGE/DRONE-4K',
    resolution: '4K UHD',
    fps: 60,
    bitrateMbps: 26.0,
    latencyMs: 84,
    jitterMs: 3.8,
    packetLoss: 0.05,
    webrtcStatus: 'connected',
    iceState: 'completed',
    codec: 'H.264 / Opus',
    lipSyncOffsetMs: -22,
    isCalibrating: false,
    tallyState: 'standby',
    isAudioMuted: true,
    isVideoFrozen: false,
    isoRecording: true,
    audioVolume: 0,
    avatarUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=300&q=80',
    talentName: 'Skyline Drone Alpha (Remote Link)',
    location: 'Metropolitan Aerial Sector'
  },
  {
    id: 'feed-8',
    camNumber: 8,
    name: 'CAM 8 • Virtual Studio & Weather',
    sourceType: 'NDI-HB',
    ipAddress: '192.168.10.48:5961',
    ndiChannel: 'STUDIO-A/GREEN-VIRTUAL',
    resolution: '1080p60',
    fps: 60,
    bitrateMbps: 15.2,
    latencyMs: 31,
    jitterMs: 0.7,
    packetLoss: 0.0,
    webrtcStatus: 'connected',
    iceState: 'completed',
    codec: 'H.264 / Opus',
    lipSyncOffsetMs: 0,
    isCalibrating: false,
    tallyState: 'standby',
    isAudioMuted: false,
    isVideoFrozen: false,
    isoRecording: true,
    audioVolume: 60,
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&q=80',
    talentName: 'Amara Okafor (Meteorology & Field)',
    location: 'Virtual Chroma Stage B'
  }
];

interface MultiCamNdiIngestionProps {
  addToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export default function MultiCamNdiIngestion({ addToast }: MultiCamNdiIngestionProps) {
  const [feeds, setFeeds] = useState<VideoFeed[]>(INITIAL_FEEDS);
  const [activeLayout, setActiveLayout] = useState<'8-grid' | 'quad' | 'solo'>('8-grid');
  const [soloFeedId, setSoloFeedId] = useState<string>('feed-1');
  const [activeCalibratingFeed, setActiveCalibratingFeed] = useState<VideoFeed | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [isAutoCalibratingAll, setIsAutoCalibratingAll] = useState<boolean>(false);
  const [globalPtpSyncStatus, setGlobalPtpSyncStatus] = useState<string>('SMPTE 2059-2 LOCKED');

  // Simulated live VU meter & minor latency fluctuation tick
  useEffect(() => {
    const timer = setInterval(() => {
      setFeeds(prev =>
        prev.map(feed => {
          if (feed.isAudioMuted || feed.webrtcStatus !== 'connected') {
            return { ...feed, audioVolume: 0 };
          }
          // Slight natural jitter & VU fluctuations
          const jitterDelta = (Math.random() - 0.5) * 2;
          const latencyDelta = (Math.random() - 0.5) * 3;
          const newLatency = Math.max(18, Math.min(130, Math.round(feed.latencyMs + latencyDelta)));
          const newVolume = Math.max(5, Math.min(95, Math.round(feed.audioVolume + (Math.random() - 0.5) * 16)));

          return {
            ...feed,
            latencyMs: newLatency,
            jitterMs: Math.max(0.2, Number((feed.jitterMs + jitterDelta * 0.1).toFixed(1))),
            audioVolume: newVolume
          };
        })
      );
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  const toast = (msg: string, type: 'success' | 'info' | 'error' = 'info') => {
    if (addToast) addToast(msg, type);
  };

  // Run Lip-Sync Calibration Routine for a single feed
  const handleCalibrateFeed = (feedId: string) => {
    const feed = feeds.find(f => f.id === feedId);
    if (!feed) return;

    // Trigger visual calibration indicator
    setFeeds(prev => prev.map(f => f.id === feedId ? { ...f, isCalibrating: true } : f));
    toast(`Running acoustic & timestamp clapperboard sync for ${feed.name}...`, 'info');

    // Web Audio sync tone pulse
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880 Hz beep
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // Ignore if autoplay restricted
    }

    setTimeout(() => {
      // Auto-calculate optimized offset (typically within -2ms to +3ms target)
      const optimalOffset = Math.round((Math.random() - 0.5) * 6);
      setFeeds(prev =>
        prev.map(f =>
          f.id === feedId
            ? { ...f, isCalibrating: false, lipSyncOffsetMs: optimalOffset }
            : f
        )
      );
      toast(`Lip-Sync calibration completed for ${feed.name}: Set to ${optimalOffset >= 0 ? `+${optimalOffset}` : optimalOffset} ms`, 'success');
    }, 1400);
  };

  // Batch Auto-Calibrate All Feeds
  const handleAutoCalibrateAll = () => {
    setIsAutoCalibratingAll(true);
    toast('Initiating SMPTE PTP Master Clock Lip-Sync Alignment across all 8 feeds...', 'info');

    setFeeds(prev => prev.map(f => ({ ...f, isCalibrating: true })));

    setTimeout(() => {
      setFeeds(prev =>
        prev.map(f => ({
          ...f,
          isCalibrating: false,
          lipSyncOffsetMs: Math.round((Math.random() - 0.5) * 4) // tight 0-2ms sync
        }))
      );
      setIsAutoCalibratingAll(false);
      setGlobalPtpSyncStatus('SMPTE 2059-2 PHASE-ALIGNED (<1ms Delta)');
      toast('All 8 Multi-Cam NDI & WebRTC feeds successfully calibrated and phase-aligned!', 'success');
    }, 2200);
  };

  // Re-establish WebRTC ICE Handshake
  const handleReconnectWebRTC = (feedId: string) => {
    const feed = feeds.find(f => f.id === feedId);
    if (!feed) return;

    setFeeds(prev =>
      prev.map(f =>
        f.id === feedId
          ? { ...f, webrtcStatus: 'reconnecting', iceState: 'checking' }
          : f
      )
    );
    toast(`Renegotiating WebRTC SDP & ICE candidates for ${feed.name}...`, 'info');

    setTimeout(() => {
      setFeeds(prev =>
        prev.map(f =>
          f.id === feedId
            ? { ...f, webrtcStatus: 'connected', iceState: 'completed', latencyMs: Math.round(f.latencyMs * 0.9) }
            : f
        )
      );
      toast(`WebRTC P2P connection re-established for ${feed.name}. ICE status: Completed.`, 'success');
    }, 1200);
  };

  // Toggle ISO recording
  const handleToggleIso = (feedId: string) => {
    setFeeds(prev =>
      prev.map(f => {
        if (f.id === feedId) {
          const nextState = !f.isoRecording;
          toast(`${f.name} ISO audio & video recording ${nextState ? 'ARMED' : 'DISARMED'}.`, nextState ? 'success' : 'info');
          return { ...f, isoRecording: nextState };
        }
        return f;
      })
    );
  };

  // Toggle Tally state (PGM / PVW / Standby)
  const handleCycleTally = (feedId: string) => {
    setFeeds(prev =>
      prev.map(f => {
        if (f.id === feedId) {
          const nextTally = f.tallyState === 'standby' ? 'pvw' : f.tallyState === 'pvw' ? 'pgm' : 'standby';
          toast(`${f.name} Tally state changed to ${nextTally.toUpperCase()}.`, 'info');
          return { ...f, tallyState: nextTally };
        }
        return f;
      })
    );
  };

  // Filtered feeds
  const filteredFeeds = feeds.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.talentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.ndiChannel.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.ipAddress.includes(searchQuery);
    const matchesSource = filterSource === 'all' || f.sourceType === filterSource;
    return matchesSearch && matchesSource;
  });

  const avgLatency = Math.round(feeds.reduce((acc, curr) => acc + curr.latencyMs, 0) / feeds.length);
  const totalBitrate = (feeds.reduce((acc, curr) => acc + curr.bitrateMbps, 0)).toFixed(1);
  const activeIsoCount = feeds.filter(f => f.isoRecording).length;

  return (
    <div className="space-y-6" id="multicam-ndi-ingestion-hub">
      {/* Top Header & Ingestion Matrix Overview */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 border border-sky-500/30 p-5 sm:p-6 shadow-2xl">
        <div className="absolute -right-8 -bottom-8 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 font-mono text-[10px] font-bold tracking-wider uppercase">
                <Zap className="h-3 w-3 text-amber-300 animate-pulse" />
                MULTI-CAM NDI / WEBRTC INGESTION MATRIX
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px]">
                <Shield className="h-3 w-3" />
                {globalPtpSyncStatus}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold font-display text-white tracking-tight flex items-center gap-2.5">
              <Tv className="h-5 w-5 text-sky-400" />
              Multi-Cam NDI & WebRTC Ingestion Station (8 Feeds)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Real-time ultra-low latency multi-camera ingestion grid. Monitor latency badges, WebRTC peer connection states, SMPTE clock synchronization, and execute 1-click lip-sync acoustic calibration.
            </p>
          </div>

          {/* Quick Hub Global Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleAutoCalibrateAll}
              disabled={isAutoCalibratingAll}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition shadow-lg ${
                isAutoCalibratingAll
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse cursor-wait'
                  : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-sky-500/20'
              }`}
              id="calibrate-all-feeds-btn"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              {isAutoCalibratingAll ? 'Calibrating All Feeds...' : 'Auto-Calibrate All Feeds'}
            </button>

            <button
              onClick={() => {
                const allArmed = feeds.every(f => f.isoRecording);
                setFeeds(prev => prev.map(f => ({ ...f, isoRecording: !allArmed })));
                toast(allArmed ? 'Disarmed all ISO audio tracks.' : 'Armed all 8 ISO audio tracks for discrete capture.', allArmed ? 'info' : 'success');
              }}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 border border-rose-500/30 font-semibold text-xs flex items-center gap-2 transition"
            >
              <HardDrive className="h-4 w-4 text-rose-400" />
              {feeds.every(f => f.isoRecording) ? 'Disarm All ISO' : 'Arm All 8 ISO Tracks'}
            </button>
          </div>
        </div>
      </div>

      {/* Global Ingestion Telemetry & Health Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-1.5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Active Feeds</span>
            <Wifi className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{feeds.filter(f => f.webrtcStatus === 'connected').length} / {feeds.length} Online</span>
          </div>
          <p className="text-[10px] text-emerald-400/80 font-mono">100% ICE Candidate Connectivity</p>
        </div>

        <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-1.5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Average Latency</span>
            <Clock className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-sky-400">
            {avgLatency} ms
          </div>
          <p className="text-[10px] text-slate-400 font-mono">Target SLA: &lt; 100 ms Glass-to-Glass</p>
        </div>

        <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-1.5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Total Ingestion Bitrate</span>
            <Activity className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-indigo-300">
            {totalBitrate} Mbps
          </div>
          <p className="text-[10px] text-slate-400 font-mono">Uncompressed NDI + WebRTC SRTP</p>
        </div>

        <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-1.5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase">ISO Recording Pool</span>
            <Mic className="h-3.5 w-3.5 text-rose-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-rose-400">
            {activeIsoCount} / {feeds.length} Armed
          </div>
          <p className="text-[10px] text-slate-400 font-mono">Multi-Track 24-bit 48kHz WAV</p>
        </div>
      </div>

      {/* Filter & View Controls Bar */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="text"
            placeholder="Search feed name, IP, or talent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 w-56"
          />

          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Protocols</option>
            <option value="NDI-HB">NDI High-Bandwidth</option>
            <option value="NDI-HX3">NDI HX3</option>
            <option value="WebRTC-Cloud">WebRTC Cloud P2P</option>
            <option value="SRT-Bridge">SRT Bridge</option>
          </select>
        </div>

        {/* Layout Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 self-end md:self-auto">
          <span className="text-[10px] font-mono text-slate-400 px-1.5 hidden sm:inline">VIEW:</span>
          <button
            onClick={() => setActiveLayout('8-grid')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
              activeLayout === '8-grid'
                ? 'bg-sky-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            8-Grid Matrix
          </button>
          <button
            onClick={() => setActiveLayout('quad')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
              activeLayout === 'quad'
                ? 'bg-sky-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Quad (4 Feeds)
          </button>
          <button
            onClick={() => setActiveLayout('solo')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
              activeLayout === 'solo'
                ? 'bg-sky-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Solo Focus
          </button>
        </div>
      </div>

      {/* Grid of 8 Video Feed Placeholders */}
      {activeLayout === '8-grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredFeeds.map((feed) => (
            <FeedCard
              key={feed.id}
              feed={feed}
              onCalibrate={() => handleCalibrateFeed(feed.id)}
              onOpenCalibrationModal={() => setActiveCalibratingFeed(feed)}
              onReconnect={() => handleReconnectWebRTC(feed.id)}
              onToggleIso={() => handleToggleIso(feed.id)}
              onCycleTally={() => handleCycleTally(feed.id)}
              onSolo={() => {
                setSoloFeedId(feed.id);
                setActiveLayout('solo');
              }}
              onToggleMute={() => {
                setFeeds(prev => prev.map(f => f.id === feed.id ? { ...f, isAudioMuted: !f.isAudioMuted } : f));
              }}
              onToggleFreeze={() => {
                setFeeds(prev => prev.map(f => f.id === feed.id ? { ...f, isVideoFrozen: !f.isVideoFrozen } : f));
              }}
            />
          ))}
        </div>
      )}

      {/* Quad View (4 Primary Feeds) */}
      {activeLayout === 'quad' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFeeds.slice(0, 4).map((feed) => (
            <FeedCard
              key={feed.id}
              feed={feed}
              isLarge
              onCalibrate={() => handleCalibrateFeed(feed.id)}
              onOpenCalibrationModal={() => setActiveCalibratingFeed(feed)}
              onReconnect={() => handleReconnectWebRTC(feed.id)}
              onToggleIso={() => handleToggleIso(feed.id)}
              onCycleTally={() => handleCycleTally(feed.id)}
              onSolo={() => {
                setSoloFeedId(feed.id);
                setActiveLayout('solo');
              }}
              onToggleMute={() => {
                setFeeds(prev => prev.map(f => f.id === feed.id ? { ...f, isAudioMuted: !f.isAudioMuted } : f));
              }}
              onToggleFreeze={() => {
                setFeeds(prev => prev.map(f => f.id === feed.id ? { ...f, isVideoFrozen: !f.isVideoFrozen } : f));
              }}
            />
          ))}
        </div>
      )}

      {/* Solo View */}
      {activeLayout === 'solo' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">INSPECTING FEED:</span>
              <select
                value={soloFeedId}
                onChange={(e) => setSoloFeedId(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-white rounded px-2.5 py-1 font-semibold"
              >
                {feeds.map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({f.resolution})</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setActiveLayout('8-grid')}
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
            >
              ← Back to 8-Feed Grid
            </button>
          </div>

          {(() => {
            const feed = feeds.find(f => f.id === soloFeedId) || feeds[0];
            return (
              <FeedCard
                feed={feed}
                isLarge
                isSolo
                onCalibrate={() => handleCalibrateFeed(feed.id)}
                onOpenCalibrationModal={() => setActiveCalibratingFeed(feed)}
                onReconnect={() => handleReconnectWebRTC(feed.id)}
                onToggleIso={() => handleToggleIso(feed.id)}
                onCycleTally={() => handleCycleTally(feed.id)}
                onSolo={() => {}}
                onToggleMute={() => {
                  setFeeds(prev => prev.map(f => f.id === feed.id ? { ...f, isAudioMuted: !f.isAudioMuted } : f));
                }}
                onToggleFreeze={() => {
                  setFeeds(prev => prev.map(f => f.id === feed.id ? { ...f, isVideoFrozen: !f.isVideoFrozen } : f));
                }}
              />
            );
          })()}
        </div>
      )}

      {/* Interactive Lip-Sync Calibration Modal / Inspector */}
      {activeCalibratingFeed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-900 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
                  <Sliders className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-base">
                    Lip-Sync Calibration & Audio Timing Engine
                  </h3>
                  <p className="text-xs text-slate-400">
                    {activeCalibratingFeed.name} • {activeCalibratingFeed.sourceType}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveCalibratingFeed(null)}
                className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 text-xs"
              >
                ✕
              </button>
            </div>

            {/* Timing Visualizer */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">ACOUSTIC CLAPPERBOARD SYNC OFFSET:</span>
                  <span className={`font-bold text-sm ${
                    activeCalibratingFeed.lipSyncOffsetMs === 0
                      ? 'text-emerald-400'
                      : Math.abs(activeCalibratingFeed.lipSyncOffsetMs) < 10
                      ? 'text-sky-400'
                      : 'text-amber-400'
                  }`}>
                    {activeCalibratingFeed.lipSyncOffsetMs > 0 ? `+${activeCalibratingFeed.lipSyncOffsetMs}` : activeCalibratingFeed.lipSyncOffsetMs} ms
                  </span>
                </div>

                {/* Slider */}
                <div className="space-y-1">
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="1"
                    value={activeCalibratingFeed.lipSyncOffsetMs}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setActiveCalibratingFeed({ ...activeCalibratingFeed, lipSyncOffsetMs: val });
                      setFeeds(prev => prev.map(f => f.id === activeCalibratingFeed.id ? { ...f, lipSyncOffsetMs: val } : f));
                    }}
                    className="w-full accent-sky-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>-100 ms (Audio Advance)</span>
                    <span>0 ms (Perfect Sync)</span>
                    <span>+100 ms (Audio Delay)</span>
                  </div>
                </div>

                {/* Simulated Audio vs Video Waveform visualizer */}
                <div className="h-16 rounded-lg bg-slate-950 border border-slate-800 p-2 flex flex-col justify-center relative overflow-hidden">
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mb-1">
                    <span className="text-sky-400">AUDIO TRACK (OPUS 48kHz)</span>
                    <span className="text-amber-400">VIDEO PTS TIME (SMPTE PTP)</span>
                  </div>
                  <div className="flex items-center gap-0.5 h-6">
                    {Array.from({ length: 48 }).map((_, i) => {
                      const height = Math.sin(i * 0.4 + activeCalibratingFeed.lipSyncOffsetMs * 0.05) * 10 + 12;
                      return (
                        <div
                          key={i}
                          style={{ height: `${Math.max(3, height)}px` }}
                          className={`flex-1 rounded-xs transition-all ${
                            i === 24
                              ? 'bg-amber-400'
                              : i % 2 === 0
                              ? 'bg-sky-500/80'
                              : 'bg-sky-400/40'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    handleCalibrateFeed(activeCalibratingFeed.id);
                    setActiveCalibratingFeed({ ...activeCalibratingFeed, lipSyncOffsetMs: 0 });
                  }}
                  className="py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-sky-500/20"
                >
                  <Sparkles className="h-4 w-4" />
                  Run Auto Sync Tone Test
                </button>

                <button
                  onClick={() => {
                    setActiveCalibratingFeed({ ...activeCalibratingFeed, lipSyncOffsetMs: 0 });
                    setFeeds(prev => prev.map(f => f.id === activeCalibratingFeed.id ? { ...f, lipSyncOffsetMs: 0 } : f));
                    toast(`Reset sync delay offset to 0 ms for ${activeCalibratingFeed.name}.`, 'info');
                  }}
                  className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold text-xs flex items-center justify-center gap-2 transition"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset to Zero Delay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Single Video Feed Placeholder Card Component
interface FeedCardProps {
  key?: string;
  feed: VideoFeed;
  isLarge?: boolean;
  isSolo?: boolean;
  onCalibrate: () => void;
  onOpenCalibrationModal: () => void;
  onReconnect: () => void;
  onToggleIso: () => void;
  onCycleTally: () => void;
  onSolo: () => void;
  onToggleMute: () => void;
  onToggleFreeze: () => void;
}

function FeedCard({
  feed,
  isLarge,
  isSolo,
  onCalibrate,
  onOpenCalibrationModal,
  onReconnect,
  onToggleIso,
  onCycleTally,
  onSolo,
  onToggleMute,
  onToggleFreeze
}: FeedCardProps) {
  // Latency color category
  const latencyBadgeColor =
    feed.latencyMs < 40
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
      : feed.latencyMs < 75
      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
      : 'bg-rose-500/15 text-rose-300 border-rose-500/30';

  // Tally border indicator
  const tallyBorder =
    feed.tallyState === 'pgm'
      ? 'border-red-500 shadow-red-500/20'
      : feed.tallyState === 'pvw'
      ? 'border-amber-500 shadow-amber-500/20'
      : 'border-slate-800 hover:border-slate-700';

  return (
    <div
      className={`rounded-2xl bg-slate-950 border ${tallyBorder} p-4 shadow-xl flex flex-col justify-between space-y-3.5 transition-all relative ${
        feed.isCalibrating ? 'ring-2 ring-amber-400/80 animate-pulse' : ''
      }`}
      id={`feed-card-${feed.id}`}
    >
      {/* Header Info Bar */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          {/* Tally Pill */}
          <button
            onClick={onCycleTally}
            title="Click to cycle Tally state (PGM / PVW / Standby)"
            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition border ${
              feed.tallyState === 'pgm'
                ? 'bg-red-600 text-white border-red-500 animate-pulse'
                : feed.tallyState === 'pvw'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            {feed.tallyState.toUpperCase()}
          </button>

          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white truncate flex items-center gap-1.5">
              <span>{feed.name}</span>
            </h4>
            <p className="text-[10px] text-slate-400 font-mono truncate">{feed.location}</p>
          </div>
        </div>

        {/* Source Protocol Tag */}
        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800/80 font-bold shrink-0">
          {feed.sourceType}
        </span>
      </div>

      {/* Simulated Video Feed Placeholder Box */}
      <div
        className={`relative ${
          isSolo ? 'h-96' : isLarge ? 'h-64' : 'h-44'
        } rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center group`}
      >
        {/* Talent / Scene Placeholder Background */}
        <img
          src={feed.avatarUrl}
          alt={feed.talentName}
          className={`w-full h-full object-cover transition duration-300 ${
            feed.isVideoFrozen ? 'filter grayscale brightness-75' : 'opacity-70 group-hover:opacity-85'
          }`}
        />

        {/* Camera Crosshairs & Safe Area Guides */}
        <div className="absolute inset-0 pointer-events-none border border-white/5 m-3 rounded">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20" />
          </div>
        </div>

        {/* Calibration Flash Overlay */}
        {feed.isCalibrating && (
          <div className="absolute inset-0 bg-amber-400/30 flex flex-col items-center justify-center backdrop-blur-xs animate-pulse z-20">
            <Sparkles className="h-8 w-8 text-amber-300 animate-spin" />
            <span className="text-xs font-mono font-bold text-white mt-2 bg-black/80 px-2 py-1 rounded">
              LIP-SYNC ACOUSTIC CLAPPERBOARD TEST...
            </span>
          </div>
        )}

        {/* TOP-LEFT: Latency Badge (Prominent) */}
        <div
          className={`absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center gap-1.5 border shadow-lg backdrop-blur-md ${latencyBadgeColor}`}
          title={`Network latency: ${feed.latencyMs}ms | Jitter: ±${feed.jitterMs}ms | Loss: ${feed.packetLoss}%`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${feed.latencyMs < 75 ? 'bg-emerald-400' : 'bg-rose-400'} animate-ping`} />
          <span>LATENCY: {feed.latencyMs} ms</span>
        </div>

        {/* TOP-RIGHT: Resolution & Frame Rate */}
        <div className="absolute top-2 right-2 z-10 bg-slate-950/85 border border-slate-800 px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-300 backdrop-blur-md">
          {feed.resolution} • {feed.fps}fps • {feed.bitrateMbps}M
        </div>

        {/* BOTTOM-LEFT: Simulated WebRTC Connection Status Pill */}
        <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5 bg-slate-950/90 border border-slate-800 px-2 py-1 rounded-md text-[9px] font-mono text-slate-200 backdrop-blur-md">
          <span className={`h-2 w-2 rounded-full ${
            feed.webrtcStatus === 'connected'
              ? 'bg-emerald-400'
              : feed.webrtcStatus === 'reconnecting'
              ? 'bg-amber-400 animate-spin'
              : 'bg-rose-500'
          }`} />
          <span className="font-bold uppercase tracking-wider">
            WebRTC: {feed.webrtcStatus} ({feed.iceState})
          </span>
        </div>

        {/* BOTTOM-RIGHT: Live VU Audio Meter Simulation */}
        <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1.5 bg-slate-950/90 border border-slate-800 px-2 py-1 rounded-md backdrop-blur-md">
          {feed.isAudioMuted ? (
            <VolumeX className="h-3 w-3 text-rose-400" />
          ) : (
            <Volume2 className="h-3 w-3 text-emerald-400" />
          )}
          <div className="w-12 h-2 bg-slate-800 rounded-sm overflow-hidden flex items-center">
            <div
              style={{ width: `${feed.isAudioMuted ? 0 : feed.audioVolume}%` }}
              className={`h-full transition-all duration-150 ${
                feed.audioVolume > 85 ? 'bg-rose-500' : feed.audioVolume > 65 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Network Stream Details & NDI Channel */}
      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-slate-900/60 p-2.5 rounded-xl border border-slate-850">
        <div className="space-y-0.5 truncate">
          <span className="text-slate-500 block text-[8px] uppercase">NDI Channel / Stream</span>
          <span className="text-slate-300 font-semibold truncate block">{feed.ndiChannel}</span>
        </div>
        <div className="space-y-0.5 truncate text-right">
          <span className="text-slate-500 block text-[8px] uppercase">Codec & Jitter</span>
          <span className="text-slate-300 font-semibold truncate block">{feed.codec} (±{feed.jitterMs}ms)</span>
        </div>
      </div>

      {/* Lip-Sync Calibration & Control Buttons */}
      <div className="space-y-2 pt-1 border-t border-slate-900">
        <div className="flex items-center justify-between gap-2">
          {/* Main Requested Lip-Sync Calibration Button */}
          <button
            onClick={onCalibrate}
            disabled={feed.isCalibrating}
            className="flex-1 py-2 px-2.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-[11px] font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
            title="Perform 1-Click Acoustic Lip-Sync Clapperboard Calibration"
            id={`calibrate-feed-${feed.id}-btn`}
          >
            <Sliders className="h-3.5 w-3.5 text-sky-400" />
            <span>Lip-sync Calibration</span>
            <span className="text-[9px] font-mono text-sky-400/80">
              ({feed.lipSyncOffsetMs >= 0 ? `+${feed.lipSyncOffsetMs}` : feed.lipSyncOffsetMs}ms)
            </span>
          </button>

          {/* Detailed Fine-tuning / Inspector Modal Button */}
          <button
            onClick={onOpenCalibrationModal}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs transition"
            title="Fine-tune Offset Slider & Waveform"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Quick Micro-Controls: ISO Arm, WebRTC Reconnect, Mute, Solo */}
        <div className="flex items-center justify-between gap-1.5 pt-1">
          <button
            onClick={onToggleIso}
            className={`flex-1 py-1 px-1.5 rounded-lg text-[9px] font-mono font-bold flex items-center justify-center gap-1 border transition ${
              feed.isoRecording
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
            title="Arm ISO discrete audio track recording"
          >
            <Mic className="h-2.5 w-2.5" />
            {feed.isoRecording ? 'ISO REC' : 'ISO OFF'}
          </button>

          <button
            onClick={onReconnect}
            className="py-1 px-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-[9px] font-mono flex items-center gap-1 transition"
            title="Reconnect WebRTC Peer"
          >
            <RefreshCw className="h-2.5 w-2.5" />
            <span>ICE Re-Sync</span>
          </button>

          <button
            onClick={onToggleMute}
            className={`p-1.5 rounded-lg border text-[9px] transition ${
              feed.isAudioMuted
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
            }`}
            title={feed.isAudioMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {feed.isAudioMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
          </button>

          <button
            onClick={onSolo}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-[9px] transition"
            title="Solo Inspect Feed"
          >
            <Maximize2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
